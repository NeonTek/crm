// Create sample data for testing Neontek CRM
console.log("🌱 Creating sample data for Neontek CRM...")

async function createSampleData() {
  try {
    // Create sample clients
    const clients = [
      {
        name: "Acme Corporation",
        contactPerson: "John Smith",
        email: "john@acme.com",
        phone: "+1-555-0101",
        address: "123 Business Ave, New York, NY 10001",
      },
      {
        name: "Tech Innovations Ltd",
        contactPerson: "Sarah Johnson",
        email: "sarah@techinnovations.com",
        phone: "+1-555-0102",
        address: "456 Innovation Drive, San Francisco, CA 94105",
      },
      {
        name: "Global Solutions Inc",
        contactPerson: "Mike Davis",
        email: "mike@globalsolutions.com",
        phone: "+1-555-0103",
        address: "789 Enterprise Blvd, Chicago, IL 60601",
      },
    ]

    console.log("👥 Creating sample clients...")
    const createdClients = []

    for (const client of clients) {
      try {
        const response = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(client),
        })

        if (response.ok) {
          const createdClient = await response.json()
          createdClients.push(createdClient)
          console.log(`✅ Created client: ${client.name}`)
        } else {
          console.log(`❌ Failed to create client: ${client.name}`)
        }
      } catch (error) {
        console.log(`❌ Error creating client ${client.name}:`, error.message)
      }
    }

    // Create sample projects
    if (createdClients.length > 0) {
      console.log("\n📋 Creating sample projects...")

      const projects = [
        {
          name: "Website Redesign",
          client: createdClients[0]._id,
          description: "Complete redesign of the company website with modern UI/UX",
          status: "In Progress",
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          domainExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          hostingExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          name: "Mobile App Development",
          client: createdClients[1]._id,
          description: "Native mobile application for iOS and Android platforms",
          status: "Planning",
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          name: "E-commerce Platform",
          client: createdClients[2]._id,
          description: "Custom e-commerce solution with payment integration",
          status: "Completed",
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          domainExpiry: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
          hostingExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      const createdProjects = []

      for (const project of projects) {
        try {
          const response = await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(project),
          })

          if (response.ok) {
            const createdProject = await response.json()
            createdProjects.push(createdProject)
            console.log(`✅ Created project: ${project.name}`)
          } else {
            console.log(`❌ Failed to create project: ${project.name}`)
          }
        } catch (error) {
          console.log(`❌ Error creating project ${project.name}:`, error.message)
        }
      }

      // Create sample tasks
      if (createdProjects.length > 0) {
        console.log("\n✅ Creating sample tasks...")

        const tasks = [
          {
            title: "Design Homepage Mockup",
            description: "Create wireframes and mockups for the new homepage design",
            project: createdProjects[0]._id,
            status: "Done",
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            title: "Implement User Authentication",
            description: "Set up user login and registration functionality",
            project: createdProjects[0]._id,
            status: "In Progress",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            title: "Mobile App UI Design",
            description: "Design the user interface for the mobile application",
            project: createdProjects[1]._id,
            status: "To Do",
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            title: "Payment Gateway Integration",
            description: "Integrate Stripe payment processing",
            project: createdProjects[2]._id,
            status: "Done",
            dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]

        for (const task of tasks) {
          try {
            const response = await fetch("/api/tasks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(task),
            })

            if (response.ok) {
              console.log(`✅ Created task: ${task.title}`)
            } else {
              console.log(`❌ Failed to create task: ${task.title}`)
            }
          } catch (error) {
            console.log(`❌ Error creating task ${task.title}:`, error.message)
          }
        }
      }
    }

    console.log("\n🎉 Sample data creation completed!")
    console.log("You can now test the CRM with realistic data.")
  } catch (error) {
    console.error("❌ Error creating sample data:", error)
  }
}

// Execute sample data creation
createSampleData()
