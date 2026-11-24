// Certificados Tu Prof: texto e datas como aparecem no certificado.

export type Certificado = {
  codigo: string;
  tipo: "conclusao" | "participacao" | string;
  titulo: string;
  empresa: string | null;
  carga_horaria: number | null;
  inicio: string | null;
  fim: string | null;
  nome_impresso: string;
  emitido_em: string;
};

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", ...opts }).format(new Date(`${iso.slice(0, 10)}T12:00:00Z`));

export const dataExtenso = (iso: string) => fmt(iso, { day: "numeric", month: "long", year: "numeric" });

// "3 de fevereiro a 28 de abril de 2027" (ano só no fim quando é o mesmo)
export function periodo(inicio: string | null, fim: string | null) {
  if (inicio && fim) {
    const mesmoAno = inicio.slice(0, 4) === fim.slice(0, 4);
    const a = mesmoAno ? fmt(inicio, { day: "numeric", month: "long" }) : dataExtenso(inicio);
    return `de ${a} a ${dataExtenso(fim)}`;
  }
  if (fim) return `concluído em ${dataExtenso(fim)}`;
  if (inicio) return `desde ${dataExtenso(inicio)}`;
  return null;
}

export const tituloDoTipo = (tipo: string) => (tipo === "participacao" ? "Certificado de participação" : "Certificado de conclusão");
