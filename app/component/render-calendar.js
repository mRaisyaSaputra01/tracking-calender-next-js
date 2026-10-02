'use client'
import { useState, useEffect } from 'react'

const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
];

export const Calendar = () => {
    const current = new Date()

    let [month, setMonth] = useState(current.getMonth())
    let [year, setYear] = useState(current.getFullYear())
    const currentToday = current.getDate()
    const currentMonth = current.getMonth()
    const currentYear = current.getFullYear()

    const firstDate = new Date(year, month, 1).getDay()
    const totalDays = new Date(year, month + 1, 0).getDate()

    const days = []

    for (let i = 1; i <= firstDate; i++) {
        days.push(null)
    }

    for (let i = 1; i <= totalDays; i++) {
        days.push(i)
    }

    const prevBtn = () => {
        if (month === 0) {
            setMonth(11)
            setYear(year - 1)
        } else {
            setMonth(month - 1)
        }
    }

    const nextBtn = () => {
        if (month === 11) {
            setMonth(0)
            setYear(year + 1)
        } else {
            setMonth(month + 1)
        }
    }

    console.log(days)

    return (
        <>
            <div className="month-nav">
                <button className="prev-btn" onClick={prevBtn}>{'<'}</button>
                <h2 id="monthLabel">{months[month]} {year}</h2>
                <button className="next-btn" onClick={nextBtn}>{'>'}</button>
            </div>

            <div className="weekdays">
                <span>Min</span>
                <span>Sen</span>
                <span>Sel</span>
                <span>Rab</span>
                <span>Kam</span>
                <span>Jum</span>
                <span>Sab</span>
            </div>

            <div className="calendar" id="calendar">
                {days.map((day, index) => {

                    if (day === null) {
                        return (
                            <div className="empty" key={`empty-${index}`}></div>
                        )
                    }

                    const isToday =
                        day === currentToday &&
                        month === currentMonth &&
                        year === currentYear

                    return (
                        <div
                            className={`day ${isToday ? 'today-highlight' : ''}`}
                            key={day}
                        >
                            {day}
                        </div>
                    )
                })}
            </div>
        </>
    )
}

