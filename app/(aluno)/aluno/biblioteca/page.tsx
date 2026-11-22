import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/dal";
import { getTrilhasDoAluno } from "@/lib/trilhas";
import CabecalhoPagina from "@/components/cabecalho-pagina";
import BuscaMateriais from "@/components/busca-materiais";

function Cartao({
  href,
  selo,
  titulo,
  descricao,
  escuro = false,
}: {
  href: string;
  selo: string;
  titulo: string;
  descricao: string;
  escuro?: boolean;
}) {
  return (
    <Link
      href={href}
      className="card-lift flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
    >
      <span
        className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center text-[11px] font-semibold tracking-wide ${
          escuro ? "bg-[var(--navy)] text-[var(--gold-light)]" : "bg-[var(--warning-bg)] text-[var(--warning-text)]"
        }`}
      >
        {selo}
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold">{titulo}</span>
        <span className="block text-sm text-[var(--text-secondary)]">{descricao}</span>
      </span>
    </Link>
  );
}

export default async function BibliotecaPage() {
  const user = await getUser();
  const supabase = await createClient();

  const [trilhas, { data: glossario }] = await Promise.all([
    getTrilhasDoAluno(supabase, user!.id),
    supabase.from("glossario_config").select("id").eq("id", 1).maybeSingle(),
  ]);

  const fia = trilhas.filter((t) => t.categoria === "fia");

  return (
    <div>
      <CabecalhoPagina
        sobretitulo="Biblioteca"
        titulo="Seu idioma fora da aula"
        descricao="Materiais, FIA e glossário num lugar só."
      />

      <BuscaMateriais />

      <div className="mt-8 space-y-3">
        {fia.map((t) => (
          <Cartao
            key={t.id}
            href={`/aluno/materias/${t.id}`}
            selo="FIA"
            titulo={t.titulo}
            descricao={`${t.total} ${t.total === 1 ? "item" : "itens"}`}
            escuro
          />
        ))}
        {glossario && (
          <Cartao
            href="/aluno/glossario"
            selo="Aa"
            titulo="Glossário"
            descricao="As palavras e expressões do seu programa"
          />
        )}
        {!fia.length && !glossario && (
          <p className="text-sm text-[var(--text-secondary)]">
            Ainda não há itens liberados na sua biblioteca. Use a busca acima para encontrar
            materiais da sua trilha.
          </p>
        )}
      </div>
    </div>
  );
}
