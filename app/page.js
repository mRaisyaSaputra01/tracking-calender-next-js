import './global.css'
import { prisma } from './libs/prisma'
import { getServerSession } from 'next-auth'
import { authOption } from './api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { processMissedDates } from './libs/daily-tracking'
import { TrackingCalendar } from '@/app/component/tracking-calendar'
import { Clock } from '@/app/component/update-clock'
import { addTask } from '@/app/actions/todolist'

export default async function Page() {
    const session = await getServerSession(authOption)

    if (!session?.user?.id) {
        redirect('/api/auth/signin')
    }

    const userId = Number(session.user.id)

    await processMissedDates(userId)

    const [tasks, dailyResults] = await Promise.all([
        prisma.tasks.findMany({
            where: {
                user_id: userId
            },
            orderBy: {
                id: 'desc'
            }
        }),

        prisma.daily_results.findMany({
            where: {
                user_id: userId
            },
            orderBy: {
                date: 'asc'
            }
        })
    ])

    return (
        <>
            <TrackingCalendar
                tasks={tasks}
                dailyResults={dailyResults}
                addTask={addTask}
            />
        </>
    )
}