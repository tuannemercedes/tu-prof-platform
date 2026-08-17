"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";

export async function confirmarPresencaClube(temaId: string, confirmado: boolean) {
  const user = await getUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from("clube_rsvps").upsert({
    tema_id: temaId,
    aluno_id: user.id,
    confirmado,
    updated_at: new Date().toISOString(),
  });

  revalidatePath("/aluno/clube");
  revalidatePath("/admin/clube");
}
