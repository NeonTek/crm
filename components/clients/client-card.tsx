"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Mail, Phone, MapPin, MoreVertical, Edit, Trash2, Eye } from "lucide-react"
import { ClientForm } from "./client-form"
import Link from "next/link"
import type { IClient } from "@/models/Client"

interface ClientCardProps {
  client: IClient
  projectCount?: number
  onUpdate: () => void
  onDelete: (id: string) => void
}

export function ClientCard({ client, projectCount = 0, onUpdate, onDelete }: ClientCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg">{client.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{client.contactPerson}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{projectCount} projects</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/clients/${client._id}`} className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <ClientForm
                client={client}
                onSuccess={onUpdate}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Client
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuItem
                onClick={() => onDelete(client._id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{client.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{client.phone}</span>
        </div>
        <div className="flex items-start space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{client.address}</span>
        </div>
      </CardContent>
    </Card>
  )
}
