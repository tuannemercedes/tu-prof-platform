import { createClient } from "@/lib/supabase/server";
import GlossarioList from "@/components/glossario-list";
import CabecalhoPagina from "@/components/cabecalho-pagina";
import { getUser } from "@/lib/dal";
import { doIdioma, getIdiomaDoAluno } from "@/lib/idioma";

export default async function AlunoGlossarioPage() {
  const supabase = await createClient();
  const user = await getUser();
  const { atual: idioma } = await getIdiomaDoAluno(supabase, user!.id);

  const [{ data: config }, { data: termos }] = await Promise.all([
    supabase.from("glossario_config").select("id").eq("id", 1).maybeSingle(),
    supabase.from("glossario_termos").select("id, termo, definicao, exemplo, categoria, idioma").order("termo"),
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
<CabecalhoPagina sobretitulo="Acervo · Biblioteca" titulo="Glossário" descricao="As palavras e expressões do seu programa." />

      <GlossarioList termos={(termos ?? []).filter((t) => doIdioma(t.idioma, idioma))} />
    </div>
  );
}
