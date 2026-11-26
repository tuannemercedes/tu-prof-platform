// Logo original da Tu Prof (TU prateado + PROF dourado).
// fundo "escuro": versão com TU claro (barras azul-marinho, telas escuras).
// fundo "claro": versão com TU azul-marinho (papel, cartões claros, impressão).
// fundo "auto": acompanha o tema (claro no tema claro, escuro no tema escuro).
type Props = { className?: string; fundo?: "escuro" | "claro" | "auto" };

export default function Logo({ className = "h-7", fundo = "escuro" }: Props) {
  const img = (src: string, extra = "") => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="Tu Prof" className={`w-auto max-w-full select-none ${className} ${extra}`} draggable={false} />
  );
  if (fundo === "escuro") return img("/logo-tuprof.png");
  if (fundo === "claro") return img("/logo-tuprof-claro.png");
  return (
    <>
      {img("/logo-tuprof-claro.png", "logo-tema-claro")}
      {img("/logo-tuprof.png", "logo-tema-escuro")}
    </>
  );
}
