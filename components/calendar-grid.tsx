"use client";

import { useState } from "react";

type Evento = { data: string; tema: string };

type Props = {
  eventos: Evento[];
  onDayClick?: (data: string) => void;
  selectedDate?: string | null;
};

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function fmtDate(ano: number, mes: number, dia: number) {
  return `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export default function CalendarGrid({ eventos, onDayClick, selectedDate }: Props) {
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());

  const eventosPorDia = new Map<string, Evento[]>();
  eventos.forEach((e) => {
    const lista = eventosPorDia.get(e.data) ?? [];
    lista.push(e);
    eventosPorDia.set(e.data, lista);
  });

  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const celulas: (number | null)[] = [
    ...Array(primeiroDiaSemana).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];
  while (celulas.length % 7 !== 0) celulas.push(null);

  const hojeStr = fmtDate(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  function mudarMes(delta: number) {
    let novoMes = mes + delta;
    let novoAno = ano;
    if (novoMes < 0) {
      novoMes = 11;
      novoAno -= 1;
    } else if (novoMes > 11) {
      novoMes = 0;
      novoAno += 1;
    }
    setMes(novoMes);
    setAno(novoAno);
  }

  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[var(--surface-2)]">
        <button
          type="button"
          onClick={() => mudarMes(-1)}
          aria-label="Mês anterior"
          className="px-2 py-1 text-sm rounded-md hover:bg-[var(--surface-3)]"
        >
          ‹
        </button>
        <p className="text-sm font-medium">
          {MESES[mes]} {ano}
        </p>
        <button
          type="button"
          onClick={() => mudarMes(1)}
          aria-label="Próximo mês"
          className="px-2 py-1 text-sm rounded-md hover:bg-[var(--surface-3)]"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] text-[var(--text-faint)] border-b border-[var(--border-soft)]">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {celulas.map((dia, i) => {
          if (dia === null) {
            return <div key={i} className="min-h-16 border-b border-r border-[var(--border-soft)]" />;
          }
          const dataStr = fmtDate(ano, mes, dia);
          const eventosDoDia = eventosPorDia.get(dataStr) ?? [];
          const isHoje = dataStr === hojeStr;
          const isSelected = dataStr === selectedDate;

          return (
            <button
              type="button"
              key={i}
              onClick={() => onDayClick?.(dataStr)}
              disabled={!onDayClick}
              className={`min-h-16 border-b border-r border-[var(--border-soft)] p-1 flex flex-col gap-0.5 text-left ${
                onDayClick ? "hover:bg-[var(--surface-3)] cursor-pointer" : "cursor-default"
              } ${isSelected ? "bg-[var(--accent)]/10" : ""}`}
            >
              <span
                className={`text-xs w-5 h-5 inline-flex items-center justify-center rounded-full ${
                  isHoje
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                {dia}
              </span>
              {eventosDoDia.slice(0, 2).map((e, idx) => (
                <span
                  key={idx}
                  className="text-[10px] leading-tight bg-[var(--accent-secondary)]/25 text-[var(--text-primary)] rounded px-1 py-0.5 truncate"
                >
                  {e.tema}
                </span>
              ))}
              {eventosDoDia.length > 2 && (
                <span className="text-[9px] text-[var(--text-faint)]">+{eventosDoDia.length - 2}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
