import { notFound } from "next/navigation";
import TelaModulo from "@/components/telas-aluno/modulo";
import { createClient } from "@/lib/supabase/server";
import { visaoPrevia } from "@/lib/visao";

export default async function Previa({ params, searchParams }: { params: Promise<{ id: string; materiaId: string }>; searchParams: Promise<{ idioma?: string }> }) {
  const [{ id, materiaId }, { idioma }] = await Promise.all([params, searchParams]);
  const v = await visaoPrevia(await createClient(), id, idioma);
  if (!v) notFound();
  return <TelaModulo v={v} id={materiaId} />;
}
