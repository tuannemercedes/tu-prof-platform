import { cookies } from "next/headers";
import type { createClient } from "@/lib/supabase/server";

export type Idioma = "espanhol" | "ingles";
export const ROTULO_IDIOMA: Record<Idioma, string> = { espanhol: "Espanhol", ingles: "Inglês" };

// Idiomas que o aluno estuda, a partir dos programas em que está matriculado.
export function idiomasDosProgramas(idiomasProgramas: (string | null | undefined)[]): Idioma[] {
  const set = new Set<Idioma>();
  idiomasProgramas.forEach((i) => {
    if (i === "espanhol" || i === "espanhol_ingles") set.add("espanhol");
    if (i === "ingles" || i === "espanhol_ingles") set.add("ingles");
  });
  if (!set.size) set.add("espanhol");
  return (["espanhol", "ingles"] as Idioma[]).filter((i) => set.has(i));
}

// Idioma em que o aluno está agora (escolha guardada no cookie) e as opções dele.
export async function getIdiomaDoAluno(
  supabase: Awaited<ReturnType<typeof createClient>>,
  alunoId: string
): Promise<{ atual: Idioma; opcoes: Idioma[] }> {
  const { data } = await supabase.from("turma_membros").select("turmas(idioma)").eq("aluno_id", alunoId);
  const opcoes = idiomasDosProgramas(
    (data ?? []).map((m) => (m.turmas as unknown as { idioma: string } | null)?.idioma)
  );
  const salvo = (await cookies()).get("idioma")?.value as Idioma | undefined;
  return { atual: salvo && opcoes.includes(salvo) ? salvo : opcoes[0], opcoes };
}

// Um item sem idioma (ou dos dois idiomas) aparece em qualquer área.
export function doIdioma(item: string | null | undefined, atual: Idioma) {
  return !item || item === atual || item === "espanhol_ingles";
}
