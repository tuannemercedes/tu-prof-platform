export const NIVEIS = [
  { valor: 1, rotulo: "Travando", texto: "var(--danger-text)", barra: "#c2553e" },
  { valor: 2, rotulo: "Em progresso", texto: "var(--gold-text)", barra: "#c9a24d" },
  { valor: 3, rotulo: "Segura", texto: "var(--success-text)", barra: "#2e8a61" },
] as const;

export const COMPETENCIAS_PADRAO = ["Falar em reuniões", "Entender o que dizem", "Escrever e-mails", "Apresentar"];

export function lerCompetencias(valor: string | null | undefined): string[] {
  try {
    const lista = JSON.parse(valor || "");
    if (Array.isArray(lista) && lista.every((x) => typeof x === "string") && lista.length) return lista;
  } catch {}
  return COMPETENCIAS_PADRAO;
}

export function nivel(v: unknown) {
  return NIVEIS.find((n) => n.valor === Number(v)) ?? null;
}
