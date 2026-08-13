"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCronogramaItem(formData: FormData) {
  const aluno_id = String(formData.get("aluno_id") || "");
  const data = String(formData.get("data") || "").trim() || null;
  const tema = String(formData.get("tema") || "").trim();
  const descricao = String(formData.get("descricao") || "").trim() || null;

  if (!aluno_id || !tema) return;

  const supabase = await createClient();
  await supabase.from("cronograma_itens").insert({ aluno_id, data, tema, descricao });
  revalidatePath(`/admin/alunos/${aluno_id}/cronograma`);
}

export async function deleteCronogramaItem(formData: FormData) {
  const id = String(formData.get("id") || "");
  const aluno_id = String(formData.get("aluno_id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("cronograma_itens").delete().eq("id", id);
  revalidatePath(`/admin/alunos/${aluno_id}/cronograma`);
}
