// Ícones de linha (no lugar dos emojis) para os tipos de material.
const PATHS: Record<string, React.ReactNode> = {
  html: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18M9 14l-2 2 2 2M15 14l2 2-2 2" />
    </>
  ),
  pdf: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M10 9.5v5l4.5-2.5z" />
    </>
  ),
  playlist: (
    <>
      <path d="M4 6h11M4 11h11M4 16h6" />
      <circle cx="17" cy="17" r="2.5" />
      <path d="M19.5 17V8l2-1" />
    </>
  ),
  podcast: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
    </>
  ),
  link_externo: (
    <>
      <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
      <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
    </>
  ),
};

export default function IconeTipo({ tipo, size = 22 }: { tipo: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[tipo] ?? PATHS.link_externo}
    </svg>
  );
}
