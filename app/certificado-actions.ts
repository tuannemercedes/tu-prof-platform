"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/dal";
import { frequencia, getEmpresas } from "@/lib/empresas";
import { diaISO } from "@/lib/datas";

const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim() || null;
const inteiro = (f: FormData, k: string) => {
  const n = parseInt(String(f.get(k) ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
};

// Emite o certificado de um aluno (ficha do aluno).
export async function emitirCertificado(formData: FormData) {
  const profile = await requireAdmin();
  const alunoId = String(formData.get("aluno_id"));
  const titulo = txt(formData, "titulo");
  const nome = txt(formData, "nome_impresso");
  if (!titulo || !nome) throw new Error("Preencha o nome do curso e o nome que vai no certificado.");
  const supabase = await createClient();
  const { error } = await supabase.from("certificados").insert({
    aluno_id: alunoId,
    tipo: formData.get("tipo") === "participacao" ? "participacao" : "conclusao",
    titulo,
    nome_impresso: nome,
    empresa: txt(formData, "empresa"),
    carga_horaria: inteiro(formData, "carga_horaria"),
    inicio: txt(formData, "inicio"),
    fim: txt(formData, "fim"),
    created_by: profile.id,
  });
  if (error) throw new Error("Não foi possível emitir o certificado.");
  revalidatePath(`/admin/alunos/${alunoId}`);
  revalidatePath("/aluno/evolucao");
}

export async function excluirCertificado(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("certificados").delete().eq("id", String(formData.get("id")));
  const volta = String(formData.get("voltar") ?? "");
  if (volta.startsWith("/admin")) revalidatePath(volta);
}

// Emite de uma vez os certificados de participação de um grupo de empresa,
// para quem atingiu a frequência mínima. Quem já tem o certificado do grupo não recebe de novo.
export async function emitirCertificadosGrupo(formData: FormData) {
  const profile = await requireAdmin();
  const empresaId = String(formData.get("empresa_id"));
  const turmaId = String(formData.get("turma_id"));
  const titulo = txt(formData, "titulo");
  const minimo = Math.min(Math.max(Number(formData.get("minimo") ?? 75), 0), 100);
  if (!titulo) throw new Error("Preencha o nome do programa.");

  const supabase = await createClient();
  const [empresa] = await getEmpresas(supabase, empresaId);
  const grupo = empresa?.grupos.find((g) => g.id === turmaId);
  if (!empresa || !grupo) throw new Error("Grupo não encontrado.");

  const { data: jaTem } = await supabase.from("certificados").select("aluno_id").eq("turma_id", turmaId);
  const emitidos = new Set((jaTem ?? []).map((c) => c.aluno_id));

  const linhas = grupo.participantes
    .filter((p) => !emitidos.has(p.id))
    .filter((p) => {
      const f = frequencia(grupo.aulas, p.id) as { pct: number } | null;
      return !f || f.pct >= minimo;
    })
    .map((p) => ({
      aluno_id: p.id,
      turma_id: turmaId,
      tipo: "participacao",
      titulo,
      nome_impresso: p.nome,
      empresa: empresa.nome,
      carga_horaria: inteiro(formData, "carga_horaria"),
      inicio: txt(formData, "inicio"),
      fim: txt(formData, "fim") ?? diaISO(new Date()),
      created_by: profile.id,
    }));
  if (linhas.length) {
    const { error } = await supabase.from("certificados").insert(linhas);
    if (error) throw new Error("Não foi possível emitir os certificados.");
  }
  revalidatePath(`/admin/empresas/${empresaId}`);
}
