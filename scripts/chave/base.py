"""Atalhos para escrever exercícios e montar um módulo do Espanhol Chave."""
from gerar import pagina_exercicios, pagina_ficha, pagina_livre, tabela


def mc(p, o, c, e="", **kw):
    return {"t": "mc", "p": p, "o": o, "c": c, "e": e, **kw}


def vf(p, verdadeiro, e=""):
    return {"t": "mc", "p": p, "o": ["Verdadeiro", "Falso"], "c": 0 if verdadeiro else 1, "e": e, "embaralhar": False, "tag": "verdadeiro ou falso"}


def multi(p, o, c, e="", **kw):
    return {"t": "multi", "p": p, "o": o, "c": c, "e": e, "tag": "marque todas as certas", **kw}


def fill(p, a, e="", **kw):
    return {"t": "fill", "p": p, "a": a if isinstance(a, list) else [a], "e": e, **kw}


def corr(p, a, e="", **kw):
    return {"t": "fill", "p": p, "a": a if isinstance(a, list) else [a], "e": e, "tag": "corrija", "ph": "Escreva a frase corrigida", **kw}


def order(p, w, e="", **kw):
    return {"t": "order", "p": p, "w": w, "e": e, "tag": "monte a frase", **kw}


def match(p, pares, e="", **kw):
    return {"t": "match", "p": p, "pares": pares, "e": e, "tag": "ligue", **kw}


def video(titulo):
    return {"tipo": "video", "titulo": titulo, "url": None}


def montar_aula(mod, a, rodape):
    """a: dict com n, titulo, lead, historia, trabalho, missao, prof, ficha, banco, erros."""
    pasta = f"m{mod}"
    n = a["n"]
    secoes = [
        {"titulo": "Na história", "sub": "A Camila no Casa Común, na Cidade do México.", "itens": a["historia"]},
        {"titulo": "No seu trabalho", "sub": "As mesmas estruturas em reuniões, e-mails e calls com equipes e clientes hispânicos.", "itens": a["trabalho"]},
    ]
    url_ex, total = pagina_exercicios(
        f"{pasta}/a{n:02d}-exercicios.html",
        f"Módulo {mod} · Aula {n} · Exercícios",
        a["titulo"],
        a["lead"],
        secoes,
        rodape,
    )
    url_ficha = pagina_ficha(
        f"{pasta}/a{n:02d}-ficha.html",
        f"Módulo {mod} · Aula {n} · Ficha e Missão",
        a["titulo"],
        a["missao"],
        a["prof"],
        a["ficha"],
        a["banco"],
        a.get("erros"),
        rodape,
        a.get("nota"),
    )
    return {
        "titulo": f"Aula {n} · {a['titulo']}",
        "itens": [
            video(f"Vídeo · {a['titulo']}"),
            {"tipo": "html", "titulo": f"Exercícios ({total})", "url": url_ex, "exercicios": total},
            {"tipo": "html", "titulo": "Ficha, Banco Chave e Missão", "url": url_ficha},
        ],
    }


def semaforo(itens):
    linhas = "".join(
        f'<div class="linha"><span>{t}</span><span class="luzes"><button type="button" class="v" aria-label="Verde"></button>'
        f'<button type="button" class="a" aria-label="Amarelo"></button><button type="button" class="m" aria-label="Vermelho"></button></span>'
        f'<span class="dica">Reveja: {aula}</span></div>'
        for t, aula in itens
    )
    return f'<div class="card semaforo"><p class="k">Eu consigo…</p>{linhas}</div>'


def checklist(itens):
    return '<div class="check">' + "".join(f'<label><input type="checkbox"> {t}</label>' for t in itens) + "</div>"
