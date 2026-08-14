"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createPlanner(formData: FormData) {
  const titulo = String(formData.get("titulo") || "").trim();
  if (!titulo) return;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planners")
    .insert({ titulo })
    .select("id")
    .single();

  if (error || !data) return;

  revalidatePath("/admin/planner");
  redirect(`/admin/planner/${data.id}`);
}

export async function updatePlannerTitulo(formData: FormData) {
  const id = String(formData.get("id") || "");
  const titulo = String(formData.get("titulo") || "").trim();
  if (!id || !titulo) return;

  const supabase = await createClient();
  await supabase.from("planners").update({ titulo }).eq("id", id);
  revalidatePath("/admin/planner");
  revalidatePath(`/admin/planner/${id}`);
}

export async function deletePlanner(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("planners").delete().eq("id", id);
  revalidatePath("/admin/planner");
}
