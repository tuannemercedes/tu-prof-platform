// Jogo de Cartas: frente = como o brasileiro costuma falar, verso = forma correta.
// Repetição espaçada simples por níveis (estilo caixa de Leitner).

export type Carta = {
  id: string;
  categoria: string;
  incorreta: string;
  correta: string;
  explicacao: string | null;
  audio: string | null; // endereço público do áudio gravado (se houver)
};

export type ProgressoCarta = { nivel: number; acertos: number; erros: number; proxima_em: string };

// Dias até rever a carta, conforme o nível (0 = rever hoje).
export const INTERVALOS = [0, 1, 3, 7, 14, 30];
export const NIVEL_MAX = INTERVALOS.length - 1;

export const ORDEM_CATEGORIAS = [
  "Cotidiano",
  "Trabalho e negócios",
  "Reuniões",
  "Negociação",
  "Tecnologia",
  "Marketing",
  "RH",
  "Turismo",
  "Finanças e contabilidade",
];

export function ordenarCategorias(cats: string[]) {
  const pos = (c: string) => {
    const i = ORDEM_CATEGORIAS.indexOf(c);
    return i === -1 ? 999 : i;
  };
  return [...cats].sort((a, b) => pos(a) - pos(b) || a.localeCompare(b));
}

export function hojeISO(d = new Date()) {
  // Data no fuso de São Paulo, para o "hoje" bater com o dia da aluna.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(d);
}

export function somarDias(iso: string, dias: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function proximoNivel(nivel: number, acertou: boolean) {
  return acertou ? Math.min(nivel + 1, NIVEL_MAX) : 0;
}

// Sequência de dias seguidos jogando (conta hoje ou, se ainda não jogou hoje, até ontem).
export function sequenciaDeDias(dias: string[], hoje = hojeISO()) {
  const set = new Set(dias);
  let d = set.has(hoje) ? hoje : somarDias(hoje, -1);
  let n = 0;
  while (set.has(d)) {
    n++;
    d = somarDias(d, -1);
  }
  return n;
}
