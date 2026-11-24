// Função "avisos" da Tu Prof (Supabase Edge Function).
// Chamada a cada 5 minutos pelo agendador do banco (pg_cron) e, sob demanda, pela admin.
// 1) agenda os lembretes do momento (prévia 48h antes, aula amanhã, aula em 1h, prazo amanhã, semana, resumo da equipe)
// 2) envia o que está na fila (avisos_fila) pelo Resend, respeitando as preferências de cada pessoa.
// Sem a chave RESEND_API_KEY, nada é enviado e a fila fica guardada.

import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});
// Tira espaços e aspas que às vezes vêm junto ao colar a chave.
const RESEND = (Deno.env.get("RESEND_API_KEY") ?? "").trim().replace(/^["']|["']$/g, "");
const REMETENTE = Deno.env.get("EMAIL_REMETENTE") || "Tu Prof <avisos@tuprof.com.br>";
const APP = (Deno.env.get("APP_URL") || "https://tu-prof-platform.vercel.app").replace(/\/$/, "");
const FUSO = "America/Bahia";
const H = 60 * 60 * 1000;

// ---------- datas (Bahia = UTC-3, sem horário de verão) ----------
const local = (d = new Date()) => new Date(d.getTime() - 3 * H);
const diaLocal = (d = new Date()) => local(d).toISOString().slice(0, 10);
const horaLocal = (d = new Date()) => local(d).getUTCHours();
const somarDias = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, ...o });
const hora = (iso: string) => fmt({ hour: "2-digit", minute: "2-digit" }).format(new Date(iso)).replace(":00", "h").replace(":", "h");
const diaExtenso = (iso: string) => fmt({ weekday: "long", day: "numeric", month: "long" }).format(new Date(iso)).replace("-feira", "");
const quando = (iso: string) => {
  const d = diaLocal(new Date(iso));
  const hoje = diaLocal();
  if (d === hoje) return `hoje, às ${hora(iso)}`;
  if (d === somarDias(hoje, 1)) return `amanhã, às ${hora(iso)}`;
  return `${diaExtenso(iso)}, às ${hora(iso)}`;
};
const prazoTexto = (p: string | null) => {
  if (!p) return null;
  const hoje = diaLocal();
  if (p === hoje) return "hoje";
  if (p === somarDias(hoje, 1)) return "amanhã";
  return fmt({ weekday: "long", day: "numeric", month: "short" }).format(new Date(`${p}T15:00:00Z`)).replace("-feira", "").replace(".", "");
};

// ---------- e-mail ----------
const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const primeiro = (n: string | null | undefined) => (n || "").trim().split(" ")[0] || "";

