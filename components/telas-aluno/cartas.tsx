import { createClient } from "@/lib/supabase/server";
import CabecalhoPagina from "@/components/cabecalho-pagina";
import JogoCartas from "@/components/jogo-cartas";
import { hojeISO, sequenciaDeDias, type Carta, type ProgressoCarta } from "@/lib/cartas";
import type { Visao } from "@/lib/visao";

export default async function TelaCartas({ v }: { v: Visao }) {
  const supabase = await createClient();
  const [{ data: rows }, { data: prog }, { data: dias }] = await Promise.all([
    supabase
      .from("cartas")
      .select("id, categoria, incorreta, correta, explicacao, audio_path")
      .eq("idioma", v.idioma)
      .eq("publicada", true)
      .order("categoria")
      .order("ordem"),
    supabase.from("cartas_progresso").select("carta_id, nivel, acertos, erros, proxima_em").eq("aluno_id", v.alunoId),
    supabase.from("cartas_dias").select("dia").eq("aluno_id", v.alunoId).order("dia", { ascending: false }).limit(400),
  ]);

  const cartas: Carta[] = (rows ?? []).map((r) => ({
    id: r.id,
    categoria: r.categoria,
    incorreta: r.incorreta,
    correta: r.correta,
    explicacao: r.explicacao,
    audio: r.audio_path ? supabase.storage.from("cartas-audio").getPublicUrl(r.audio_path).data.publicUrl : null,
  }));
  const progresso: Record<string, ProgressoCarta> = {};
  for (const p of prog ?? []) {
    progresso[p.carta_id] = { nivel: p.nivel, acertos: p.acertos, erros: p.erros, proxima_em: p.proxima_em };
  }
  const listaDias = (dias ?? []).map((d) => d.dia as string);
  const hoje = hojeISO();

  return (
    <div>
      <CabecalhoPagina
        sobretitulo={`Cartas · ${v.idioma === "ingles" ? "inglês" : "espanhol"}`}
        titulo="Cartas"
        descricao="Frases que muita gente fala do jeito errado. Pense em como seria o certo, vire a carta e ouça a pronúncia."
      />
      <JogoCartas
        cartas={cartas}
        progresso={progresso}
        sequencia={sequenciaDeDias(listaDias, hoje)}
        jogouHoje={listaDias.includes(hoje)}
        idioma={v.idioma}
        previa={v.previa}
      />
    </div>
  );
}
