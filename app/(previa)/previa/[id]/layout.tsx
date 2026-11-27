import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { visaoPrevia } from "@/lib/visao";
import AlunoNav from "@/components/aluno-nav";
import BarraVoltar from "@/components/barra-voltar";

// Prévia "ver como o aluno vê": a mesma tela do aluno, montada para a equipe.
// Nada do que se clica aqui é salvo para o aluno.
export default async function PreviaLayout({ children, params }: LayoutProps<"/previa/[id]">) {
  await requireStaff();
  const { id } = await params;
  const supabase = await createClient();
  const [v, { data: config }] = await Promise.all([visaoPrevia(supabase, id), supabase.from("configuracoes").select("chave, valor")]);
  if (!v) notFound();

  const valor = (chave: string) => config?.find((c) => c.chave === chave)?.valor;
  const primeiroNome = v.nome.split(" ")[0];

  return (
    <>
      <div className="bg-[var(--gold)] text-[var(--navy)] px-4 py-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[13px]">
        <span>
          <strong>Prévia</strong> · você está vendo a plataforma como <strong>{primeiroNome}</strong> vê. Nada aqui é salvo.
        </span>
        <Link href={`/admin/alunos/${id}`} className="font-semibold underline underline-offset-2">
          ← Voltar à ficha
        </Link>
      </div>
      <div className="min-h-screen flex flex-col sm:flex-row">
        <Suspense>
          <AlunoNav
            nome={primeiroNome}
            idioma={{ atual: v.idioma, opcoes: v.opcoes }}
            base={v.base}
            previa
            appUrl={valor("app_treino_url")}
            appLabel={valor("app_treino_label")}
            contatoUrl={valor("contato_url")}
            contatoLabel={valor("contato_label")}
          />
        </Suspense>
        <main className="flex-1 min-w-0 px-4 sm:px-10 pt-6 sm:pt-10 pb-28 sm:pb-12">
          <Suspense>
            <BarraVoltar base={v.base} />
          </Suspense>
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </>
  );
}
