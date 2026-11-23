"use client";

// Botão de imprimir/salvar em PDF e o campo de comentário editável do relatório.
export function BotaoImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="h-11 px-5 rounded-xl bg-[#0e1b33] text-white font-semibold text-sm"
    >
      Imprimir / salvar em PDF
    </button>
  );
}

export function Comentario({ inicial }: { inicial: string }) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      className="min-h-[90px] rounded-xl border border-dashed border-[#c9a24d] p-4 text-[15px] leading-relaxed outline-none focus:border-solid print:border-none print:p-0 whitespace-pre-line"
    >
      {inicial}
    </div>
  );
}