type Bloco = { rotulo?: string; texto: string };
function modelo(p: {
  sobretitulo: string;
  titulo: string;
  intro?: string;
  blocos?: Bloco[];
  botao?: { texto: string; url: string };
  rodape: string;
}) {
  const blocos = (p.blocos ?? [])
    .map(
      (b) => `<tr><td style="padding:0 0 12px 0">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f2e8;border-radius:12px"><tr><td style="padding:14px 16px">
          ${b.rotulo ? `<div style="font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#8a6a1f;font-weight:bold;padding-bottom:4px">${esc(b.rotulo)}</div>` : ""}
          <div style="font-size:15px;line-height:1.5;color:#1d2433">${b.texto}</div>
        </td></tr></table></td></tr>`
    )
    .join("");
  const botao = p.botao
    ? `<tr><td style="padding:8px 0 4px 0"><a href="${p.botao.url}" style="display:inline-block;background:#c9a24d;color:#0e1b33;text-decoration:none;font-weight:bold;font-size:15px;padding:13px 22px;border-radius:12px">${esc(p.botao.texto)}</a></td></tr>`
    : "";
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#efeadf;font-family:Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#efeadf"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden">
  <tr><td style="background:#0e1b33;padding:22px 28px">
    <span style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:bold;letter-spacing:1px"><span style="color:#d6d6d6">TU</span> <span style="color:#c9a24d">PROF</span></span>
  </td></tr>
  <tr><td style="padding:28px 28px 8px 28px">
    <div style="font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#8a6a1f;font-weight:bold">${esc(p.sobretitulo)}</div>
    <h1 style="margin:6px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;color:#0e1b33;font-weight:bold">${esc(p.titulo)}</h1>
    ${p.intro ? `<p style="margin:12px 0 0 0;font-size:15px;line-height:1.55;color:#3b4352">${p.intro}</p>` : ""}
  </td></tr>
  <tr><td style="padding:16px 28px 24px 28px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${blocos}${botao}</table></td></tr>
  <tr><td style="padding:16px 28px 24px 28px;border-top:1px solid #ece6d8;font-size:12px;line-height:1.5;color:#7a8190">${p.rodape}</td></tr>
</table>
<div style="font-size:11px;color:#8b8f99;padding-top:12px">Tu Prof · Comunicação profissional e internacional</div>
</td></tr></table></body></html>`;
}

const rodapeAluno = `Você recebe este aviso porque estuda na Tu Prof. <a href="${APP}/aluno/perfil#avisos" style="color:#8a6a1f">Escolher quais avisos receber</a>.`;
const rodapeEquipe = `Aviso para a equipe Tu Prof. <a href="${APP}/admin/configuracoes#avisos" style="color:#8a6a1f">Escolher quais avisos receber</a>.`;

const PREF: Record<string, string | null> = {
  teste: null,
  boas_vindas: null,
  certificado: null,
  relatorio: null,
  tarefa_nova: "tarefas",
  prazo: "tarefas",
  aula_vespera: "aulas",
  aula_1h: "aulas",
  aula_previa: "aulas",
  comentario: "comentarios",
  semana: "semana",
  entrega: "entregas",
  diario: "diario",
};

type Pessoa = { id: string; email: string; nome: string | null; role: string; avisos: Record<string, unknown>; link_aula: string | null; professor_id: string | null };
type Email = { assunto: string; html: string } | null;

const ROTULO_ENTREGA: Record<string, string> = {
  feito: "É só marcar como feita no Plano.",
  texto: "Escreva a resposta direto na tarefa.",
  audio: "Grave o áudio pelo celular, direto na tarefa.",
  link: "O link da atividade está na tarefa.",
};

async function membros(turma: string) {
  const { data } = await db.from("turma_membros").select("aluno_id").eq("turma_id", turma);
  return (data ?? []).map((m) => m.aluno_id as string);
}
const destinos = async (aluno: string | null, turma: string | null) =>
  aluno ? [aluno] : turma ? await membros(turma) : [];

async function nomeProfessorDe(p: Pessoa) {
  if (p.professor_id) {
    const { data } = await db.from("profiles").select("nome").eq("id", p.professor_id).maybeSingle();
    if (data?.nome) return primeiro(data.nome);
  }
  const { data } = await db.from("profiles").select("nome").eq("role", "admin").limit(1).maybeSingle();
  return primeiro(data?.nome) || "Sua professora";
}

async function montar(tipo: string, dados: Record<string, string>, p: Pessoa): Promise<Email> {
  const nome = primeiro(p.nome);
  const ola = nome ? `${esc(nome)}, ` : "";

  if (tipo === "teste") {
    return {
      assunto: "Teste de e-mail da Tu Prof",
      html: modelo({
        sobretitulo: "Tudo certo",
        titulo: "Os avisos por e-mail estão funcionando",
        intro: `${ola}este é um teste enviado pela plataforma. É assim que os alunos vão receber lembretes de aula, tarefas novas e comentários.`,
        botao: { texto: "Abrir a plataforma", url: APP },
        rodape: rodapeEquipe,
      }),
    };
  }

  if (tipo === "boas_vindas") {
    if (!dados.senha) return null;
    const { data: m } = await db.from("turma_membros").select("turmas(nome)").eq("aluno_id", p.id);
    const programas = (m ?? []).map((x) => (x.turmas as unknown as { nome: string } | null)?.nome).filter(Boolean) as string[];
    const equipe = p.role !== "aluno";
    return {
      assunto: equipe ? "Seu acesso à equipe Tu Prof" : "Boas-vindas à Tu Prof: seu acesso à plataforma",
      html: modelo({
        sobretitulo: equipe ? "Equipe Tu Prof" : "Boas-vindas",
        titulo: nome ? `Que bom ter você aqui, ${nome}` : "Que bom ter você aqui",
        intro: equipe
          ? "Seu acesso à plataforma da Tu Prof está pronto. É por ela que você acompanha seus alunos, aulas e entregas."
          : "Sua plataforma da Tu Prof está pronta. É nela que ficam suas aulas, seu plano da semana, as tarefas, o acervo de materiais e a sua evolução.",
        blocos: [
          {
            rotulo: "Seus dados de acesso",
            texto: `Endereço: <a href="${APP}" style="color:#0e1b33">${esc(APP.replace(/^https?:\/\//, ""))}</a><br>E-mail: <b>${esc(p.email)}</b><br>Senha: <b style="font-family:Menlo,Consolas,monospace;letter-spacing:.5px">${esc(dados.senha)}</b>`,
          },
          ...(programas.length && !equipe ? [{ rotulo: programas.length === 1 ? "Seu programa" : "Seus programas", texto: programas.map(esc).join("<br>") }] : []),
          {
            rotulo: "Duas dicas",
            texto: "Troque a senha por uma sua em <b>Meu perfil</b>, logo no primeiro acesso.<br>No celular, abra o endereço e escolha <b>Adicionar à tela de início</b>: a plataforma fica como um app.",
          },
        ],
        botao: { texto: "Entrar na plataforma", url: `${APP}/login` },
        rodape: equipe ? rodapeEquipe : "Você recebe este e-mail porque foi cadastrado(a) na plataforma da Tu Prof.",
      }),
    };
  }

  if (tipo === "certificado") {
    const { data: c } = await db.from("certificados").select("codigo, titulo, tipo").eq("codigo", dados.codigo).maybeSingle();
    if (!c) return null;
    return {
      assunto: `Seu certificado está pronto: ${c.titulo}`,
      html: modelo({
        sobretitulo: c.tipo === "participacao" ? "Certificado de participação" : "Certificado de conclusão",
        titulo: nome ? `Parabéns, ${nome}` : "Parabéns",
        intro: `Seu certificado de <b>${esc(c.titulo)}</b> está pronto. Você pode abrir, salvar em PDF e compartilhar, inclusive no LinkedIn. Qualquer pessoa confere que ele é verdadeiro pelo código <b>${esc(c.codigo)}</b>.`,
        botao: { texto: "Abrir meu certificado", url: `${APP}/certificado/${c.codigo}` },
        rodape: rodapeAluno,
      }),
    };
  }

  if (tipo === "relatorio") {
    const mes = String(dados.mes ?? "").slice(0, 7);
    const { data: r } = await db.from("relatorios_mensais").select("comentario, publicado_em").eq("aluno_id", p.id).eq("mes", `${mes}-01`).maybeSingle();
    if (!r?.publicado_em) return null;
    const [a, m] = mes.split("-").map(Number);
    const nomeMes = new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(a, m - 1, 15)));
    const prof = await nomeProfessorDe(p);
    const trecho = (r.comentario ?? "").length > 500 ? `${r.comentario!.slice(0, 500)}...` : r.comentario ?? "";
    return {
      assunto: `Seu relatório de ${nomeMes} na Tu Prof`,
      html: modelo({
        sobretitulo: `Relatório de ${nomeMes}`,
        titulo: nome ? `${nome}, veja como foi seu mês` : "Veja como foi seu mês",
        intro: "Seu relatório mensal está na plataforma: aulas, tarefas, sua evolução e o comentário da professora.",
        blocos: trecho ? [{ rotulo: `Comentário de ${prof}`, texto: esc(trecho).replace(/\n/g, "<br>") }] : [],
        botao: { texto: "Ver meu relatório", url: `${APP}/aluno/relatorios/${mes}` },
        rodape: rodapeAluno,
      }),
    };
  }

  if (tipo === "tarefa_nova" || tipo === "prazo") {
    const { data: t } = await db.from("tarefas").select("id, texto, entrega, prazo, link_url, aula_id").eq("id", dados.tarefa_id).maybeSingle();
    if (!t) return null;
    if (tipo === "prazo") {
      const { data: e } = await db.from("tarefa_entregas").select("concluida").eq("tarefa_id", t.id).eq("aluno_id", p.id).maybeSingle();
      if (e?.concluida) return null;
    }
    let daAula: Bloco | null = null;
    if (t.aula_id && tipo === "tarefa_nova") {
      const { data: a } = await db.from("aulas").select("tema, resumo").eq("id", t.aula_id).maybeSingle();
      if (a?.resumo) daAula = { rotulo: `Na aula: ${a.tema}`, texto: esc(a.resumo) };
    }
    const prazo = prazoTexto(t.prazo);
    const curta = t.texto.length > 60 ? `${t.texto.slice(0, 57)}...` : t.texto;
    return {
      assunto: tipo === "prazo" ? `Vence amanhã: ${curta}` : `Nova tarefa: ${curta}`,
      html: modelo({
        sobretitulo: tipo === "prazo" ? "Lembrete de prazo" : "Tarefa nova",
        titulo: tipo === "prazo" ? "Sua tarefa vence amanhã" : "Você tem uma tarefa nova",
        intro: tipo === "prazo" ? `${ola}ainda dá tempo. Ela está esperando por você no Plano.` : `${ola}está no seu Plano.`,
        blocos: [
          { rotulo: "Tarefa", texto: esc(t.texto) },
          ...(daAula ? [daAula] : []),
          { rotulo: "Como entregar", texto: `${esc(ROTULO_ENTREGA[t.entrega] ?? ROTULO_ENTREGA.feito)}${prazo ? `<br>Prazo: <b>${esc(prazo)}</b>` : ""}` },
        ],
        botao: { texto: "Abrir no Plano", url: `${APP}/aluno/plano` },
        rodape: rodapeAluno,
      }),
    };
  }

  if (tipo === "comentario") {
    const [{ data: t }, { data: e }] = await Promise.all([
      db.from("tarefas").select("texto").eq("id", dados.tarefa_id).maybeSingle(),
      db.from("tarefa_entregas").select("comentario").eq("tarefa_id", dados.tarefa_id).eq("aluno_id", p.id).maybeSingle(),
    ]);
    if (!t || !e?.comentario) return null;
    const prof = await nomeProfessorDe(p);
    return {
      assunto: `${prof} comentou sua tarefa`,
      html: modelo({
        sobretitulo: "Retorno da tarefa",
        titulo: `${prof} comentou sua entrega`,
        blocos: [
          { rotulo: "Tarefa", texto: esc(t.texto) },
          { rotulo: "Comentário", texto: esc(e.comentario).replace(/\n/g, "<br>") },
        ],
        botao: { texto: "Ver no Plano", url: `${APP}/aluno/plano` },
        rodape: rodapeAluno,
      }),
    };
  }

  if (tipo === "entrega") {
    const [{ data: t }, { data: e }, { data: a }] = await Promise.all([
      db.from("tarefas").select("texto").eq("id", dados.tarefa_id).maybeSingle(),
      db.from("tarefa_entregas").select("resposta, arquivo_path").eq("tarefa_id", dados.tarefa_id).eq("aluno_id", dados.aluno_id).maybeSingle(),
      db.from("profiles").select("nome, email").eq("id", dados.aluno_id).maybeSingle(),
    ]);
    if (!t || !e || !a) return null;
    const quem = a.nome || a.email;
    const oque = e.arquivo_path ? "enviou um áudio" : "respondeu a tarefa";
    return {
      assunto: `${primeiro(quem)} ${oque}`,
      html: modelo({
        sobretitulo: "Entrega de tarefa",
        titulo: `${quem} ${oque}`,
        blocos: [
          { rotulo: "Tarefa", texto: esc(t.texto) },
          ...(e.resposta ? [{ rotulo: "Resposta", texto: esc(e.resposta.length > 600 ? `${e.resposta.slice(0, 600)}...` : e.resposta).replace(/\n/g, "<br>") }] : []),
        ],
        botao: { texto: e.arquivo_path ? "Ouvir e comentar" : "Ler e comentar", url: `${APP}/admin/alunos/${dados.aluno_id}` },
        rodape: rodapeEquipe,
      }),
    };
  }

  if (tipo === "aula_previa") {
    const { data: a } = await db.from("aulas").select("id, data, tema, status, previa, turmas(nome)").eq("id", dados.aula_id).maybeSingle();
    type Pv = { objetivo?: string; situacao?: string; expressoes?: { frase: string; traducao: string }[]; erro?: string; preparo?: string };
    const pv = (a?.previa ?? null) as Pv | null;
    if (!a?.data || a.status !== "agendada" || !pv || new Date(a.data).getTime() < Date.now()) return null;
    const grupo = (a.turmas as unknown as { nome: string } | null)?.nome;
    const expr = (pv.expressoes ?? []).slice(0, 6);
    return {
      assunto: `Prévia da aula de ${quando(a.data).replace(/, às.*/, "")}: ${a.tema}`,
      html: modelo({
        sobretitulo: "Prévia da aula",
        titulo: a.tema,
        intro: `${ola}sua próxima aula é <b>${esc(quando(a.data))}</b>${grupo ? ` (${esc(grupo)})` : ""}. Dê uma olhada antes para chegar com o vocabulário na ponta da língua.`,
        blocos: [
          ...(pv.objetivo ? [{ rotulo: "Objetivo", texto: esc(pv.objetivo) }] : []),
          ...(pv.situacao ? [{ rotulo: "A situação", texto: esc(pv.situacao).replace(/\n/g, "<br>") }] : []),
          ...(expr.length
            ? [{ rotulo: "Expressões-chave", texto: expr.map((e) => `<b>${esc(e.frase)}</b>${e.traducao ? ` <span style="color:#7a8190">· ${esc(e.traducao)}</span>` : ""}`).join("<br>") }]
            : []),
          ...(pv.preparo ? [{ rotulo: "Para chegar preparado", texto: esc(pv.preparo) }] : []),
        ],
        botao: { texto: "Ver a prévia completa", url: `${APP}/aluno/aula/${a.id}` },
        rodape: rodapeAluno,
      }),
    };
  }

  if (tipo === "aula_vespera" || tipo === "aula_1h") {
    const { data: a } = await db.from("aulas").select("id, data, tema, status, aluno_id, turma_id, turmas(nome)").eq("id", dados.aula_id).maybeSingle();
    if (!a?.data || a.status !== "agendada" || new Date(a.data).getTime() < Date.now()) return null;
    const grupo = (a.turmas as unknown as { nome: string } | null)?.nome;
    const link = a.aluno_id ? p.link_aula : null;
    return {
      assunto: tipo === "aula_1h" ? `Sua aula começa às ${hora(a.data)}` : `Aula ${quando(a.data)}`,
      html: modelo({
        sobretitulo: tipo === "aula_1h" ? "Daqui a pouco" : "Lembrete de aula",
        titulo: tipo === "aula_1h" ? `Sua aula começa às ${hora(a.data)}` : `Sua próxima aula é ${quando(a.data)}`,
        intro: `${ola}${tipo === "aula_1h" ? "separe uns minutos antes para revisar o que vamos usar." : "até lá!"}`,
        blocos: [
          { rotulo: "Tema", texto: esc(a.tema) },
          ...(grupo ? [{ rotulo: "Grupo", texto: esc(grupo) }] : []),
        ],
        botao: link ? { texto: "Entrar na aula", url: link } : { texto: "Ver no Plano", url: `${APP}/aluno/plano` },
        rodape: rodapeAluno,
      }),
    };
  }

  if (tipo === "semana") {
    const segunda = dados.dia;
    const proxima = somarDias(segunda, 7);
    const { data: m } = await db.from("turma_membros").select("turma_id").eq("aluno_id", p.id);
    const turmas = (m ?? []).map((x) => x.turma_id);
    const filtro = turmas.length ? `aluno_id.eq.${p.id},turma_id.in.(${turmas.join(",")})` : `aluno_id.eq.${p.id}`;
    const [{ data: aulas }, { data: tarefas }, { data: entregas }] = await Promise.all([
      db.from("aulas").select("data, tema").or(filtro).eq("status", "agendada").gte("data", `${segunda}T03:00:00Z`).lt("data", `${proxima}T03:00:00Z`).order("data"),
      db.from("tarefas").select("id, texto, prazo").or(filtro).gte("prazo", segunda).lt("prazo", proxima).order("prazo"),
      db.from("tarefa_entregas").select("tarefa_id, concluida").eq("aluno_id", p.id),
    ]);
    const feitas = new Set((entregas ?? []).filter((e) => e.concluida).map((e) => e.tarefa_id));
    const pendentes = (tarefas ?? []).filter((t) => !feitas.has(t.id));
    if (!aulas?.length && !pendentes.length) return null;
    return {
      assunto: "Sua semana na Tu Prof",
      html: modelo({
        sobretitulo: "Sua semana",
        titulo: `Bom dia${nome ? `, ${nome}` : ""}`,
        intro: "Aqui está o que vem pela frente nesta semana.",
        blocos: [
          ...(aulas?.length
            ? [{ rotulo: aulas.length === 1 ? "Aula" : "Aulas", texto: aulas.map((a) => `<b>${esc(diaExtenso(a.data!))}, ${esc(hora(a.data!))}</b> · ${esc(a.tema)}`).join("<br>") }]
            : []),
          ...(pendentes.length
            ? [{ rotulo: "Tarefas", texto: pendentes.map((t) => `${esc(t.texto)}${t.prazo ? ` <span style="color:#7a8190">(até ${esc(prazoTexto(t.prazo))})</span>` : ""}`).join("<br>") }]
            : []),
        ],
        botao: { texto: "Abrir meu Plano", url: `${APP}/aluno/plano` },
        rodape: rodapeAluno,
      }),
    };
  }

  if (tipo === "diario") {
    const hoje = dados.dia;
    const ehAdmin = p.role === "admin";
    const { data: aulas } = await db
      .from("aulas")
      .select("data, tema, status, aluno_id, turma_id, profiles!aulas_aluno_id_fkey(nome, professor_id), turmas(nome, professor_id)")
      .gte("data", `${somarDias(hoje, -14)}T03:00:00Z`)
      .lt("data", `${somarDias(hoje, 1)}T03:00:00Z`)
      .order("data");
    type A = { data: string; tema: string; status: string; aluno_id: string | null; turma_id: string | null; profiles: { nome: string; professor_id: string | null } | null; turmas: { nome: string; professor_id: string | null } | null };
    // A admin vê tudo; o professor, só as aulas dos alunos e grupos dele.
    const minhas = ((aulas ?? []) as unknown as A[]).filter((a) => {
      const prof = a.aluno_id ? a.profiles?.professor_id : a.turmas?.professor_id;
      return ehAdmin || prof === p.id;
    });
    const deHoje = minhas.filter((a) => diaLocal(new Date(a.data)) === hoje && a.status === "agendada");
    const semRegistro = minhas.filter((a) => diaLocal(new Date(a.data)) < hoje && a.status === "agendada");
    if (!deHoje.length && !semRegistro.length) return null;
    const quem = (a: A) => (a.aluno_id ? a.profiles?.nome : a.turmas?.nome) ?? "";
    return {
      assunto: deHoje.length ? `Hoje: ${deHoje.length} ${deHoje.length === 1 ? "aula" : "aulas"}` : "Aulas para registrar",
      html: modelo({
        sobretitulo: "Seu dia na Tu Prof",
        titulo: `Bom dia${nome ? `, ${nome}` : ""}`,
        blocos: [
          ...(deHoje.length ? [{ rotulo: "Aulas de hoje", texto: deHoje.map((a) => `<b>${esc(hora(a.data))}</b> · ${esc(quem(a))} · ${esc(a.tema)}`).join("<br>") }] : []),
          ...(semRegistro.length
            ? [{ rotulo: "Já passaram e faltam registrar", texto: semRegistro.map((a) => `${esc(fmt({ day: "2-digit", month: "2-digit" }).format(new Date(a.data)))} · ${esc(quem(a))} · ${esc(a.tema)}`).join("<br>") }]
            : []),
        ],
        botao: { texto: "Abrir o painel", url: `${APP}/admin` },
        rodape: rodapeEquipe,
      }),
    };
  }
  return null;
}

