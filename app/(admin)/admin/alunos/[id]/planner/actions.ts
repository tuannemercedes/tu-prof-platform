"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPlannerDia(formData: FormData) {
  const aluno_id = String(formData.get("aluno_id") || "");
  const semana = Number(formData.get("semana") || 1);
  const titulo = String(formData.get("titulo") || "").trim();
  const conteudo_html = String(formData.get("conteudo_html") || "").trim() || null;

  if (!aluno_id || !titulo) return { error: "Preencha o título do dia." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("planner_dias")
    .insert({ aluno_id, semana, titulo, conteudo_html });

  if (error) return { error: error.message };

  revalidatePath(`/admin/alunos/${aluno_id}/planner`);
  return { success: true };
}

export async function deletePlannerDia(formData: FormData) {
  const id = String(formData.get("id") || "");
  const aluno_id = String(formData.get("aluno_id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("planner_dias").delete().eq("id", id);
  revalidatePath(`/admin/alunos/${aluno_id}/planner`);
}

export async function createPlannerItem(formData: FormData) {
  const dia_id = String(formData.get("dia_id") || "");
  const aluno_id = String(formData.get("aluno_id") || "");
  const texto = String(formData.get("texto") || "").trim();
  if (!dia_id || !texto) return;

  const supabase = await createClient();
  await supabase.from("planner_itens").insert({ dia_id, texto });
  revalidatePath(`/admin/alunos/${aluno_id}/planner`);
}

export async function deletePlannerItem(formData: FormData) {
  const id = String(formData.get("id") || "");
  const aluno_id = String(formData.get("aluno_id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("planner_itens").delete().eq("id", id);
  revalidatePath(`/admin/alunos/${aluno_id}/planner`);
}
