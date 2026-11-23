// O glossário aparece para o aluno como "pastas": cada tema vira um cartão
// (ex.: "Sobrevivência cotidiana") e, dentro dele, as subcategorias viram filtros.
// Convenção da categoria: "Tema · Subcategoria". Termos exclusivos vão para "Só para você".

export const PASTA_EXCLUSIVA = "Só para você";

type TermoBase = {
  id: string;
  termo: string;
  definicao: string;
  exemplo: string | null;
  categoria: string | null;
  aluno_id?: string | null;
};

export type Pasta<T extends TermoBase> = { nome: string; termos: T[] };

export function pastaDo(t: TermoBase) {
  if (t.aluno_id) return PASTA_EXCLUSIVA;
  return (t.categoria || "").split(" · ")[0].trim() || "Outros";
}

export function subcategoriaDo(t: TermoBase) {
  if (t.aluno_id) return t.categoria || null;
  const partes = (t.categoria || "").split(" · ");
  return partes.length > 1 ? partes.slice(1).join(" · ") : null;
}

export function pastasDoGlossario<T extends TermoBase>(termos: T[]): Pasta<T>[] {
  const mapa = new Map<string, T[]>();
  termos.forEach((t) => {
    const p = pastaDo(t);
    if (!mapa.has(p)) mapa.set(p, []);
    mapa.get(p)!.push(t);
  });
  const ordem = (n: string) => (n === PASTA_EXCLUSIVA ? 0 : n === "Outros" ? 2 : 1);
  return [...mapa.entries()]
    .map(([nome, ts]) => ({ nome, termos: ts }))
    .sort((a, b) => ordem(a.nome) - ordem(b.nome) || a.nome.localeCompare(b.nome));
}
