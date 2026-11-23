import { createClient } from "@/lib/supabase/server";
import GlossarioList from "@/components/glossario-list";
import CabecalhoPagina from "@/components/cabecalho-pagina";
import { doIdioma } from "@/lib/idioma";
import { type Visao } from "@/lib/visao";
import { getGlossarioAcessoParaAluno } from "@/lib/glossario";

export default async function TelaGlossario({ v }: { v: Visao }) {
  const supabase = await createClient();
  const idioma = v.idioma;
  const temGlossario = !v.previa || (await getGlossarioAcessoParaAluno(supabase, v.alunoId));

  const [{ data: config }, { data: termos }] = await Promise.all([
    supabase.from("glossario_config").select("id").eq("id", 1).maybeSingle(),
    supabase.from("glossario_termos").select("id, termo, definicao, exemplo, categoria, idioma, aluno_id").order("termo"),
  ]);

  const meus = (termos ?? []).filter(
    (t) =>
      doIdioma(t.idioma, idioma) &&
      (!v.previa || (t.aluno_id ? t.aluno_id === v.alunoId : temGlossario))
  );
  if (!(v.previa ? temGlossario : config) && !meus.length) {
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

      <GlossarioList termos={meus.map((t) => (t.aluno_id ? { ...t, categoria: "Só para você" } : t))} />
    </div>
  );
}
