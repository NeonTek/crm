import mongoose, { type Document, Schema } from "mongoose"

export interface IProject extends Document {
  name: string
  client: mongoose.Types.ObjectId
  description: string
  status: "Planning" | "In Progress" | "Completed" | "On Hold"
  startDate: Date
  endDate: Date
  domainExpiry?: Date
  hostingExpiry?: Date
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client is required"],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Planning", "In Progress", "Completed", "On Hold"],
      default: "Planning",
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    domainExpiry: {
      type: Date,
      required: false,
    },
    hostingExpiry: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema)
