// "Programas" são guardados na tabela técnica "turmas".

export const IDIOMAS = [
  { valor: "espanhol", rotulo: "Espanhol" },
  { valor: "ingles", rotulo: "Inglês" },
  { valor: "espanhol_ingles", rotulo: "Espanhol e inglês" },
  { valor: "portugues", rotulo: "Português" },
] as const;

export function rotuloIdioma(valor: string | null | undefined) {
  return IDIOMAS.find((i) => i.valor === valor)?.rotulo ?? "Espanhol";
}
