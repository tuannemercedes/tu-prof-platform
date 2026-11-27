import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLiberados, liberado, type Visao } from "@/lib/visao";
import MaterialCard, { type MaterialCardData } from "@/components/material-card";
import { TrilhaProgressProvider } from "@/components/trilha-progress-context";

export default async function TelaModulo({ v, id }: { v: Visao; id: string }) {
  const supabase = await createClient();
  const lib = await getLiberados(supabase, v);

  const [{ data: materia }, { data: materiais }, { data: progresso }, { data: fases }] =
    await Promise.all([
      supabase.from("materias").select("id, titulo, capa_path, descricao").eq("id", id).single(),
      supabase
        .from("materiais")
        .select("id, titulo, tipo, conteudo_html, arquivo_path, capa_path, url, ordem, fase_id")
        .eq("materia_id", id)
        .order("ordem")
        .order("created_at"),
      supabase.from("progresso").select("material_id, concluido").eq("aluno_id", v.alunoId),
      supabase.from("fases").select("id, titulo, ordem").eq("materia_id", id).order("ordem"),
    ]);

  if (!materia) notFound();

  const progressoMap = new Map((progresso ?? []).map((p) => [p.material_id, p.concluido]));

  const materiaisComUrl: (MaterialCardData & { fase_id: string | null })[] = await Promise.all(
    (materiais ?? []).filter((m) => liberado(lib, m.id)).map(async (m) => {
      let signedUrl: string | null = null;
      if (m.tipo === "pdf" && m.arquivo_path) {
        const { data } = await supabase.storage
          .from("materiais")
          .createSignedUrl(m.arquivo_path, 3600);
        signedUrl = data?.signedUrl ?? null;
      }
      const capaUrl = m.capa_path
        ? supabase.storage.from("capas").getPublicUrl(m.capa_path).data.publicUrl
        : null;
      return {
        id: m.id,
        titulo: m.titulo,
        tipo: m.tipo,
        conteudo_html: m.conteudo_html,
        url: m.url,
        signedUrl,
        capaUrl,
        concluido: progressoMap.get(m.id) ?? false,
        fase_id: m.fase_id,
      };
    })
  );

  const semFase = materiaisComUrl.filter((m) => !m.fase_id);
  const totalConcluidos = materiaisComUrl.filter((m) => m.concluido).length;

  return (
    <TrilhaProgressProvider
      titulo={materia.titulo}
      total={materiaisComUrl.length}
      concluidosIniciais={totalConcluidos}
    >
      <div className="space-y-8">
        {(() => {
          const capa = materia.capa_path ? supabase.storage.from("capas").getPublicUrl(materia.capa_path).data.publicUrl : null;
          const proximo = materiaisComUrl.find((m) => !m.concluido);
          const p = materiaisComUrl.length ? Math.round((totalConcluidos / materiaisComUrl.length) * 100) : 0;
          return (
            <header className="modulo-hero relative -mx-4 sm:mx-0 sm:rounded-[24px] overflow-hidden min-h-[260px] flex items-end">
              {capa ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={capa} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="capa-padrao absolute inset-0" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[#060d18]/95 via-[#060d18]/70 to-transparent" />
              <div className="relative p-6 sm:p-8 flex flex-col gap-3 text-white max-w-xl">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e9cf8a]">Módulo</span>
                <h1 className="m-0 font-serif font-semibold text-[34px] sm:text-[40px] leading-[1.05] text-white">{materia.titulo}</h1>
                {materia.descricao && <p className="m-0 text-[15px] text-white/80">{materia.descricao}</p>}
                <div className="flex items-center gap-3 max-w-xs">
                  <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#e9cf8a,#c9a24d)]" style={{ width: `${p}%` }} />
                  </div>
                  <span className="text-xs text-white/80">{p}%</span>
                </div>
                {proximo && (
                  <a href={`#material-${proximo.id}`} className="botao-ouro self-start inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    {totalConcluidos ? "Continuar" : "Começar"}: {proximo.titulo}
                  </a>
                )}
              </div>
            </header>
          );
        })()}

        {(fases?.length ?? 0) === 0 && semFase.length === 0 && (
          <p className="text-sm text-[var(--text-secondary)]">Nenhum material liberado aqui ainda.</p>
        )}

        {fases?.map((fase) => {
          const materiaisDaFase = materiaisComUrl.filter((m) => m.fase_id === fase.id);
          if (!materiaisDaFase.length) return null;
          return (
            <section key={fase.id} className="space-y-3">
              <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                {fase.titulo}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {materiaisDaFase.map((m) => (
                  <MaterialCard key={m.id} material={m} readOnly={v.previa} />
                ))}
              </div>
            </section>
          );
        })}

        {semFase.length > 0 && (
          <section className="space-y-3">
            {(fases?.length ?? 0) > 0 && (
              <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Outros</h2>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {semFase.map((m) => (
                <MaterialCard key={m.id} material={m} readOnly={v.previa} />
              ))}
            </div>
          </section>
        )}
      </div>
    </TrilhaProgressProvider>
  );
}
