// Mongoose models for NeonTek CRM
import mongoose, { Schema, type Document } from "mongoose"
import type { Client, Project, Task, Notification } from "./types"

// Client Schema
interface IClient extends Omit<Client, "id">, Document {}

const ClientSchema = new Schema<IClient>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    company: { type: String, required: true },
    contactPerson: { type: String, required: true },
    serviceOffered: { type: String, required: true },
    hostingProvider: { type: String },
    hostingExpiryDate: { type: String },
    hostingPrice: { type: Number },
    domainName: { type: String },
    domainExpiryDate: { type: String },
    domainPrice: { type: Number },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString()
        ret.createdAt = ret.createdAt.toISOString()
        ret.updatedAt = ret.updatedAt.toISOString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

// Project Schema
interface IProject extends Omit<Project, "id">, Document {}

const ProjectSchema = new Schema<IProject>(
  {
    clientId: { type: String, required: true, ref: "Client" },
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["planning", "in-progress", "completed", "on-hold"],
      default: "planning",
    },
    startDate: { type: String, required: true },
    endDate: { type: String },
    budget: { type: Number },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString()
        ret.createdAt = ret.createdAt.toISOString()
        ret.updatedAt = ret.updatedAt.toISOString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

// Task Schema
interface ITask extends Omit<Task, "id">, Document {}

const TaskSchema = new Schema<ITask>(
  {
    projectId: { type: String, required: true, ref: "Project" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    assignedTo: { type: String },
    dueDate: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString()
        ret.createdAt = ret.createdAt.toISOString()
        ret.updatedAt = ret.updatedAt.toISOString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

// Notification Schema
interface INotification extends Omit<Notification, "id">, Document {}

const NotificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: ["domain-expiry", "hosting-expiry", "general"],
      required: true,
    },
    clientId: { type: String, required: true, ref: "Client" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    daysUntilExpiry: { type: Number },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString()
        ret.createdAt = ret.createdAt.toISOString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

// Export models
export const ClientModel = mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema)
export const ProjectModel = mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema)
export const TaskModel = mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema)
export const NotificationModel =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema)
