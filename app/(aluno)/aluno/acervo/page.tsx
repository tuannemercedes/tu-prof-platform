import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";
import { doIdioma, getIdiomaDoAluno } from "@/lib/idioma";
import { capaDoItem, TIPO_ROTULO } from "@/lib/capas";
import AcervoGaleria, { type ItemAcervo } from "@/components/acervo-galeria";

type Row = {
  id: string;
  titulo: string;
  tipo: string;
  url: string | null;
  capa_url: string | null;
  capa_path: string | null;
  idioma: string;
  materia_id: string;
  materias: { titulo: string; categoria: string } | null;
};

export default async function AcervoPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { aba } = await searchParams;
  const user = await getUser();
  const supabase = await createClient();
  const { atual: idioma } = await getIdiomaDoAluno(supabase, user!.id);

  const [{ data: materiais }, { data: termos }] = await Promise.all([
    supabase
      .from("materiais")
      .select("id, titulo, tipo, url, capa_url, capa_path, idioma, materia_id, materias(titulo, categoria)")
      .order("ordem"),
    supabase.from("glossario_termos").select("id, termo, definicao, exemplo, idioma, aluno_id, categoria").order("termo"),
  ]);

  const itens: ItemAcervo[] = [];
  ((materiais ?? []) as unknown as Row[]).forEach((m) => {
    const cat = m.materias?.categoria;
    if (cat !== "fia" && cat !== "biblioteca") return;
    if (!doIdioma(m.idioma, idioma)) return;
    itens.push({
      id: m.id,
      area: cat,
      tipo: m.tipo,
      tag: TIPO_ROTULO[m.tipo] ?? "Item",
      titulo: m.titulo,
      colecao: m.materias?.titulo ?? "",
      capa: capaDoItem({
        url: m.url,
        capa_url: m.capa_url,
        capa_publica: m.capa_path ? supabase.storage.from("capas").getPublicUrl(m.capa_path).data.publicUrl : null,
      }),
      href: `/aluno/materias/${m.materia_id}#material-${m.id}`,
    });
  });
  (termos ?? []).forEach((t) => {
    if (!doIdioma(t.idioma, idioma)) return;
    itens.push({
      id: t.id,
      area: "biblioteca",
      tipo: "glossario",
      tag: "Glossário",
      titulo: t.termo,
      colecao: t.aluno_id ? `Só para você · ${t.definicao ?? ""}` : t.definicao ?? "",
      capa: null,
      href: "/aluno/glossario",
    });
  });

  return (
    <div>
      <div className="space-y-1.5 mb-5">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--gold-text)]">Acervo</p>
        <h1 className="m-0 font-serif font-semibold text-[34px] leading-[1.05]">
          {idioma === "ingles" ? "Seu inglês fora da aula" : "Seu espanhol fora da aula"}
        </h1>
      </div>
      <AcervoGaleria itens={itens} abaInicial={aba === "biblioteca" ? "biblioteca" : "fia"} />
    </div>
  );
}
