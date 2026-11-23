// Datas sempre no fuso da Tu Prof (Brasil, UTC-3).
export const FUSO = "America/Bahia";

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, ...opts });

export function hojePorExtenso() {
  const s = fmt({ weekday: "long", day: "numeric", month: "long" }).format(new Date());
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// "AAAA-MM-DD" do dia no fuso da Tu Prof
export function diaISO(d: Date | string) {
  const data = typeof d === "string" ? new Date(d) : d;
  const p = fmt({ year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(data);
  const v = (t: string) => p.find((x) => x.type === t)!.value;
  return `${v("year")}-${v("month")}-${v("day")}`;
}

export function diaSemanaCurto(d: string | Date) {
  const data = typeof d === "string" ? new Date(d) : d;
  return fmt({ weekday: "short" }).format(data).replace(".", "").slice(0, 3).toUpperCase();
}

export function diaDoMes(d: string | Date) {
  const data = typeof d === "string" ? new Date(d) : d;
  return Number(fmt({ day: "numeric" }).format(data));
}

export function hora(d: string | Date) {
  const data = typeof d === "string" ? new Date(d) : d;
  const h = fmt({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(data);
  return h.endsWith(":00") ? `${Number(h.slice(0, 2))}h` : h.replace(":", "h");
}

// "quarta, 25 nov · 18h"
export function quandoCompleto(d: string | Date) {
  const data = typeof d === "string" ? new Date(d) : d;
  const dia = fmt({ weekday: "long", day: "numeric", month: "short" }).format(data).replace(".", "");
  return `${dia.replace("-feira", "")} · ${hora(data)}`;
}

export function diaCurtoComMes(iso: string) {
  return fmt({ day: "numeric", month: "short" }).format(new Date(iso + "T12:00:00Z")).replace(".", "");
}

// Segunda-feira (AAAA-MM-DD) da semana que contém o dia ISO informado.
export function segundaDaSemana(iso: string) {
  const d = new Date(iso + "T12:00:00Z");
  const dow = d.getUTCDay(); // 0 = domingo
  const delta = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

export function somarDias(iso: string, n: number) {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function rotuloIntervalo(inicio: string) {
  const fim = somarDias(inicio, 6);
  const f = (iso: string, comMes: boolean) =>
    fmt(comMes ? { day: "numeric", month: "long" } : { day: "numeric" }).format(new Date(iso + "T12:00:00Z"));
  const mesmoMes = inicio.slice(5, 7) === fim.slice(5, 7);
  return mesmoMes ? `${f(inicio, false)} a ${f(fim, true)}` : `${f(inicio, true).replace(" de ", " ")} a ${f(fim, true)}`;
}
