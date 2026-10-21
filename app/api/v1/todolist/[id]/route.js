import { getServerSession } from "next-auth";
import { authOption } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/libs/prisma";

// PUT: Memperbarui tugas milik user yang login
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOption);

        if (!session?.user?.id) {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const taskId = Number(id);

        if (!Number.isSafeInteger(taskId) || taskId <= 0) {
            return Response.json(
                { message: "Invalid task ID" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const data = {};

        if (typeof body.tasks === "string" && body.tasks.trim()) {
            data.tasks = body.tasks.trim();
        }

        if (body.date !== undefined) {
            if (
                typeof body.date !== "string" ||
                !body.date ||
                Number.isNaN(Date.parse(body.date))
            ) {
                return Response.json(
                    { message: "Invalid date" },
                    { status: 400 }
                );
            }

            data.date = new Date(body.date);
        }

        if (body.completed !== undefined) {
            if (typeof body.completed !== "boolean") {
                return Response.json(
                    { message: "Completed must be a boolean" },
                    { status: 400 }
                );
            }

            data.completed = body.completed;
        }

        if (Object.keys(data).length === 0) {
            return Response.json(
                { message: "No valid fields to update" },
                { status: 400 }
            );
        }

        const result = await prisma.tasks.updateMany({
            where: {
                id: taskId,
                user_id: session.user.id
            },
            data
        });

        if (result.count === 0) {
            return Response.json(
                { message: "Task not found" },
                { status: 404 }
            );
        }

        const updatedTask = await prisma.tasks.findFirst({
            where: {
                id: taskId,
                user_id: session.user.id
            }
        });

        return Response.json(updatedTask);
    } catch (error) {
        console.error("PUT task error:", error);

        return Response.json(
            { message: "Failed to update task" },
            { status: 500 }
        );
    }
}

// DELETE: Menghapus tugas milik user yang login
export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOption);

        if (!session?.user?.id) {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const taskId = Number(id);

        if (!Number.isSafeInteger(taskId) || taskId <= 0) {
            return Response.json(
                { message: "Invalid task ID" },
                { status: 400 }
            );
        }

        const result = await prisma.tasks.deleteMany({
            where: {
                id: taskId,
                user_id: session.user.id
            }
        });

        if (result.count === 0) {
            return Response.json(
                { message: "Task not found" },
                { status: 404 }
            );
        }

        return Response.json({
            message: "Task deleted successfully"
        });
    } catch (error) {
        console.error("DELETE task error:", error);

        return Response.json(
            { message: "Failed to delete task" },
            { status: 500 }
        );
    }
}