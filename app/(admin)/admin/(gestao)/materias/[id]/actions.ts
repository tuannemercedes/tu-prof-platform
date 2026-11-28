"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function lerIdioma(v: FormDataEntryValue | null) {
  const s = String(v || "");
  return ["espanhol", "ingles", "espanhol_ingles"].includes(s) ? s : "espanhol";
}

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
  const visivel_todos = formData.get("todos") === "on";

  if (!materia_id || !titulo || !tipo) {
    return { error: "Preencha os campos obrigatórios." };
  }

  const supabase = await createClient();

  let conteudo_html: string | null = null;
  let arquivo_path: string | null = null;
  let url: string | null = null;
  let capa_path: string | null = null;
  let entrega: string | null = null;

  if (tipo === "missao") {
    conteudo_html = String(formData.get("enunciado") || "").trim();
    if (!conteudo_html) return { error: "Escreva o que o aluno deve fazer na missão." };
    entrega = lerEntrega(formData.get("entrega"));
  } else if (tipo === "html") {
    conteudo_html = String(formData.get("conteudo_html") || "");
    if (!conteudo_html.trim()) return { error: "Cole o código HTML do material." };
  } else if (tipo === "pdf") {
    const arquivo = formData.get("arquivo") as File | null;
    if (!arquivo || arquivo.size === 0) return { error: "Selecione um arquivo PDF." };
    const path = `${materia_id}/${Date.now()}-${arquivo.name}`;
    const { error: uploadError } = await supabase.storage.from("materiais").upload(path, arquivo);
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
    const { error: capaUploadError } = await supabase.storage.from("capas").upload(capaPath, capa, { contentType: capa.type || undefined });
    if (capaUploadError) return { error: `Erro ao enviar a capa: ${capaUploadError.message}` };
    capa_path = capaPath;
  }

  const { data: material, error } = await supabase
    .from("materiais")
    .insert({
      materia_id,
      fase_id,
      tipo,
      titulo,
      conteudo_html,
      arquivo_path,
      capa_path,
      url,
      visivel_todos,
      entrega,
      idioma: lerIdioma(formData.get("idioma")),
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (turmaIds.length && material) {
    await supabase.from("material_turmas").insert(turmaIds.map((turma_id) => ({ material_id: material.id, turma_id })));
  }

  if (alunoIds.length && material) {
    await supabase.from("material_alunos").insert(alunoIds.map((aluno_id) => ({ material_id: material.id, aluno_id })));
  }

  revalidatePath(`/admin/materias/${materia_id}`);
  return { success: true };
}

export async function updateMaterial(formData: FormData) {
  const id = String(formData.get("id") || "");
  const materia_id = String(formData.get("materia_id") || "");
  const tipo = String(formData.get("tipo") || "");
  const titulo = String(formData.get("titulo") || "").trim();

  if (!id || !titulo) return { error: "Preencha os campos obrigatórios." };

  const visivel_todos = formData.get("todos") === "on";
  const supabase = await createClient();
  const updates: Record<string, unknown> = { titulo, visivel_todos, idioma: lerIdioma(formData.get("idioma")) };

  if (tipo === "missao") {
    const enunciado = String(formData.get("enunciado") || "").trim();
    if (!enunciado) return { error: "Escreva o que o aluno deve fazer na missão." };
    updates.conteudo_html = enunciado;
    updates.entrega = lerEntrega(formData.get("entrega"));
  } else if (tipo === "html") {
    const conteudo_html = String(formData.get("conteudo_html") || "");
    // Páginas prontas da Tu Prof (exercícios guardados no site) continuam como estão se o campo ficar vazio.
    if (!conteudo_html.trim() && formData.get("estatico") !== "1") return { error: "Cole o código HTML do material." };
    if (conteudo_html.trim()) {
      updates.conteudo_html = conteudo_html;
      updates.url = null;
    }
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
    const { error: capaUploadError } = await supabase.storage.from("capas").upload(capaPath, capa, { contentType: capa.type || undefined });
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
    await supabase.from("material_turmas").insert(turmaIds.map((turma_id) => ({ material_id: id, turma_id })));
  }

  if (alunoIds.length) {
    await supabase.from("material_alunos").insert(alunoIds.map((aluno_id) => ({ material_id: id, aluno_id })));
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

export async function moverParaFase(id: string, materiaId: string, faseId: string | null) {
  const supabase = await createClient();
  await supabase.from("materiais").update({ fase_id: faseId }).eq("id", id);
  revalidatePath(`/admin/materias/${materiaId}`);
}

export async function moverMaterial(id: string, materiaId: string, faseId: string | null, direcao: "up" | "down") {
  const supabase = await createClient();
  const query = supabase.from("materiais").select("id").eq("materia_id", materiaId);
  const { data: materiais } = await (faseId ? query.eq("fase_id", faseId) : query.is("fase_id", null)).order("ordem").order("created_at");

  if (!materiais) return;

  const index = materiais.findIndex((m) => m.id === id);
  const alvo = direcao === "up" ? index - 1 : index + 1;
  if (index === -1 || alvo < 0 || alvo >= materiais.length) return;

  const reordenados = [...materiais];
  [reordenados[index], reordenados[alvo]] = [reordenados[alvo], reordenados[index]];

  await Promise.all(reordenados.map((m, i) => supabase.from("materiais").update({ ordem: i }).eq("id", m.id)));

  revalidatePath(`/admin/materias/${materiaId}`);
}

// ===== Etapas e materiais: renomear, reordenar, duplicar =====

export async function renomearFase(formData: FormData) {
  const id = String(formData.get("id") || "");
  const materia_id = String(formData.get("materia_id") || "");
  const titulo = String(formData.get("titulo") || "").trim();
  if (!id || !titulo) return;
  const supabase = await createClient();
  await supabase.from("fases").update({ titulo }).eq("id", id);
  revalidatePath(`/admin/materias/${materia_id}`);
}

export async function moverFase(formData: FormData) {
  const id = String(formData.get("id") || "");
  const materia_id = String(formData.get("materia_id") || "");
  const passo = String(formData.get("direcao")) === "cima" ? -1 : 1;
  const supabase = await createClient();
  const { data } = await supabase.from("fases").select("id").eq("materia_id", materia_id).order("ordem").order("created_at");
  const lista = (data ?? []).map((f) => f.id);
  const i = lista.indexOf(id);
  const j = i + passo;
  if (i < 0 || j < 0 || j >= lista.length) return;
  [lista[i], lista[j]] = [lista[j], lista[i]];
  await Promise.all(lista.map((fid, ordem) => supabase.from("fases").update({ ordem }).eq("id", fid)));
  revalidatePath(`/admin/materias/${materia_id}`);
}

// Copia um material (mesmo lugar, mesmas liberações), logo abaixo do original.
export async function duplicarMaterial(formData: FormData) {
  const id = String(formData.get("id") || "");
  const materia_id = String(formData.get("materia_id") || "");
  const supabase = await createClient();
  const { data: m } = await supabase
    .from("materiais")
    .select(
      "materia_id, fase_id, tipo, titulo, conteudo_html, arquivo_path, url, ordem, capa_path, idioma, visivel_todos, material_turmas(turma_id), material_alunos(aluno_id)",
    )
    .eq("id", id)
    .single();
  if (!m) return;
  const { material_turmas, material_alunos, ...dados } = m as typeof m & {
    material_turmas: { turma_id: string }[];
    material_alunos: { aluno_id: string }[];
  };
  const { data: novo } = await supabase
    .from("materiais")
    .insert({ ...dados, titulo: `${dados.titulo} (cópia)`, ordem: (dados.ordem ?? 0) + 1 })
    .select("id")
    .single();
  if (novo) {
    if (material_turmas?.length)
      await supabase.from("material_turmas").insert(material_turmas.map((t) => ({ material_id: novo.id, turma_id: t.turma_id })));
    if (material_alunos?.length)
      await supabase.from("material_alunos").insert(material_alunos.map((a) => ({ material_id: novo.id, aluno_id: a.aluno_id })));
  }
  revalidatePath(`/admin/materias/${materia_id}`);
}

// Cola o link da videoaula direto na lista (aulas criadas com o espaço do vídeo vazio).
export async function salvarLinkVideo(formData: FormData) {
  const id = String(formData.get("id") || "");
  const materia_id = String(formData.get("materia_id") || "");
  const url = String(formData.get("url") || "").trim();
  if (!id || !/^https?:\/\//i.test(url)) return;
  const supabase = await createClient();
  await supabase.from("materiais").update({ url }).eq("id", id);
  revalidatePath(`/admin/materias/${materia_id}`);
}

function lerEntrega(v: FormDataEntryValue | null) {
  const s = String(v || "");
  return s === "audio" || s === "texto" || s === "feito" ? s : "audio_texto";
}
