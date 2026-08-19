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

export async function updateMateriaTitulo(formData: FormData) {
  const id = String(formData.get("id") || "");
  const titulo = String(formData.get("titulo") || "").trim();
  if (!id || !titulo) return;

  const supabase = await createClient();
  await supabase.from("materias").update({ titulo }).eq("id", id);
  revalidatePath("/admin/materias");
  revalidatePath("/admin/fia");
  revalidatePath(`/admin/materias/${id}`);
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

export async function moverMateria(id: string, categoria: string, direcao: "up" | "down") {
  const supabase = await createClient();
  const { data: materias } = await supabase
    .from("materias")
    .select("id")
    .eq("categoria", categoria)
    .order("ordem")
    .order("titulo");

  if (!materias) return;

  const index = materias.findIndex((m) => m.id === id);
  const alvo = direcao === "up" ? index - 1 : index + 1;
  if (index === -1 || alvo < 0 || alvo >= materias.length) return;

  const reordenadas = [...materias];
  [reordenadas[index], reordenadas[alvo]] = [reordenadas[alvo], reordenadas[index]];

  await Promise.all(
    reordenadas.map((m, i) => supabase.from("materias").update({ ordem: i }).eq("id", m.id))
  );

  revalidatePath("/admin/materias");
  revalidatePath("/admin/fia");
}
