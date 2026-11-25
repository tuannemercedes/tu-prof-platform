"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser, requireAdmin } from "@/lib/dal";

// Cada pessoa liga/desliga os próprios avisos por e-mail ({"aulas": false} = desligado).
export async function salvarAvisos(prefs: Record<string, boolean>) {
  const user = await getUser();
  if (!user) return { error: "Sessão expirada." };
  const supabase = await createClient();
  const limpo = Object.fromEntries(Object.entries(prefs).filter(([, v]) => v === false));
  const { error } = await supabase.from("profiles").update({ avisos: limpo }).eq("id", user.id);
  if (error) return { error: "Não foi possível salvar." };
  revalidatePath("/aluno/perfil");
  revalidatePath("/admin/configuracoes");
  return { ok: true };
}

// Teste: coloca um e-mail na fila para a própria admin e chama a função na hora.
export async function enviarTeste() {
  const profile = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("avisos_fila").insert({ tipo: "teste", destinatario: profile.id });
  if (error) return { error: "Não foi possível criar o teste." };
  const { data, error: erroFn } = await supabase.functions.invoke("avisos", { body: {} });
  revalidatePath("/admin/configuracoes");
  if (erroFn) return { error: "A função de avisos não respondeu. Tente de novo em alguns minutos." };
  const r = (typeof data === "string" ? JSON.parse(data) : data) as { chave?: boolean; enviados?: number; erros?: number };
  if (!r?.chave) return { error: "Falta cadastrar a chave do Resend. O teste fica na fila e sai assim que ela estiver lá." };
  if (r.erros) return { error: "O Resend recusou o envio. Veja o motivo no histórico abaixo." };
  return { ok: true };
}
