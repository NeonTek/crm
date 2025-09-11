import { AuthGuard } from "@/components/auth-guard"
import { ClientList } from "@/components/client-list"

export default function ClientsPage() {
  return (
    <AuthGuard>
      <ClientList />
    </AuthGuard>
  )
}
