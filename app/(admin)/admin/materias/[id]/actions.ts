"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createFase(formData: FormData) {
  const materia_id = String(formData.get("materia_id") || "");
  const titulo = String(formData.get("titulo") || "").trim();
  if (!materia_id || !titulo) return;

  const supabase = await createClient();
  await supabase.from("fases").insert({ materia_id, titulo });
  revalidatePath(`/admin/materias/${materia_id}`);
}

export async function deleteFase(formData: FormData) {
  const id = String(formData.get("id") || "");
  const materia_id = String(formData.get("materia_id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("fases").delete().eq("id", id);
  revalidatePath(`/admin/materias/${materia_id}`);
}

export async function createMaterial(formData: FormData) {
  const materia_id = String(formData.get("materia_id") || "");
  const fase_id = String(formData.get("fase_id") || "") || null;
  const tipo = String(formData.get("tipo") || "");
  const titulo = String(formData.get("titulo") || "").trim();
  const turmaIds = formData.getAll("turmas").map(String);
  const alunoIds = formData.getAll("alunos").map(String);

  if (!materia_id || !titulo || !tipo) {
    return { error: "Preencha os campos obrigatórios." };
  }

  const supabase = await createClient();

  let conteudo_html: string | null = null;
  let arquivo_path: string | null = null;
  let url: string | null = null;

  if (tipo === "html") {
    conteudo_html = String(formData.get("conteudo_html") || "");
    if (!conteudo_html.trim()) return { error: "Cole o código HTML do material." };
  } else if (tipo === "pdf") {
    const arquivo = formData.get("arquivo") as File | null;
    if (!arquivo || arquivo.size === 0) return { error: "Selecione um arquivo PDF." };
    const path = `${materia_id}/${Date.now()}-${arquivo.name}`;
    const { error: uploadError } = await supabase.storage
      .from("materiais")
      .upload(path, arquivo);
    if (uploadError) return { error: uploadError.message };
    arquivo_path = path;
  } else {
    url = String(formData.get("url") || "").trim();
    if (!url) return { error: "Informe o link." };
  }

  const { data: material, error } = await supabase
    .from("materiais")
    .insert({ materia_id, fase_id, tipo, titulo, conteudo_html, arquivo_path, url })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (turmaIds.length && material) {
    await supabase
      .from("material_turmas")
      .insert(turmaIds.map((turma_id) => ({ material_id: material.id, turma_id })));
  }

  if (alunoIds.length && material) {
    await supabase
      .from("material_alunos")
      .insert(alunoIds.map((aluno_id) => ({ material_id: material.id, aluno_id })));
  }

  revalidatePath(`/admin/materias/${materia_id}`);
  return { success: true };
}

export async function deleteMaterial(formData: FormData) {
  const id = String(formData.get("id") || "");
  const materia_id = String(formData.get("materia_id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("materiais").delete().eq("id", id);
  revalidatePath(`/admin/materias/${materia_id}`);
}
