import { notFound } from "next/navigation";
import TelaEvolucao from "@/components/telas-aluno/evolucao";
import { createClient } from "@/lib/supabase/server";
import { visaoPrevia } from "@/lib/visao";

export default async function Previa({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ idioma?: string }> }) {
  const [{ id }, { idioma }] = await Promise.all([params, searchParams]);
  const v = await visaoPrevia(await createClient(), id, idioma);
  if (!v) notFound();
  return <TelaEvolucao v={v} />;
}
