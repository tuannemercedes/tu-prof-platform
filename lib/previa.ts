// Prévia da aula: o que o aluno vê antes da aula (formato das situações do Portal).

export type Expressao = { frase: string; traducao: string };
export type Previa = {
  objetivo?: string;
  situacao?: string;
  expressoes?: Expressao[];
  erro?: string;
  preparo?: string;
};

export const HORAS_ANTES = 48;

export function lerPrevia(v: unknown): Previa | null {
  if (!v || typeof v !== "object") return null;
  const p = v as Previa;
  const tem = p.objetivo || p.situacao || p.erro || p.preparo || (p.expressoes && p.expressoes.length);
  return tem ? p : null;
}

// A prévia abre 48h antes da aula (e continua aberta depois, para revisar).
export function liberaEm(dataAula: string) {
  return new Date(new Date(dataAula).getTime() - HORAS_ANTES * 60 * 60 * 1000);
}
export function previaLiberada(dataAula: string | null) {
  return !!dataAula && Date.now() >= liberaEm(dataAula).getTime();
}

// No formulário, uma expressão por linha: "frase = tradução"
export function expressoesParaTexto(lista?: Expressao[]) {
  return (lista ?? []).map((e) => (e.traducao ? `${e.frase} = ${e.traducao}` : e.frase)).join("\n");
}
export function textoParaExpressoes(texto: string): Expressao[] {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [frase, ...resto] = l.split(/\s*=\s*/);
      return { frase: frase.trim(), traducao: resto.join(" = ").trim() };
    });
}
