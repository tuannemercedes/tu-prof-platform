import { notFound } from "next/navigation";
import TelaPlano from "@/components/telas-aluno/plano";
import { createClient } from "@/lib/supabase/server";
import { visaoPrevia } from "@/lib/visao";

export default async function Previa({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ idioma?: string }> }) {
  const [{ id }, { idioma }] = await Promise.all([params, searchParams]);
  const v = await visaoPrevia(await createClient(), id, idioma);
  if (!v) notFound();
  return <TelaPlano v={v} />;
}
