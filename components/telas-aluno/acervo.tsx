import { createClient } from "@/lib/supabase/server";
import { doIdioma, TEXTOS_IDIOMA } from "@/lib/idioma";
import { getLiberados, liberado, rota, type Visao } from "@/lib/visao";
import { getGlossarioAcessoParaAluno } from "@/lib/glossario";
import { pastasDoGlossario } from "@/lib/glossario-pastas";
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

export default async function TelaAcervo({ v, aba }: { v: Visao; aba?: string }) {
  const supabase = await createClient();
  const idioma = v.idioma;
  const lib = await getLiberados(supabase, v);
  const temGlossario = !v.previa || (await getGlossarioAcessoParaAluno(supabase, v.alunoId));

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
    if (!doIdioma(m.idioma, idioma) || !liberado(lib, m.id)) return;
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
      href: rota(v, `/materias/${m.materia_id}`, `#material-${m.id}`),
    });
  });
  const termosVisiveis = (termos ?? []).filter(
    (t) =>
      doIdioma(t.idioma, idioma) &&
      (!v.previa || (t.aluno_id ? t.aluno_id === v.alunoId : temGlossario))
  );
  // Cada tema do glossário vira uma "pasta" na galeria.
  pastasDoGlossario(termosVisiveis).forEach((p) => {
    itens.push({
      id: p.nome,
      area: "biblioteca",
      tipo: "glossario",
      tag: "Glossário",
      titulo: p.nome,
      colecao: idioma === "ingles" ? "Em inglês" : "Em espanhol",
      quantidade: p.termos.length,
      busca: p.termos.map((t) => `${t.termo} ${t.definicao ?? ""}`).join(" "),
      capa: null,
      href: rota(v, "/glossario", "", { tema: p.nome }),
    });
  });

  return (
    <div>
      <div className="space-y-1.5 mb-5">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--gold-text)]">Acervo</p>
        <h1 className="m-0 font-serif font-semibold text-[34px] leading-[1.05]">
          {TEXTOS_IDIOMA[idioma].foraDaAula}
        </h1>
      </div>
      <AcervoGaleria itens={itens} abaInicial={aba === "biblioteca" ? "biblioteca" : "fia"} />
    </div>
  );
}
