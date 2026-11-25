"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser, requireStaff } from "@/lib/dal";

// Remarcar, desmarcar e pedir remarcação. Servem para aula individual e de grupo;
// a RLS decide quem pode mexer em cada aula. Os e-mails saem pelos gatilhos do banco.

const txt = (f: FormData, k: string) => String(f.get(k) ?? "").trim() || null;
// "2026-11-25T18:00" digitado no navegador = horário de Brasília (UTC-3)
const paraTimestamp = (local: string | null) => (local ? new Date(`${local}:00-03:00`).toISOString() : null);

function atualizar(f: FormData) {
  const voltar = String(f.get("voltar") ?? "");
  if (voltar.startsWith("/admin")) revalidatePath(voltar);
  revalidatePath("/admin");
  revalidatePath("/aluno", "layout");
}

export async function remarcarAula(formData: FormData) {
  await requireStaff();
  const aulaId = String(formData.get("aula_id"));
  const nova = paraTimestamp(txt(formData, "data"));
  if (!nova) return;
  const supabase = await createClient();
  const { data: aula } = await supabase.from("aulas").select("data, remarcada_de").eq("id", aulaId).single();
  if (!aula || aula.data === nova) return;
  const { error } = await supabase
    .from("aulas")
    // Guarda a data original (a primeira), mesmo que a aula seja remarcada mais de uma vez.
    .update({ data: nova, remarcada_de: aula.remarcada_de ?? aula.data, motivo: txt(formData, "motivo") })
    .eq("id", aulaId);
  if (error) throw new Error("Não foi possível remarcar.");
  await supabase.from("pedidos_remarcacao").update({ resolvido_em: new Date().toISOString() }).eq("aula_id", aulaId).is("resolvido_em", null);
  atualizar(formData);
}

export async function desmarcarAula(formData: FormData) {
  await requireStaff();
  const aulaId = String(formData.get("aula_id"));
  const cancelamento = formData.get("cancelamento") === "sem_reposicao" ? "sem_reposicao" : "repor";
  const supabase = await createClient();
  const { error } = await supabase
    .from("aulas")
    .update({ status: "cancelada", cancelamento, motivo: txt(formData, "motivo") })
    .eq("id", aulaId);
  if (error) throw new Error("Não foi possível desmarcar.");
  await supabase.from("pedidos_remarcacao").update({ resolvido_em: new Date().toISOString() }).eq("aula_id", aulaId).is("resolvido_em", null);
  atualizar(formData);
}

// Volta uma aula desmarcada para a agenda (desfazer).
export async function reativarAula(formData: FormData) {
  await requireStaff();
  const supabase = await createClient();
  await supabase.from("aulas").update({ status: "agendada", cancelamento: null }).eq("id", String(formData.get("aula_id")));
  atualizar(formData);
}

export async function resolverPedido(formData: FormData) {
  await requireStaff();
  const supabase = await createClient();
  await supabase.from("pedidos_remarcacao").update({ resolvido_em: new Date().toISOString() }).eq("id", String(formData.get("pedido_id")));
  atualizar(formData);
}

// O aluno pede para remarcar uma aula.
export async function pedirRemarcacao(_: unknown, formData: FormData) {
  const user = await getUser();
  if (!user) return { error: "Entre de novo na plataforma." };
  const supabase = await createClient();
  const { error } = await supabase.from("pedidos_remarcacao").insert({
    aula_id: String(formData.get("aula_id")),
    aluno_id: user.id,
    mensagem: txt(formData, "mensagem"),
    sugestao: txt(formData, "sugestao"),
  });
  if (error) return { error: "Não foi possível enviar o pedido. Tente de novo." };
  revalidatePath("/aluno", "layout");
  return { ok: true };
}
