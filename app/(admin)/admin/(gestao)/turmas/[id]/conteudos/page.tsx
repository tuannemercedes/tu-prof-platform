import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const TIPO_LABELS: Record<string, string> = {
  html: "Página HTML",
  pdf: "PDF",
  video: "Vídeo",
  playlist: "Playlist",
  podcast: "Podcast",
  link_externo: "Link externo",
};

type MaterialRow = {
  id: string;
  titulo: string;
  tipo: string;
  materia_id: string;
  materias: { id: string; titulo: string; categoria: string } | null;
  material_turmas: { turma_id: string }[];
};

export default async function TurmaConteudosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: turma }, { data: materiaisRows }] = await Promise.all([
    supabase.from("turmas").select("id, nome").eq("id", id).single(),
    supabase
      .from("materiais")
      .select("id, titulo, tipo, materia_id, materias(id, titulo, categoria), material_turmas(turma_id)")
      .order("materia_id"),
  ]);

  if (!turma) notFound();

  const porTrilha = new Map<
    string,
    {
      titulo: string;
      categoria: string;
      materiais: { id: string; titulo: string; tipo: string; liberado: boolean }[];
    }
  >();

  ((materiaisRows ?? []) as unknown as MaterialRow[]).forEach((m) => {
    if (!m.materias) return;
    if (!porTrilha.has(m.materias.id)) {
      porTrilha.set(m.materias.id, {
        titulo: m.materias.titulo,
        categoria: m.materias.categoria,
        materiais: [],
      });
    }

    const liberado = m.material_turmas.some((mt) => mt.turma_id === id);

    porTrilha.get(m.materias.id)!.materiais.push({
      id: m.id,
      titulo: m.titulo,
      tipo: m.tipo,
      liberado,
    });
  });

  const trilhas = [...porTrilha.values()].sort((a, b) => a.titulo.localeCompare(b.titulo));
  const totalMateriais = trilhas.reduce((acc, t) => acc + t.materiais.length, 0);
  const totalLiberados = trilhas.reduce(
    (acc, t) => acc + t.materiais.filter((m) => m.liberado).length,
    0
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/admin/turmas" className="text-xs text-[var(--text-secondary)] hover:underline">
          ← Turmas
        </Link>
        <h1 className="text-lg font-semibold">Conteúdos da turma {turma.nome}</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {totalLiberados} de {totalMateriais} materiais liberados para toda a turma. Acessos
          individuais de cada aluno não entram aqui — veja em{" "}
          <span className="font-mono">Alunos → 📦 Conteúdos</span>.
        </p>
      </div>

      {trilhas.length === 0 && (
        <p className="text-sm text-[var(--text-secondary)]">Nenhum material cadastrado ainda.</p>
      )}

      {trilhas.map((trilha) => (
        <section key={trilha.titulo} className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            {trilha.titulo}
            {trilha.categoria === "fia" && " (FIA)"}
          </h2>
          <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
            {trilha.materiais.map((m) => (
              <li key={m.id} className="p-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{m.titulo}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{TIPO_LABELS[m.tipo] ?? m.tipo}</p>
                </div>
                {m.liberado ? (
                  <span className="text-xs font-medium text-[var(--success-text)] bg-[var(--success-bg)] px-2 py-1 rounded-md whitespace-nowrap">
                    ✅ liberado
                  </span>
                ) : (
                  <span className="text-xs font-medium text-[var(--text-faint)] bg-[var(--surface-2)] px-2 py-1 rounded-md whitespace-nowrap">
                    ⬜ não liberado
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
