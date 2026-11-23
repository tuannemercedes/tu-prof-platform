import type { createClient } from "@/lib/supabase/server";
import type { Liberados } from "@/lib/visao";

export type Entrega = "feito" | "texto" | "audio" | "link";

export type TarefaAluno = {
  id: string;
  texto: string;
  entrega: Entrega;
  linkUrl: string | null;
  prazo: string | null;
  criadaEm: string;
  concluida: boolean;
  resposta: string | null;
  arquivoPath: string | null;
  comentario: string | null;
  origem: string;
  idioma: string | null;
};

type Row = {
  id: string;
  texto: string;
  entrega: Entrega;
  link_url: string | null;
  prazo: string | null;
  created_at: string;
  aluno_id: string | null;
  turma_id: string | null;
  material_id: string | null;
  idioma: string | null;
  materiais: { titulo: string; idioma: string } | null;
  aulas: { tema: string } | null;
};

// Tarefas que o aluno logado enxerga (a RLS filtra) + a entrega dele em cada uma.
export async function getTarefasDoAluno(
  supabase: Awaited<ReturnType<typeof createClient>>,
  alunoId: string,
  lib: Liberados = null
): Promise<TarefaAluno[]> {
  const [{ data: rows }, { data: entregas }] = await Promise.all([
    supabase
      .from("tarefas")
      .select(
        "id, texto, entrega, link_url, prazo, created_at, aluno_id, turma_id, material_id, idioma, materiais(titulo, idioma), aulas(tema)"
      )
      .order("prazo", { ascending: true, nullsFirst: false })
      .order("created_at"),
    supabase
      .from("tarefa_entregas")
      .select("tarefa_id, concluida, resposta, arquivo_path, comentario")
      .eq("aluno_id", alunoId),
  ]);

  const mapa = new Map((entregas ?? []).map((e) => [e.tarefa_id, e]));

  const visiveis = ((rows ?? []) as unknown as Row[]).filter(
    (r) =>
      !lib ||
      r.aluno_id === alunoId ||
      (!!r.turma_id && lib.turmas.has(r.turma_id)) ||
      (!!r.material_id && lib.materiais.has(r.material_id))
  );

  return visiveis.map((r) => {
    const e = mapa.get(r.id);
    return {
      id: r.id,
      texto: r.texto,
      entrega: r.entrega,
      linkUrl: r.link_url,
      prazo: r.prazo,
      criadaEm: r.created_at,
      concluida: e?.concluida ?? false,
      resposta: e?.resposta ?? null,
      arquivoPath: e?.arquivo_path ?? null,
      comentario: e?.comentario ?? null,
      idioma: r.idioma ?? r.materiais?.idioma ?? null,
      origem: r.aulas?.tema ? `Aula: ${r.aulas.tema}` : r.materiais?.titulo ? r.materiais.titulo : "",
    };
  });
}

export function formatarPrazo(prazo: string | null) {
  if (!prazo) return null;
  const d = new Date(prazo + "T12:00:00");
  return `Até ${new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "short" }).format(d)}`;
}
