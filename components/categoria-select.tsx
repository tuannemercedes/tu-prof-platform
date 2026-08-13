"use client";

export default function CategoriaSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select
      name="categoria"
      defaultValue={defaultValue}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="text-xs rounded-md border border-gray-300 px-2 py-1.5"
    >
      <option value="trilha">Trilha</option>
      <option value="fia">FIA</option>
    </select>
  );
}
