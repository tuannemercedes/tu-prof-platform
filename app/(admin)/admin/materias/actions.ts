"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createMateria(formData: FormData) {
  const titulo = String(formData.get("titulo") || "").trim();
  const categoria = String(formData.get("categoria") || "trilha");
  if (!titulo) return;

  const supabase = await createClient();
  await supabase.from("materias").insert({ titulo, categoria });
  revalidatePath("/admin/materias");
}

export async function updateMateriaCategoria(formData: FormData) {
  const id = String(formData.get("id") || "");
  const categoria = String(formData.get("categoria") || "");
  if (!id || !categoria) return;

  const supabase = await createClient();
  await supabase.from("materias").update({ categoria }).eq("id", id);
  revalidatePath("/admin/materias");
}

export async function deleteMateria(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("materias").delete().eq("id", id);
  revalidatePath("/admin/materias");
}
