import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Invoice, Client, Project } from "@/lib/types";

interface InvoiceData {
  invoice: Invoice;
  client: Client;
  project: Project;
}

async function getInvoiceData(invoiceId: string): Promise<InvoiceData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/invoices/${invoiceId}/public`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Failed to fetch invoice data", error);
    return null;
  }
}

export default async function InvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getInvoiceData(params.id);

  if (!data) {
    notFound();
  }

  const { invoice, client, project } = data;

  const getStatusColor = (status: Invoice["status"]) => {
    if (status === "paid") return "bg-green-100 text-green-800";
    if (status === "overdue") return "bg-red-100 text-red-800";
    if (status === "sent") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-muted min-h-screen p-4 sm:p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="p-8">
          <div className="flex flex-col sm:flex-row justify-between gap-8">
            <div>
              <Image
                src="/logo.png"
                alt="NeonTek Logo"
                width={150}
                height={50}
                className="dark:invert mb-4"
              />
              <p className="text-muted-foreground text-sm">Nairobi, Kenya</p>
            </div>
            <div className="text-left sm:text-right">
              <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
              <p className="text-muted-foreground"># {invoice.invoiceNumber}</p>
              <Badge className={`mt-2 ${getStatusColor(invoice.status)}`}>
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div>
              <h3 className="font-semibold mb-1">Bill To</h3>
              <p className="text-sm font-medium">{client.name}</p>
              <p className="text-sm text-muted-foreground">{client.company}</p>
              <p className="text-sm text-muted-foreground">{client.email}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm">
                <strong>Issue Date:</strong>{" "}
                {new Date(invoice.issueDate).toLocaleDateString()}
              </p>
              <p className="text-sm">
                <strong>Due Date:</strong>{" "}
                {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lineItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    KES {item.unitPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    KES {item.total.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end mt-8">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>KES {invoice.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
          {invoice.notes && (
            <div className="mt-8 pt-4 border-t">
              <h4 className="font-semibold">Notes</h4>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
