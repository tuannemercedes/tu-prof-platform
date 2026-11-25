"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCronogramaItem(formData: FormData) {
  const cronograma_id = String(formData.get("cronograma_id") || "");
  const data = String(formData.get("data") || "").trim() || null;
  const tema = String(formData.get("tema") || "").trim();
  const descricao = String(formData.get("descricao") || "").trim() || null;

  if (!cronograma_id || !tema) return;

  const supabase = await createClient();
  await supabase.from("cronograma_itens").insert({ cronograma_id, data, tema, descricao });
  revalidatePath(`/admin/cronograma/${cronograma_id}`);
}

export async function deleteCronogramaItem(formData: FormData) {
  const id = String(formData.get("id") || "");
  const cronograma_id = String(formData.get("cronograma_id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("cronograma_itens").delete().eq("id", id);
  revalidatePath(`/admin/cronograma/${cronograma_id}`);
}

export async function updateCronogramaAcesso(formData: FormData) {
  const cronograma_id = String(formData.get("cronograma_id") || "");
  const turmaIds = formData.getAll("turmas").map(String);
  const alunoIds = formData.getAll("alunos").map(String);
  const visivel_todos = formData.get("todos") === "on";
  if (!cronograma_id) return;

  const supabase = await createClient();

  await supabase.from("cronogramas").update({ visivel_todos }).eq("id", cronograma_id);
  await supabase.from("cronograma_turmas").delete().eq("cronograma_id", cronograma_id);
  await supabase.from("cronograma_alunos").delete().eq("cronograma_id", cronograma_id);

  if (turmaIds.length) {
    await supabase
      .from("cronograma_turmas")
      .insert(turmaIds.map((turma_id) => ({ cronograma_id, turma_id })));
  }

  if (alunoIds.length) {
    await supabase
      .from("cronograma_alunos")
      .insert(alunoIds.map((aluno_id) => ({ cronograma_id, aluno_id })));
  }

  revalidatePath(`/admin/cronograma/${cronograma_id}`);
}
