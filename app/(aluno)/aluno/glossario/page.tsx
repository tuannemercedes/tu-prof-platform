import { createClient } from "@/lib/supabase/server";
import GlossarioList from "@/components/glossario-list";

export default async function AlunoGlossarioPage() {
  const supabase = await createClient();

  const [{ data: config }, { data: termos }] = await Promise.all([
    supabase.from("glossario_config").select("id").eq("id", 1).maybeSingle(),
    supabase.from("glossario_termos").select("id, termo, definicao, exemplo, categoria").order("termo"),
  ]);

  if (!config) {
    return (
      <div className="max-w-2xl">
        <p className="text-sm text-[var(--text-secondary)]">
          Você ainda não tem acesso ao Glossário.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-serif font-semibold">Glossário</h1>
        <p className="text-sm text-[var(--text-secondary)]">Termos e expressões em espanhol.</p>
      </div>

      <GlossarioList termos={termos ?? []} />
    </div>
  );
}
