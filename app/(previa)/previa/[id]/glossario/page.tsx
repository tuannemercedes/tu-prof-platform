import { notFound } from "next/navigation";
import TelaGlossario from "@/components/telas-aluno/glossario";
import { createClient } from "@/lib/supabase/server";
import { visaoPrevia } from "@/lib/visao";

export default async function Previa({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ idioma?: string; tema?: string }> }) {
  const [{ id }, { idioma, tema }] = await Promise.all([params, searchParams]);
  const v = await visaoPrevia(await createClient(), id, idioma);
  if (!v) notFound();
  return <TelaGlossario v={v} tema={tema} />;
}
