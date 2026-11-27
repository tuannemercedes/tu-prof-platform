"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";
import { hojeISO, INTERVALOS, proximoNivel, somarDias } from "@/lib/cartas";

// Registra a resposta do aluno a uma carta e agenda a próxima revisão.
export async function responderCarta(cartaId: string, acertou: boolean) {
  const user = await getUser();
  if (!user) return { error: "Sessão expirada." };
  const supabase = await createClient();
  const hoje = hojeISO();

  const { data: atual } = await supabase
    .from("cartas_progresso")
    .select("nivel, acertos, erros")
    .eq("aluno_id", user.id)
    .eq("carta_id", cartaId)
    .maybeSingle();

  const nivel = proximoNivel(atual?.nivel ?? 0, acertou);
  const { error } = await supabase.from("cartas_progresso").upsert({
    aluno_id: user.id,
    carta_id: cartaId,
    nivel,
    acertos: (atual?.acertos ?? 0) + (acertou ? 1 : 0),
    erros: (atual?.erros ?? 0) + (acertou ? 0 : 1),
    proxima_em: somarDias(hoje, INTERVALOS[nivel]),
    ultima_em: new Date().toISOString(),
  });
  if (error) return { error: error.message };

  const { data: dia } = await supabase.from("cartas_dias").select("cartas").eq("aluno_id", user.id).eq("dia", hoje).maybeSingle();
  await supabase.from("cartas_dias").upsert({ aluno_id: user.id, dia: hoje, cartas: (dia?.cartas ?? 0) + 1 });

  return { ok: true };
}
