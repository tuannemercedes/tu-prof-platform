import { createClient } from "@/lib/supabase/server";
import PreviewNav from "@/components/preview-nav";
import GlossarioList from "@/components/glossario-list";
import { getGlossarioAcessoParaAluno } from "@/lib/glossario";

export default async function PreviewGlossarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const temAcesso = await getGlossarioAcessoParaAluno(supabase, id);

  if (!temAcesso) {
    return (
      <div className="space-y-6">
        <PreviewNav alunoId={id} />
        <p className="text-sm text-[var(--text-secondary)]">
          Este aluno ainda não tem acesso ao Glossário.
        </p>
      </div>
    );
  }

  const { data: termos } = await supabase
    .from("glossario_termos")
    .select("id, termo, definicao, exemplo, categoria")
    .order("termo");

  return (
    <div className="space-y-6">
      <PreviewNav alunoId={id} />
      <div>
        <h1 className="text-lg font-semibold">Glossário</h1>
        <p className="text-sm text-[var(--text-secondary)]">Termos e expressões em espanhol.</p>
      </div>

      <GlossarioList termos={termos ?? []} />
    </div>
  );
}
