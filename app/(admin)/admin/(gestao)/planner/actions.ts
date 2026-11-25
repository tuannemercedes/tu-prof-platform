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

export async function duplicatePlanner(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();

  const { data: original } = await supabase.from("planners").select("titulo").eq("id", id).single();
  if (!original) return;

  const { data: novoPlanner, error } = await supabase
    .from("planners")
    .insert({ titulo: `${original.titulo} (cópia)` })
    .select("id")
    .single();
  if (error || !novoPlanner) return;

  const { data: dias } = await supabase
    .from("planner_dias")
    .select("id, semana, titulo, ordem, conteudo_html")
    .eq("planner_id", id)
    .order("semana")
    .order("ordem");

  for (const dia of dias ?? []) {
    const { data: novoDia } = await supabase
      .from("planner_dias")
      .insert({
        planner_id: novoPlanner.id,
        semana: dia.semana,
        titulo: dia.titulo,
        ordem: dia.ordem,
        conteudo_html: dia.conteudo_html,
      })
      .select("id")
      .single();
    if (!novoDia) continue;

    const { data: itens } = await supabase
      .from("planner_itens")
      .select("texto, link_url, ordem")
      .eq("dia_id", dia.id)
      .order("ordem");

    if (itens?.length) {
      await supabase
        .from("planner_itens")
        .insert(itens.map((i) => ({ dia_id: novoDia.id, texto: i.texto, link_url: i.link_url, ordem: i.ordem })));
    }
  }

  // liberação de acesso não é copiada de propósito — a cópia nasce sem
  // ninguém liberado, pra escolher pra quem vai (esse é o ponto de duplicar).
  revalidatePath("/admin/planner");
  redirect(`/admin/planner/${novoPlanner.id}`);
}
