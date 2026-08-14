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
  let capa_path: string | null = null;

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

  const capa = formData.get("capa") as File | null;
  if (capa && capa.size > 0) {
    const ext = capa.name.includes(".") ? capa.name.split(".").pop()!.toLowerCase().slice(0, 10) : "jpg";
    const capaPath = `${materia_id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error: capaUploadError } = await supabase.storage
      .from("capas")
      .upload(capaPath, capa, { contentType: capa.type || undefined });
    if (capaUploadError) return { error: `Erro ao enviar a capa: ${capaUploadError.message}` };
    capa_path = capaPath;
  }

  const { data: material, error } = await supabase
    .from("materiais")
    .insert({ materia_id, fase_id, tipo, titulo, conteudo_html, arquivo_path, capa_path, url })
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

export async function updateMaterial(formData: FormData) {
  const id = String(formData.get("id") || "");
  const materia_id = String(formData.get("materia_id") || "");
  const fase_id = String(formData.get("fase_id") || "") || null;
  const tipo = String(formData.get("tipo") || "");
  const titulo = String(formData.get("titulo") || "").trim();

  if (!id || !titulo) return { error: "Preencha os campos obrigatórios." };

  const supabase = await createClient();
  const updates: Record<string, unknown> = { titulo, fase_id };

  if (tipo === "html") {
    const conteudo_html = String(formData.get("conteudo_html") || "");
    if (!conteudo_html.trim()) return { error: "Cole o código HTML do material." };
    updates.conteudo_html = conteudo_html;
  } else if (tipo === "pdf") {
    const arquivo = formData.get("arquivo") as File | null;
    if (arquivo && arquivo.size > 0) {
      const path = `${materia_id}/${Date.now()}-${arquivo.name}`;
      const { error: uploadError } = await supabase.storage.from("materiais").upload(path, arquivo);
      if (uploadError) return { error: uploadError.message };
      updates.arquivo_path = path;
    }
  } else {
    const url = String(formData.get("url") || "").trim();
    if (!url) return { error: "Informe o link." };
    updates.url = url;
  }

  const capa = formData.get("capa") as File | null;
  if (capa && capa.size > 0) {
    const ext = capa.name.includes(".") ? capa.name.split(".").pop()!.toLowerCase().slice(0, 10) : "jpg";
    const capaPath = `${materia_id}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error: capaUploadError } = await supabase.storage
      .from("capas")
      .upload(capaPath, capa, { contentType: capa.type || undefined });
    if (capaUploadError) return { error: `Erro ao enviar a capa: ${capaUploadError.message}` };
    updates.capa_path = capaPath;
  }

  const { error } = await supabase.from("materiais").update(updates).eq("id", id);
  if (error) return { error: error.message };

  const turmaIds = formData.getAll("turmas").map(String);
  const alunoIds = formData.getAll("alunos").map(String);

  await supabase.from("material_turmas").delete().eq("material_id", id);
  await supabase.from("material_alunos").delete().eq("material_id", id);

  if (turmaIds.length) {
    await supabase
      .from("material_turmas")
      .insert(turmaIds.map((turma_id) => ({ material_id: id, turma_id })));
  }

  if (alunoIds.length) {
    await supabase
      .from("material_alunos")
      .insert(alunoIds.map((aluno_id) => ({ material_id: id, aluno_id })));
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
