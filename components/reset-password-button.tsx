"use client";

import { useState, useTransition } from "react";
import { resetAlunoPassword } from "@/app/(admin)/admin/alunos/actions";

export default function ResetPasswordButton({ alunoId }: { alunoId: string }) {
  const [password, setPassword] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setPassword(null);
    startTransition(async () => {
      const result = await resetAlunoPassword(alunoId);
      if (result?.password) setPassword(result.password);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-xs rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
      >
        {isPending ? "Gerando..." : "Redefinir senha"}
      </button>
      {password && (
        <span className="text-xs text-green-700">
          Nova senha: <span className="font-mono font-semibold">{password}</span>
        </span>
      )}
    </div>
  );
}
