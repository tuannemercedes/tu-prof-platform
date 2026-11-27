import { createHash } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import CabecalhoPagina from "@/components/cabecalho-pagina";
import JogoCartas from "@/components/jogo-cartas";
import { hojeISO, sequenciaDeDias, type Carta, type ProgressoCarta } from "@/lib/cartas";
import type { Idioma } from "@/lib/idioma";
import type { Visao } from "@/lib/visao";
import audiosGerados from "@/lib/cartas-audio.json";

const GERADOS = new Set(audiosGerados as string[]);

// Áudio da forma correta: o gravado pela professora (Storage) ou o gerado com voz neural.
function audioDaCarta(supabase: Awaited<ReturnType<typeof createClient>>, idioma: string, correta: string, audioPath: string | null) {
  if (audioPath) return supabase.storage.from("cartas-audio").getPublicUrl(audioPath).data.publicUrl;
  const h = createHash("sha1").update(`${idioma}|${correta}`).digest("hex").slice(0, 16);
  return GERADOS.has(h) ? `/audio/cartas/${h}.mp3` : null;
}

export default async function TelaCartas({ v }: { v: Visao }) {
  const supabase = await createClient();
  const idiomas: Idioma[] = v.opcoes.length ? v.opcoes : [v.idioma];
  const [{ data: rows }, { data: prog }, { data: dias }] = await Promise.all([
    supabase
      .from("cartas")
      .select("id, idioma, categoria, incorreta, correta, explicacao, tipo, audio_path")
      .in("idioma", idiomas)
      .eq("publicada", true)
      .order("categoria")
      .order("ordem"),
    supabase.from("cartas_progresso").select("carta_id, nivel, acertos, erros, proxima_em").eq("aluno_id", v.alunoId),
    supabase.from("cartas_dias").select("dia").eq("aluno_id", v.alunoId).order("dia", { ascending: false }).limit(400),
  ]);

  const porIdioma = Object.fromEntries(idiomas.map((i) => [i, [] as Carta[]])) as Record<Idioma, Carta[]>;
  for (const r of rows ?? []) {
    porIdioma[r.idioma as Idioma]?.push({
      id: r.id,
      categoria: r.categoria,
      incorreta: r.incorreta,
      correta: r.correta,
      explicacao: r.explicacao,
      tipo: r.tipo === "natural" ? "natural" : r.tipo === "expressao" ? "expressao" : "erro",
      audio: audioDaCarta(supabase, r.idioma, r.correta, r.audio_path),
    });
  }
  const progresso: Record<string, ProgressoCarta> = {};
  for (const p of prog ?? []) {
    progresso[p.carta_id] = { nivel: p.nivel, acertos: p.acertos, erros: p.erros, proxima_em: p.proxima_em };
  }
  const listaDias = (dias ?? []).map((d) => d.dia as string);
  const hoje = hojeISO();

  return (
    <div>
      <CabecalhoPagina
        sobretitulo="Cartas"
        titulo="Frases e expressões por tema"
        descricao="Escolha um tema, vire as cartas e ouça a pronúncia. As que você erra voltam mais vezes até ficarem naturais."
      />
      <JogoCartas
        porIdioma={porIdioma}
        idiomaInicial={v.idioma}
        progresso={progresso}
        sequencia={sequenciaDeDias(listaDias, hoje)}
        jogouHoje={listaDias.includes(hoje)}
        previa={v.previa}
      />
    </div>
  );
}
