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
  material_turmas: { turma_id: string; turmas: { nome: string } | null }[];
  material_alunos: { aluno_id: string }[];
};

export default async function AlunoConteudosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: aluno }, { data: turmaMembros }, { data: materiaisRows }] = await Promise.all([
    supabase.from("profiles").select("id, nome, email").eq("id", id).single(),
    supabase.from("turma_membros").select("turma_id").eq("aluno_id", id),
    supabase
      .from("materiais")
      .select(
        "id, titulo, tipo, materia_id, materias(id, titulo, categoria), material_turmas(turma_id, turmas(nome)), material_alunos(aluno_id)"
      )
      .order("materia_id"),
  ]);

  if (!aluno) notFound();

  const turmaIdsDoAluno = new Set((turmaMembros ?? []).map((tm) => tm.turma_id));

  const porTrilha = new Map<
    string,
    {
      titulo: string;
      categoria: string;
      materiais: { id: string; titulo: string; tipo: string; liberado: boolean; via: string[] }[];
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

    const viaTurmas = m.material_turmas
      .filter((mt) => turmaIdsDoAluno.has(mt.turma_id))
      .map((mt) => mt.turmas?.nome)
      .filter((n): n is string => Boolean(n));
    const viaIndividual = m.material_alunos.some((ma) => ma.aluno_id === id);

    const via = [...viaTurmas, ...(viaIndividual ? ["individual"] : [])];

    porTrilha.get(m.materias.id)!.materiais.push({
      id: m.id,
      titulo: m.titulo,
      tipo: m.tipo,
      liberado: via.length > 0,
      via,
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
        <Link href="/admin/alunos" className="text-xs text-gray-500 hover:underline">
          ← Alunos
        </Link>
        <h1 className="text-lg font-semibold">Conteúdos de {aluno.nome || aluno.email}</h1>
        <p className="text-sm text-gray-500">
          {totalLiberados} de {totalMateriais} materiais liberados para este aluno.
        </p>
      </div>

      {trilhas.length === 0 && (
        <p className="text-sm text-gray-500">Nenhum material cadastrado ainda.</p>
      )}

      {trilhas.map((trilha) => (
        <section key={trilha.titulo} className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {trilha.titulo}
            {trilha.categoria === "fia" && " (FIA)"}
          </h2>
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
            {trilha.materiais.map((m) => (
              <li key={m.id} className="p-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{m.titulo}</p>
                  <p className="text-xs text-gray-500">{TIPO_LABELS[m.tipo] ?? m.tipo}</p>
                </div>
                {m.liberado ? (
                  <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-md whitespace-nowrap">
                    ✅ {m.via.join(", ")}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md whitespace-nowrap">
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
