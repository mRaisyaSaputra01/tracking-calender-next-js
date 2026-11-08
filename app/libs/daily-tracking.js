import { prisma } from './prisma'

// Mengambil tanggal saat ini berdasarkan zona waktu WIB.
function getTodayWIB() {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date())

    const values = Object.fromEntries(
        parts.map(({ type, value }) => [type, value])
    )

    return `${values.year}-${values.month}-${values.day}`
}

// Mengubah string tanggal menjadi objek Date untuk kolom @db.Date.
function toDatabaseDate(dateString) {
    return new Date(`${dateString}T00:00:00.000Z`)
}

// Mengubah objek Date menjadi string tanggal.
function formatDatabaseDate(date) {
    return date.toISOString().slice(0, 10)
}

// Memajukan tanggal satu hari.
function addOneDay(dateString) {
    const date = toDatabaseDate(dateString)
    date.setUTCDate(date.getUTCDate() + 1)
    return date.toISOString().slice(0, 10)
}

// Memproses tanggal yang sudah lewat dan belum memiliki hasil.
export async function processMissedDates(userId) {
    if (!Number.isSafeInteger(userId) || userId <= 0) {
        throw new Error('Invalid user ID')
    }

    const totalStart = performance.now()

    const userStart = performance.now()
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { tracking_started_at: true }
    })
    console.log(`[PROFILE] Find tracking user: ${(performance.now() - userStart).toFixed(2)} ms`)

    if (!user) throw new Error('User not found')

    const today = getTodayWIB()

    const startDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(user.tracking_started_at)

    const start = toDatabaseDate(startDate)
    const end = toDatabaseDate(today)

    let processedDates = 0

    if (startDate < today) {
        const resultsStart = performance.now()

        const existingResults = await prisma.daily_results.findMany({
            where: {
                user_id: userId,
                date: {
                    gte: start,
                    lt: end
                }
            },
            select: { date: true }
        })

        console.log(`[PROFILE] Find existing results: ${(performance.now() - resultsStart).toFixed(2)} ms`)

        const existingDates = new Set(
            existingResults.map(result => formatDatabaseDate(result.date))
        )

        let dateString = startDate

        while (dateString < today) {
            if (!existingDates.has(dateString)) {
                const date = toDatabaseDate(dateString)

                try {
                    await prisma.$transaction(async (tx) => {
                        const incompleteTask = await tx.tasks.findFirst({
                            where: {
                                user_id: userId,
                                date,
                                completed: false
                            },
                            select: { id: true }
                        })

                        const anyTask = await tx.tasks.findFirst({
                            where: {
                                user_id: userId,
                                date
                            },
                            select: { id: true }
                        })

                        const status = Boolean(anyTask && !incompleteTask)

                        await tx.daily_results.create({
                            data: {
                                user_id: userId,
                                date,
                                status
                            }
                        })
                    })

                    processedDates++
                } catch (error) {
                    if (error.code !== 'P2002') {
                        throw error
                    }
                }
            }

            dateString = addOneDay(dateString)
        }

        console.log(`[PROFILE] Newly processed dates: ${processedDates}`)
    }

    // Kunci seluruh tugas tanggal lampau sekaligus.
    const lockStart = performance.now()

    await prisma.tasks.updateMany({
        where: {
            user_id: userId,
            date: { lt: end },
            locked: false
        },
        data: { locked: true }
    })

    console.log(`[PROFILE] Lock past tasks: ${(performance.now() - lockStart).toFixed(2)} ms`)

    console.log(`[PROFILE] Optimized processMissedDates: ${(performance.now() - totalStart).toFixed(2)} ms`)
}
