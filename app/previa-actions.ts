"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser, requireStaff } from "@/lib/dal";
import { textoParaExpressoes, type Previa } from "@/lib/previa";

const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim() || undefined;

// Salva (ou apaga, se tudo vier vazio) a prévia de uma aula. A RLS decide quem pode.
export async function salvarPrevia(formData: FormData) {
  await requireStaff();
  const aulaId = String(formData.get("aula_id"));
  const previa: Previa = {
    objetivo: txt(formData, "objetivo"),
    situacao: txt(formData, "situacao"),
    expressoes: textoParaExpressoes(String(formData.get("expressoes") ?? "")),
    erro: txt(formData, "erro"),
    preparo: txt(formData, "preparo"),
  };
  const vazia = !previa.objetivo && !previa.situacao && !previa.erro && !previa.preparo && !previa.expressoes?.length;
  const supabase = await createClient();
  const { error } = await supabase.from("aulas").update({ previa: vazia ? null : previa }).eq("id", aulaId);
  if (error) throw new Error("Não foi possível salvar a prévia.");
  const voltar = String(formData.get("voltar") ?? "");
  if (voltar.startsWith("/admin")) revalidatePath(voltar);
  revalidatePath("/aluno");
}

// Registra que o aluno abriu a prévia (para o relatório do RH).
export async function marcarPreviaVista(aulaId: string) {
  const user = await getUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase.from("previa_vistas").upsert({ aula_id: aulaId, aluno_id: user.id }, { onConflict: "aula_id,aluno_id", ignoreDuplicates: true });
}
