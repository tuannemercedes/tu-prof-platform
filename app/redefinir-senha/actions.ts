"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updatePasswordAfterRecovery(formData: FormData) {
  const novaSenha = String(formData.get("novaSenha") || "");
  const confirmarSenha = String(formData.get("confirmarSenha") || "");

  if (novaSenha.length < 6) return { error: "A nova senha precisa ter pelo menos 6 caracteres." };
  if (novaSenha !== confirmarSenha) return { error: "As senhas não coincidem." };

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Link expirado ou inválido. Solicite um novo link." };

  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) return { error: "Não foi possível atualizar a senha." };

  redirect("/");
}
