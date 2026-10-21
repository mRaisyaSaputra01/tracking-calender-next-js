'use client'

import { useTransition } from 'react'
import { toggleTask, removeTask } from '@/app/actions/todolist'

export const Todolist = ({
    tasks,
    isPastDate
}) => {
    const [isPending, startTransition] = useTransition()

    return (
        <div className="todolist-container">
            <div className="todolist">
                {tasks.map((task) => (
                    <div className="task-item" key={task.id}>
                        <p className={task.completed ? 'completed' : ''}>
                            {task.tasks}
                        </p>

                        <div className="task-actions">
                            <button
                                type="button"
                                className="done-btn"
                                disabled={isPending || isPastDate}
                                onClick={() => {
                                    startTransition(async () => {
                                        await toggleTask(task.id)
                                    })
                                }}
                            >
                                ✓
                            </button>

                            <button
                                type="button"
                                className="remove-btn"
                                disabled={isPending || isPastDate}
                                onClick={() => {
                                    startTransition(async () => {
                                        await removeTask(task.id)
                                    })
                                }}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}

                {tasks.length === 0 && (
                    <p>Belum ada tugas untuk tanggal ini.</p>
                )}
            </div>
        </div>
    )
}