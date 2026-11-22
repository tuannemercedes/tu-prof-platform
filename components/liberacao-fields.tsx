"use client";

import { useState } from "react";

type Props = {
  turmas: { id: string; nome: string }[];
  alunos: { id: string; nome: string | null; email: string }[];
  turmaIdsLiberadas?: string[] | Set<string>;
  alunoIdsLiberados?: string[] | Set<string>;
  todosInicial?: boolean;
};

export default function LiberacaoFields({
  turmas,
  alunos,
  turmaIdsLiberadas,
  alunoIdsLiberados,
  todosInicial = false,
}: Props) {
  const [todos, setTodos] = useState(todosInicial);

  const turmaSet =
    turmaIdsLiberadas instanceof Set ? turmaIdsLiberadas : new Set(turmaIdsLiberadas ?? []);
  const alunoSet =
    alunoIdsLiberados instanceof Set ? alunoIdsLiberados : new Set(alunoIdsLiberados ?? []);

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold mb-1">Quem vê</legend>
      <label className="flex items-center gap-1.5 text-sm font-medium">
        <input
          type="checkbox"
          name="todos"
          checked={todos}
          onChange={(e) => setTodos(e.target.checked)}
        />
        Todos os alunos da escola
      </label>

      <div className={todos ? "opacity-40 pointer-events-none" : undefined}>
        {turmas.length > 0 ? (
          <div className="mb-3">
            <p className="text-xs text-[var(--text-secondary)] mb-1">Programas (todos os alunos matriculados)</p>
            <div className="flex flex-wrap gap-3 text-sm">
              {turmas.map((turma) => (
                <label key={turma.id} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    name="turmas"
                    value={turma.id}
                    defaultChecked={turmaSet.has(turma.id)}
                    disabled={todos}
                  />
                  {turma.nome}
                </label>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-[var(--text-faint)] mb-3">Nenhum programa cadastrado ainda.</p>
        )}

        {alunos.length > 0 && (
          <div>
            <p className="text-xs text-[var(--text-secondary)] mb-1">
              E também estes alunos (de qualquer programa)
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              {alunos.map((aluno) => (
                <label key={aluno.id} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    name="alunos"
                    value={aluno.id}
                    defaultChecked={alunoSet.has(aluno.id)}
                    disabled={todos}
                  />
                  {aluno.nome || aluno.email}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </fieldset>
  );
}
