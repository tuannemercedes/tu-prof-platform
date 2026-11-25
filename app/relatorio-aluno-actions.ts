"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/dal";
import { mesValido } from "@/lib/relatorio-aluno";

// Salva o comentário do mês e, se pedido, publica para o aluno (dispara o e-mail).
export async function salvarRelatorioAluno(formData: FormData) {
  const profile = await requireStaff();
  const alunoId = String(formData.get("aluno_id"));
  const mes = mesValido(String(formData.get("mes")));
  if (!mes) throw new Error("Mês inválido.");
  const publicar = formData.get("publicar") === "1";
  const supabase = await createClient();
  const { data: atual } = await supabase
    .from("relatorios_mensais")
    .select("publicado_em")
    .eq("aluno_id", alunoId)
    .eq("mes", `${mes}-01`)
    .maybeSingle();
  const { error } = await supabase.from("relatorios_mensais").upsert(
    {
      aluno_id: alunoId,
      mes: `${mes}-01`,
      comentario: String(formData.get("comentario") ?? "").trim() || null,
      publicado_em: atual?.publicado_em ?? (publicar ? new Date().toISOString() : null),
      created_by: profile.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "aluno_id,mes" }
  );
  if (error) throw new Error("Não foi possível salvar o relatório.");
  revalidatePath(`/relatorio/aluno/${alunoId}`);
  revalidatePath("/aluno/evolucao");
}
