"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { IDIOMAS } from "@/lib/programas";

function lerIdioma(valor: FormDataEntryValue | null) {
  const v = String(valor || "");
  return IDIOMAS.some((i) => i.valor === v) ? v : "espanhol";
}

export async function createTurma(formData: FormData) {
  const nome = String(formData.get("nome") || "").trim();
  const idioma = lerIdioma(formData.get("idioma"));
  if (!nome) return;

  const supabase = await createClient();
  await supabase.from("turmas").insert({ nome, idioma });
  revalidatePath("/admin/turmas");
}

export async function updateTurmaNome(formData: FormData) {
  const id = String(formData.get("id") || "");
  const nome = String(formData.get("nome") || "").trim();
  const idioma = lerIdioma(formData.get("idioma"));
  const descricao = String(formData.get("descricao") || "").trim() || null;
  if (!id || !nome) return;

  const supabase = await createClient();
  await supabase.from("turmas").update({ nome, idioma, descricao }).eq("id", id);
  revalidatePath("/admin/turmas");
}

export async function updateTurmaCalendario(formData: FormData) {
  const id = String(formData.get("id") || "");
  const calendario_embed_url = String(formData.get("calendario_embed_url") || "").trim() || null;
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("turmas").update({ calendario_embed_url }).eq("id", id);
  revalidatePath("/admin/turmas");
}

export async function deleteTurma(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("turmas").delete().eq("id", id);
  revalidatePath("/admin/turmas");
}

// ===== Trilha do programa (módulos) =====

export async function adicionarModulo(formData: FormData) {
  const turmaId = String(formData.get("turma_id") || "");
  const materiaId = String(formData.get("materia_id") || "");
  if (!turmaId || !materiaId) return;
  const supabase = await createClient();
  const { count } = await supabase
    .from("programa_materias")
    .select("*", { count: "exact", head: true })
    .eq("turma_id", turmaId);
  await supabase.from("programa_materias").upsert({ turma_id: turmaId, materia_id: materiaId, ordem: count ?? 0 });
  revalidatePath("/admin/turmas");
}

export async function removerModulo(formData: FormData) {
  const supabase = await createClient();
  await supabase
    .from("programa_materias")
    .delete()
    .eq("turma_id", String(formData.get("turma_id")))
    .eq("materia_id", String(formData.get("materia_id")));
  revalidatePath("/admin/turmas");
}

export async function moverModulo(formData: FormData) {
  const turmaId = String(formData.get("turma_id"));
  const materiaId = String(formData.get("materia_id"));
  const direcao = String(formData.get("direcao")) === "cima" ? -1 : 1;
  const supabase = await createClient();
  const { data } = await supabase
    .from("programa_materias")
    .select("materia_id, ordem")
    .eq("turma_id", turmaId)
    .order("ordem");
  const lista = (data ?? []).map((d) => d.materia_id);
  const i = lista.indexOf(materiaId);
  const j = i + direcao;
  if (i < 0 || j < 0 || j >= lista.length) return;
  [lista[i], lista[j]] = [lista[j], lista[i]];
  await Promise.all(
    lista.map((m, ordem) =>
      supabase.from("programa_materias").update({ ordem }).eq("turma_id", turmaId).eq("materia_id", m)
    )
  );
  revalidatePath("/admin/turmas");
}

// ===== Modelo de plano do programa =====

export async function salvarEtapaModelo(formData: FormData) {
  const turmaId = String(formData.get("turma_id"));
  const id = String(formData.get("id") || "");
  const dados = {
    periodo: String(formData.get("periodo") || "").trim(),
    tema: String(formData.get("tema") || "").trim(),
    entrega: String(formData.get("entrega") || "").trim() || null,
  };
  if (!dados.periodo || !dados.tema) return;
  const supabase = await createClient();
  if (id) {
    await supabase.from("programa_etapas").update(dados).eq("id", id);
  } else {
    const { count } = await supabase
      .from("programa_etapas")
      .select("*", { count: "exact", head: true })
      .eq("turma_id", turmaId);
    await supabase.from("programa_etapas").insert({ ...dados, turma_id: turmaId, ordem: count ?? 0 });
  }
  revalidatePath("/admin/turmas");
}

export async function excluirEtapaModelo(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("programa_etapas").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/turmas");
}
