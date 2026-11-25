"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPlannerDia(formData: FormData) {
  const planner_id = String(formData.get("planner_id") || "");
  const semana = Number(formData.get("semana") || 1);
  const titulo = String(formData.get("titulo") || "").trim();

  if (!planner_id || !titulo) return { error: "Preencha o título do dia." };

  const supabase = await createClient();
  const { error } = await supabase.from("planner_dias").insert({ planner_id, semana, titulo });

  if (error) return { error: error.message };

  revalidatePath(`/admin/planner/${planner_id}`);
  return { success: true };
}

export async function deletePlannerDia(formData: FormData) {
  const id = String(formData.get("id") || "");
  const planner_id = String(formData.get("planner_id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("planner_dias").delete().eq("id", id);
  revalidatePath(`/admin/planner/${planner_id}`);
}

export async function createPlannerItem(formData: FormData) {
  const dia_id = String(formData.get("dia_id") || "");
  const planner_id = String(formData.get("planner_id") || "");
  const texto = String(formData.get("texto") || "").trim();
  const link_url = String(formData.get("link_url") || "").trim() || null;
  if (!dia_id || !texto) return;

  const supabase = await createClient();
  await supabase.from("planner_itens").insert({ dia_id, texto, link_url });
  revalidatePath(`/admin/planner/${planner_id}`);
}

export async function deletePlannerItem(formData: FormData) {
  const id = String(formData.get("id") || "");
  const planner_id = String(formData.get("planner_id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("planner_itens").delete().eq("id", id);
  revalidatePath(`/admin/planner/${planner_id}`);
}

export async function updatePlannerAcesso(formData: FormData) {
  const planner_id = String(formData.get("planner_id") || "");
  const turmaIds = formData.getAll("turmas").map(String);
  const alunoIds = formData.getAll("alunos").map(String);
  const visivel_todos = formData.get("todos") === "on";
  if (!planner_id) return;

  const supabase = await createClient();

  await supabase.from("planners").update({ visivel_todos }).eq("id", planner_id);
  await supabase.from("planner_turmas").delete().eq("planner_id", planner_id);
  await supabase.from("planner_alunos").delete().eq("planner_id", planner_id);

  if (turmaIds.length) {
    await supabase
      .from("planner_turmas")
      .insert(turmaIds.map((turma_id) => ({ planner_id, turma_id })));
  }

  if (alunoIds.length) {
    await supabase
      .from("planner_alunos")
      .insert(alunoIds.map((aluno_id) => ({ planner_id, aluno_id })));
  }

  revalidatePath(`/admin/planner/${planner_id}`);
}
