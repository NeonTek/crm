// Type definitions for NeonTek CRM
export interface Client {
  id: string
  name: string
  email: string
  phone: string
  company: string
  contactPerson: string
  serviceOffered: string
  hostingProvider?: string
  hostingExpiryDate?: string
  hostingPrice?: number
  domainName?: string
  domainExpiryDate?: string
  domainPrice?: number
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description: string;
  status: "planning" | "in-progress" | "completed" | "on-hold";
  startDate: string;
  endDate?: string;
  budget?: number;
  amountPaid?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  assignedTo?: string;
  startDate?: string;
  dueDate?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string
  type: "domain-expiry" | "hosting-expiry" | "general"
  clientId: string
  title: string
  message: string
  daysUntilExpiry?: number
  isRead: boolean
  createdAt: string
}

export interface Payment {
  id: string;
  clientId: string;
  projectId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: "cash" | "mpesa" | "bank_transfer" | "other";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Invoice-related Interfaces ---
export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  projectId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
