"""Gera as páginas do Espanhol Chave (exercícios, fichas, missões) em public/chave/
e os áudios em public/audio/chave/. Também escreve scripts/chave/estrutura.json, usado
para criar os módulos, etapas e aulas no banco.

Uso: python3 scripts/chave/gerar.py [--sem-audio]
"""
import hashlib, html, json, os, subprocess, sys, wave

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
sys.path.insert(0, AQUI)
PUB = os.path.join(RAIZ, "public")
AUDIO_DIR = os.path.join(PUB, "audio/chave")
VOZES = {
    "mx": ("es_MX-claude-high", None),
    "mx2": ("es_MX-ald-medium", None),
    "ar": ("es_AR-daniela-high", None),
    "es": ("es_ES-sharvard-medium", 1),
    "es2": ("es_ES-davefx-medium", None),
}
PEDIDOS = {}  # caminho -> (voz, texto)


def audio(texto, voz="mx"):
    h = hashlib.sha1(f"{voz}|{texto}".encode()).hexdigest()[:16]
    caminho = f"/audio/chave/{h}.mp3"
    PEDIDOS[caminho] = (voz, texto)
    return caminho


def esc(s):
    return html.escape(s, quote=False)


TOPO = """<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{titulo}</title><link rel="stylesheet" href="/chave/assets/chave.css?v=1"></head><body><div class="w">
<div class="topo"><img src="/logo-tuprof-claro.png" alt="Tu Prof"><span>Espanhol Chave</span></div>
<p class="k">{kicker}</p><h1>{titulo}</h1>{lead}"""
FIM = """<div class="rodape"><span><b>TU PROF</b> · Comunicação profissional e internacional</span><span>{rodape}</span></div>
</div><script id="dados" type="application/json">{dados}</script><script src="/chave/assets/chave.js?v=1"></script></body></html>"""


def salvar(rel, conteudo):
    destino = os.path.join(PUB, "chave", rel)
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    with open(destino, "w") as f:
        f.write(conteudo)
    return f"/chave/{rel}"


def banco_html(palavras):
    bs = "".join(f'<button type="button" data-src="{audio(p)}">{esc(p)} <i>▶</i></button>' for p in palavras)
    return f'<div class="banco">{bs}</div>'


def pagina_exercicios(rel, kicker, titulo, lead, secoes, rodape):
    total = 0
    for s in secoes:
        for it in s["itens"]:
            total += 1
            if "audio" in it:
                it["src"] = audio(it.pop("audio"), it.pop("voz", "mx"))
    corpo = (
        TOPO.format(titulo=esc(titulo), kicker=esc(kicker), lead=f'<p class="lead">{lead}</p>')
        + '<div id="exercicios"></div>'
        + '<div class="fim card" id="fim"><p class="k">Resultado</p><div class="grande">0/0</div><p></p>'
        + '<button class="bt claro" type="button" data-refazer-erros>Refazer os que errei</button> '
        + '<button class="bt" type="button" data-refazer>Refazer tudo</button></div>'
        + '<div class="placar" id="placar"><span></span><div class="barra"><i></i></div></div>'
        + FIM.format(rodape=esc(rodape), dados=json.dumps({"secoes": secoes}, ensure_ascii=False).replace("</", "<\\/"))
    )
    return salvar(rel, corpo), total


def pagina_livre(rel, kicker, titulo, lead, corpo_html, rodape):
    corpo = (
        TOPO.format(titulo=esc(titulo), kicker=esc(kicker), lead=f'<p class="lead">{lead}</p>' if lead else "")
        + corpo_html
        + FIM.format(rodape=esc(rodape), dados="{}")
    )
    return salvar(rel, corpo)


def pagina_ficha(rel, kicker, titulo, missao, profissional, ficha, banco, erros, rodape, nota=None):
    """missao/profissional: (título, texto). ficha: html. banco: lista. erros: [(errado, certo)]."""
    partes = [
        f'<div class="missao"><p class="k">Missão Chave · 24 horas</p><h3>{missao[0]}</h3><p>{missao[1]}</p></div>',
        f'<div class="card dark"><p class="k">Versão profissional</p><h3>{profissional[0]}</h3><p style="margin:0">{profissional[1]}</p></div>',
        '<h2>Ficha da aula</h2>',
        ficha,
        '<h2>Banco Chave<small>Toque para ouvir e repita em voz alta.</small></h2>',
        banco_html(banco),
    ]
    if erros:
        li = "".join(f"<li><s>{esc(a)}</s> → <b>{esc(b)}</b></li>" for a, b in erros)
        partes.append(f'<h2>Erros que mais aparecem</h2><div class="card"><ul class="lista erros">{li}</ul></div>')
    if nota:
        partes.append(f'<p class="nota">{nota}</p>')
    return pagina_livre(rel, kicker, titulo, "", "".join(partes), rodape)


def tabela(cabecalho, linhas):
    th = "".join(f"<th>{esc(c)}</th>" for c in cabecalho)
    trs = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in l) + "</tr>" for l in linhas)
    return f'<div class="card"><table><tr>{th}</tr>{trs}</table></div>'


def gerar_audios():
    from piper import PiperVoice, SynthesisConfig
    os.makedirs(AUDIO_DIR, exist_ok=True)
    vozes = {}
    feitos = 0
    for caminho, (voz, texto) in PEDIDOS.items():
        destino = os.path.join(PUB, caminho.lstrip("/"))
        if os.path.exists(destino):
            continue
        nome, sid = VOZES[voz]
        if voz not in vozes:
            vozes[voz] = PiperVoice.load(f"/tmp/piper/vits-piper-{nome}/{nome}.onnx")
        falar = texto.replace("…", ".").replace("___", "").replace("«", "").replace("»", "")
        with wave.open("/tmp/chave.wav", "wb") as w:
            vozes[voz].synthesize_wav(falar, w, syn_config=SynthesisConfig(speaker_id=sid, length_scale=1.1))
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", "/tmp/chave.wav", "-ac", "1", "-codec:a", "libmp3lame", "-b:a", "48k", destino], check=True)
        feitos += 1
    print("áudios novos:", feitos, "· total:", len(PEDIDOS))


if __name__ == "__main__":
    import comece, modulo1, modulo2

    estrutura = [comece.gerar(), modulo1.gerar(), modulo2.gerar()]
    json.dump(estrutura, open(os.path.join(AQUI, "estrutura.json"), "w"), ensure_ascii=False, indent=1)
    n_ex = sum(it.get("exercicios", 0) for m in estrutura for f in m["fases"] for it in f["itens"])
    n_aulas = sum(len(f["itens"]) for m in estrutura for f in m["fases"])
    print("módulos:", len(estrutura), "· itens:", n_aulas, "· exercícios:", n_ex)
    if "--sem-audio" not in sys.argv:
        import gerar as G  # o mesmo módulo que as páginas usaram para registrar os áudios

        G.gerar_audios()
