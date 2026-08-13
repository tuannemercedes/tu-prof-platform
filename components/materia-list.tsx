import Link from "next/link";
import CategoriaSelect from "@/components/categoria-select";
import { updateMateriaCategoria, deleteMateria } from "@/app/(admin)/admin/materias/actions";

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
      {materias.map((materia) => (
        <li key={materia.id} className="p-4 flex items-center justify-between gap-4">
          <Link href={`/admin/materias/${materia.id}`} className="flex-1">
            <p className="text-sm font-medium hover:underline">{materia.titulo}</p>
            <p className="text-xs text-[var(--text-secondary)]">
              {materia.materiais[0]?.count ?? 0} material(is)
            </p>
          </Link>
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
        </li>
      ))}
    </ul>
  );
}
