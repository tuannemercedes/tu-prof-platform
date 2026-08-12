"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createMateria(formData: FormData) {
  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) return;

  const supabase = await createClient();
  await supabase.from("materias").insert({ titulo });
  revalidatePath("/admin/materias");
}

export async function deleteMateria(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("materias").delete().eq("id", id);
  revalidatePath("/admin/materias");
}
