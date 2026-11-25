import { notFound } from "next/navigation";
import TelaAcervo from "@/components/telas-aluno/acervo";
import { createClient } from "@/lib/supabase/server";
import { visaoPrevia } from "@/lib/visao";

export default async function Previa({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ idioma?: string; aba?: string }> }) {
  const [{ id }, { idioma, aba }] = await Promise.all([params, searchParams]);
  const v = await visaoPrevia(await createClient(), id, idioma);
  if (!v) notFound();
  return <TelaAcervo v={v} aba={aba} />;
}