// ---------- agendamento dos lembretes ----------
async function agendar() {
  const agora = new Date();
  const linhas: { tipo: string; destinatario: string; dados: Record<string, string>; chave: string }[] = [];

  const { data: aulas } = await db
    .from("aulas")
    .select("id, data, aluno_id, turma_id, previa")
    .eq("status", "agendada")
    .gte("data", agora.toISOString())
    .lte("data", new Date(agora.getTime() + 48 * H).toISOString());
  for (const a of aulas ?? []) {
    const falta = new Date(a.data!).getTime() - agora.getTime();
    for (const d of await destinos(a.aluno_id, a.turma_id)) {
      // Com prévia: um e-mail 48h antes com a prévia (no lugar do lembrete da véspera).
      if (a.previa && falta > 3 * H) linhas.push({ tipo: "aula_previa", destinatario: d, dados: { aula_id: a.id }, chave: `aula48:${a.id}:${d}` });
      if (!a.previa && falta > 3 * H && falta <= 24 * H) linhas.push({ tipo: "aula_vespera", destinatario: d, dados: { aula_id: a.id }, chave: `aula24:${a.id}:${d}` });
      if (falta <= 70 * 60 * 1000) linhas.push({ tipo: "aula_1h", destinatario: d, dados: { aula_id: a.id }, chave: `aula1h:${a.id}:${d}` });
    }
  }

  const hoje = diaLocal(agora);
  const h = horaLocal(agora);
  if (h >= 9) {
    const { data: tarefas } = await db.from("tarefas").select("id, aluno_id, turma_id").eq("prazo", somarDias(hoje, 1));
    for (const t of tarefas ?? []) {
      for (const d of await destinos(t.aluno_id, t.turma_id)) {
        linhas.push({ tipo: "prazo", destinatario: d, dados: { tarefa_id: t.id }, chave: `prazo:${t.id}:${d}` });
      }
    }
  }
  // Resumos só de manhã (7h às 12h); fora disso não faz sentido "Bom dia".
  if (h >= 7 && h < 12) {
    const { data: pessoas } = await db.from("profiles").select("id, role");
    const segunda = local(agora).getUTCDay() === 1;
    for (const p of pessoas ?? []) {
      if (p.role === "aluno" && segunda) linhas.push({ tipo: "semana", destinatario: p.id, dados: { dia: hoje }, chave: `semana:${p.id}:${hoje}` });
      if (p.role !== "aluno") linhas.push({ tipo: "diario", destinatario: p.id, dados: { dia: hoje }, chave: `diario:${p.id}:${hoje}` });
    }
  }

  if (linhas.length) await db.from("avisos_fila").upsert(linhas, { onConflict: "chave", ignoreDuplicates: true });
  return linhas.length;
}

