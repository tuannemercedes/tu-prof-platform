"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createMateria(formData: FormData) {
  const titulo = String(formData.get("titulo") || "").trim();
  const categoria = String(formData.get("categoria") || "trilha");
  if (!titulo) return;

  const supabase = await createClient();
  await supabase.from("materias").insert({ titulo, categoria });
  revalidatePath("/admin/materias");
  revalidatePath("/admin/fia");
}

export async function updateMateriaTitulo(formData: FormData) {
  const id = String(formData.get("id") || "");
  const titulo = String(formData.get("titulo") || "").trim();
  if (!id || !titulo) return;

  const supabase = await createClient();
  await supabase.from("materias").update({ titulo }).eq("id", id);
  revalidatePath("/admin/materias");
  revalidatePath("/admin/fia");
  revalidatePath(`/admin/materias/${id}`);
}

export async function updateMateriaCategoria(formData: FormData) {
  const id = String(formData.get("id") || "");
  const categoria = String(formData.get("categoria") || "");
  if (!id || !categoria) return;

  const supabase = await createClient();
  await supabase.from("materias").update({ categoria }).eq("id", id);
  revalidatePath("/admin/materias");
}

export async function deleteMateria(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("materias").delete().eq("id", id);
  revalidatePath("/admin/materias");
}

export async function moverMateria(id: string, categoria: string, direcao: "up" | "down") {
  const supabase = await createClient();
  const { data: materias } = await supabase.from("materias").select("id").eq("categoria", categoria).order("ordem").order("titulo");

  if (!materias) return;

  const index = materias.findIndex((m) => m.id === id);
  const alvo = direcao === "up" ? index - 1 : index + 1;
  if (index === -1 || alvo < 0 || alvo >= materias.length) return;

  const reordenadas = [...materias];
  [reordenadas[index], reordenadas[alvo]] = [reordenadas[alvo], reordenadas[index]];

  await Promise.all(reordenadas.map((m, i) => supabase.from("materias").update({ ordem: i }).eq("id", m.id)));

  revalidatePath("/admin/materias");
  revalidatePath("/admin/fia");
}

