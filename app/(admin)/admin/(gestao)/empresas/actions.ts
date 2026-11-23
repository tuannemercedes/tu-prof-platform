"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generatePassword } from "@/lib/password";
import { requireAdmin } from "@/lib/dal";

// Corporate: empresas, contratos, grupos, participantes, aulas de grupo e presença.
// Tudo passa pela RLS (dados comerciais = só admin). Criar login usa a chave
// de serviço, então também exige admin.

const txt = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? "").trim();
  return v || null;
};
const num = (f: FormData, k: string) => {
  const v = txt(f, k);
  if (!v) return null;
  const n = Number(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
// "2026-11-25T18:00" digitado no navegador = horário de Brasília (UTC-3)
const paraTimestamp = (local: string | null) => (local ? new Date(`${local}:00-03:00`).toISOString() : null);

function atualizar(empresaId?: string | null) {
  revalidatePath("/admin/empresas");
  if (empresaId) revalidatePath(`/admin/empresas/${empresaId}`);
  revalidatePath("/admin");
}

export async function criarEmpresa(formData: FormData) {
  await requireAdmin();
  const nome = txt(formData, "nome");
  if (!nome) return;
  const supabase = await createClient();
  const { data, error } = await supabase.from("empresas").insert({ nome }).select("id").single();
  if (error || !data) throw new Error("Não foi possível criar a empresa.");
  atualizar();
  redirect(`/admin/empresas/${data.id}`);
}

export async function salvarEmpresa(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const supabase = await createClient();
  const { error } = await supabase
    .from("empresas")
    .update({
      nome: txt(formData, "nome") ?? undefined,
      contato_nome: txt(formData, "contato_nome"),
      contato_email: txt(formData, "contato_email"),
      contato_telefone: txt(formData, "contato_telefone"),
      observacoes: txt(formData, "observacoes"),
    })
    .eq("id", id);
  if (error) throw new Error("Não foi possível salvar.");
  atualizar(id);
}

export async function salvarContrato(formData: FormData) {
  await requireAdmin();
  const empresaId = String(formData.get("empresa_id"));
  const id = txt(formData, "id");
  const dados = {
    empresa_id: empresaId,
    descricao: txt(formData, "descricao"),
    idioma: txt(formData, "idioma") ?? "espanhol",
    valor_mensal: num(formData, "valor_mensal"),
    max_acessos: num(formData, "max_acessos"),
    aulas_mes: num(formData, "aulas_mes"),
    inicio: txt(formData, "inicio"),
    fim: txt(formData, "fim"),
    observacoes: txt(formData, "observacoes"),
  };
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("contratos").update(dados).eq("id", id)
    : await supabase.from("contratos").insert(dados);
  if (error) throw new Error("Não foi possível salvar o contrato.");
  atualizar(empresaId);
}

export async function excluirContrato(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("contratos").delete().eq("id", String(formData.get("id")));
  atualizar(String(formData.get("empresa_id")));
}

export async function criarGrupo(formData: FormData) {
  await requireAdmin();
  const empresaId = String(formData.get("empresa_id"));
  const nome = txt(formData, "nome");
  if (!nome) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("turmas")
    .insert({ nome, idioma: txt(formData, "idioma") ?? "espanhol", empresa_id: empresaId, professor_id: txt(formData, "professor_id") });
  if (error) throw new Error("Não foi possível criar o grupo.");
  atualizar(empresaId);
  revalidatePath("/admin/turmas");
}

export async function salvarGrupo(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("turmas")
    .update({ nome: txt(formData, "nome") ?? undefined, professor_id: txt(formData, "professor_id") })
    .eq("id", String(formData.get("id")));
  if (error) throw new Error("Não foi possível salvar o grupo.");
  atualizar(String(formData.get("empresa_id")));
}

type Linha = { nome: string | null; email: string };
function lerLinhas(texto: string): Linha[] {
  const linhas: Linha[] = [];
  texto.split(/\n/).forEach((bruta) => {
    const l = bruta.trim();
    if (!l) return;
    const email = l.match(/[^\s<>,;]+@[^\s<>,;]+\.[^\s<>,;]+/)?.[0]?.toLowerCase();
    if (!email) return;
    const nome = l.replace(email, "").replace(/[<>,;\t]/g, " ").replace(/\s+/g, " ").trim() || null;
    linhas.push({ nome, email });
  });
  return linhas;
}

export type ResultadoParticipante = { nome: string | null; email: string; senha: string | null; erro?: string };

export async function adicionarParticipantes(
  empresaId: string,
  turmaId: string,
  texto: string
): Promise<{ resultados: ResultadoParticipante[]; error?: string }> {
  await requireAdmin();
  const linhas = lerLinhas(texto);
  if (!linhas.length) return { resultados: [], error: "Não encontrei nenhum e-mail. Use uma pessoa por linha: Nome, e-mail" };

  const admin = createAdminClient();
  const supabase = await createClient();
  const resultados: ResultadoParticipante[] = [];
  let lista: { id: string; email?: string }[] | null = null;

  for (const { nome, email } of linhas) {
    const senha = generatePassword();
    const { data, error } = await admin.auth.admin.createUser({ email, password: senha, email_confirm: true });
    let id = data?.user?.id;
    let nova = true;
    if (error) {
      if (!error.message.toLowerCase().includes("already")) {
        resultados.push({ nome, email, senha: null, erro: error.message });
        continue;
      }
      nova = false;
      if (!lista) lista = (await admin.auth.admin.listUsers({ perPage: 1000 })).data?.users ?? [];
      id = lista.find((u) => u.email?.toLowerCase() === email)?.id;
    }
    if (!id) {
      resultados.push({ nome, email, senha: null, erro: "Não foi possível criar." });
      continue;
    }
    const { data: atual } = await supabase.from("profiles").select("role").eq("id", id).single();
    if (atual && atual.role !== "aluno") {
      resultados.push({ nome, email, senha: null, erro: "Esse e-mail é de alguém da equipe." });
      continue;
    }
    if (nome) await supabase.from("profiles").update({ nome }).eq("id", id);
    await supabase.from("turma_membros").upsert({ turma_id: turmaId, aluno_id: id });
    resultados.push({ nome, email, senha: nova ? senha : null });
  }

  atualizar(empresaId);
  revalidatePath("/admin/alunos");
  return { resultados };
}

export async function removerParticipante(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase
    .from("turma_membros")
    .delete()
    .eq("turma_id", String(formData.get("turma_id")))
    .eq("aluno_id", String(formData.get("aluno_id")));
  atualizar(String(formData.get("empresa_id")));
}

export async function agendarAulaGrupo(formData: FormData) {
  const profile = await requireAdmin();
  const turmaId = String(formData.get("turma_id"));
  const tema = txt(formData, "tema");
  const data = paraTimestamp(txt(formData, "data"));
  if (!tema || !data) return;
  const supabase = await createClient();
  const { data: turma } = await supabase.from("turmas").select("idioma, professor_id").eq("id", turmaId).single();
  const idioma = turma?.idioma === "espanhol" || turma?.idioma === "ingles" ? turma.idioma : null;
  const { error } = await supabase
    .from("aulas")
    .insert({ turma_id: turmaId, professor_id: turma?.professor_id ?? profile.id, data, tema, idioma });
  if (error) throw new Error("Não foi possível agendar.");
  atualizar(String(formData.get("empresa_id")));
}

export async function registrarAulaGrupo(formData: FormData) {
  await requireAdmin();
  const aulaId = String(formData.get("aula_id"));
  const turmaId = String(formData.get("turma_id"));
  const presentes = new Set(formData.getAll("presente").map(String));
  const supabase = await createClient();

  const { error } = await supabase
    .from("aulas")
    .update({ tema: txt(formData, "tema") ?? undefined, resumo: txt(formData, "resumo"), status: "realizada" })
    .eq("id", aulaId);
  if (error) throw new Error("Não foi possível salvar a aula.");

  const { data: membros } = await supabase.from("turma_membros").select("aluno_id").eq("turma_id", turmaId);
  await supabase.from("presencas").delete().eq("aula_id", aulaId);
  if (membros?.length) {
    await supabase
      .from("presencas")
      .insert(membros.map((m) => ({ aula_id: aulaId, aluno_id: m.aluno_id, presente: presentes.has(m.aluno_id) })));
  }
  atualizar(String(formData.get("empresa_id")));
}

export async function excluirAulaGrupo(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("aulas").delete().eq("id", String(formData.get("aula_id")));
  atualizar(String(formData.get("empresa_id")));
}
