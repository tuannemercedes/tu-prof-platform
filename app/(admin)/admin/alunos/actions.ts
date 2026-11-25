"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generatePassword } from "@/lib/password";
import { requireAdmin } from "@/lib/dal";

type Papel = "aluno" | "professor";

function lerPapel(valor: FormDataEntryValue | null): Papel {
  return valor === "professor" ? "professor" : "aluno";
}

export async function addAluno(formData: FormData) {
  // Usa a chave de serviço (cria login): só a admin pode chamar.
  await requireAdmin();

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const nome = String(formData.get("nome") || "").trim();
  const papel = lerPapel(formData.get("papel"));
  const professorId = String(formData.get("professor_id") || "") || null;
  const turmaIds = formData.getAll("turmas").map(String);

  if (!email) return { error: "Informe um e-mail." };

  const admin = createAdminClient();
  const password = generatePassword();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  let pessoaId = data?.user?.id;
  let jaExistia = false;

  if (error) {
    jaExistia = true;
    if (error.message.toLowerCase().includes("already")) {
      const { data: list } = await admin.auth.admin.listUsers();
      pessoaId = list?.users.find((u) => u.email?.toLowerCase() === email)?.id;
    } else {
      return { error: error.message };
    }
  }

  if (!pessoaId) return { error: "Não foi possível criar a pessoa." };

  const supabase = await createClient();
  const { data: atual } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", pessoaId)
    .single();

  // Nunca rebaixa uma conta de admin que já exista com esse e-mail.
  if (atual?.role === "admin") {
    return { error: "Esse e-mail já é de uma conta de administração." };
  }

  await supabase
    .from("profiles")
    .update({
      ...(nome ? { nome } : {}),
      role: papel,
      professor_id: papel === "aluno" ? professorId : null,
      // Aluno novo começa "em montagem" (sem e-mails), a não ser que seja liberado já.
      ...(papel === "aluno" && !jaExistia && formData.get("boas_vindas") === "1" ? { liberado_em: new Date().toISOString() } : {}),
    })
    .eq("id", pessoaId);

  if (papel === "aluno" && turmaIds.length) {
    await supabase
      .from("turma_membros")
      .upsert(turmaIds.map((turma_id) => ({ turma_id, aluno_id: pessoaId })));
  }

  // E-mail de boas-vindas com link, login e senha (só para conta nova).
  const boasVindas = !jaExistia && formData.get("boas_vindas") === "1";
  if (boasVindas) {
    await supabase.from("avisos_fila").insert({ tipo: "boas_vindas", destinatario: pessoaId, dados: { senha: password } });
  }

  revalidatePath("/admin/alunos");
  // Se a conta já existia, a senha dela não mudou: não mostramos uma senha falsa.
  return { success: true, email, password: jaExistia ? null : password, papel, boasVindas };
}

// Libera o acesso de alunos "em montagem": gera uma senha nova, envia as boas-vindas
// e liga os avisos por e-mail. Serve para um aluno ou para vários de uma vez.
export async function liberarAlunos(formData: FormData) {
  await requireAdmin();
  const ids = formData.getAll("aluno_id").map(String).filter(Boolean);
  if (!ids.length) return;
  const admin = createAdminClient();
  const supabase = await createClient();
  const { data: alunos } = await supabase.from("profiles").select("id").in("id", ids).eq("role", "aluno").is("liberado_em", null);
  for (const a of alunos ?? []) {
    const senha = generatePassword();
    const { error } = await admin.auth.admin.updateUserById(a.id, { password: senha });
    if (error) continue;
    await supabase.from("profiles").update({ liberado_em: new Date().toISOString() }).eq("id", a.id);
    await supabase.from("avisos_fila").insert({ tipo: "boas_vindas", destinatario: a.id, dados: { senha } });
  }
  revalidatePath("/admin/alunos", "layout");
  revalidatePath("/admin");
}

export async function resetAlunoPassword(alunoId: string) {
  // Usa a chave de serviço (troca senha): só a admin pode chamar.
  await requireAdmin();

  const admin = createAdminClient();
  const password = generatePassword();

  const { error } = await admin.auth.admin.updateUserById(alunoId, { password });
  if (error) return { error: error.message };

  return { success: true, password };
}

export async function updateAlunoTurmas(formData: FormData) {
  const alunoId = String(formData.get("aluno_id") || "");
  const turmaIds = formData.getAll("turmas").map(String);
  const professorId = String(formData.get("professor_id") || "") || null;
  if (!alunoId) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ professor_id: professorId }).eq("id", alunoId);
  await supabase.from("turma_membros").delete().eq("aluno_id", alunoId);

  if (turmaIds.length) {
    await supabase
      .from("turma_membros")
      .insert(turmaIds.map((turma_id) => ({ turma_id, aluno_id: alunoId })));
  }

  revalidatePath("/admin/alunos");
}
