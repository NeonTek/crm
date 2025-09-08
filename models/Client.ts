import mongoose, { type Document, Schema } from "mongoose"

export interface IClient extends Document {
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  createdAt: Date
  updatedAt: Date
}

const ClientSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, "Contact person is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema)
