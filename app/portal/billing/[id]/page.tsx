import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { InvoiceDisplay } from "@/components/invoice-display";
import { getClientById } from "@/lib/data";
import { InvoiceModel } from "@/lib/models";
import { sessionOptions, SessionData } from "@/lib/auth";
import connectDB from "@/lib/mongoose";

async function getInvoiceDataForClient(invoiceId: string) {
  try {
    const session = await getIronSession<SessionData>(
      cookies(),
      sessionOptions
    );
    const clientId = session.clientId;

    if (!clientId) return null; // Not logged in

    await connectDB();
    const invoice = await InvoiceModel.findById(invoiceId).lean();

    // Security Check: Ensure the invoice belongs to the logged-in client
    if (!invoice || invoice.clientId.toString() !== clientId) {
      return null;
    }

    const client = await getClientById(invoice.clientId);
    if (!client) return null;

    // Convert non-serializable BSON properties to strings
    const serializableInvoice = JSON.parse(JSON.stringify(invoice));
    serializableInvoice.id = serializableInvoice._id.toString();

    return { invoice: serializableInvoice, client };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function ClientInvoiceViewPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getInvoiceDataForClient(params.id);

  if (!data) {
    notFound();
  }

  return <InvoiceDisplay invoice={data.invoice} client={data.client} />;
}
