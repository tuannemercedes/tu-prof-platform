"use client";

import { useFormStatus } from "react-dom";

// Botão de envio que pede confirmação antes (para excluir, tirar, duplicar…).
export default function BotaoConfirmar({
  mensagem,
  children,
  className,
  formAction,
}: {
  mensagem: string;
  children: React.ReactNode;
  className?: string;
  formAction?: (fd: FormData) => void | Promise<void>;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      formAction={formAction}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(mensagem)) e.preventDefault();
      }}
      className={`${className ?? ""} disabled:opacity-50`}
    >
      {pending ? "Aguarde…" : children}
    </button>
  );
}
