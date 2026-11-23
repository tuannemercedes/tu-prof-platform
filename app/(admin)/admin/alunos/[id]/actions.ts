"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/dal";

// Todas as ações abaixo passam pela RLS: a admin mexe em qualquer aluno,
// o professor só nos alunos que estão com ele.

const txt = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? "").trim();
  return v || null;
};

// "2026-11-25T18:00" digitado no navegador = horário de Brasília (UTC-3)
function paraTimestamp(local: string | null) {
  if (!local) return null;
  return new Date(`${local}:00-03:00`).toISOString();
}

function lerIdioma(f: FormData) {
  const v = String(f.get("idioma") ?? "");
  return v === "espanhol" || v === "ingles" ? v : null;
}

function atualizar(alunoId: string) {
  revalidatePath(`/admin/alunos/${alunoId}`);
  revalidatePath("/admin");
}

export async function salvarDadosAluno(formData: FormData) {
  await requireStaff();
  const alunoId = String(formData.get("aluno_id"));
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      objetivo: txt(formData, "objetivo"),
      foco: txt(formData, "foco"),
      horario: txt(formData, "horario"),
      plano_nome: txt(formData, "plano_nome"),
      link_aula: txt(formData, "link_aula"),
    })
    .eq("id", alunoId);
  if (error) throw new Error("Não foi possível salvar.");
  atualizar(alunoId);
}

export async function agendarAula(formData: FormData) {
  const profile = await requireStaff();
  const alunoId = String(formData.get("aluno_id"));
  const tema = txt(formData, "tema");
  const data = paraTimestamp(txt(formData, "data"));
  if (!tema || !data) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("aulas")
    .insert({ aluno_id: alunoId, professor_id: profile.id, data, tema, descricao: txt(formData, "descricao"), idioma: lerIdioma(formData) });
  if (error) throw new Error("Não foi possível agendar.");
  atualizar(alunoId);
}

export async function registrarAula(formData: FormData) {
  const profile = await requireStaff();
  const alunoId = String(formData.get("aluno_id"));
  const aulaId = txt(formData, "aula_id");
  const tema = txt(formData, "tema");
  const resumo = txt(formData, "resumo");
  const tarefa = txt(formData, "tarefa");
  const entrega = String(formData.get("entrega") || "feito");
  if (!tema) return { error: "Informe o tema da aula." };

  const supabase = await createClient();
  let idAula = aulaId;

  if (aulaId) {
    const { error } = await supabase.from("aulas").update({ tema, resumo, status: "realizada" }).eq("id", aulaId);
    if (error) return { error: "Não foi possível salvar a aula." };
  } else {
    const { data, error } = await supabase
      .from("aulas")
      .insert({ aluno_id: alunoId, professor_id: profile.id, data: new Date().toISOString(), tema, resumo, status: "realizada", idioma: lerIdioma(formData) })
      .select("id")
      .single();
    if (error) return { error: "Não foi possível salvar a aula." };
    idAula = data.id;
  }

  if (tarefa) {
    const { error } = await supabase.from("tarefas").insert({
      aluno_id: alunoId,
      aula_id: idAula,
      idioma: lerIdioma(formData),
      texto: tarefa,
      entrega: ["feito", "texto", "audio", "link"].includes(entrega) ? entrega : "feito",
      link_url: txt(formData, "link_url"),
      prazo: txt(formData, "prazo"),
      created_by: profile.id,
    });
    if (error) return { error: "A aula foi salva, mas a tarefa não. Tente de novo." };
  }

  atualizar(alunoId);
  return { ok: true };
}

export async function excluirAula(formData: FormData) {
  await requireStaff();
  const alunoId = String(formData.get("aluno_id"));
  const supabase = await createClient();
  await supabase.from("aulas").delete().eq("id", String(formData.get("id")));
  atualizar(alunoId);
}

