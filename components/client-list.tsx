"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Client } from "@/lib/types"
import { ClientForm } from "./client-form"
import { Search, Plus, Edit, Trash2, Building2, Mail, Phone, Calendar, Server, Globe } from "lucide-react"

export function ClientList() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredClients(filtered)
  }, [clients, searchTerm])

  const loadClients = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/clients")
      if (response.ok) {
        const clientsData = await response.json()
        setClients(clientsData)
      }
    } catch (error) {
      console.error("Error loading clients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setShowForm(true)
  }

  const handleDelete = async (clientId: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: "DELETE",
        })
        if (response.ok) {
          loadClients()
        }
      } catch (error) {
        console.error("Error deleting client:", error)
      }
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingClient(undefined)
    loadClients()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingClient(undefined)
  }

  const isExpiringSoon = (expiryDate: string | undefined) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays >= 0
  }

  if (showForm) {
    return <ClientForm client={editingClient} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Clients</h2>
          <p className="text-muted-foreground">Manage your client information and track hosting/domain expiry</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <CardDescription>{client.company}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(client)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(client.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.contactPerson && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{client.contactPerson}</span>
                  </div>
                )}
              </div>

              {client.serviceOffered && (
                <Badge variant="secondary" className="text-xs">
                  {client.serviceOffered}
                </Badge>
              )}

              {/* Hosting Information */}
              {client.hostingProvider && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span>{client.hostingProvider}</span>
                    {client.hostingPrice && <span className="text-muted-foreground">(KES{client.hostingPrice})</span>}
                  </div>
                  {client.hostingExpiryDate && (
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>Expires: {new Date(client.hostingExpiryDate).toLocaleDateString()}</span>
                      {isExpiringSoon(client.hostingExpiryDate) && (
                        <Badge variant="destructive" className="text-xs">
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Domain Information */}
              {client.domainName && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{client.domainName}</span>
                    {client.domainPrice && <span className="text-muted-foreground">(KES{client.domainPrice})</span>}
                  </div>
                  {client.domainExpiryDate && (
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>Expires: {new Date(client.domainExpiryDate).toLocaleDateString()}</span>
                      {isExpiringSoon(client.domainExpiryDate) && (
                        <Badge variant="destructive" className="text-xs">
                          Expiring Soon
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No clients found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "No clients match your search criteria." : "Get started by adding your first client."}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Client
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
