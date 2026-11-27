"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { responderCarta } from "@/app/(aluno)/aluno/cartas/actions";
import { CATEGORIAS, hojeISO, INTERVALOS, NIVEL_MAX, proximoNivel, somarDias, type Carta, type ProgressoCarta } from "@/lib/cartas";

type Idioma = "espanhol" | "ingles";
type Props = {
  porIdioma: Partial<Record<Idioma, Carta[]>>;
  idiomaInicial: Idioma;
  progresso: Record<string, ProgressoCarta>;
  sequencia: number;
  jogouHoje: boolean;
  previa: boolean;
};
type Modo = "tudo" | "expressao" | "erros";
type Resposta = { carta: Carta; acertou: boolean };

const GERAL = "Geral";
const RODADA = 15;
const ROTULO: Record<Idioma, string> = { espanhol: "Espanhol", ingles: "Inglês" };
const MODOS: { v: Modo; l: string }[] = [
  { v: "tudo", l: "Tudo" },
  { v: "expressao", l: "Frases e expressões" },
  { v: "erros", l: "Erros comuns" },
];

function embaralhar<T>(lista: T[]) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Primeiro as cartas na hora de rever (as mais difíceis antes), depois as novas;
// se não houver nenhuma, treino livre com cartas sorteadas.
function montarRodada(cartas: Carta[], prog: Record<string, ProgressoCarta>, hoje: string, limite: number) {
  const vencidas = cartas.filter((c) => prog[c.id] && prog[c.id].proxima_em <= hoje);
  const novas = cartas.filter((c) => !prog[c.id]);
  const prioridade = [...embaralhar(vencidas).sort((a, b) => prog[a.id].nivel - prog[b.id].nivel), ...embaralhar(novas)].slice(0, limite);
  if (prioridade.length) return { cartas: embaralhar(prioridade), livre: false };
  return { cartas: embaralhar(cartas).slice(0, limite), livre: true };
}

