// Database setup script for NeonTek CRM
// This script creates the necessary collections and indexes

const { MongoClient } = require("mongodb")

const MONGODB_URI =
  "mongodb+srv://neontek6_db_user:0cJesvAjzxdm29Ec@cluster0.albjtdk.mongodb.net/neontek_crm?retryWrites=true&w=majority&appName=Cluster0"

async function setupDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("neontek_crm")

    // Create collections
    const collections = ["clients", "projects", "tasks", "notifications"]

    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName)
        console.log(`Created collection: ${collectionName}`)
      } catch (error) {
        if (error.code === 48) {
          console.log(`Collection ${collectionName} already exists`)
        } else {
          console.error(`Error creating collection ${collectionName}:`, error)
        }
      }
    }

    // Create indexes for better performance

    // Clients indexes
    await db.collection("clients").createIndex({ email: 1 }, { unique: true })
    await db.collection("clients").createIndex({ createdAt: -1 })
    await db.collection("clients").createIndex({ hostingExpiryDate: 1 })
    await db.collection("clients").createIndex({ domainExpiryDate: 1 })
    console.log("Created indexes for clients collection")

    // Projects indexes
    await db.collection("projects").createIndex({ clientId: 1 })
    await db.collection("projects").createIndex({ status: 1 })
    await db.collection("projects").createIndex({ createdAt: -1 })
    console.log("Created indexes for projects collection")

    // Tasks indexes
    await db.collection("tasks").createIndex({ projectId: 1 })
    await db.collection("tasks").createIndex({ status: 1 })
    await db.collection("tasks").createIndex({ priority: 1 })
    await db.collection("tasks").createIndex({ dueDate: 1 })
    await db.collection("tasks").createIndex({ createdAt: -1 })
    console.log("Created indexes for tasks collection")

    // Notifications indexes
    await db.collection("notifications").createIndex({ clientId: 1 })
    await db.collection("notifications").createIndex({ type: 1 })
    await db.collection("notifications").createIndex({ isRead: 1 })
    await db.collection("notifications").createIndex({ createdAt: -1 })
    console.log("Created indexes for notifications collection")

    console.log("Database setup completed successfully!")
  } catch (error) {
    console.error("Error setting up database:", error)
  } finally {
    await client.close()
  }
}

setupDatabase()
