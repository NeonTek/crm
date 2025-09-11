// Database seeding script for NeonTek CRM
// This script adds sample data for testing

const { MongoClient } = require("mongodb")

const MONGODB_URI =
  "mongodb+srv://neontek6_db_user:0cJesvAjzxdm29Ec@cluster0.albjtdk.mongodb.net/neontek_crm?retryWrites=true&w=majority&appName=Cluster0"

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("neontek_crm")

    // Clear existing data
    await db.collection("clients").deleteMany({})
    await db.collection("projects").deleteMany({})
    await db.collection("tasks").deleteMany({})
    await db.collection("notifications").deleteMany({})
    console.log("Cleared existing data")

    // Sample clients
    const clients = [
      {
        name: "Acme Corporation",
        email: "contact@acme.com",
        phone: "+254700123456",
        company: "Acme Corporation",
        contactPerson: "John Doe",
        serviceOffered: "Web Development",
        hostingProvider: "HostGator",
        hostingExpiryDate: "2024-12-15",
        hostingPrice: 120,
        domainName: "acme.com",
        domainExpiryDate: "2024-11-30",
        domainPrice: 15,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
      {
        name: "Tech Solutions Ltd",
        email: "info@techsolutions.co.ke",
        phone: "+254722987654",
        company: "Tech Solutions Ltd",
        contactPerson: "Jane Smith",
        serviceOffered: "Mobile App Development",
        hostingProvider: "AWS",
        hostingExpiryDate: "2025-03-20",
        hostingPrice: 200,
        domainName: "techsolutions.co.ke",
        domainExpiryDate: "2025-02-14",
        domainPrice: 20,
        createdAt: "2024-02-10T14:30:00Z",
        updatedAt: "2024-02-10T14:30:00Z",
      },
      {
        name: "Green Energy Co",
        email: "hello@greenenergy.com",
        phone: "+254733456789",
        company: "Green Energy Co",
        contactPerson: "Mike Johnson",
        serviceOffered: "E-commerce Website",
        hostingProvider: "Bluehost",
        hostingExpiryDate: "2024-11-25",
        hostingPrice: 80,
        domainName: "greenenergy.com",
        domainExpiryDate: "2024-12-05",
        domainPrice: 12,
        createdAt: "2024-03-05T09:15:00Z",
        updatedAt: "2024-03-05T09:15:00Z",
      },
    ]

    const clientResults = await db.collection("clients").insertMany(clients)
    console.log(`Inserted ${clientResults.insertedCount} clients`)

    // Sample projects
    const clientIds = Object.values(clientResults.insertedIds).map((id) => id.toString())

    const projects = [
      {
        clientId: clientIds[0],
        name: "Corporate Website Redesign",
        description: "Complete redesign of the corporate website with modern UI/UX",
        status: "in-progress",
        startDate: "2024-01-20",
        endDate: "2024-12-20",
        budget: 5000,
        createdAt: "2024-01-20T10:00:00Z",
        updatedAt: "2024-01-20T10:00:00Z",
      },
      {
        clientId: clientIds[1],
        name: "Mobile App Development",
        description: "Native mobile app for iOS and Android platforms",
        status: "planning",
        startDate: "2024-03-01",
        endDate: "2024-08-01",
        budget: 15000,
        createdAt: "2024-02-15T14:30:00Z",
        updatedAt: "2024-02-15T14:30:00Z",
      },
      {
        clientId: clientIds[2],
        name: "E-commerce Platform",
        description: "Full e-commerce solution with payment integration",
        status: "completed",
        startDate: "2024-01-01",
        endDate: "2024-06-01",
        budget: 8000,
        createdAt: "2024-01-01T09:00:00Z",
        updatedAt: "2024-06-01T17:00:00Z",
      },
    ]

    const projectResults = await db.collection("projects").insertMany(projects)
    console.log(`Inserted ${projectResults.insertedCount} projects`)

    // Sample tasks
    const projectIds = Object.values(projectResults.insertedIds).map((id) => id.toString())

    const tasks = [
      {
        projectId: projectIds[0],
        title: "Design homepage mockup",
        description: "Create wireframes and mockups for the new homepage design",
        status: "completed",
        priority: "high",
        assignedTo: "Design Team",
        dueDate: "2024-02-15",
        createdAt: "2024-01-21T10:00:00Z",
        updatedAt: "2024-02-10T15:30:00Z",
      },
      {
        projectId: projectIds[0],
        title: "Implement responsive navigation",
        description: "Code the responsive navigation menu with mobile support",
        status: "in-progress",
        priority: "medium",
        assignedTo: "Frontend Developer",
        dueDate: "2024-11-30",
        createdAt: "2024-02-11T09:00:00Z",
        updatedAt: "2024-02-11T09:00:00Z",
      },
      {
        projectId: projectIds[1],
        title: "User authentication system",
        description: "Implement secure user login and registration",
        status: "todo",
        priority: "high",
        assignedTo: "Backend Developer",
        dueDate: "2024-12-15",
        createdAt: "2024-02-16T11:00:00Z",
        updatedAt: "2024-02-16T11:00:00Z",
      },
    ]

    const taskResults = await db.collection("tasks").insertMany(tasks)
    console.log(`Inserted ${taskResults.insertedCount} tasks`)

    console.log("Database seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()
