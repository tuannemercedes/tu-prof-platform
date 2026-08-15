"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  if (!email) return { error: "Informe seu e-mail." };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email);

  return { success: true };
}

export async function verifyRecoveryCode(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const token = String(formData.get("token") || "").trim();
  const novaSenha = String(formData.get("novaSenha") || "");
  const confirmarSenha = String(formData.get("confirmarSenha") || "");

  if (!email || !token) return { error: "Preencha o código recebido por e-mail." };
  if (novaSenha.length < 6) return { error: "A nova senha precisa ter pelo menos 6 caracteres." };
  if (novaSenha !== confirmarSenha) return { error: "As senhas não coincidem." };

  const supabase = await createClient();

  const { error: verifyError } = await supabase.auth.verifyOtp({ email, token, type: "recovery" });
  if (verifyError) return { error: "Código inválido ou expirado. Solicite um novo." };

  const { error: updateError } = await supabase.auth.updateUser({ password: novaSenha });
  if (updateError) return { error: `Não foi possível atualizar a senha: ${updateError.message}` };

  redirect("/");
}
