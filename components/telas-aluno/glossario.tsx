import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GlossarioList from "@/components/glossario-list";
import CabecalhoPagina from "@/components/cabecalho-pagina";
import { IconePasta } from "@/components/acervo-galeria";
import { doIdioma } from "@/lib/idioma";
import { rota, type Visao } from "@/lib/visao";
import { getGlossarioAcessoParaAluno } from "@/lib/glossario";
import { pastasDoGlossario, subcategoriaDo } from "@/lib/glossario-pastas";

// Glossário do aluno em "pastas": sem tema, mostra os cartões dos temas;
// com ?tema=..., abre a pasta e lista as palavras daquele tema.
export default async function TelaGlossario({ v, tema }: { v: Visao; tema?: string }) {
  const supabase = await createClient();
  const idioma = v.idioma;
  const rotuloIdioma = idioma === "ingles" ? "inglês" : "espanhol";

  const [temGlossario, { data: config }, { data: termos }] = await Promise.all([
    v.previa ? getGlossarioAcessoParaAluno(supabase, v.alunoId) : Promise.resolve(true),
    supabase.from("glossario_config").select("id").eq("id", 1).maybeSingle(),
    supabase.from("glossario_termos").select("id, termo, definicao, exemplo, categoria, idioma, aluno_id").order("termo"),
  ]);

  const meus = (termos ?? []).filter(
    (t) => doIdioma(t.idioma, idioma) && (!v.previa || (t.aluno_id ? t.aluno_id === v.alunoId : temGlossario))
  );
  const pastas = pastasDoGlossario(meus);

  if (!(v.previa ? temGlossario : config) && !meus.length) {
    return <p className="text-sm text-[var(--text-secondary)]">Você ainda não tem acesso ao Glossário.</p>;
  }

  const voltar = (
    <Link
      href={tema ? rota(v, "/glossario") : rota(v, "/acervo", "", { aba: "biblioteca" })}
      className="inline-flex items-center gap-1 mb-4 text-sm font-semibold text-[var(--gold-text)]"
    >
      ← {tema ? "Todos os glossários" : "Biblioteca"}
    </Link>
  );

  const pasta = tema ? pastas.find((p) => p.nome === tema) : null;

  if (tema && pasta) {
    return (
      <div className="max-w-2xl">
        {voltar}
        <CabecalhoPagina
          sobretitulo={`Glossário · ${rotuloIdioma}`}
          titulo={pasta.nome}
          descricao={`${pasta.termos.length} ${pasta.termos.length === 1 ? "palavra" : "palavras"}`}
        />
        <GlossarioList termos={pasta.termos.map((t) => ({ ...t, categoria: subcategoriaDo(t) }))} />
      </div>
    );
  }

  return (
    <div>
      {voltar}
      <CabecalhoPagina
        sobretitulo={`Acervo · Biblioteca · ${rotuloIdioma}`}
        titulo="Glossários"
        descricao={tema ? "Esse tema não existe neste idioma. Escolha um dos glossários abaixo." : "Escolha um tema para ver as palavras."}
      />
      {pastas.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {pastas.map((p) => (
            <Link key={p.nome} href={rota(v, "/glossario", "", { tema: p.nome })} className="group flex flex-col gap-2">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--warning-bg)] text-[var(--warning-text)] flex flex-col justify-end gap-1 p-3.5">
                <IconePasta className="absolute top-3 right-3 opacity-70" />
                <span className="font-serif font-semibold text-[22px] leading-tight line-clamp-3">{p.nome}</span>
                <span className="text-xs font-semibold opacity-80">
                  {p.termos.length} {p.termos.length === 1 ? "palavra" : "palavras"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-secondary)]">Ainda não há palavras em {rotuloIdioma}.</p>
      )}
    </div>
  );
}