// ---------- envio ----------
async function enviar() {
  const r = { enviados: 0, ignorados: 0, erros: 0, adiados: 0 };
  const agora = new Date();
  const { data: fila } = await db
    .from("avisos_fila")
    .select("id, tipo, destinatario, dados, criado_em, tentativas, profiles(id, email, nome, role, avisos, link_aula, professor_id)")
    .eq("status", "pendente")
    .lte("enviar_apos", agora.toISOString())
    .order("enviar_apos")
    .limit(60);

  const madrugada = horaLocal(agora) >= 22 || horaLocal(agora) < 7;
  for (const item of fila ?? []) {
    const p = item.profiles as unknown as Pessoa | null;
    // A senha do e-mail de boas-vindas não fica guardada depois do envio.
    const marcar = (status: string, erro?: string) =>
      db
        .from("avisos_fila")
        .update({
          status,
          erro: erro ?? null,
          enviado_em: status === "enviado" ? new Date().toISOString() : null,
          ...(item.tipo === "boas_vindas" ? { dados: {} } : {}),
        })
        .eq("id", item.id);

    const pref = PREF[item.tipo];
    if (!p || !p.email || p.email.endsWith(".invalid") || (pref && p.avisos?.[pref] === false)) {
      await marcar("ignorado", !p ? "sem destinatário" : pref && p.avisos?.[pref] === false ? "desligado pela pessoa" : "e-mail inválido");
      r.ignorados++;
      continue;
    }
    const resumo = item.tipo === "semana" || item.tipo === "diario";
    const dia = (item.dados as Record<string, string> | null)?.dia;
    if (agora.getTime() - new Date(item.criado_em).getTime() > 48 * H || (resumo && dia !== diaLocal(agora))) {
      await marcar("ignorado", "expirou");
      r.ignorados++;
      continue;
    }
    // Sem e-mail de madrugada (exceto aviso de aula em 1h)
    if (madrugada && item.tipo !== "aula_1h" && item.tipo !== "teste") {
      const sete = new Date(`${horaLocal(agora) >= 22 ? somarDias(diaLocal(agora), 1) : diaLocal(agora)}T10:00:00Z`);
      await db.from("avisos_fila").update({ enviar_apos: sete.toISOString() }).eq("id", item.id);
      r.adiados++;
      continue;
    }

    let email: Email = null;
    try {
      email = await montar(item.tipo, (item.dados ?? {}) as Record<string, string>, p);
    } catch (e) {
      await db.from("avisos_fila").update({ status: "erro", erro: String(e).slice(0, 300) }).eq("id", item.id);
      r.erros++;
      continue;
    }
    if (!email) {
      await marcar("ignorado", "nada a avisar");
      r.ignorados++;
      continue;
    }

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: REMETENTE, to: [p.email], subject: email.assunto, html: email.html }),
    });
    if (resp.ok) {
      await marcar("enviado");
      r.enviados++;
    } else {
      const erro = (await resp.text()).slice(0, 300);
      const tentativas = (item.tentativas ?? 0) + 1;
      await db
        .from("avisos_fila")
        .update(
          tentativas >= 3
            ? { status: "erro", erro, tentativas, ...(item.tipo === "boas_vindas" ? { dados: {} } : {}) }
            : { erro, tentativas, enviar_apos: new Date(Date.now() + 15 * 60 * 1000).toISOString() }
        )
        .eq("id", item.id);
      r.erros++;
    }
  }
  return r;
}

Deno.serve(async (req) => {
  // Quem pode chamar: o agendador do banco (segredo) ou a admin logada.
  const { data: segredo } = await db.rpc("avisos_segredo");
  let autorizado = !!segredo && req.headers.get("x-avisos-segredo") === segredo;
  if (!autorizado) {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (token) {
      const { data } = await db.auth.getUser(token);
      if (data.user) {
        const { data: perfil } = await db.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
        autorizado = perfil?.role === "admin";
      }
    }
  }
  if (!autorizado) return new Response("não autorizado", { status: 401 });

  const agendados = await agendar();
  const resultado = RESEND ? await enviar() : null;
  const status = {
    chave: !!RESEND,
    // Diagnóstico sem expor a chave: formato e tamanho.
    chave_formato_ok: RESEND.startsWith("re_"),
    chave_tamanho: RESEND.length,
    remetente: REMETENTE,
    ultima_execucao: new Date().toISOString(),
    agendados,
    ...(resultado ?? {}),
  };
  await db.from("configuracoes").upsert({ chave: "email_status", valor: JSON.stringify(status) }, { onConflict: "chave" });
  return new Response(JSON.stringify(status), { headers: { "Content-Type": "application/json" } });
});
