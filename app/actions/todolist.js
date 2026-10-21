'use server';

import { prisma } from '@/app/libs/prisma';
import { getServerSession } from 'next-auth';
import { authOption } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

// Mengambil tanggal hari ini berdasarkan WIB.
function getTodayWIB() {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date());

    const values = Object.fromEntries(
        parts.map(({ type, value }) => [type, value])
    );

    return `${values.year}-${values.month}-${values.day}`;
}

// Mengubah tanggal database menjadi format YYYY-MM-DD.
function formatDatabaseDate(date) {
    return date.toISOString().slice(0, 10);
}

// Mengubah tanggal pilihan menjadi objek Date untuk Prisma.
function toDatabaseDate(dateString) {
    return new Date(`${dateString}T00:00:00.000Z`);
}

// Memastikan pengguna sudah login.
async function getAuthenticatedUser() {
    const session = await getServerSession(authOption);

    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const userId = Number(session.user.id);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
        throw new Error('Invalid user ID');
    }

    return userId;
}

// Memastikan tanggal belum lewat dan belum memiliki hasil final.
async function assertDateEditable(userId, date) {
    const dateString = formatDatabaseDate(date);
    const today = getTodayWIB();

    if (dateString < today) {
        throw new Error('Tanggal sudah lewat dan tidak dapat diubah');
    }

    const dailyResult = await prisma.daily_results.findUnique({
        where: {
            user_id_date: {
                user_id: userId,
                date
            }
        },
        select: {
            id: true
        }
    });

    if (dailyResult) {
        throw new Error('Tanggal sudah memiliki hasil final');
    }
}

// Menambahkan tugas untuk tanggal yang dipilih.
export async function addTask(formData) {
    const userId = await getAuthenticatedUser();

    const taskName = formData.get('tasks');
    const selectedDate = formData.get('date');

    if (
        typeof taskName !== 'string' ||
        !taskName.trim()
    ) {
        throw new Error('Nama tugas tidak boleh kosong');
    }

    if (
        typeof selectedDate !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)
    ) {
        throw new Error('Tanggal tidak valid');
    }

    const date = toDatabaseDate(selectedDate);

    // Pastikan tanggal benar-benar valid.
    if (formatDatabaseDate(date) !== selectedDate) {
        throw new Error('Tanggal tidak valid');
    }

    await assertDateEditable(userId, date);

    await prisma.tasks.create({
        data: {
            user_id: userId,
            tasks: taskName.trim(),
            date,
            completed: false,
            locked: false
        }
    });

    revalidatePath('/');
}

// Menandai tugas selesai atau belum selesai.
export async function toggleTask(taskId) {
    const userId = await getAuthenticatedUser();
    const id = Number(taskId);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new Error('Invalid task ID');
    }

    const task = await prisma.tasks.findFirst({
        where: {
            id,
            user_id: userId
        },
        select: {
            id: true,
            date: true,
            completed: true,
            locked: true
        }
    });

    if (!task) {
        throw new Error('Task not found');
    }

    if (task.locked) {
        throw new Error('Tugas sudah dikunci');
    }

    await assertDateEditable(userId, task.date);

    const result = await prisma.tasks.updateMany({
        where: {
            id,
            user_id: userId,
            locked: false,
            completed: task.completed
        },
        data: {
            completed: !task.completed
        }
    });

    if (result.count === 0) {
        throw new Error('Tugas tidak dapat diubah');
    }

    revalidatePath('/');
}

// Menghapus tugas.
export async function removeTask(taskId) {
    const userId = await getAuthenticatedUser();
    const id = Number(taskId);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new Error('Invalid task ID');
    }

    const task = await prisma.tasks.findFirst({
        where: {
            id,
            user_id: userId
        },
        select: {
            id: true,
            date: true,
            locked: true
        }
    });

    if (!task) {
        throw new Error('Task not found');
    }

    if (task.locked) {
        throw new Error('Tugas sudah dikunci');
    }

    await assertDateEditable(userId, task.date);

    const result = await prisma.tasks.deleteMany({
        where: {
            id,
            user_id: userId,
            locked: false
        }
    });

    if (result.count === 0) {
        throw new Error('Tugas tidak dapat dihapus');
    }

    revalidatePath('/');
}