"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";

export async function updateNome(formData: FormData) {
  const nome = String(formData.get("nome") || "").trim();
  const user = await getUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ nome: nome || null }).eq("id", user.id);

  revalidatePath("/aluno/perfil");
  revalidatePath("/aluno");
}
