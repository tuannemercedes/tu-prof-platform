"use server";

import { createClient } from "@/lib/supabase/server";

export type ResultadoBusca = {
  id: string;
  titulo: string;
  tipo: string;
  materiaId: string;
  materiaTitulo: string;
};

export async function buscarMateriais(termo: string): Promise<ResultadoBusca[]> {
  if (!termo.trim()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("materiais")
    .select("id, titulo, tipo, materia_id, materias(titulo)")
    .ilike("titulo", `%${termo.trim()}%`)
    .order("titulo")
    .limit(20);

  return (data ?? []).map((m) => ({
    id: m.id,
    titulo: m.titulo,
    tipo: m.tipo,
    materiaId: m.materia_id,
    materiaTitulo: (m.materias as unknown as { titulo: string } | null)?.titulo ?? "",
  }));
}
