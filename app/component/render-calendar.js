'use client'

import { useState } from 'react'

const months = [
    'Januari', 'Februari', 'Maret', 'April',
    'Mei', 'Juni', 'Juli', 'Agustus',
    'September', 'Oktober', 'November', 'Desember'
]

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

export const Calendar = ({
    selectedDate,
    onSelectDate,
    dailyResults = []
}) => {
    const today = getTodayWIB()
    const [month, setMonth] = useState(
        Number(today.slice(5, 7)) - 1
    )
    const [year, setYear] = useState(
        Number(today.slice(0, 4))
    )

    const firstDate = new Date(year, month, 1).getDay()
    const totalDays = new Date(year, month + 1, 0).getDate()

    const days = []

    for (let i = 0; i < firstDate; i++) {
        days.push(null)
    }

    for (let i = 1; i <= totalDays; i++) {
        days.push(i)
    }

    function changeMonth(direction) {
        const date = new Date(year, month + direction, 1)

        setMonth(date.getMonth())
        setYear(date.getFullYear())
    }

    function formatDate(day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }

    function getDailyResult(dateString) {
        return dailyResults.find((result) => (
            new Date(result.date).toISOString().slice(0, 10)
                === dateString
        ))
    }

    return (
        <>
            <div className="month-nav">
                <button
                    type="button"
                    className="prev-btn"
                    onClick={() => changeMonth(-1)}
                >
                    {'<'}
                </button>

                <h2 id="monthLabel">
                    {months[month]} {year}
                </h2>

                <button
                    type="button"
                    className="next-btn"
                    onClick={() => changeMonth(1)}
                >
                    {'>'}
                </button>
            </div>

            <div className="weekdays">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
                    .map((day) => (
                        <span key={day}>{day}</span>
                    ))}
            </div>

            <div className="calendar" id="calendar">
                {days.map((day, index) => {
                    if (day === null) {
                        return (
                            <div
                                className="empty"
                                key={`empty-${index}`}
                            />
                        )
                    }

                    const dateString = formatDate(day)
                    const isToday = dateString === today
                    const isSelected = dateString === selectedDate
                    const result = getDailyResult(dateString)

                    let statusClass = ''

                    if (result) {
                        statusClass = result.status
                            ? 'day-success'
                            : 'day-failed'
                    }

                    return (
                        <button
                            type="button"
                            key={dateString}
                            className={[
                                'day',
                                isToday ? 'today-highlight' : '',
                                isSelected ? 'selected-day' : '',
                                statusClass
                            ].filter(Boolean).join(' ')}
                            onClick={() => onSelectDate(dateString)}
                            aria-pressed={isSelected}
                        >
                            {day}
                        </button>
                    )
                })}
            </div>
        </>
    )
}