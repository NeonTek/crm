import { AuthGuard } from "@/components/auth-guard"
import { ProjectList } from "@/components/project-list"

export default function ProjectsPage() {
  return (
    <AuthGuard>
      <ProjectList />
    </AuthGuard>
  )
}
