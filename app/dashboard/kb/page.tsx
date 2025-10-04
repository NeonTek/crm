import { AuthGuard } from "@/components/auth-guard";
import { KbArticleList } from "@/components/kb-article-list";

export default function KnowledgeBasePage() {
  return (
    <AuthGuard>
      <KbArticleList />
    </AuthGuard>
  );
}
