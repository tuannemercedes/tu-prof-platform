"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";

type Dados = { concluida: boolean; resposta?: string | null; arquivoPath?: string | null };

export async function salvarEntrega(tarefaId: string, dados: Dados) {
  const user = await getUser();
  if (!user) return { error: "Sessão expirada. Entre de novo." };

  const supabase = await createClient();
  const { error } = await supabase.from("tarefa_entregas").upsert({
    tarefa_id: tarefaId,
    aluno_id: user.id,
    concluida: dados.concluida,
    ...(dados.resposta !== undefined ? { resposta: dados.resposta } : {}),
    ...(dados.arquivoPath !== undefined ? { arquivo_path: dados.arquivoPath } : {}),
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: "Não foi possível salvar. Tente de novo." };
  revalidatePath("/aluno", "layout");
  return { ok: true };
}
