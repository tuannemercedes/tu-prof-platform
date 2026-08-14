"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createCronograma(formData: FormData) {
  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) return;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cronogramas")
    .insert({ titulo })
    .select("id")
    .single();

  if (error || !data) return;

  revalidatePath("/admin/cronograma");
  redirect(`/admin/cronograma/${data.id}`);
}

export async function deleteCronograma(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("cronogramas").delete().eq("id", id);
  revalidatePath("/admin/cronograma");
}
