"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";

// O aluno entrega a Missão de uma aula (áudio já enviado ao storage e/ou texto).
export async function enviarMissao(materialId: string, audioPath: string | null, texto: string | null) {
  const user = await getUser();
  if (!user) return { error: "Faça login de novo." };
  if (audioPath && !audioPath.startsWith(`${user.id}/missoes/${materialId}/`)) return { error: "Arquivo inválido." };
  if (!audioPath && !texto?.trim()) return { error: "Envie um áudio ou escreva a resposta." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("missao_entregas")
    .insert({ material_id: materialId, aluno_id: user.id, audio_path: audioPath, texto: texto?.trim().slice(0, 5000) || null });
  if (error) return { error: "Não foi possível registrar a entrega. Tente de novo." };

  await supabase.from("progresso").upsert({ aluno_id: user.id, material_id: materialId, concluido: true, updated_at: new Date().toISOString() });
  revalidatePath("/aluno");
  return { success: true };
}
