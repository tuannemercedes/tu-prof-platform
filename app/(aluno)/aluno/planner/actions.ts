"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleItemConcluido(itemId: string, concluido: boolean) {
  const supabase = await createClient();
  await supabase.from("planner_itens").update({ concluido }).eq("id", itemId);
  revalidatePath("/aluno/planner");
}
