export type CronogramaItem = {
  id: string;
  data: string | null;
  tema: string;
  descricao: string | null;
};

export function calcularJornada(itens: CronogramaItem[]) {
  const total = itens.length;
  if (total === 0) return { total: 0, semanaAtual: 0, proximaAula: null as CronogramaItem | null };

  const hoje = new Date().toISOString().slice(0, 10);
  const comData = itens.filter((i) => i.data);

  const semanaAtual = Math.min(
    Math.max(comData.filter((i) => i.data! <= hoje).length, 1),
    total
  );

  const proximaAula =
    comData
      .filter((i) => i.data! >= hoje)
      .sort((a, b) => (a.data! < b.data! ? -1 : 1))[0] ?? null;

  return { total, semanaAtual, proximaAula };
}