// Capa (imagem) e descrição curta do módulo, vistas pelo aluno na Trilha.
export async function salvarCapaMateria(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const updates: { capa_path?: string | null; descricao?: string | null } = {};
  if (formData.has("descricao")) updates.descricao = String(formData.get("descricao") ?? "").trim() || null;
  if (formData.get("remover_capa") === "1") updates.capa_path = null;
  const capa = formData.get("capa") as File | null;
  if (capa && capa.size > 0) {
    const ext = capa.name.includes(".") ? capa.name.split(".").pop()!.toLowerCase().slice(0, 10) : "jpg";
    const caminho = `modulos/${id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("capas").upload(caminho, capa, { contentType: capa.type || undefined });
    if (error) throw new Error("Não foi possível enviar a imagem.");
    updates.capa_path = caminho;
  }
  if (Object.keys(updates).length) await supabase.from("materias").update(updates).eq("id", id);
  revalidatePath(`/admin/materias/${id}`);
  revalidatePath("/admin/materias");
  revalidatePath("/aluno", "layout");
}

// ===== Comandos da página do módulo =====

// Capas prontas no estilo da marca (arquivos do próprio site).
export async function escolherCapaPronta(formData: FormData) {
  const id = String(formData.get("id") || "");
  const capa = String(formData.get("capa") || "");
  if (!id || !capa.startsWith("/capas-prontas/")) return;
  const supabase = await createClient();
  await supabase.from("materias").update({ capa_path: capa }).eq("id", id);
  revalidatePath(`/admin/materias/${id}`);
  revalidatePath("/admin/materias");
  revalidatePath("/aluno", "layout");
}

// Nome e descrição do módulo num formulário só.
export async function salvarDadosModulo(formData: FormData) {
  const id = String(formData.get("id") || "");
  const titulo = String(formData.get("titulo") || "").trim();
  if (!id || !titulo) return;
  const supabase = await createClient();
  await supabase
    .from("materias")
    .update({ titulo, descricao: String(formData.get("descricao") ?? "").trim() || null })
    .eq("id", id);
  revalidatePath(`/admin/materias/${id}`);
  revalidatePath("/admin/materias");
  revalidatePath("/admin/turmas");
  revalidatePath("/aluno", "layout");
}

// Exclui o módulo inteiro (etapas e materiais juntos) e volta para a lista.
export async function excluirModulo(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("materias").delete().eq("id", id);
  revalidatePath("/admin/materias");
  revalidatePath("/admin/turmas");
  redirect("/admin/materias");
}

// Cria uma cópia do módulo (capa, etapas e materiais), sem liberar para ninguém.
// Útil para fazer a versão em outro idioma ou adaptar para outro programa.
export async function duplicarModulo(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  const [{ data: m }, { data: fases }, { data: materiais }] = await Promise.all([
    supabase.from("materias").select("titulo, descricao, categoria, capa_path, ordem").eq("id", id).single(),
    supabase.from("fases").select("id, titulo, ordem").eq("materia_id", id).order("ordem"),
    supabase
      .from("materiais")
      .select("fase_id, tipo, titulo, conteudo_html, arquivo_path, url, ordem, capa_path, idioma")
      .eq("materia_id", id)
      .order("ordem"),
  ]);
  if (!m) return;
  const { data: nova } = await supabase
    .from("materias")
    .insert({ titulo: `${m.titulo} (cópia)`, descricao: m.descricao, categoria: m.categoria, capa_path: m.capa_path, ordem: (m.ordem ?? 0) + 1 })
    .select("id")
    .single();
  if (!nova) return;
  const mapaFases = new Map<string, string>();
  for (const f of fases ?? []) {
    const { data: nf } = await supabase.from("fases").insert({ materia_id: nova.id, titulo: f.titulo, ordem: f.ordem }).select("id").single();
    if (nf) mapaFases.set(f.id, nf.id);
  }
  if (materiais?.length) {
    await supabase
      .from("materiais")
      .insert(
        materiais.map((x) => ({ ...x, materia_id: nova.id, fase_id: x.fase_id ? (mapaFases.get(x.fase_id) ?? null) : null, visivel_todos: false })),
      );
  }
  revalidatePath("/admin/materias");
  redirect(`/admin/materias/${nova.id}?copia=1`);
}

// Inclui/retira o módulo de um programa a partir da página do módulo.
// Ao incluir, os materiais do módulo também ficam liberados para o programa.
export async function incluirNoPrograma(formData: FormData) {
  const materiaId = String(formData.get("materia_id") || "");
  const turmaId = String(formData.get("turma_id") || "");
  if (!materiaId || !turmaId) return;
  const supabase = await createClient();
  const { count } = await supabase.from("programa_materias").select("*", { count: "exact", head: true }).eq("turma_id", turmaId);
  await supabase.from("programa_materias").upsert({ turma_id: turmaId, materia_id: materiaId, ordem: count ?? 0 });
  if (formData.get("liberar") === "1") {
    const { data: mats } = await supabase.from("materiais").select("id").eq("materia_id", materiaId);
    if (mats?.length) {
      await supabase.from("material_turmas").upsert(
        mats.map((x) => ({ material_id: x.id, turma_id: turmaId })),
        { onConflict: "material_id,turma_id", ignoreDuplicates: true },
      );
    }
  }
  revalidatePath(`/admin/materias/${materiaId}`);
  revalidatePath("/admin/turmas");
}

export async function retirarDoPrograma(formData: FormData) {
  const materiaId = String(formData.get("materia_id") || "");
  const turmaId = String(formData.get("turma_id") || "");
  const supabase = await createClient();
  await supabase.from("programa_materias").delete().eq("turma_id", turmaId).eq("materia_id", materiaId);
  revalidatePath(`/admin/materias/${materiaId}`);
  revalidatePath("/admin/turmas");
}

// Cria um módulo já dentro de um programa e abre a página dele.
export async function criarModuloNoPrograma(formData: FormData) {
  const turmaId = String(formData.get("turma_id") || "");
  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) return;
  const supabase = await createClient();
  const { data: nova } = await supabase.from("materias").insert({ titulo, categoria: "trilha" }).select("id").single();
  if (!nova) return;
  if (turmaId) {
    const { count } = await supabase.from("programa_materias").select("*", { count: "exact", head: true }).eq("turma_id", turmaId);
    await supabase.from("programa_materias").insert({ turma_id: turmaId, materia_id: nova.id, ordem: count ?? 0 });
  }
  revalidatePath("/admin/turmas");
  revalidatePath("/admin/materias");
  redirect(`/admin/materias/${nova.id}`);
}
