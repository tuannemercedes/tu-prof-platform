import { redirect } from "next/navigation";

// Endereço antigo da prévia: agora ela fica em /previa/<id>.
export default async function PreviewAntigo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/previa/${id}`);
}
