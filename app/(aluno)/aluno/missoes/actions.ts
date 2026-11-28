"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";

// O aluno entrega a Missão de uma aula (áudio já enviado ao storage e/ou texto).
export async function enviarMissao(materialId: string, audioPath: string | null, texto: string | null) {
  const user = await getUser();
  if (!user) return { error: "Faça login de novo." };
  if (audioPath && !audioPath.startsWith(`${user.id}/missoes/${materialId}/`)) return { error: "Arquivo inválido." };

  const supabase = await createClient();
  const { data: material } = await supabase.from("materiais").select("entrega").eq("id", materialId).eq("tipo", "missao").maybeSingle();
  if (!material) return { error: "Missão não encontrada." };
  // Missões de "só marcar que fez" não entram na fila de correção.
  const soMarcar = material.entrega === "feito";
  if (!soMarcar && !audioPath && !texto?.trim()) return { error: "Envie um áudio ou escreva a resposta." };

  const { error } = await supabase.from("missao_entregas").insert({
    material_id: materialId,
    aluno_id: user.id,
    audio_path: audioPath,
    texto: texto?.trim().slice(0, 5000) || null,
    precisa_correcao: !soMarcar,
  });
  if (error) return { error: "Não foi possível registrar a entrega. Tente de novo." };

  await supabase.from("progresso").upsert({ aluno_id: user.id, material_id: materialId, concluido: true, updated_at: new Date().toISOString() });
  revalidatePath("/aluno");
  return { success: true };
}
