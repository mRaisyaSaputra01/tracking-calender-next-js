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

// Memajukan tanggal satu hari tanpa bergantung pada zona waktu server.
function addOneDay(dateString) {
const date = new Date(`${dateString}T00:00:00.000Z`)
date.setUTCDate(date.getUTCDate() + 1)

return date.toISOString().slice(0, 10)

}

// Memproses tanggal yang sudah lewat dan belum memiliki hasil.
export async function processMissedDates(userId) {
if (!Number.isSafeInteger(userId) || userId <= 0) {
throw new Error('Invalid user ID')
}

const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
        tracking_started_at: true
    }
})

if (!user) {
    throw new Error('User not found')
}

const today = getTodayWIB()

const startedParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
}).formatToParts(user.tracking_started_at)

const startedValues = Object.fromEntries(
    startedParts.map(({ type, value }) => [type, value])
)

const startDate =
    `${startedValues.year}-${startedValues.month}-${startedValues.day}`

let dateString = startDate

while (dateString < today) {
    const date = toDatabaseDate(dateString)

    try {
        await prisma.$transaction(async (tx) => {
            const existingResult = await tx.daily_results.findUnique({
                where: {
                    user_id_date: {
                        user_id: userId,
                        date
                    }
                }
            })

            if (!existingResult) {
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
            }

            await tx.tasks.updateMany({
                where: {
                    user_id: userId,
                    date,
                    locked: false
                },
                data: {
                    locked: true
                }
            })
        })
    } catch (error) {
        // Jika proses bersamaan membuat hasil yang sama,
        // periksa apakah hasilnya sudah tersimpan.
        const existingResult = await prisma.daily_results.findUnique({
            where: {
                user_id_date: {
                    user_id: userId,
                    date
                }
            }
        })

        if (!existingResult) {
            throw error
        }

        await prisma.tasks.updateMany({
            where: {
                user_id: userId,
                date,
                locked: false
            },
            data: {
                locked: true
            }
        })
    }

    dateString = addOneDay(dateString)
}

}
