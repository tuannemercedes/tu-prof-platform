"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/dal";
import { detectarTipo } from "@/lib/links";
import { capaDoSpotify } from "@/lib/capas";

export type NovoItem = {
  link: string;
  titulo: string;
  idioma: string;
  destino: "fia" | "biblioteca";
  colecaoId: string | null;
  quem: "todos" | "programa" | "aluno";
  turmaId: string | null;
  alunoId: string | null;
};

export async function criarItemBiblioteca(dados: NovoItem) {
  await requireAdmin();
  const url = dados.link.trim();
  if (!url) return { error: "Cole um link." };
  const supabase = await createClient();

  // Coleção onde o item entra (cria "FIA Tu Prof" ou "Biblioteca Tu Prof" se ainda não houver)
  const categoria = dados.destino === "fia" ? "fia" : "biblioteca";
  let materiaId = dados.colecaoId;
  if (!materiaId) {
    const { data: existente } = await supabase.from("materias").select("id").eq("categoria", categoria).order("ordem").limit(1);
    materiaId = existente?.[0]?.id ?? null;
    if (!materiaId) {
      const { data: nova, error } = await supabase
        .from("materias")
        .insert({ titulo: categoria === "fia" ? "FIA Tu Prof" : "Biblioteca Tu Prof", categoria })
        .select("id")
        .single();
      if (error || !nova) return { error: "Não foi possível criar a coleção da biblioteca." };
      materiaId = nova.id;
    }
  }

  const { tipo, rotulo } = detectarTipo(url);
  const spotify = await capaDoSpotify(url);
  let titulo = dados.titulo.trim() || spotify?.titulo || "";
  if (!titulo) {
    try {
      const u = new URL(url);
      titulo = `${rotulo} · ${u.hostname.replace("www.", "")}`;
    } catch {
      titulo = rotulo;
    }
  }

  const { data: material, error } = await supabase
    .from("materiais")
    .insert({
      materia_id: materiaId,
      tipo: tipo === "pdf" ? "link_externo" : tipo,
      titulo,
      url,
      idioma: dados.idioma,
      capa_url: spotify?.capa ?? null,
      visivel_todos: dados.quem === "todos",
    })
    .select("id")
    .single();
  if (error || !material) return { error: "Não foi possível adicionar." };

  if (dados.quem === "programa" && dados.turmaId) {
    await supabase.from("material_turmas").insert({ material_id: material.id, turma_id: dados.turmaId });
  }
  if (dados.quem === "aluno" && dados.alunoId) {
    await supabase.from("material_alunos").insert({ material_id: material.id, aluno_id: dados.alunoId });
  }

  revalidatePath("/admin/biblioteca");
  return { ok: true };
}

export async function excluirItemBiblioteca(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("materiais").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/biblioteca");
}
