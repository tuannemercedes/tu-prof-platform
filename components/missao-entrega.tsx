"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { enviarMissao } from "@/app/(aluno)/aluno/missoes/actions";
import { dataHora } from "@/lib/data-hora";

export type EntregaMissao = {
  id: string;
  created_at: string;
  texto: string | null;
  audioUrl: string | null;
  comentario: string | null;
  comentario_em: string | null;
  comentario_nome: string | null;
};

const LIMITE_SEG = 180;

function mm(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Enunciado em texto simples: parágrafos separados por linha em branco;
// "Versão profissional:" no começo de um parágrafo vira destaque.
function Enunciado({ texto }: { texto: string }) {
  return (
    <div className="flex flex-col gap-3 text-[15.5px] leading-relaxed">
      {texto
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((par, i) => {
          const m = par.match(/^(Versão profissional:)\s*([\s\S]*)$/);
          return m ? (
            <div key={i} className="rounded-xl bg-[linear-gradient(155deg,#1d3766,#0e1b33)] text-[#eef2f8] px-4 py-3">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e9cf8a] mb-1">Versão profissional</span>
              {m[2]}
            </div>
          ) : (
            <p key={i} className="m-0">
              {par}
            </p>
          );
        })}
    </div>
  );
}

export default function MissaoEntrega({
  materialId,
  enunciado,
  entrega,
  entregas,
  alunoId,
  readOnly,
  onEnviada,
}: {
  materialId: string;
  enunciado: string;
  entrega: string | null;
  entregas: EntregaMissao[];
  alunoId: string;
  readOnly: boolean;
  onEnviada: () => void;
}) {
  const soMarcar = entrega === "feito";
  const pedeAudio = entrega !== "texto" && !soMarcar;
  const pedeTexto = entrega === "texto" || entrega === "audio_texto" || soMarcar;
  const router = useRouter();
  const [estado, setEstado] = useState<"parado" | "gravando" | "gravado">("parado");
  const [segundos, setSegundos] = useState(0);
  const [audio, setAudio] = useState<{ blob: Blob; url: string; ext: string } | null>(null);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aberto, setAberto] = useState(entregas.length === 0);
  const [enviando, startEnvio] = useTransition();
  const rec = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const contagem = useRef(0);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
      rec.current?.stream.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  async function gravar() {
    setErro(null);
    if (readOnly) {
      setErro("Na prévia não dá para gravar. O aluno vê exatamente este gravador.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const tipo = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
      const r = new MediaRecorder(stream, tipo ? { mimeType: tipo } : undefined);
      const partes: Blob[] = [];
      r.ondataavailable = (e) => e.data.size && partes.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const mime = r.mimeType || tipo || "audio/webm";
        const blob = new Blob(partes, { type: mime });
        setAudio({ blob, url: URL.createObjectURL(blob), ext: mime.includes("mp4") ? "m4a" : "webm" });
        setEstado("gravado");
      };
      rec.current = r;
      r.start();
      contagem.current = 0;
      setSegundos(0);
      setEstado("gravando");
      timer.current = setInterval(() => {
        contagem.current += 1;
        setSegundos(contagem.current);
        if (contagem.current >= LIMITE_SEG) parar();
      }, 1000);
    } catch {
      setErro("Não conseguimos acessar o microfone. Libere o microfone para este site no navegador ou envie um arquivo de áudio.");
    }
  }

  function parar() {
    if (timer.current) clearInterval(timer.current);
    if (rec.current?.state === "recording") rec.current.stop();
  }

  function descartar() {
    if (audio) URL.revokeObjectURL(audio.url);
    setAudio(null);
    setEstado("parado");
  }

  function escolherArquivo(f: File | undefined) {
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) {
      setErro("O arquivo passa de 20 MB. Grave aqui mesmo ou envie um áudio mais curto.");
      return;
    }
    descartar();
    setAudio({ blob: f, url: URL.createObjectURL(f), ext: (f.name.split(".").pop() || "m4a").toLowerCase().slice(0, 5) });
    setEstado("gravado");
  }

  function enviar() {
    setErro(null);
    if (readOnly) {
      setErro("Na prévia nada é enviado.");
      return;
    }
    if (!soMarcar && !audio && !texto.trim()) {
      setErro(pedeAudio ? "Grave o áudio antes de enviar." : "Escreva a sua resposta antes de enviar.");
      return;
    }
    startEnvio(async () => {
      let audioPath: string | null = null;
      if (audio) {
        audioPath = `${alunoId}/missoes/${materialId}/${Date.now()}.${audio.ext}`;
        const { error } = await createClient().storage.from("entregas").upload(audioPath, audio.blob, { contentType: audio.blob.type || undefined });
        if (error) {
          setErro("Não foi possível enviar o áudio. Tente de novo.");
          return;
        }
      }
      const r = await enviarMissao(materialId, audioPath, texto.trim() || null);
      if (r?.error) {
        setErro(r.error);
        return;
      }
      descartar();
      setTexto("");
      setAberto(false);
      onEnviada();
      router.refresh();
    });
  }

  const botao = "inline-flex items-center gap-2 h-11 px-4 rounded-xl text-sm font-semibold";

  return (
    <div className="p-5 sm:p-7 flex flex-col gap-6 bg-[var(--surface)]">
      <div className="rounded-2xl border border-dashed border-[var(--gold)] bg-[#fffdf7] dark:bg-transparent p-5">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold-text)] mb-2">Missão Chave · 24 horas</span>
        <Enunciado texto={enunciado} />
      </div>

      {entregas.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold">{soMarcar ? "Feita" : entregas.length === 1 ? "A sua entrega" : "As suas entregas"}</span>
          {entregas.map((e) => (
            <div key={e.id} className="rounded-2xl border border-[var(--border)] p-4 flex flex-col gap-3">
              <span className="text-xs text-[var(--text-secondary)]">
                {soMarcar ? "Você marcou como feita em" : "Enviada em"} {dataHora(e.created_at)}
              </span>
              {e.audioUrl && <audio src={e.audioUrl} controls preload="none" className="w-full" />}
              {e.texto && <p className="m-0 text-[15px] whitespace-pre-wrap">{e.texto}</p>}
              {e.comentario ? (
                <div className="rounded-xl bg-[var(--success-bg)] px-4 py-3">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--success-text)] mb-1">
                    Comentário {e.comentario_nome ? `de ${e.comentario_nome}` : "da equipe"}
                    {e.comentario_em ? ` · ${dataHora(e.comentario_em)}` : ""}
                  </span>
                  <p className="m-0 text-[15px] whitespace-pre-wrap">{e.comentario}</p>
                </div>
              ) : soMarcar ? null : (
                <span className="text-[13px] text-[var(--text-secondary)]">Aguardando o comentário da equipe (até 2 dias úteis).</span>
              )}
            </div>
          ))}
          {!aberto && !soMarcar && (
            <button type="button" onClick={() => setAberto(true)} className="self-start text-sm font-semibold text-[var(--gold-text)]">
              Enviar uma nova versão
            </button>
          )}
        </div>
      )}

      {aberto && (
        <div className="flex flex-col gap-4">
          {pedeAudio && (
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold">Grave a sua resposta</span>
              {estado === "parado" && (
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={gravar} className={`${botao} botao-ouro`}>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#b3261e]" aria-hidden="true" /> Gravar áudio
                  </button>
                  <label className="text-sm text-[var(--text-secondary)] cursor-pointer hover:underline">
                    ou envie um arquivo de áudio
                    <input type="file" accept="audio/*" className="sr-only" onChange={(e) => escolherArquivo(e.target.files?.[0])} />
                  </label>
                </div>
              )}
              {estado === "gravando" && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#b3261e]" aria-live="polite">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#b3261e] animate-pulse" aria-hidden="true" /> Gravando {mm(segundos)}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">até {mm(LIMITE_SEG)}</span>
                  <button type="button" onClick={parar} className={`${botao} bg-[var(--accent)] text-[var(--accent-contrast)]`}>
                    Parar
                  </button>
                </div>
              )}
              {estado === "gravado" && audio && (
                <div className="flex flex-col gap-2">
                  <audio src={audio.url} controls className="w-full" />
                  <button type="button" onClick={descartar} className="self-start text-sm text-[var(--text-secondary)] hover:underline">
                    Apagar e gravar de novo
                  </button>
                </div>
              )}
            </div>
          )}
          {pedeTexto && (
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold">
                {soMarcar ? "Quer contar como foi? (opcional)" : pedeAudio ? "Quer escrever também? (opcional)" : "Escreva a sua resposta"}
              </span>
              {soMarcar && (
                <span className="text-[13px] text-[var(--text-secondary)]">Esta missão não precisa de correção: é só marcar quando fizer.</span>
              )}
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={soMarcar ? 3 : 5}
                className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-[15px]"
              />
            </label>
          )}
          {erro && <p className="m-0 text-sm text-[var(--danger-text)]">{erro}</p>}
          <button
            type="button"
            onClick={enviar}
            disabled={enviando || estado === "gravando"}
            className={`${botao} self-start bg-[var(--accent)] text-[var(--accent-contrast)] disabled:opacity-50`}
          >
            {enviando ? "Enviando…" : soMarcar ? "Fiz a missão" : "Enviar missão"}
          </button>
        </div>
      )}
    </div>
  );
}
