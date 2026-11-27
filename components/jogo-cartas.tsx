"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { responderCarta } from "@/app/(aluno)/aluno/cartas/actions";
import { hojeISO, INTERVALOS, NIVEL_MAX, ordenarCategorias, proximoNivel, somarDias, type Carta, type ProgressoCarta } from "@/lib/cartas";

type Props = {
  cartas: Carta[];
  progresso: Record<string, ProgressoCarta>;
  sequencia: number;
  jogouHoje: boolean;
  idioma: "espanhol" | "ingles";
  previa: boolean;
};

type Resposta = { carta: Carta; acertou: boolean };

const RODADA = 15;
const MISTURADO = "__todas__";

function embaralhar<T>(lista: T[]) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Escolhe as cartas da rodada: primeiro as que estão na hora de rever (as mais difíceis antes),
// depois as novas; se não houver nenhuma, treino livre com cartas sorteadas.
function montarRodada(cartas: Carta[], prog: Record<string, ProgressoCarta>, hoje: string, limite: number) {
  const vencidas = cartas.filter((c) => prog[c.id] && prog[c.id].proxima_em <= hoje);
  const novas = cartas.filter((c) => !prog[c.id]);
  const prioridade = [...embaralhar(vencidas).sort((a, b) => prog[a.id].nivel - prog[b.id].nivel), ...embaralhar(novas)].slice(0, limite);
  if (prioridade.length) return { cartas: embaralhar(prioridade), livre: false };
  return { cartas: embaralhar(cartas).slice(0, limite), livre: true };
}

// Voz do aparelho para o áudio quando não há gravação.
function escolherVoz(lang: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const vozes = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2)));
  if (!vozes.length) return null;
  const exata = vozes.filter((v) => v.lang.replace("_", "-").toLowerCase() === lang.toLowerCase());
  const base = exata.length ? exata : vozes;
  return base.find((v) => /natural|premium|enhanced|google|neural/i.test(v.name)) ?? base[0];
}

