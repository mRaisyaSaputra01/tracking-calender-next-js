'use client'

import { useState } from 'react'

export const Todolist = () => {
    const [tasks, setTasks] = useState([])
    const [taskInput, setTaskInput] = useState('')
    const [error, setError] = useState(false)

    const addTask = () => {
        const format = taskInput.trim()

        const formattedTask =
            format.charAt(0).toUpperCase() + format.slice(1)

        const newTask = {
            id: Date.now(),
            text: formattedTask,
            completed: false
        }

        setTasks([...tasks, newTask])
    }

    const submitTask = () => {
        if (taskInput.trim() === '') {
            setError(true)
            return
        }

        setError(false)

        addTask()
        setTaskInput('')
    }

    const removeTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id))
    }

    const toggleTask = (id) => {
        setTasks(
            tasks.map(task =>
                task.id === id
                    ? { ...task, completed: !task.completed }
                    : task
            )
        )
    }

    return (
        <div className="todolist-container">

            <div className="todolist">

                {tasks.map(task => (
                    <div className="task-item" key={task.id}>

                        <p className={task.completed ? 'completed' : ''}>
                            {task.text}
                        </p>

                        <div className="task-actions">

                            <button
                                className="done-btn"
                                onClick={() => toggleTask(task.id)}
                            >
                                ✓
                            </button>

                            <button
                                className="remove-btn"
                                onClick={() => removeTask(task.id)}
                            >
                                ×
                            </button>

                        </div>

                    </div>
                ))}

            </div>

            <div className="submit-todolist">

                <input
                    type="text"
                    id="taskInput"
                    placeholder={
                        error
                            ? 'Tambahkan Tugas Dulu'
                            : 'Tambahkan Tugas Disini'
                    }
                    className={error ? 'error' : ''}
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            submitTask()
                        }
                    }}
                />

                <button
                    className="submit-btn"
                    id="submitBtn"
                    onClick={submitTask}
                >
                    Tambah
                </button>

            </div>

        </div>
    )
}