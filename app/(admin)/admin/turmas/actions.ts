"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createTurma(formData: FormData) {
  const nome = String(formData.get("nome") || "").trim();
  if (!nome) return;

  const supabase = await createClient();
  await supabase.from("turmas").insert({ nome });
  revalidatePath("/admin/turmas");
}

export async function updateTurmaNome(formData: FormData) {
  const id = String(formData.get("id") || "");
  const nome = String(formData.get("nome") || "").trim();
  if (!id || !nome) return;

  const supabase = await createClient();
  await supabase.from("turmas").update({ nome }).eq("id", id);
  revalidatePath("/admin/turmas");
}

export async function updateTurmaCalendario(formData: FormData) {
  const id = String(formData.get("id") || "");
  const calendario_embed_url = String(formData.get("calendario_embed_url") || "").trim() || null;
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("turmas").update({ calendario_embed_url }).eq("id", id);
  revalidatePath("/admin/turmas");
}

export async function deleteTurma(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("turmas").delete().eq("id", id);
  revalidatePath("/admin/turmas");
}
