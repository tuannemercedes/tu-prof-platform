"use client";

// Recolhe/abre a barra lateral no computador. A escolha fica guardada neste navegador
// (localStorage "barra") e é aplicada antes da página aparecer (script em app/layout.tsx).
export default function BotaoBarra() {
  function alternar() {
    const html = document.documentElement;
    const recolher = html.dataset.barra !== "recolhida";
    if (recolher) html.dataset.barra = "recolhida";
    else delete html.dataset.barra;
    try {
      localStorage.setItem("barra", recolher ? "recolhida" : "aberta");
    } catch {}
  }
  return (
    <button
      type="button"
      onClick={alternar}
      title="Recolher ou abrir o menu"
      aria-label="Recolher ou abrir o menu"
      className="barra-botao hidden sm:flex w-9 h-9 shrink-0 items-center justify-center rounded-lg text-[var(--on-navy-muted)] hover:text-white hover:bg-[var(--navy-2)]"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
        <path d="M9 4v16" />
        <path className="barra-seta" d="M15.5 10l-2 2 2 2" />
      </svg>
    </button>
  );
}
