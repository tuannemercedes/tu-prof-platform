"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateConfiguracoes(formData: FormData) {
  const app_treino_url = String(formData.get("app_treino_url") || "").trim();
  const app_treino_label = String(formData.get("app_treino_label") || "").trim();
  const contato_url = String(formData.get("contato_url") || "").trim();
  const contato_label = String(formData.get("contato_label") || "").trim();

  const supabase = await createClient();
  await supabase
    .from("configuracoes")
    .upsert([
      { chave: "app_treino_url", valor: app_treino_url || null },
      { chave: "app_treino_label", valor: app_treino_label || "UZUS - Seu simulador" },
      { chave: "contato_url", valor: contato_url || null },
      { chave: "contato_label", valor: contato_label || "Fale comigo" },
    ]);

  revalidatePath("/admin/configuracoes");
  revalidatePath("/aluno");
}