export default function JogoCartas({ cartas, progresso: progressoInicial, sequencia, jogouHoje, idioma, previa }: Props) {
  const hoje = hojeISO();
  const lang = idioma === "ingles" ? "en-US" : "es-ES";
  const [progresso, setProgresso] = useState(progressoInicial);
  const [tela, setTela] = useState<"baralhos" | "jogo" | "fim">("baralhos");
  const [baralho, setBaralho] = useState<string>(MISTURADO);
  const [fila, setFila] = useState<Carta[]>([]);
  const [total, setTotal] = useState(0);
  const [livre, setLivre] = useState(false);
  const [virada, setVirada] = useState(false);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [repetidas, setRepetidas] = useState<Set<string>>(new Set());
  const [falando, setFalando] = useState(false);
  const [semVoz, setSemVoz] = useState(false);
  const [jogou, setJogou] = useState(jogouHoje);
  const [, startTransition] = useTransition();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const categorias = useMemo(() => ordenarCategorias([...new Set(cartas.map((c) => c.categoria))]), [cartas]);
  const doBaralho = useCallback((b: string) => (b === MISTURADO ? cartas : cartas.filter((c) => c.categoria === b)), [cartas]);

  const stats = (lista: Carta[]) => {
    const dominadas = lista.filter((c) => (progresso[c.id]?.nivel ?? 0) >= 3).length;
    const paraHoje = lista.filter((c) => !progresso[c.id] || progresso[c.id].proxima_em <= hoje).length;
    return { dominadas, paraHoje, total: lista.length };
  };
  const geral = stats(cartas);

  // Carrega a lista de vozes (alguns navegadores só entregam depois de um evento).
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const ver = () => setSemVoz(!escolherVoz(lang));
    ver();
    window.speechSynthesis.addEventListener("voiceschanged", ver);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", ver);
  }, [lang]);

  const carta = fila[0];

  const ouvir = useCallback(
    (c: Carta) => {
      if (c.audio) {
        audioRef.current?.pause();
        const a = new Audio(c.audio);
        audioRef.current = a;
        setFalando(true);
        a.onended = a.onerror = () => setFalando(false);
        a.play().catch(() => setFalando(false));
        return;
      }
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(c.correta);
      u.lang = lang;
      const voz = escolherVoz(lang);
      if (voz) u.voice = voz;
      u.rate = 0.92;
      u.onend = u.onerror = () => setFalando(false);
      setFalando(true);
      window.speechSynthesis.speak(u);
    },
    [lang],
  );

  function comecar(b: string) {
    const r = montarRodada(doBaralho(b), progresso, hoje, b === MISTURADO ? RODADA : 30);
    setBaralho(b);
    setFila(r.cartas);
    setTotal(r.cartas.length);
    setLivre(r.livre);
    setRespostas([]);
    setRepetidas(new Set());
    setVirada(false);
    setTela("jogo");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const virar = useCallback(() => {
    if (!carta) return;
    if (!virada) setTimeout(() => ouvir(carta), 380);
    setVirada(!virada);
  }, [carta, ouvir, virada]);

  const responder = useCallback(
    (acertou: boolean) => {
      if (!carta || !virada) return;
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
      const primeira = !repetidas.has(carta.id);
      // Só a primeira resposta da rodada conta para o progresso.
      if (primeira) {
        setRespostas((r) => [...r, { carta, acertou }]);
        const atual = progresso[carta.id];
        const nivel = proximoNivel(atual?.nivel ?? 0, acertou);
        setProgresso((p) => ({
          ...p,
          [carta.id]: {
            nivel,
            acertos: (atual?.acertos ?? 0) + (acertou ? 1 : 0),
            erros: (atual?.erros ?? 0) + (acertou ? 0 : 1),
            proxima_em: somarDias(hoje, INTERVALOS[nivel]),
          },
        }));
        if (!previa) {
          setJogou(true);
          startTransition(() => {
            void responderCarta(carta.id, acertou);
          });
        }
      }
      // Errou: a carta volta no fim da rodada para mais uma tentativa.
      const resto = fila.slice(1);
      if (!acertou && primeira) {
        setRepetidas((s) => new Set(s).add(carta.id));
        setFila([...resto, carta]);
      } else {
        setFila(resto);
      }
      setVirada(false);
      if (resto.length === 0 && (acertou || !primeira)) setTela("fim");
    },
    [carta, virada, repetidas, progresso, hoje, previa, fila],
  );

  // Teclado: espaço/enter vira; 1 = ainda erro; 2 = acertei.
  useEffect(() => {
    if (tela !== "jogo") return;
    const tecla = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea, select")) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        virar();
      } else if (virada && e.key === "1") responder(false);
      else if (virada && e.key === "2") responder(true);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [tela, virar, responder, virada]);

  const nomeBaralho = baralho === MISTURADO ? "Rodada do dia" : baralho;
  const rotulo = idioma === "ingles" ? "Inglês" : "Espanhol";

  if (!cartas.length) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-6 text-[15px] text-[var(--text-secondary)]">
        As cartas de {rotulo.toLowerCase()} estão sendo preparadas. Em breve elas aparecem aqui.
      </div>
    );
  }

  // ===== Escolha do baralho =====
  if (tela === "baralhos") {
    const seq = jogou && !jogouHoje ? sequencia + 1 : sequencia;
    return (
      <div className="flex flex-col gap-8">
        {previa && (
          <p className="text-sm rounded-xl px-4 py-3 bg-[var(--info-bg)] text-[var(--info-text)]">
            Prévia: você está vendo as cartas como o aluno vê. As respostas não são salvas.
          </p>
        )}

        <section className="carta-frente relative rounded-[26px] p-6 sm:p-8 overflow-hidden">
          <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2 max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold-light)]">Rodada do dia</p>
              <h2 className="font-serif text-[28px] sm:text-[32px] leading-[1.1] font-semibold text-white">
                {geral.paraHoje ? `${Math.min(geral.paraHoje, RODADA)} cartas esperando por você` : "Tudo em dia por hoje"}
              </h2>
              <p className="text-[15px] text-[#c9d2e3]">
                {geral.paraHoje
                  ? "Cartas de todos os temas, embaralhadas. As que você erra voltam mais vezes."
                  : "Você revisou tudo o que estava na hora. Se quiser, jogue um treino livre."}
              </p>
            </div>
            <button type="button" onClick={() => comecar(MISTURADO)} className="botao-ouro shrink-0 h-12 px-7 rounded-xl text-[15px] font-semibold">
              {geral.paraHoje ? "Jogar agora" : "Treino livre"}
            </button>
          </div>
          <dl className="relative mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
            {[
              { n: seq, l: seq === 1 ? "dia seguido" : "dias seguidos" },
              { n: geral.dominadas, l: "cartas dominadas" },
              { n: geral.total, l: "cartas no total" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="sr-only">{s.l}</dt>
                <dd className="font-serif text-[26px] font-semibold text-white leading-none">{s.n}</dd>
                <p className="mt-1 text-xs text-[#aab6cc]">{s.l}</p>
              </div>
            ))}
          </dl>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-[22px] font-semibold">Baralhos por tema</h2>
          <div className="grid gap-x-7 gap-y-8 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))] pr-3">
            {categorias.map((cat) => {
              const s = stats(doBaralho(cat));
              const pct = s.total ? Math.round((s.dominadas / s.total) * 100) : 0;
              return (
                <button key={cat} type="button" onClick={() => comecar(cat)} className="baralho text-left">
                  <div className="baralho-face p-5 min-h-[150px] flex flex-col justify-between gap-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-serif text-[19px] font-semibold leading-tight text-white">{cat}</span>
                      <span className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-white/10 text-[var(--gold-light)] whitespace-nowrap">
                        {s.total} {s.total === 1 ? "carta" : "cartas"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-[var(--gold)]" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-[#aab6cc]">
                        {s.dominadas} dominadas{s.paraHoje ? ` · ${s.paraHoje} para hoje` : ""}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // ===== Fim da rodada =====
  if (tela === "fim") {
    const acertos = respostas.filter((r) => r.acertou).length;
    const erradas = respostas.filter((r) => !r.acertou);
    const pct = respostas.length ? Math.round((acertos / respostas.length) * 100) : 0;
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full carta-entra">
        <section className="carta-frente relative rounded-[26px] p-7 sm:p-9 text-center">
          <p className="relative text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold-light)]">{nomeBaralho}</p>
          <p className="relative mt-3 font-serif text-[56px] leading-none font-semibold text-white">{pct}%</p>
          <p className="relative mt-3 text-[15px] text-[#c9d2e3]">
            {acertos} de {respostas.length} de primeira.{" "}
            {pct >= 80
              ? "Muito bem!"
              : pct >= 50
                ? "Bom caminho. As que você errou voltam logo."
                : "Normal no começo: as cartas difíceis vão voltar até virarem naturais."}
          </p>
          <div className="relative mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => comecar(baralho)} className="botao-ouro h-11 px-6 rounded-xl text-sm font-semibold">
              Jogar de novo
            </button>
            <button
              type="button"
              onClick={() => setTela("baralhos")}
              className="h-11 px-6 rounded-xl text-sm font-semibold border border-white/25 text-white hover:bg-white/10"
            >
              Outros baralhos
            </button>
          </div>
        </section>

        {erradas.length > 0 && (
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-5 sm:p-6 flex flex-col gap-4">
            <h2 className="font-serif text-[20px] font-semibold">Para treinar</h2>
            <ul className="flex flex-col divide-y divide-[var(--border)]">
              {erradas.map(({ carta: c }) => (
                <li key={c.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className={`text-sm text-[var(--text-faint)] ${c.tipo === "natural" ? "" : "carta-errada"}`}>{c.incorreta}</p>
                    <p className="text-[15px] font-semibold">{c.correta}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => ouvir(c)}
                    aria-label={`Ouvir: ${c.correta}`}
                    className="shrink-0 w-10 h-10 rounded-full border border-[var(--border-strong)] flex items-center justify-center text-[var(--gold-text)]"
                  >
                    <IconeSom />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  // ===== Jogo =====
  const feitas = total - fila.filter((c) => !repetidas.has(c.id)).length;
  const nivel = carta ? (progresso[carta.id]?.nivel ?? 0) : 0;
  return (
    <div className="flex flex-col gap-5 max-w-xl mx-auto w-full">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setTela(respostas.length ? "fim" : "baralhos")}
          className="text-sm font-semibold text-[var(--gold-text)]"
        >
          ← {respostas.length ? "Encerrar" : "Baralhos"}
        </button>
        <span className="text-sm text-[var(--text-secondary)]">
          {nomeBaralho}
          {livre ? " · treino livre" : ""} · {Math.min(feitas + 1, total)} de {total}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--surface-3)] overflow-hidden" aria-hidden="true">
        <div className="h-full rounded-full bg-[var(--gold)] transition-all duration-500" style={{ width: `${(feitas / total) * 100}%` }} />
      </div>

      {carta && (
        <div key={carta.id + (repetidas.has(carta.id) ? "-b" : "")} className="carta-cena carta-entra h-[400px] sm:h-[430px]">
          <div
            className={`carta-giro ${virada ? "virada" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={virada ? "Carta virada: forma correta" : "Toque para ver a forma correta"}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("[data-ouvir]")) return;
              virar();
            }}
          >
            {/* Frente */}
            <div className="carta-face carta-frente p-7 sm:p-9 flex flex-col cursor-pointer">
              <div className="relative flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-[0.14em] text-[var(--gold-light)]">{carta.categoria}</span>
                <Nivel n={nivel} claro />
              </div>
              <div className="relative flex-1 flex flex-col justify-center gap-4 text-center">
                <span
                  className={`mx-auto text-[11px] font-semibold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full ${
                    carta.tipo === "natural" ? "bg-white/10 text-[#c9d2e3]" : "bg-[#e87868]/15 text-[#f1a597]"
                  }`}
                >
                  {carta.tipo === "natural" ? "Não está errado, mas…" : "Erro comum"}
                </span>
                <p className="text-sm text-[#aab6cc]">{repetidas.has(carta.id) ? "Mais uma vez:" : "Muita gente fala assim:"}</p>
                <p className="font-serif text-[27px] sm:text-[31px] leading-[1.2] font-semibold text-white">“{carta.incorreta}”</p>
                <p className="text-sm text-[#aab6cc]">{carta.tipo === "natural" ? "Como soaria mais natural?" : "Como seria o certo?"}</p>
              </div>
              <p className="relative text-center text-xs text-[#8f9cb5]">Pense na resposta e toque para virar</p>
            </div>

            {/* Verso */}
            <div className="carta-face carta-verso p-7 sm:p-9 flex flex-col cursor-pointer">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-[0.14em] text-[var(--gold-text)]">
                  {carta.tipo === "natural" ? "Mais natural" : "Forma correta"}
                </span>
                <Nivel n={nivel} />
              </div>
              <div className="flex-1 flex flex-col justify-center items-center gap-4 text-center">
                <p className={`text-sm opacity-60 ${carta.tipo === "natural" ? "" : "carta-errada"}`}>{carta.incorreta}</p>
                <p className="font-serif text-[28px] sm:text-[32px] leading-[1.2] font-semibold">{carta.correta}</p>
                <button
                  type="button"
                  data-ouvir
                  onClick={() => ouvir(carta)}
                  className={`inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold border transition-colors ${
                    falando ? "border-[var(--gold)] text-[var(--gold-text)] bg-[var(--gold)]/10" : "border-current/20 hover:border-[var(--gold)]"
                  }`}
                >
                  <IconeSom /> {falando ? "Ouvindo…" : "Ouvir"}
                </button>
                {semVoz && !carta.audio && <p className="text-xs opacity-60">Seu aparelho não tem voz em {rotulo.toLowerCase()} instalada.</p>}
                {carta.explicacao && <p className="text-[15px] leading-relaxed opacity-80 max-w-sm">{carta.explicacao}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 min-h-[52px]">
        {virada ? (
          <>
            <button
              type="button"
              onClick={() => responder(false)}
              className="h-[52px] rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] text-[15px] font-semibold hover:border-[var(--danger-text)]"
            >
              {carta?.tipo === "natural" ? "Ainda não" : "Ainda erro"}
            </button>
            <button type="button" onClick={() => responder(true)} className="botao-ouro h-[52px] rounded-xl text-[15px] font-semibold">
              {carta?.tipo === "natural" ? "Eu diria assim" : "Eu teria acertado"}
            </button>
          </>
        ) : (
          <button type="button" onClick={virar} className="col-span-2 h-[52px] rounded-xl botao-metal text-white text-[15px] font-semibold">
            Virar carta
          </button>
        )}
      </div>
      <p className="hidden sm:block text-center text-xs text-[var(--text-faint)]">Atalhos: espaço vira · 1 ainda não · 2 acertei</p>
    </div>
  );
}

function Nivel({ n, claro = false }: { n: number; claro?: boolean }) {
  return (
    <span className="flex items-center gap-1" title={`Domínio: ${n} de ${NIVEL_MAX}`} aria-label={`Domínio ${n} de ${NIVEL_MAX}`}>
      {Array.from({ length: NIVEL_MAX }, (_, i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < n ? "bg-[var(--gold)]" : claro ? "bg-white/20" : "bg-current opacity-20"}`} />
      ))}
    </span>
  );
}

function IconeSom() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 5L6 9H3v6h3l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}
