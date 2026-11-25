import { notFound } from "next/navigation";
import TelaAula from "@/components/telas-aluno/aula";
import { createClient } from "@/lib/supabase/server";
import { visaoPrevia } from "@/lib/visao";

export default async function Previa({ params, searchParams }: { params: Promise<{ id: string; aulaId: string }>; searchParams: Promise<{ idioma?: string }> }) {
  const [{ id, aulaId }, { idioma }] = await Promise.all([params, searchParams]);
  const v = await visaoPrevia(await createClient(), id, idioma);
  if (!v) notFound();
  return <TelaAula v={v} id={aulaId} />;
}
