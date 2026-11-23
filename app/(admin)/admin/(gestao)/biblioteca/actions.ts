"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/dal";
import { detectarTipo } from "@/lib/links";

export type NovoItem = {
  link: string;
  titulo: string;
  idioma: string;
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

  // Coleção da FIA onde o item entra (cria "Biblioteca Tu Prof" se não houver nenhuma)
  let materiaId = dados.colecaoId;
  if (!materiaId) {
    const { data: existente } = await supabase.from("materias").select("id").eq("categoria", "fia").order("ordem").limit(1);
    materiaId = existente?.[0]?.id ?? null;
    if (!materiaId) {
      const { data: nova, error } = await supabase
        .from("materias")
        .insert({ titulo: "Biblioteca Tu Prof", categoria: "fia" })
        .select("id")
        .single();
      if (error || !nova) return { error: "Não foi possível criar a coleção da biblioteca." };
      materiaId = nova.id;
    }
  }

  const { tipo, rotulo } = detectarTipo(url);
  let titulo = dados.titulo.trim();
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
