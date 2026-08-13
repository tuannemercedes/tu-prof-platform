"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";

export async function updateNome(formData: FormData) {
  const nome = String(formData.get("nome") || "").trim();
  const user = await getUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ nome: nome || null }).eq("id", user.id);

  revalidatePath("/aluno/perfil");
  revalidatePath("/aluno");
}

export async function updatePassword(formData: FormData) {
  const senhaAtual = String(formData.get("senhaAtual") || "");
  const novaSenha = String(formData.get("novaSenha") || "");
  const confirmarSenha = String(formData.get("confirmarSenha") || "");

  const user = await getUser();
  if (!user?.email) return { error: "Sessão inválida." };

  if (novaSenha.length < 6) return { error: "A nova senha precisa ter pelo menos 6 caracteres." };
  if (novaSenha !== confirmarSenha) return { error: "As senhas não coincidem." };

  const supabase = await createClient();

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: senhaAtual,
  });
  if (authError) return { error: "Senha atual incorreta." };

  const { error: updateError } = await supabase.auth.updateUser({ password: novaSenha });
  if (updateError) return { error: "Não foi possível atualizar a senha." };

  return { success: true };
}
