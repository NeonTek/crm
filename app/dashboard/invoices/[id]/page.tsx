import { notFound } from "next/navigation";
import { InvoiceDisplay } from "@/components/invoice-display";
import { getClientById } from "@/lib/data";
import { InvoiceModel } from "@/lib/models";
import connectDB from "@/lib/mongoose";

async function getInvoiceDataForAdmin(invoiceId: string) {
  try {
    await connectDB();
    const invoice = await InvoiceModel.findById(invoiceId).lean();
    if (!invoice) return null;

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

export default async function AdminInvoiceViewPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getInvoiceDataForAdmin(params.id);

  if (!data) {
    notFound();
  }

  return <InvoiceDisplay invoice={data.invoice} client={data.client} />;
}
