import './global.css'
import { prisma } from './libs/prisma'
import { getServerSession } from 'next-auth'
import { authOption } from './api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { processMissedDates } from './libs/daily-tracking'
import { TrackingCalendar } from '@/app/component/tracking-calendar'
import { addTask } from '@/app/actions/todolist'

export default async function Page() {
    const session = await getServerSession(authOption)

    if (!session?.user?.id) {
        redirect('/api/auth/signin')
    }

    const userId = Number(session.user.id)

    const missedStart = performance.now();
    await processMissedDates(userId);
    console.log(
        `[PROFILE] processMissedDates: ${(performance.now() - missedStart).toFixed(2)} ms`
    );

    const fetchStart = performance.now();
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
    console.log(
        `[PROFILE] Fetch tasks & dailyResults: ${(performance.now() - fetchStart).toFixed(2)} ms`
    );

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