import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { TaskModel } from "@/lib/models";

export async function GET() {
  await connectDB();
  try {
    const tasksToUpdate = await TaskModel.find({
      $or: [{ startDate: { $exists: false } }, { startDate: "" }],
    }).lean();

    if (tasksToUpdate.length === 0) {
      return NextResponse.json({
        message: "Task migration complete. All tasks are up-to-date.",
      });
    }

    let updatedCount = 0;
    for (const task of tasksToUpdate) {
      const newStartDate = new Date(task.createdAt).toISOString().split("T")[0];
      await TaskModel.updateOne(
        { _id: task._id },
        { $set: { startDate: newStartDate } }
      );
      updatedCount++;
    }

    return NextResponse.json({
      message: `Successfully migrated ${updatedCount} tasks.`,
    });
  } catch (error) {
    console.error("Task migration error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        message: "An error occurred during task migration.",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
