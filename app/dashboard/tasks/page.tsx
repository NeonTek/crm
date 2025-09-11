import { AuthGuard } from "@/components/auth-guard"
import { TaskList } from "@/components/task-list"

export default function TasksPage() {
  return (
    <AuthGuard>
      <TaskList />
    </AuthGuard>
  )
}
