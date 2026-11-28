"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/dal";

// A professora ou o monitor deixa o comentário de correção de uma Missão.
export async function comentarMissao(formData: FormData) {
  const perfil = await requireStaff();
  const id = String(formData.get("id") || "");
  const comentario = String(formData.get("comentario") || "").trim().slice(0, 4000);
  if (!id) return;
  const supabase = await createClient();
  await supabase
    .from("missao_entregas")
    .update(
      comentario
        ? { comentario, comentario_em: new Date().toISOString(), comentario_por: perfil.id, comentario_nome: (perfil.nome ?? "").split(" ")[0] || null }
        : { comentario: null, comentario_em: null, comentario_por: null, comentario_nome: null },
    )
    .eq("id", id);
  revalidatePath("/admin/missoes");
}