export async function criarTarefa(formData: FormData) {
  const profile = await requireStaff();
  const alunoId = String(formData.get("aluno_id"));
  const texto = txt(formData, "texto");
  if (!texto) return;
  const entrega = String(formData.get("entrega") || "feito");
  const supabase = await createClient();
  await supabase.from("tarefas").insert({
    aluno_id: alunoId,
    idioma: lerIdioma(formData),
    texto,
    entrega: ["feito", "texto", "audio", "link"].includes(entrega) ? entrega : "feito",
    link_url: txt(formData, "link_url"),
    prazo: txt(formData, "prazo"),
    created_by: profile.id,
  });
  atualizar(alunoId);
}

export async function excluirTarefa(formData: FormData) {
  await requireStaff();
  const alunoId = String(formData.get("aluno_id"));
  const supabase = await createClient();
  await supabase.from("tarefas").delete().eq("id", String(formData.get("id")));
  atualizar(alunoId);
}

export async function comentarEntrega(formData: FormData) {
  await requireStaff();
  const alunoId = String(formData.get("aluno_id"));
  const supabase = await createClient();
  await supabase
    .from("tarefa_entregas")
    .update({ comentario: txt(formData, "comentario") })
    .eq("tarefa_id", String(formData.get("tarefa_id")))
    .eq("aluno_id", alunoId);
  atualizar(alunoId);
}

// ===== Plano do semestre =====

export async function salvarEtapa(formData: FormData) {
  await requireStaff();
  const alunoId = String(formData.get("aluno_id"));
  const id = txt(formData, "id");
  const dados = {
    periodo: txt(formData, "periodo") ?? "",
    tema: txt(formData, "tema") ?? "",
    entrega: txt(formData, "entrega"),
  };
  if (!dados.periodo || !dados.tema) return;
  const supabase = await createClient();
  if (id) {
    await supabase.from("plano_etapas").update(dados).eq("id", id);
  } else {
    const { count } = await supabase
      .from("plano_etapas")
      .select("*", { count: "exact", head: true })
      .eq("aluno_id", alunoId);
    await supabase.from("plano_etapas").insert({ ...dados, aluno_id: alunoId, ordem: count ?? 0, idioma: lerIdioma(formData) });
  }
  atualizar(alunoId);
}

export async function excluirEtapa(formData: FormData) {
  await requireStaff();
  const alunoId = String(formData.get("aluno_id"));
  const supabase = await createClient();
  await supabase.from("plano_etapas").delete().eq("id", String(formData.get("id")));
  atualizar(alunoId);
}

export async function aplicarModelo(formData: FormData) {
  await requireStaff();
  const alunoId = String(formData.get("aluno_id"));
  const turmaId = String(formData.get("turma_id"));
  const supabase = await createClient();
  const { data: modelo } = await supabase
    .from("programa_etapas")
    .select("ordem, periodo, tema, entrega")
    .eq("turma_id", turmaId)
    .order("ordem");
  if (!modelo?.length) return;
  const { count } = await supabase
    .from("plano_etapas")
    .select("*", { count: "exact", head: true })
    .eq("aluno_id", alunoId);
  await supabase
    .from("plano_etapas")
    .insert(modelo.map((m, i) => ({ ...m, ordem: (count ?? 0) + i, aluno_id: alunoId, idioma: lerIdioma(formData) })));
  atualizar(alunoId);
}

// ===== Evolução =====

export async function salvarCheckpoint(
  alunoId: string,
  niveis: Record<string, number>,
  comentario: string,
  titulo: string,
  idioma: "espanhol" | "ingles" | null
) {
  const profile = await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("checkpoints").insert({
    aluno_id: alunoId,
    niveis,
    comentario: comentario.trim() || null,
    titulo: titulo.trim() || null,
    idioma,
    created_by: profile.id,
  });
  if (error) return { error: "Não foi possível salvar o checkpoint." };
  atualizar(alunoId);
  return { ok: true };
}