export default function JogoCartas({ porIdioma, idiomaInicial, progresso: progressoInicial, sequencia, jogouHoje, previa }: Props) {
  const hoje = hojeISO();
  const idiomas = (Object.keys(porIdioma) as Idioma[]).sort((a) => (a === "espanhol" ? -1 : 1));
  const [idioma, setIdioma] = useState<Idioma>(porIdioma[idiomaInicial] ? idiomaInicial : idiomas[0]);
  const [categoria, setCategoria] = useState(GERAL);
  const [modo, setModo] = useState<Modo>("tudo");
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [progresso, setProgresso] = useState(progressoInicial);
  const [tela, setTela] = useState<"escolha" | "jogo" | "fim">("escolha");
  const [fila, setFila] = useState<Carta[]>([]);
  const [total, setTotal] = useState(0);
  const [livre, setLivre] = useState(false);
  const [virada, setVirada] = useState(false);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [repetidas, setRepetidas] = useState<Set<string>>(new Set());
  const [tocando, setTocando] = useState<string | null>(null);
  const [jogou, setJogou] = useState(jogouHoje);
  const [, startTransition] = useTransition();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const todas = useMemo(() => porIdioma[idioma] ?? [], [porIdioma, idioma]);
  const doTema = useCallback((cat: string) => (cat === GERAL ? todas : todas.filter((c) => c.categoria === cat)), [todas]);
  const filtrar = useCallback(
    (lista: Carta[]) =>
      modo === "tudo" ? lista : modo === "expressao" ? lista.filter((c) => c.tipo === "expressao") : lista.filter((c) => c.tipo !== "expressao"),
    [modo],
  );
  const visiveis = useMemo(() => filtrar(doTema(categoria)), [filtrar, doTema, categoria]);
  const temas = CATEGORIAS.filter((c) => todas.some((x) => x.categoria === c.nome));
  const infoTema = CATEGORIAS.find((c) => c.nome === categoria);

  const stats = (lista: Carta[]) => ({
    total: lista.length,
    dominadas: lista.filter((c) => (progresso[c.id]?.nivel ?? 0) >= 3).length,
    paraHoje: lista.filter((c) => !progresso[c.id] || progresso[c.id].proxima_em <= hoje).length,
  });
  const st = stats(visiveis);
  const seq = jogou && !jogouHoje ? sequencia + 1 : sequencia;

  const ouvir = useCallback((c: Carta) => {
    if (!c.audio) return;
    audioRef.current?.pause();
    const a = new Audio(c.audio);
    audioRef.current = a;
    setTocando(c.id);
    a.onended = a.onerror = () => setTocando(null);
    a.play().catch(() => setTocando(null));
  }, []);

  function trocarIdioma(i: Idioma) {
    setIdioma(i);
    setSelecionadas(new Set());
  }
  function trocarTema(cat: string) {
    setCategoria(cat);
    setSelecionadas(new Set());
  }

  function comecar(lista?: Carta[]) {
    const base = lista ?? (selecionadas.size ? visiveis.filter((c) => selecionadas.has(c.id)) : visiveis);
    const r =
      lista || selecionadas.size
        ? { cartas: embaralhar(base), livre: false }
        : montarRodada(base, progresso, hoje, categoria === GERAL ? RODADA : 30);
    if (!r.cartas.length) return;
    setFila(r.cartas);
    setTotal(r.cartas.length);
    setLivre(r.livre);
    setRespostas([]);
    setRepetidas(new Set());
    setVirada(false);
    setTela("jogo");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const carta = fila[0];

  const virar = () => {
    if (!carta) return;
    if (!virada) setTimeout(() => ouvir(carta), 420);
    setVirada(!virada);
  };

  const responder = (acertou: boolean) => {
    if (!carta || !virada) return;
    audioRef.current?.pause();
    const primeira = !repetidas.has(carta.id);
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
    const resto = fila.slice(1);
    if (!acertou && primeira) {
      setRepetidas((s) => new Set(s).add(carta.id));
      setFila([...resto, carta]);
    } else {
      setFila(resto);
    }
    setVirada(false);
    if (resto.length === 0 && (acertou || !primeira)) setTela("fim");
  };

  // Teclado: espaço/enter vira; 1 = ainda não; 2 = acertei. As ações mais recentes ficam numa ref.
  const teclas = useRef({ virar, responder, virada });
  useEffect(() => {
    teclas.current = { virar, responder, virada };
  });
  useEffect(() => {
    if (tela !== "jogo") return;
    const tecla = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input, textarea, select")) return;
      const t = teclas.current;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        t.virar();
      } else if (t.virada && e.key === "1") t.responder(false);
      else if (t.virada && e.key === "2") t.responder(true);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [tela]);

  if (!idiomas.length || !Object.values(porIdioma).some((l) => l?.length)) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-6 text-[15px] text-[var(--text-secondary)]">
        As cartas estão sendo preparadas. Em breve elas aparecem aqui.
      </div>
    );
  }

  // ===== Escolha: temas, idioma, tipo e frases =====
  if (tela === "escolha") {
    const todasMarcadas = visiveis.length > 0 && visiveis.every((c) => selecionadas.has(c.id));
    return (
      <div className="flex flex-col gap-[18px]">
        {previa && (
          <p className="text-sm rounded-xl px-4 py-3 bg-[var(--info-bg)] text-[var(--info-text)]">
            Prévia: você está vendo as cartas como o aluno vê. As respostas não são salvas.
          </p>
        )}

        <div
          role="tablist"
          aria-label="Temas das cartas"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-1.5"
        >
          {[{ nome: GERAL, sub: "Um pouco de cada tema" }, ...temas].map((t) => {
            const on = t.nome === categoria;
            return (
              <button
                key={t.nome}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => trocarTema(t.nome)}
                className={`rounded-xl py-2.5 px-2 flex flex-col items-center text-center gap-0.5 transition-colors ${
                  on ? "bg-[var(--navy)] text-[var(--on-navy)]" : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
                }`}
              >
                <span className="text-[15px] font-semibold leading-tight">{t.nome}</span>
                <span className={`text-[11px] leading-tight ${on ? "text-[var(--gold-light)]" : ""}`}>{t.sub}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {idiomas.map((i) => {
            const on = i === idioma;
            return (
              <button
                key={i}
                type="button"
                onClick={() => trocarIdioma(i)}
                aria-pressed={on}
                className={`shrink-0 h-10 px-4 rounded-full text-sm font-medium border ${
                  on ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]" : "bg-[var(--surface)] border-[var(--border-strong)]"
                }`}
              >
                {ROTULO[i]}
              </button>
            );
          })}
          <span className="w-px h-6 bg-[var(--border-strong)] mx-1" aria-hidden="true" />
          {MODOS.map((m) => {
            const on = m.v === modo;
            return (
              <button
                key={m.v}
                type="button"
                onClick={() => {
                  setModo(m.v);
                  setSelecionadas(new Set());
                }}
                aria-pressed={on}
                className={`shrink-0 h-10 px-4 rounded-full text-sm font-medium border ${
                  on ? "bg-[var(--navy)] text-[var(--on-navy)] border-[var(--navy)]" : "bg-[var(--surface)] border-[var(--border-strong)]"
                }`}
              >
                {m.l}
              </button>
            );
          })}
        </div>

        <section className="carta-frente relative rounded-[26px] p-6 sm:p-8 overflow-hidden">
          <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold-light)]">
                {ROTULO[idioma]} · {MODOS.find((m) => m.v === modo)?.l}
              </p>
              <h2 className="font-serif text-[28px] sm:text-[32px] leading-[1.1] font-semibold text-white">{categoria}</h2>
              <p className="text-[15px] text-[#c9d2e3]">
                {categoria === GERAL ? "Rodada do dia com cartas de todos os temas. As que você erra voltam mais vezes." : infoTema?.descricao}
              </p>
            </div>
            <button
              type="button"
              disabled={!visiveis.length}
              onClick={() => comecar()}
              className="botao-ouro shrink-0 h-12 px-7 rounded-xl text-[15px] font-semibold disabled:opacity-50"
            >
              {selecionadas.size
                ? `Jogar ${selecionadas.size} ${selecionadas.size === 1 ? "selecionada" : "selecionadas"}`
                : categoria === GERAL
                  ? st.paraHoje
                    ? "Jogar a rodada do dia"
                    : "Treino livre"
                  : "Jogar este tema"}
            </button>
          </div>
          <dl className="relative mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/10 pt-5">
            {[
              { n: st.total, l: "cartas" },
              { n: st.dominadas, l: "dominadas" },
              { n: st.paraHoje, l: "para hoje" },
              { n: seq, l: seq === 1 ? "dia seguido" : "dias seguidos" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="sr-only">{s.l}</dt>
                <dd className="font-serif text-[26px] font-semibold text-white leading-none">{s.n}</dd>
                <p className="mt-1 text-xs text-[#aab6cc]">{s.l}</p>
              </div>
            ))}
          </dl>
        </section>

        {categoria !== GERAL && visiveis.length > 0 && (
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-4 sm:p-5 flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-serif text-[20px] font-semibold">As frases deste tema</h3>
              <button
                type="button"
                onClick={() => setSelecionadas(todasMarcadas ? new Set() : new Set(visiveis.map((c) => c.id)))}
                className="text-sm font-semibold text-[var(--gold-text)]"
              >
                {todasMarcadas ? "Limpar seleção" : "Selecionar todas"}
              </button>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] -mt-1">Marque as que você quer treinar agora, ou jogue o tema inteiro.</p>
            <ul className="flex flex-col divide-y divide-[var(--border)]">
              {visiveis.map((c) => {
                const marcada = selecionadas.has(c.id);
                const nivel = progresso[c.id]?.nivel ?? 0;
                return (
                  <li key={c.id} className="py-3 flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={marcada}
                      onChange={() =>
                        setSelecionadas((s) => {
                          const n = new Set(s);
                          if (n.has(c.id)) n.delete(c.id);
                          else n.add(c.id);
                          return n;
                        })
                      }
                      aria-label={`Selecionar: ${c.correta}`}
                      className="mt-1.5 w-[18px] h-[18px] accent-[var(--navy)]"
                    />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p
                        className={`text-[13px] text-[var(--text-faint)] ${c.tipo === "erro" ? "line-through decoration-[var(--danger-text)]/60" : ""}`}
                      >
                        {c.incorreta}
                      </p>
                      <p className="text-[15px] font-semibold">{c.correta}</p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <Selo tipo={c.tipo} />
                        <Nivel n={nivel} />
                      </div>
                    </div>
                    {c.audio && (
                      <button
                        type="button"
                        onClick={() => ouvir(c)}
                        aria-label={`Ouvir: ${c.correta}`}
                        className={`shrink-0 w-10 h-10 rounded-full border flex items-center justify-center ${
                          tocando === c.id ? "border-[var(--gold)] text-[var(--gold-text)]" : "border-[var(--border-strong)] text-[var(--gold-text)]"
                        }`}
                      >
                        <IconeSom />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
        {!visiveis.length && <p className="text-sm text-[var(--text-secondary)]">Ainda não há cartas desse tipo neste tema.</p>}
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
          <p className="relative text-xs font-semibold uppercase tracking-[0.14em] text-[var(--gold-light)]">
            {categoria} · {ROTULO[idioma]}
          </p>
          <p className="relative mt-3 font-serif text-[56px] leading-none font-semibold text-white">{pct}%</p>
          <p className="relative mt-3 text-[15px] text-[#c9d2e3]">
            {acertos} de {respostas.length} de primeira.{" "}
            {pct >= 80
              ? "Muito bem!"
              : pct >= 50
                ? "Bom caminho. As que você errou voltam logo."
                : "Normal no começo: as cartas difíceis vão voltar até ficarem naturais."}
          </p>
          <div className="relative mt-6 flex flex-wrap justify-center gap-3">
            {erradas.length > 0 && (
              <button
                type="button"
                onClick={() => comecar(erradas.map((r) => r.carta))}
                className="botao-ouro h-11 px-6 rounded-xl text-sm font-semibold"
              >
                Treinar as {erradas.length} que errei
              </button>
            )}
            <button
              type="button"
              onClick={() => setTela("escolha")}
              className="h-11 px-6 rounded-xl text-sm font-semibold border border-white/25 text-white hover:bg-white/10"
            >
              Voltar aos temas
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
                    <p className={`text-sm text-[var(--text-faint)] ${c.tipo === "erro" ? "carta-errada" : ""}`}>{c.incorreta}</p>
                    <p className="text-[15px] font-semibold">{c.correta}</p>
                  </div>
                  {c.audio && (
                    <button
                      type="button"
                      onClick={() => ouvir(c)}
                      aria-label={`Ouvir: ${c.correta}`}
                      className="shrink-0 w-10 h-10 rounded-full border border-[var(--border-strong)] flex items-center justify-center text-[var(--gold-text)]"
                    >
                      <IconeSom />
                    </button>
                  )}
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
  const frente =
    carta?.tipo === "expressao"
      ? { selo: "Como se diz?", topo: "Em português:", pergunta: `Como você diria em ${idioma === "ingles" ? "inglês" : "espanhol"}?` }
      : carta?.tipo === "natural"
        ? { selo: "Não está errado, mas…", topo: "Muita gente fala assim:", pergunta: "Como soaria mais natural?" }
        : { selo: "Erro comum", topo: "Muita gente fala assim:", pergunta: "Como seria o certo?" };
  const versoRotulo = carta?.tipo === "expressao" ? "Assim se diz" : carta?.tipo === "natural" ? "Mais natural" : "Forma correta";
  return (
    <div className="flex flex-col gap-5 max-w-xl mx-auto w-full">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => setTela(respostas.length ? "fim" : "escolha")} className="text-sm font-semibold text-[var(--gold-text)]">
          ← {respostas.length ? "Encerrar" : "Temas"}
        </button>
        <span className="text-sm text-[var(--text-secondary)]">
          {categoria}
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
            aria-label={virada ? "Carta virada" : "Toque para virar a carta"}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("[data-ouvir]")) return;
              virar();
            }}
          >
            <div className="carta-face carta-frente p-7 sm:p-9 flex flex-col cursor-pointer">
              <div className="relative flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-[0.14em] text-[var(--gold-light)]">{carta.categoria}</span>
                <Nivel n={nivel} claro />
              </div>
              <div className="relative flex-1 flex flex-col justify-center gap-4 text-center">
                <span
                  className={`mx-auto text-[11px] font-semibold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full ${
                    carta.tipo === "erro"
                      ? "bg-[#e87868]/15 text-[#f1a597]"
                      : carta.tipo === "expressao"
                        ? "bg-[#d9b866]/15 text-[#e9cf8a]"
                        : "bg-white/10 text-[#c9d2e3]"
                  }`}
                >
                  {frente.selo}
                </span>
                <p className="text-sm text-[#aab6cc]">{repetidas.has(carta.id) ? "Mais uma vez:" : frente.topo}</p>
                <p className="font-serif text-[27px] sm:text-[31px] leading-[1.2] font-semibold text-white">“{carta.incorreta}”</p>
                <p className="text-sm text-[#aab6cc]">{frente.pergunta}</p>
              </div>
              <p className="relative text-center text-xs text-[#8f9cb5]">Pense na resposta e toque para virar</p>
            </div>

            <div className="carta-face carta-verso p-7 sm:p-9 flex flex-col cursor-pointer">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-[0.14em] text-[var(--gold-text)]">{versoRotulo}</span>
                <Nivel n={nivel} />
              </div>
              <div className="flex-1 flex flex-col justify-center items-center gap-4 text-center">
                <p className={`text-sm opacity-60 ${carta.tipo === "erro" ? "carta-errada" : ""}`}>{carta.incorreta}</p>
                <p className="font-serif text-[28px] sm:text-[32px] leading-[1.2] font-semibold">{carta.correta}</p>
                {carta.audio && (
                  <button
                    type="button"
                    data-ouvir
                    onClick={() => ouvir(carta)}
                    className={`inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-semibold border transition-colors ${
                      tocando === carta.id ? "border-[var(--gold)] text-[var(--gold-text)]" : "border-current/20 hover:border-[var(--gold)]"
                    }`}
                  >
                    <IconeSom /> {tocando === carta.id ? "Ouvindo…" : "Ouvir de novo"}
                  </button>
                )}
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
              {carta?.tipo === "erro" ? "Ainda erro" : "Ainda não"}
            </button>
            <button type="button" onClick={() => responder(true)} className="botao-ouro h-[52px] rounded-xl text-[15px] font-semibold">
              {carta?.tipo === "erro" ? "Eu teria acertado" : "Eu diria assim"}
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

function Selo({ tipo }: { tipo: Carta["tipo"] }) {
  const conf =
    tipo === "expressao"
      ? { l: "expressão", c: "bg-[var(--surface-2)] text-[var(--gold-text)]" }
      : tipo === "natural"
        ? { l: "mais natural", c: "bg-[var(--info-bg)] text-[var(--info-text)]" }
        : { l: "erro comum", c: "bg-[var(--danger-bg)] text-[var(--danger-text)]" };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${conf.c}`}>{conf.l}</span>;
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
