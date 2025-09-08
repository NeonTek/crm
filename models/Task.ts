import mongoose, { type Document, Schema } from "mongoose"

export interface ITask extends Document {
  title: string
  project: mongoose.Types.ObjectId
  description: string
  status: "To Do" | "In Progress" | "Done"
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
}

const TaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },
    description: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Done"],
      default: "To Do",
      required: true,
    },
    dueDate: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema)
