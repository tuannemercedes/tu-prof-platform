"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./sign-out-button";

type Materia = { id: string; titulo: string };

type Props = {
  nome: string;
  trilhas: Materia[];
  fia: Materia[];
  appTreinoUrl?: string | null;
  appTreinoLabel?: string | null;
};

export default function AlunoSidebar({ nome, trilhas, fia, appTreinoUrl, appTreinoLabel }: Props) {
  const pathname = usePathname();

  function linkClass(href: string) {
    const active = pathname === href;
    return `block px-2 py-1.5 rounded-md text-sm whitespace-nowrap ${
      active ? "bg-black text-white" : "hover:bg-gray-100"
    }`;
  }

  return (
    <aside className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-gray-200 p-4 flex flex-col gap-6 md:h-screen md:sticky md:top-0 md:overflow-y-auto">
      <div>
        <p className="font-semibold">Tu Prof</p>
        <p className="text-xs text-gray-500 truncate">Olá, {nome}</p>
      </div>

      <nav className="flex flex-col gap-1">
        <Link href="/aluno" className={linkClass("/aluno")}>
          Início
        </Link>
      </nav>

      {trilhas.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 px-2">
            Trilhas de aprendizagem
          </p>
          <nav className="flex flex-col gap-1">
            {trilhas.map((t) => (
              <Link key={t.id} href={`/aluno/materias/${t.id}`} className={linkClass(`/aluno/materias/${t.id}`)}>
                {t.titulo}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {(fia.length > 0 || appTreinoUrl) && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 px-2">
            FIA
          </p>
          <nav className="flex flex-col gap-1">
            {fia.map((t) => (
              <Link key={t.id} href={`/aluno/materias/${t.id}`} className={linkClass(`/aluno/materias/${t.id}`)}>
                {t.titulo}
              </Link>
            ))}
            {appTreinoUrl && (
              <a
                href={appTreinoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 whitespace-nowrap"
              >
                {appTreinoLabel} ↗
              </a>
            )}
          </nav>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-gray-100 text-xs text-gray-500">
        <SignOutButton />
      </div>
    </aside>
  );
}
