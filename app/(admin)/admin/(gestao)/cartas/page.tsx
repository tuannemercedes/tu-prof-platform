import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ordenarCategorias, ORDEM_CATEGORIAS } from "@/lib/cartas";
import { excluirCarta, publicarCategoria, salvarCarta } from "./actions";

type Row = {
  id: string;
  categoria: string;
  incorreta: string;
  correta: string;
  explicacao: string | null;
  tipo: string;
  audio_path: string | null;
  publicada: boolean;
};

const campo = "w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2.5 text-[15px] text-[var(--text-primary)]";

function FormCarta({ idioma, carta, categorias }: { idioma: string; carta?: Row; categorias: string[] }) {
  const lista = `cats-${carta?.id ?? "nova"}`;
  return (
    <form action={salvarCarta} className="flex flex-col gap-3">
      <input type="hidden" name="idioma" value={idioma} />
      {carta && <input type="hidden" name="id" value={carta.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Frente: como muita gente fala</span>
          <input name="incorreta" required defaultValue={carta?.incorreta} className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Verso: forma correta / mais natural</span>
          <input name="correta" required defaultValue={carta?.correta} className={campo} />
        </label>
      </div>
      <fieldset className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <legend className="font-semibold mb-1">Tipo</legend>
        <label className="flex items-center gap-2">
          <input type="radio" name="tipo" value="erro" defaultChecked={(carta?.tipo ?? "erro") === "erro"} /> Erro (está errado de fato)
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="tipo" value="natural" defaultChecked={carta?.tipo === "natural"} /> Não está errado, mas soa mais natural de outro
          jeito
        </label>
      </fieldset>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold">Explicação curta (em português)</span>
        <textarea name="explicacao" rows={2} defaultValue={carta?.explicacao ?? ""} className={campo} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2 items-end">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">Tema</span>
          <input name="categoria" required list={lista} defaultValue={carta?.categoria} className={campo} />
          <datalist id={lista}>
            {categorias.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold">
            Áudio gravado por você <span className="font-normal text-[var(--text-secondary)]">(opcional)</span>
          </span>
          <input name="audio" type="file" accept="audio/*" className="text-sm" />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="publicada" defaultChecked={carta?.publicada ?? false} /> Publicada (os alunos veem)
        </label>
        {carta?.audio_path && (
          <label className="flex items-center gap-2 text-[var(--text-secondary)]">
            <input type="checkbox" name="remover_audio" /> Tirar o áudio gravado (volta a voz do aparelho)
          </label>
        )}
        <button type="submit" className="ml-auto h-10 px-5 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold">
          {carta ? "Salvar" : "Adicionar carta"}
        </button>
      </div>
    </form>
  );
}

export default async function CartasAdminPage({ searchParams }: { searchParams: Promise<{ idioma?: string }> }) {
  const { idioma: pedido } = await searchParams;
  const idioma = pedido === "ingles" ? "ingles" : "espanhol";
  const supabase = await createClient();
  const { data } = await supabase
    .from("cartas")
    .select("id, categoria, incorreta, correta, explicacao, tipo, audio_path, publicada")
    .eq("idioma", idioma)
    .order("ordem")
    .order("created_at");
  const cartas = (data ?? []) as Row[];
  const categorias = ordenarCategorias([...new Set(cartas.map((c) => c.categoria))]);
  const sugestoes = ordenarCategorias([...new Set([...ORDEM_CATEGORIAS, ...categorias])]);
  const publicadas = cartas.filter((c) => c.publicada).length;

  const chip = (on: boolean) =>
    `h-10 px-4 rounded-full text-sm font-medium flex items-center border ${
      on ? "bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]" : "bg-[var(--surface)] border-[var(--border-strong)]"
    }`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Link href="/admin/biblioteca" className="text-sm font-semibold text-[var(--gold-text)]">
          ← Acervo
        </Link>
        <h1 className="m-0 font-serif font-semibold text-[40px] leading-[1.05]">Cartas</h1>
        <p className="m-0 text-[15px] text-[var(--text-secondary)] max-w-2xl">
          O jogo dos alunos: na frente, a frase como muita gente fala; no verso, a forma correta (ou mais natural), a explicação e o áudio. Cada carta
          é marcada como <strong>erro</strong> (está errado de fato) ou <strong>mais natural</strong> (não está errado, mas o nativo diria de outro
          jeito). Só as cartas publicadas aparecem para os alunos. Sem áudio gravado, o jogo usa a voz do aparelho.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/cartas?idioma=espanhol" className={chip(idioma === "espanhol")}>
          Espanhol
        </Link>
        <Link href="/admin/cartas?idioma=ingles" className={chip(idioma === "ingles")}>
          Inglês
        </Link>
        <span className="ml-2 text-sm text-[var(--text-secondary)]">
          {publicadas} de {cartas.length} publicadas
        </span>
      </div>

      <details className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-5">
        <summary className="cursor-pointer font-semibold">+ Nova carta</summary>
        <div className="mt-4">
          <FormCarta idioma={idioma} categorias={sugestoes} />
        </div>
      </details>

      {categorias.map((cat) => {
        const doTema = cartas.filter((c) => c.categoria === cat);
        const pub = doTema.filter((c) => c.publicada).length;
        const todas = pub === doTema.length;
        return (
          <section key={cat} className="bg-[var(--surface)] border border-[var(--border)] rounded-[18px] p-5 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-[22px] font-semibold leading-tight">{cat}</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  {doTema.length} cartas · {pub ? (todas ? "todas publicadas" : `${pub} publicadas`) : "rascunho, ainda não publicadas"}
                </p>
              </div>
              <form action={publicarCategoria}>
                <input type="hidden" name="idioma" value={idioma} />
                <input type="hidden" name="categoria" value={cat} />
                <input type="hidden" name="publicada" value={todas ? "0" : "1"} />
                <button
                  type="submit"
                  className={
                    todas
                      ? "h-10 px-4 rounded-xl border border-[var(--border-strong)] text-sm font-semibold"
                      : "h-10 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] text-sm font-semibold"
                  }
                >
                  {todas ? "Tirar do ar" : "Publicar o tema todo"}
                </button>
              </form>
            </div>
            <ul className="flex flex-col divide-y divide-[var(--border)]">
              {doTema.map((c) => (
                <li key={c.id}>
                  <details className="group py-3">
                    <summary className="cursor-pointer list-none flex items-start gap-3">
                      <span
                        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${c.publicada ? "bg-[var(--success-text)]" : "bg-[var(--border-strong)]"}`}
                        title={c.publicada ? "Publicada" : "Rascunho"}
                      />
                      <span className="flex-1 min-w-0">
                        <span
                          className={`block text-sm text-[var(--text-faint)] ${c.tipo === "natural" ? "" : "line-through decoration-[var(--danger-text)]/60"}`}
                        >
                          {c.incorreta}
                        </span>
                        <span className="block text-[15px] font-semibold">{c.correta}</span>
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-1 rounded-lg ${
                          c.tipo === "natural" ? "bg-[var(--info-bg)] text-[var(--info-text)]" : "bg-[var(--danger-bg)] text-[var(--danger-text)]"
                        }`}
                      >
                        {c.tipo === "natural" ? "mais natural" : "erro"}
                      </span>
                      {c.audio_path && (
                        <span className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--gold-text)]">áudio</span>
                      )}
                      <span className="text-xs text-[var(--gold-text)] font-semibold group-open:hidden">Editar</span>
                    </summary>
                    <div className="mt-4 pl-5 flex flex-col gap-3">
                      <FormCarta idioma={idioma} carta={c} categorias={sugestoes} />
                      {c.audio_path && (
                        <audio
                          controls
                          preload="none"
                          className="h-9"
                          src={supabase.storage.from("cartas-audio").getPublicUrl(c.audio_path).data.publicUrl}
                        />
                      )}
                      <form action={excluirCarta}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" className="text-xs text-[var(--text-faint)] hover:text-[var(--danger-text)]">
                          Apagar esta carta
                        </button>
                      </form>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
