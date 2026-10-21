'use client'

import { useState } from 'react'
import { Calendar } from './render-calendar'
import { Todolist } from './todolist'
import { Clock } from './update-clock'

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

export const TrackingCalendar = ({
    tasks,
    addTask,
    dailyResults
}) => {
    const [selectedDate, setSelectedDate] = useState(getTodayWIB)

    const today = getTodayWIB()
    const isPastDate = selectedDate < today

    const selectedTasks = tasks.filter((task) => {
        const taskDate = new Date(task.date)
            .toISOString()
            .slice(0, 10)

        return taskDate === selectedDate
    })

    const dailyResult = dailyResults.find((result) => {
        const resultDate = new Date(result.date)
            .toISOString()
            .slice(0, 10)

        return resultDate === selectedDate
    })

    return (
        <div className="main">
            <section className="calendar-container">
                <Calendar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    dailyResults={dailyResults}
                />
            </section>

            <aside>
                <Clock />
                <div className="todolist-container">
                    <p>
                        Tanggal Dipilih: {selectedDate}
                    </p>

                    {dailyResult && (
                        <p>
                            Status hari ini:{' '}
                            {dailyResult.status
                                ? 'Berhasil'
                                : 'Gagal'}
                        </p>
                    )}

                    <Todolist
                        tasks={selectedTasks}
                        selectedDate={selectedDate}
                        isPastDate={isPastDate}
                    />

                    <div className="submit-todolist">
                        <form action={addTask}>
                            <input
                                type="hidden"
                                name="date"
                                value={selectedDate}
                            />

                            <input
                                type="text"
                                id="tasks"
                                name="tasks"
                                placeholder="Tambahkan Tugas Disini"
                                disabled={isPastDate}
                                required
                            />

                            <button
                                className="submit-btn"
                                type="submit"
                                disabled={isPastDate}
                            >
                                Tambah
                            </button>
                        </form>
                    </div>
                </div>
            </aside>
        </div>
    )
}