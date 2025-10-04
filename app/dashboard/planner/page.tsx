import { AuthGuard } from "@/components/auth-guard";
import { TeamPlanner } from "@/components/team-planner";

export default function PlannerPage() {
  return (
    <AuthGuard>
      <TeamPlanner />
    </AuthGuard>
  );
}
