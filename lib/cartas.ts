// Jogo de Cartas: frente = como o brasileiro costuma falar, verso = forma correta.
// Repetição espaçada simples por níveis (estilo caixa de Leitner).

export type Carta = {
  id: string;
  categoria: string;
  incorreta: string;
  correta: string;
  explicacao: string | null;
  tipo: "erro" | "natural" | "expressao"; // erro de fato, correto mas pouco natural, ou frase/expressão útil
  audio: string | null; // endereço público do áudio gravado (se houver)
};

export type ProgressoCarta = { nivel: number; acertos: number; erros: number; proxima_em: string };

// Dias até rever a carta, conforme o nível (0 = rever hoje).
export const INTERVALOS = [0, 1, 3, 7, 14, 30];
export const NIVEL_MAX = INTERVALOS.length - 1;

// Temas das Cartas: situações do dia a dia e profissões.
export const CATEGORIAS: { nome: string; sub: string; descricao: string }[] = [
  { nome: "Cotidiano", sub: "Vida adulta", descricao: "O dia a dia fora do trabalho: encontros, compras, imprevistos e conversas rápidas." },
  {
    nome: "Trabalho e negócios",
    sub: "Rotina de escritório",
    descricao: "E-mails, prazos, pedidos de ajuda e o vocabulário de quem trabalha com outras equipes.",
  },
  {
    nome: "Reuniões",
    sub: "Abrir, participar, fechar",
    descricao: "Começar, pedir a palavra, lidar com a conexão ruim e combinar os próximos passos.",
  },
  {
    nome: "Negociação",
    sub: "Propostas e acordos",
    descricao: "Propor, colocar condições, responder a objeções e fechar o acordo sem perder a cordialidade.",
  },
  {
    nome: "Gestão de contas",
    sub: "Relacionamento com cliente",
    descricao: "Para gerentes de contas: acompanhar, resolver problemas, renovar contratos e manter o cliente por perto.",
  },
  { nome: "Tecnologia", sub: "TI e produto", descricao: "Deploy, bugs, testes, chamados e o jeito como times de tecnologia falam." },
  { nome: "Marketing", sub: "Campanhas e marca", descricao: "Público, campanhas, métricas e mídia paga, com os termos que o mercado usa." },
  {
    nome: "RH",
    sub: "Pessoas e carreira",
    descricao: "Vagas, seleção, avaliação, feedback e as palavras que mais confundem (demitir, pedir demissão).",
  },
  { nome: "Turismo", sub: "Viagens e hotelaria", descricao: "Aeroporto, hotel, restaurante e deslocamentos, com as variações entre países." },
  { nome: "Finanças e contabilidade", sub: "Números e fechamento", descricao: "Fluxo de caixa, fechamento do mês, DRE, impostos e inadimplência." },
];

export const ORDEM_CATEGORIAS = CATEGORIAS.map((c) => c.nome);

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
