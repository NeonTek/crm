const mongoose = require("mongoose")

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://neontek6_db_user:0cJesvAjzxdm29Ec@cluster0.albjtdk.mongodb.net/neontek_crm?retryWrites=true&w=majority&appName=Cluster0"

// Define schemas inline for seeding
const ClientSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    company: String,
    contactPerson: String,
    serviceOffered: String,
    hostingProvider: String,
    hostingExpiryDate: String,
    hostingPrice: Number,
    domainName: String,
    domainExpiryDate: String,
    domainPrice: Number,
  },
  { timestamps: true },
)

const ProjectSchema = new mongoose.Schema(
  {
    clientId: String,
    name: String,
    description: String,
    status: String,
    startDate: String,
    endDate: String,
    budget: Number,
  },
  { timestamps: true },
)

const TaskSchema = new mongoose.Schema(
  {
    projectId: String,
    title: String,
    description: String,
    status: String,
    priority: String,
    assignedTo: String,
    dueDate: String,
  },
  { timestamps: true },
)

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(MONGODB_URI)
    console.log("Connected successfully!")

    const Client = mongoose.model("Client", ClientSchema)
    const Project = mongoose.model("Project", ProjectSchema)
    const Task = mongoose.model("Task", TaskSchema)

    // Clear existing data
    await Client.deleteMany({})
    await Project.deleteMany({})
    await Task.deleteMany({})
    console.log("Cleared existing data")

    // Seed clients
    const clients = await Client.insertMany([
      {
        name: "John Doe",
        email: "john@example.com",
        phone: "+254712345678",
        company: "Tech Solutions Ltd",
        contactPerson: "John Doe",
        serviceOffered: "Website Development",
        hostingProvider: "Hostinger",
        hostingExpiryDate: "2025-03-15",
        hostingPrice: 5000,
        domainName: "techsolutions.co.ke",
        domainExpiryDate: "2025-02-20",
        domainPrice: 1500,
      },
      {
        name: "Jane Smith",
        email: "jane@business.com",
        phone: "+254723456789",
        company: "Business Corp",
        contactPerson: "Jane Smith",
        serviceOffered: "E-commerce Platform",
        hostingProvider: "SiteGround",
        hostingExpiryDate: "2025-04-10",
        hostingPrice: 8000,
        domainName: "businesscorp.com",
        domainExpiryDate: "2025-03-25",
        domainPrice: 2000,
      },
    ])
    console.log(`Seeded ${clients.length} clients`)

    // Seed projects
    const projects = await Project.insertMany([
      {
        clientId: clients[0]._id.toString(),
        name: "Corporate Website Redesign",
        description: "Complete redesign of the company website with modern UI/UX",
        status: "in-progress",
        startDate: "2024-12-01",
        endDate: "2025-02-28",
        budget: 150000,
      },
      {
        clientId: clients[1]._id.toString(),
        name: "E-commerce Platform Development",
        description: "Build a full-featured e-commerce platform with payment integration",
        status: "planning",
        startDate: "2025-01-15",
        endDate: "2025-05-30",
        budget: 300000,
      },
    ])
    console.log(`Seeded ${projects.length} projects`)

    // Seed tasks
    const tasks = await Task.insertMany([
      {
        projectId: projects[0]._id.toString(),
        title: "Design Homepage Mockup",
        description: "Create wireframes and mockups for the new homepage design",
        status: "completed",
        priority: "high",
        assignedTo: "Design Team",
        dueDate: "2024-12-15",
      },
      {
        projectId: projects[0]._id.toString(),
        title: "Implement Responsive Navigation",
        description: "Code the responsive navigation menu for all device sizes",
        status: "in-progress",
        priority: "medium",
        assignedTo: "Frontend Developer",
        dueDate: "2024-12-20",
      },
      {
        projectId: projects[1]._id.toString(),
        title: "Setup Payment Gateway",
        description: "Integrate M-Pesa and card payment options",
        status: "todo",
        priority: "high",
        assignedTo: "Backend Developer",
        dueDate: "2025-02-01",
      },
    ])
    console.log(`Seeded ${tasks.length} tasks`)

    console.log("Database seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await mongoose.disconnect()
  }
}

seedDatabase()
