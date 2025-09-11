"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Client } from "@/lib/types"
import { X } from "lucide-react"

interface ClientFormProps {
  client?: Client
  onSuccess: () => void
  onCancel: () => void
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    company: client?.company || "",
    contactPerson: client?.contactPerson || "",
    serviceOffered: client?.serviceOffered || "",
    hostingProvider: client?.hostingProvider || "",
    hostingExpiryDate: client?.hostingExpiryDate || "",
    hostingPrice: client?.hostingPrice?.toString() || "",
    domainName: client?.domainName || "",
    domainExpiryDate: client?.domainExpiryDate || "",
    domainPrice: client?.domainPrice?.toString() || "",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const clientData = {
        ...formData,
        hostingPrice: formData.hostingPrice ? Number(formData.hostingPrice) : undefined,
        domainPrice: formData.domainPrice ? Number(formData.domainPrice) : undefined,
      }

      if (client) {
        const response = await fetch(`/api/clients/${client.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clientData),
        })
        if (!response.ok) throw new Error("Failed to update client")
      } else {
        const response = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clientData),
        })
        if (!response.ok) throw new Error("Failed to create client")
      }

      if ((window as any).refreshDashboardStats) {
        ;(window as any).refreshDashboardStats()
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving client:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{client ? "Edit Client" : "Add New Client"}</CardTitle>
            <CardDescription>
              {client ? "Update client information" : "Enter client details and project information"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleChange("contactPerson", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceOffered">Service Offered</Label>
                <Input
                  id="serviceOffered"
                  value={formData.serviceOffered}
                  onChange={(e) => handleChange("serviceOffered", e.target.value)}
                  placeholder="e.g., Web Development, Mobile App"
                />
              </div>
            </div>
          </div>

          {/* Hosting Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hosting Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hostingProvider">Hosting Provider</Label>
                <Input
                  id="hostingProvider"
                  value={formData.hostingProvider}
                  onChange={(e) => handleChange("hostingProvider", e.target.value)}
                  placeholder="e.g., HostGator, AWS, DigitalOcean"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hostingExpiryDate">Hosting Expiry Date</Label>
                <Input
                  id="hostingExpiryDate"
                  type="date"
                  value={formData.hostingExpiryDate}
                  onChange={(e) => handleChange("hostingExpiryDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hostingPrice">Hosting Price (USD)</Label>
                <Input
                  id="hostingPrice"
                  type="number"
                  step="0.01"
                  value={formData.hostingPrice}
                  onChange={(e) => handleChange("hostingPrice", e.target.value)}
                  placeholder="120.00"
                />
              </div>
            </div>
          </div>

          {/* Domain Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Domain Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="domainName">Domain Name</Label>
                <Input
                  id="domainName"
                  value={formData.domainName}
                  onChange={(e) => handleChange("domainName", e.target.value)}
                  placeholder="example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domainExpiryDate">Domain Expiry Date</Label>
                <Input
                  id="domainExpiryDate"
                  type="date"
                  value={formData.domainExpiryDate}
                  onChange={(e) => handleChange("domainExpiryDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domainPrice">Domain Price (USD)</Label>
                <Input
                  id="domainPrice"
                  type="number"
                  step="0.01"
                  value={formData.domainPrice}
                  onChange={(e) => handleChange("domainPrice", e.target.value)}
                  placeholder="15.00"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : client ? "Update Client" : "Create Client"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
