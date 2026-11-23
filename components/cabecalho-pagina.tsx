type Props = {
  sobretitulo?: string;
  titulo: string;
  descricao?: string;
};

export default function CabecalhoPagina({ sobretitulo, titulo, descricao }: Props) {
  return (
    <div className="space-y-1.5 mb-6">
      {sobretitulo && (
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--gold-text)]">
          {sobretitulo}
        </p>
      )}
      <h1 className="font-serif font-semibold text-[34px] leading-[1.05] sm:text-[40px]">{titulo}</h1>
      {descricao && <p className="text-[15px] text-[var(--text-secondary)] max-w-xl">{descricao}</p>}
    </div>
  );
}
