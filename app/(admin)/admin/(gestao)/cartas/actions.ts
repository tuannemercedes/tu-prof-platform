"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function revalidar() {
  revalidatePath("/admin/cartas");
  revalidatePath("/aluno/cartas");
}

const IDIOMAS = ["espanhol", "ingles"];

export async function salvarCarta(formData: FormData) {
  const id = String(formData.get("id") || "");
  const idioma = String(formData.get("idioma") || "");
  const categoria = String(formData.get("categoria") || "").trim();
  const incorreta = String(formData.get("incorreta") || "").trim();
  const correta = String(formData.get("correta") || "").trim();
  const explicacao = String(formData.get("explicacao") || "").trim() || null;
  const publicada = formData.get("publicada") === "on";
  const removerAudio = formData.get("remover_audio") === "on";
  const audio = formData.get("audio");
  if (!IDIOMAS.includes(idioma) || !categoria || !incorreta || !correta) return;

  const supabase = await createClient();
  let cartaId = id;
  if (id) {
    await supabase.from("cartas").update({ categoria, incorreta, correta, explicacao, publicada }).eq("id", id);
  } else {
    const { count } = await supabase.from("cartas").select("*", { count: "exact", head: true }).eq("idioma", idioma).eq("categoria", categoria);
    const { data } = await supabase
      .from("cartas")
      .insert({ idioma, categoria, incorreta, correta, explicacao, publicada, ordem: count ?? 0 })
      .select("id")
      .single();
    cartaId = data?.id ?? "";
  }
  if (!cartaId) return;

  if (audio instanceof File && audio.size > 0) {
    const ext = (audio.name.split(".").pop() || "mp3").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${idioma}/${cartaId}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("cartas-audio").upload(path, audio, { contentType: audio.type || "audio/mpeg", upsert: true });
    if (!error) {
      const { data: antiga } = await supabase.from("cartas").select("audio_path").eq("id", cartaId).maybeSingle();
      if (antiga?.audio_path) await supabase.storage.from("cartas-audio").remove([antiga.audio_path]);
      await supabase.from("cartas").update({ audio_path: path }).eq("id", cartaId);
    }
  } else if (removerAudio) {
    const { data: antiga } = await supabase.from("cartas").select("audio_path").eq("id", cartaId).maybeSingle();
    if (antiga?.audio_path) await supabase.storage.from("cartas-audio").remove([antiga.audio_path]);
    await supabase.from("cartas").update({ audio_path: null }).eq("id", cartaId);
  }
  revalidar();
}

export async function excluirCarta(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = await createClient();
  const { data } = await supabase.from("cartas").select("audio_path").eq("id", id).maybeSingle();
  if (data?.audio_path) await supabase.storage.from("cartas-audio").remove([data.audio_path]);
  await supabase.from("cartas").delete().eq("id", id);
  revalidar();
}

// Publica (ou tira do ar) todas as cartas de um tema de uma vez.
export async function publicarCategoria(formData: FormData) {
  const idioma = String(formData.get("idioma") || "");
  const categoria = String(formData.get("categoria") || "");
  const publicada = formData.get("publicada") === "1";
  if (!IDIOMAS.includes(idioma) || !categoria) return;
  const supabase = await createClient();
  await supabase.from("cartas").update({ publicada }).eq("idioma", idioma).eq("categoria", categoria);
  revalidar();
}
