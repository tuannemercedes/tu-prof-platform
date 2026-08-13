"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";

export async function toggleProgresso(materialId: string, concluido: boolean) {
  const user = await getUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from("progresso").upsert({
    aluno_id: user.id,
    material_id: materialId,
    concluido,
    updated_at: new Date().toISOString(),
  });

  revalidatePath("/aluno");
}

export async function recordAccess(materialId: string) {
  const user = await getUser();
  if (!user) return;

  const supabase = await createClient();
  await supabase.from("progresso").upsert(
    {
      aluno_id: user.id,
      material_id: materialId,
      acessado_em: new Date().toISOString(),
    },
    { onConflict: "aluno_id,material_id" }
  );
}
