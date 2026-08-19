import Link from "next/link";
import CategoriaSelect from "@/components/categoria-select";
import SubmitButton from "@/components/submit-button";
import MateriaMoveButtons from "@/components/materia-move-buttons";
import {
  updateMateriaCategoria,
  updateMateriaTitulo,
  deleteMateria,
} from "@/app/(admin)/admin/materias/actions";

export type Materia = {
  id: string;
  titulo: string;
  categoria: string;
  materiais: { count: number }[];
};

export default function MateriaList({ materias }: { materias: Materia[] }) {
  if (!materias.length) {
    return (
      <p className="p-4 text-sm text-[var(--text-secondary)] border border-[var(--border)] rounded-lg">
        Nenhuma ainda.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg">
      {materias.map((materia, index) => (
        <li key={materia.id} className="p-4 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <MateriaMoveButtons
                id={materia.id}
                categoria={materia.categoria}
                isFirst={index === 0}
                isLast={index === materias.length - 1}
              />
              <Link
                href={`/admin/materias/${materia.id}`}
                className="text-xs text-[var(--text-secondary)] hover:underline whitespace-nowrap"
              >
                Abrir → {materia.materiais[0]?.count ?? 0} material(is)
              </Link>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <form action={updateMateriaCategoria} className="flex items-center gap-2">
                <input type="hidden" name="id" value={materia.id} />
                <CategoriaSelect defaultValue={materia.categoria} />
              </form>
              <form action={deleteMateria}>
                <input type="hidden" name="id" value={materia.id} />
                <button type="submit" className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]">
                  Excluir
                </button>
              </form>
            </div>
          </div>
          <form action={updateMateriaTitulo} className="flex gap-2">
            <input type="hidden" name="id" value={materia.id} />
            <input
              type="text"
              name="titulo"
              defaultValue={materia.titulo}
              required
              className="bg-[var(--surface)] flex-1 rounded-md border border-[var(--border-strong)] px-2 py-1.5 text-sm font-medium"
            />
            <SubmitButton className="text-xs rounded-md border border-[var(--border-strong)] px-3 py-1.5 hover:bg-[var(--surface-2)] whitespace-nowrap">
              Salvar nome
            </SubmitButton>
          </form>
        </li>
      ))}
    </ul>
  );
}
