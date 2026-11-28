// Dias úteis (segunda a sexta) entre uma data e agora, no horário de Brasília.
// Feriados não entram na conta.
export function diasUteisDesde(iso: string, agora = new Date()) {
  const dia = (d: Date) => new Date(d.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const ini = dia(new Date(iso));
  const fim = dia(agora);
  let n = 0;
  const c = new Date(ini.getFullYear(), ini.getMonth(), ini.getDate() + 1);
  while (c <= fim) {
    const s = c.getDay();
    if (s !== 0 && s !== 6) n++;
    c.setDate(c.getDate() + 1);
  }
  return n;
}

export const PRAZO_MISSAO_DIAS_UTEIS = 2;
