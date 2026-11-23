import { createClient } from "@/lib/supabase/server";
import BibliotecaLista, { type ItemBiblioteca } from "@/components/biblioteca-lista";

const TIPO: Record<string, string> = {
  html: "Página",
  pdf: "PDF",
  video: "Vídeo",
  playlist: "Playlist",
  podcast: "Podcast",
  link_externo: "Link",
};

type MaterialRow = {
  id: string;
  titulo: string;
  tipo: string;
  materia_id: string;
  materias: { titulo: string; categoria: string } | null;
};

export default async function BibliotecaPage() {
  const supabase = await createClient();

  const [{ data: materiais }, { data: termos }] = await Promise.all([
    supabase.from("materiais").select("id, titulo, tipo, materia_id, materias(titulo, categoria)").order("ordem"),
    supabase.from("glossario_termos").select("id, termo, definicao, exemplo").order("termo"),
  ]);

  const itens: ItemBiblioteca[] = [];
  ((materiais ?? []) as unknown as MaterialRow[]).forEach((m) => {
    const fia = m.materias?.categoria === "fia";
    if (!fia && !["pdf", "link_externo"].includes(m.tipo)) return;
    itens.push({
      id: m.id,
      grupo: fia ? "fia" : "material",
      tag: TIPO[m.tipo] ?? "Item",
      titulo: m.titulo,
      descricao: m.materias?.titulo ?? "",
      href: `/aluno/materias/${m.materia_id}#material-${m.id}`,
    });
  });
  (termos ?? []).forEach((t) => {
    itens.push({
      id: t.id,
      grupo: "glossario",
      tag: "Termo",
      titulo: t.termo,
      descricao: [t.definicao, t.exemplo ? `Ex.: ${t.exemplo}` : null].filter(Boolean).join(" "),
      href: "/aluno/glossario",
    });
  });

  return (
    <div>
      <div className="space-y-1.5 mb-5">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--gold-text)]">Biblioteca</p>
        <h1 className="m-0 font-serif font-semibold text-[34px] leading-[1.05]">Espanhol fora da aula</h1>
      </div>
      <BibliotecaLista itens={itens} />
    </div>
  );
}
