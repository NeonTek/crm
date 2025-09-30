import { AuthGuard } from "@/components/auth-guard";
import { BulkNotificationForm } from "@/components/bulk-notification-form";

export default function BulkNotificationsPage() {
  return (
    <AuthGuard>
      <BulkNotificationForm />
    </AuthGuard>
  );
}
