import mongoose from "mongoose"

declare global {
  var myMongoose: {
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
  }
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.myMongoose

if (!cached) {
  cached = global.myMongoose = { conn: null, promise: null }
}

async function dbConnect() {
  const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb+srv://neontek6_db_user:0cJesvAjzxdm29Ec@cluster0.albjtdk.mongodb.net/neontek_crm?retryWrites=true&w=majority&appName=Cluster0"

  if (cached.conn) {
    console.log("[v0] Using cached database connection")
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000, // Increased timeout for better connection reliability
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000, // Increased connection timeout
      retryWrites: true,
      w: "majority",
      heartbeatFrequencyMS: 10000,
      maxIdleTimeMS: 30000,
    }

    console.log("[v0] Creating new database connection")

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("[v0] Database connected successfully")
        return mongoose
      })
      .catch((error) => {
        console.error("[v0] Database connection promise failed:", error)
        cached.promise = null
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
    console.log("[v0] Database connection established")
  } catch (e) {
    cached.promise = null
    console.error("[v0] Database connection failed:", e)
    throw new Error(`Database connection failed: ${e instanceof Error ? e.message : "Unknown error"}`)
  }

  return cached.conn
}

export default dbConnect
