import { AuthGuard } from "@/components/auth-guard"
import { NotificationCenter } from "@/components/notification-center"

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <NotificationCenter />
    </AuthGuard>
  )
}
