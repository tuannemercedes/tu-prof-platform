"use client";

import { useRef, useState, useTransition } from "react";
import { addAluno } from "@/app/(admin)/admin/alunos/actions";

type Props = {
  turmas: { id: string; nome: string }[];
};

export default function AddAlunoForm({ turmas }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addAluno(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
      }
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-3 border border-gray-200 rounded-lg p-4"
    >
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder="e-mail do aluno"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          name="nome"
          placeholder="nome (opcional)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      {turmas.length ? (
        <div className="flex flex-wrap gap-3 text-sm">
          {turmas.map((turma) => (
            <label key={turma.id} className="flex items-center gap-1.5">
              <input type="checkbox" name="turmas" value={turma.id} />
              {turma.nome}
            </label>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          Crie uma turma primeiro para poder associar o aluno a ela.
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-black text-white text-sm font-medium px-4 py-2 disabled:opacity-50"
      >
        {isPending ? "Adicionando..." : "Adicionar aluno"}
      </button>
    </form>
  );
}
