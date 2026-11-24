import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CertificadoArte from "@/components/certificado-arte";
import { BotaoImprimir } from "@/components/relatorio-acoes";
import { tituloDoTipo, type Certificado } from "@/lib/certificados";

export const metadata: Metadata = { title: "Certificado · Tu Prof", robots: { index: false } };

// Página pública do certificado: o aluno abre e salva em PDF; qualquer pessoa
// (um recrutador, o RH) confere pelo código que o certificado é verdadeiro.
export default async function CertificadoPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("certificado_por_codigo", { p_codigo: codigo });
  const c = (data as Certificado[] | null)?.[0];
  const host = (await headers()).get("host") ?? "tu-prof-platform.vercel.app";

  if (!c) {
    return (
      <main className="min-h-screen bg-[#f3efe6] text-[#0e1b33] flex items-center justify-center p-6">
        <div className="max-w-md text-center flex flex-col gap-3">
          <h1 className="m-0 font-serif text-3xl font-semibold">Certificado não encontrado</h1>
          <p className="m-0 text-[15px] text-[#5b6372]">
            Não existe certificado da Tu Prof com o código <strong>{codigo.toUpperCase()}</strong>. Confira se o código foi digitado
            corretamente.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3efe6] print:bg-white text-[#0e1b33] flex flex-col items-center gap-5 px-4 py-6 print:p-0">
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        @media print { .certificado-caixa { max-width: none !important; width: 297mm !important; } }
      `}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Arimo:wght@400;700&display=swap" rel="stylesheet" />
      <div className="print:hidden w-full max-w-[1123px] flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#e5f2e8] text-[#1f6b3a] px-3.5 py-1.5 text-sm font-semibold">
          ✓ Certificado válido · {tituloDoTipo(c.tipo).toLowerCase()} emitido pela Tu Prof
        </span>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-semibold text-[#8a6a1f]">
            Ir para a plataforma
          </Link>
          <BotaoImprimir />
        </div>
      </div>
      <CertificadoArte c={c} verificacao={`${host}/certificado/${c.codigo}`} />
      <p className="print:hidden m-0 text-[13px] text-[#5b6372]">
        Para salvar em PDF: clique em &quot;Imprimir / salvar em PDF&quot; e escolha &quot;Salvar como PDF&quot;, papel A4 deitado, sem margens.
      </p>
    </main>
  );
}
