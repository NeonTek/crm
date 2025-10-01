import mongoose, { Schema, type Document } from "mongoose";
import type { Client, Project, Task, Notification } from "./types";

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
        ret.id = ret._id.toString();
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Project Schema
interface IProject extends Omit<Project, "id">, Document {
  amountPaid?: number; // Add this
}

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
    amountPaid: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Payment Schema
interface IPayment extends Document {
  clientId: string;
  projectId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: "cash" | "mpesa" | "bank_transfer" | "other";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    clientId: { type: String, required: true, ref: "Client" },
    projectId: { type: String, required: true, ref: "Project" },
    amount: { type: Number, required: true },
    paymentDate: { type: String, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "mpesa", "bank_transfer", "other"],
      default: "mpesa",
    },
    notes: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Task Schema
interface ITask extends Omit<Task, "id">, Document {
  cost?: number; // Add this
}

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
    cost: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.createdAt = ret.createdAt.toISOString();
        ret.updatedAt = ret.updatedAt.toISOString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

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
        ret.id = ret._id.toString();
        ret.createdAt = ret.createdAt.toISOString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Ticket Schema
interface IMessage extends Document {
  sender: "client" | "staff";
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: String, enum: ["client", "staff"], required: true },
  content: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

interface ITicket extends Document {
  clientId: string;
  clientName: string;
  subject: string;
  status: "open" | "in-progress" | "closed";
  priority: "low" | "medium" | "high";
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    clientId: { type: String, required: true, ref: "Client" },
    clientName: { type: String, required: true },
    subject: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "in-progress", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Export models
export const ClientModel =
  mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);
export const ProjectModel =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
export const TaskModel =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
export const NotificationModel =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export const TicketModel =
  mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema);

export const PaymentModel =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

