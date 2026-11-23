"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/dal";
import { detectarTipo } from "@/lib/links";

export type NovaAula = {
  materiaId: string;
  titulo: string;
  link: string;
  idioma: string;
  turmaIds: string[];
  alunoIds: string[];
  todos: boolean;
  tarefa: { texto: string; entrega: string; linkUrl: string } | null;
};

// Cria a aula (material) no módulo, define "Quem vê" e, se houver, a tarefa da aula.
export async function criarAula(dados: NovaAula) {
  const eu = await requireAdmin();
  if (!dados.materiaId || !dados.titulo.trim()) return { error: "Escolha o módulo e dê um título à aula." };

  const supabase = await createClient();
  const { tipo } = detectarTipo(dados.link);
  const url = dados.link.trim() || null;
  if (!url) return { error: "Cole o link do vídeo ou do material." };

  const { count } = await supabase
    .from("materiais")
    .select("*", { count: "exact", head: true })
    .eq("materia_id", dados.materiaId);

  const { data: material, error } = await supabase
    .from("materiais")
    .insert({
      materia_id: dados.materiaId,
      tipo: tipo === "pdf" ? "link_externo" : tipo,
      titulo: dados.titulo.trim(),
      url,
      idioma: dados.idioma,
      visivel_todos: dados.todos,
      ordem: count ?? 0,
    })
    .select("id")
    .single();
  if (error || !material) return { error: "Não foi possível criar a aula." };

  if (dados.turmaIds.length) {
    await supabase.from("material_turmas").insert(dados.turmaIds.map((turma_id) => ({ material_id: material.id, turma_id })));
  }
  if (dados.alunoIds.length) {
    await supabase.from("material_alunos").insert(dados.alunoIds.map((aluno_id) => ({ material_id: material.id, aluno_id })));
  }

  if (dados.tarefa?.texto.trim()) {
    await supabase.from("tarefas").insert({
      material_id: material.id,
      texto: dados.tarefa.texto.trim(),
      entrega: ["feito", "texto", "audio", "link"].includes(dados.tarefa.entrega) ? dados.tarefa.entrega : "feito",
      link_url: dados.tarefa.linkUrl.trim() || null,
      created_by: eu.id,
    });
  }

  revalidatePath("/admin/turmas");
  revalidatePath(`/admin/materias/${dados.materiaId}`);
  return { ok: true };
}
