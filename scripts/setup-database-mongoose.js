const mongoose = require("mongoose")

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://neontek6_db_user:0cJesvAjzxdm29Ec@cluster0.albjtdk.mongodb.net/neontek_crm?retryWrites=true&w=majority&appName=Cluster0"

async function setupDatabase() {
  try {
    console.log("Connecting to MongoDB with Mongoose...")
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB successfully!")

    // Create indexes for better performance
    const db = mongoose.connection.db

    // Client indexes
    await db.collection("clients").createIndex({ email: 1 }, { unique: true })
    await db.collection("clients").createIndex({ createdAt: -1 })
    console.log("Created indexes for clients collection")

    // Project indexes
    await db.collection("projects").createIndex({ clientId: 1 })
    await db.collection("projects").createIndex({ status: 1 })
    await db.collection("projects").createIndex({ createdAt: -1 })
    console.log("Created indexes for projects collection")

    // Task indexes
    await db.collection("tasks").createIndex({ projectId: 1 })
    await db.collection("tasks").createIndex({ status: 1 })
    await db.collection("tasks").createIndex({ priority: 1 })
    await db.collection("tasks").createIndex({ createdAt: -1 })
    console.log("Created indexes for tasks collection")

    // Notification indexes
    await db.collection("notifications").createIndex({ clientId: 1 })
    await db.collection("notifications").createIndex({ type: 1 })
    await db.collection("notifications").createIndex({ isRead: 1 })
    await db.collection("notifications").createIndex({ createdAt: -1 })
    console.log("Created indexes for notifications collection")

    console.log("Database setup completed successfully!")
  } catch (error) {
    console.error("Error setting up database:", error)
  } finally {
    await mongoose.disconnect()
  }
}

setupDatabase()
