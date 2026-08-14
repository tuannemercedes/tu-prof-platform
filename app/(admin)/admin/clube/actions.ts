"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateClubeConfig(formData: FormData) {
  const link_acesso = String(formData.get("link_acesso") || "").trim() || null;
  const dia_horario = String(formData.get("dia_horario") || "").trim() || null;

  const supabase = await createClient();
  await supabase.from("clube_config").update({ link_acesso, dia_horario }).eq("id", 1);

  revalidatePath("/admin/clube");
  revalidatePath("/aluno/clube");
}

export async function saveTema(formData: FormData) {
  const id = String(formData.get("id") || "");
  const data = String(formData.get("data") || "");
  const tema = String(formData.get("tema") || "").trim();
  const descricao = String(formData.get("descricao") || "").trim() || null;

  if (!data || !tema) return { error: "Preencha o tema." };

  const supabase = await createClient();

  const { error } = id
    ? await supabase.from("clube_temas").update({ data, tema, descricao }).eq("id", id)
    : await supabase.from("clube_temas").upsert({ data, tema, descricao }, { onConflict: "data" });

  if (error) return { error: error.message };

  revalidatePath("/admin/clube");
  revalidatePath("/aluno/clube");
  return { success: true };
}

export async function deleteTema(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("clube_temas").delete().eq("id", id);

  revalidatePath("/admin/clube");
  revalidatePath("/aluno/clube");
}

export async function updateClubeAcesso(formData: FormData) {
  const turmaIds = formData.getAll("turmas").map(String);
  const alunoIds = formData.getAll("alunos").map(String);
  const visivel_todos = formData.get("todos") === "on";

  const supabase = await createClient();

  await supabase.from("clube_config").update({ visivel_todos }).eq("id", 1);
  await supabase.from("clube_turmas").delete().not("turma_id", "is", null);
  await supabase.from("clube_alunos").delete().not("aluno_id", "is", null);

  if (turmaIds.length) {
    await supabase.from("clube_turmas").insert(turmaIds.map((turma_id) => ({ turma_id })));
  }
  if (alunoIds.length) {
    await supabase.from("clube_alunos").insert(alunoIds.map((aluno_id) => ({ aluno_id })));
  }

  revalidatePath("/admin/clube");
  revalidatePath("/aluno/clube");
}
