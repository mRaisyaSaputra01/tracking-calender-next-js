import { getServerSession } from "next-auth";
import { authOption } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/libs/prisma";

// GET: Mengambil tugas milik user yang login
export async function GET() {
    try {
        const session = await getServerSession(authOption);

        if (!session?.user?.id) {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const tasks = await prisma.tasks.findMany({
            where: {
                user_id: session.user.id
            },
            orderBy: {
                id: "desc"
            }
        });

        return Response.json(tasks);
    } catch (error) {
        console.error("GET tasks error:", error);

        return Response.json(
            { message: "Failed to retrieve tasks" },
            { status: 500 }
        );
    }
}

// POST: Membuat tugas baru
export async function POST(request) {
    try {
        const session = await getServerSession(authOption);

        if (!session?.user?.id) {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { tasks, date } = await request.json();

        if (
            typeof tasks !== "string" ||
            !tasks.trim() ||
            !date ||
            Number.isNaN(Date.parse(date))
        ) {
            return Response.json(
                { message: "Valid tasks and date are required" },
                { status: 400 }
            );
        }

        const newTask = await prisma.tasks.create({
            data: {
                tasks: tasks.trim(),
                date: new Date(date),
                user_id: session.user.id,
                completed: false
            }
        });

        return Response.json(newTask, { status: 201 });
    } catch (error) {
        console.error("POST task error:", error);

        return Response.json(
            { message: "Failed to create task" },
            { status: 500 }
        );
    }
}
