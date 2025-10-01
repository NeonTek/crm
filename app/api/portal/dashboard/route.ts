import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/portal-auth";
import { getClientById, getProjectsByClientId } from "@/lib/data";

// Helper function to calculate days remaining
const calculateDaysRemaining = (expiryDate?: string): number | null => {
  if (!expiryDate) return null;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export async function GET() {
  try {
    const session = await getClientSession();

    if (!session.isLoggedIn || !session.clientId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const client = await getClientById(session.clientId);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const projects = await getProjectsByClientId(session.clientId);

    // Add service details with days remaining
    const services = {
      hosting: {
        provider: client.hostingProvider,
        expiryDate: client.hostingExpiryDate,
        price: client.hostingPrice,
        daysRemaining: calculateDaysRemaining(client.hostingExpiryDate),
      },
      domain: {
        name: client.domainName,
        expiryDate: client.domainExpiryDate,
        price: client.domainPrice,
        daysRemaining: calculateDaysRemaining(client.domainExpiryDate),
      },
    };

    return NextResponse.json({
      client,
      projects,
      services, // Include services in the response
    });
  } catch (error) {
    console.error("Error fetching client dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
