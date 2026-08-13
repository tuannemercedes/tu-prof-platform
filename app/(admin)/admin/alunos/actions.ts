"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generatePassword } from "@/lib/password";

export async function addAluno(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const nome = String(formData.get("nome") || "").trim();
  const turmaIds = formData.getAll("turmas").map(String);

  if (!email) return { error: "Informe um e-mail." };

  const admin = createAdminClient();
  const password = generatePassword();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  let alunoId = data?.user?.id;

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      const { data: list } = await admin.auth.admin.listUsers();
      alunoId = list?.users.find((u) => u.email?.toLowerCase() === email)?.id;
    } else {
      return { error: error.message };
    }
  }

  if (!alunoId) return { error: "Não foi possível criar o aluno." };

  const supabase = await createClient();
  if (nome) await supabase.from("profiles").update({ nome }).eq("id", alunoId);

  if (turmaIds.length) {
    await supabase
      .from("turma_membros")
      .upsert(turmaIds.map((turma_id) => ({ turma_id, aluno_id: alunoId })));
  }

  revalidatePath("/admin/alunos");
  return { success: true, email, password };
}

export async function resetAlunoPassword(alunoId: string) {
  const admin = createAdminClient();
  const password = generatePassword();

  const { error } = await admin.auth.admin.updateUserById(alunoId, { password });
  if (error) return { error: error.message };

  return { success: true, password };
}

export async function updateAlunoTurmas(formData: FormData) {
  const alunoId = String(formData.get("aluno_id") || "");
  const turmaIds = formData.getAll("turmas").map(String);
  if (!alunoId) return;

  const supabase = await createClient();
  await supabase.from("turma_membros").delete().eq("aluno_id", alunoId);

  if (turmaIds.length) {
    await supabase
      .from("turma_membros")
      .insert(turmaIds.map((turma_id) => ({ turma_id, aluno_id: alunoId })));
  }

  revalidatePath("/admin/alunos");
}
