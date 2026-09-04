"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateGlossarioAcesso(formData: FormData) {
  const turmaIds = formData.getAll("turmas").map(String);
  const alunoIds = formData.getAll("alunos").map(String);
  const visivel_todos = formData.get("todos") === "on";

  const supabase = await createClient();

  await supabase.from("glossario_config").update({ visivel_todos }).eq("id", 1);
  await supabase.from("glossario_turmas").delete().not("turma_id", "is", null);
  await supabase.from("glossario_alunos").delete().not("aluno_id", "is", null);

  if (turmaIds.length) {
    await supabase.from("glossario_turmas").insert(turmaIds.map((turma_id) => ({ turma_id })));
  }
  if (alunoIds.length) {
    await supabase.from("glossario_alunos").insert(alunoIds.map((aluno_id) => ({ aluno_id })));
  }

  revalidatePath("/admin/glossario");
  revalidatePath("/aluno/glossario");
}

export async function saveTermo(formData: FormData) {
  const id = String(formData.get("id") || "");
  const termo = String(formData.get("termo") || "").trim();
  const definicao = String(formData.get("definicao") || "").trim();
  const exemplo = String(formData.get("exemplo") || "").trim() || null;
  const categoria = String(formData.get("categoria") || "").trim() || null;

  if (!termo || !definicao) return { error: "Preencha o termo e a definição." };

  const supabase = await createClient();

  const { error } = id
    ? await supabase.from("glossario_termos").update({ termo, definicao, exemplo, categoria }).eq("id", id)
    : await supabase.from("glossario_termos").insert({ termo, definicao, exemplo, categoria });

  if (error) return { error: error.message };

  revalidatePath("/admin/glossario");
  revalidatePath("/aluno/glossario");
  return { success: true };
}

export async function deleteTermo(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("glossario_termos").delete().eq("id", id);

  revalidatePath("/admin/glossario");
  revalidatePath("/aluno/glossario");
}

type TermoImportado = { termo: string; definicao: string; exemplo: string | null };

export async function importarTermos(termos: TermoImportado[], categoria: string | null) {
  const linhas = termos
    .map((t) => ({ termo: t.termo.trim(), definicao: t.definicao.trim(), exemplo: t.exemplo?.trim() || null }))
    .filter((t) => t.termo && t.definicao);

  if (!linhas.length) return { error: "Nenhum termo válido pra importar." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("glossario_termos")
    .insert(linhas.map((l) => ({ ...l, categoria })));

  if (error) return { error: error.message };

  revalidatePath("/admin/glossario");
  revalidatePath("/aluno/glossario");
  return { success: true, total: linhas.length };
}
