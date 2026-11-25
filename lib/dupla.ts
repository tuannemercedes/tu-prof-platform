import type { createClient } from "@/lib/supabase/server";

type Supa = Awaited<ReturnType<typeof createClient>>;

// Aula em dupla: as duas aulas (uma de cada pessoa) têm o mesmo par_id.
// Devolve os ids de todas as aulas do par (ou só a própria, se não for em dupla).
export async function aulasDoPar(supabase: Supa, aulaId: string) {
  const { data } = await supabase.from("aulas").select("par_id").eq("id", aulaId).maybeSingle();
  if (!data?.par_id) return [aulaId];
  const { data: par } = await supabase.from("aulas").select("id").eq("par_id", data.par_id);
  return (par ?? []).map((a) => a.id as string);
}

export async function duplaDe(supabase: Supa, alunoId: string) {
  const { data } = await supabase.from("profiles").select("dupla_com").eq("id", alunoId).maybeSingle();
  return (data?.dupla_com as string | null) ?? null;
}
