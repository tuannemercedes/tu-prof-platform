/* Espanhol Chave · motor das páginas de aula.
   Lê o JSON em <script id="dados">, monta os exercícios, corrige na hora e mostra o placar. */
(function () {
  var D = JSON.parse(document.getElementById("dados").textContent);
  var tocando = null;
  function tocar(src) {
    if (!src) return;
    if (tocando) tocando.pause();
    tocando = new Audio(src);
    tocando.play().catch(function () {});
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function norm(s) {
    return String(s || "")
      .normalize("NFC")
      .toLowerCase()
      .replace(/[¿?¡!.,;:«»"“”'’()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  function semAcento(s) {
    return norm(s).normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  function embaralhar(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Banco Chave: chips que tocam o áudio
  document.querySelectorAll(".banco button[data-src]").forEach(function (b) {
    b.addEventListener("click", function () { tocar(b.dataset.src); });
  });
  document.querySelectorAll("[data-ouvir]").forEach(function (b) {
    b.addEventListener("click", function () { tocar(b.dataset.ouvir); });
  });

  // Listas de verificação e semáforo (só na tela, nada é salvo)
  document.querySelectorAll(".semaforo .linha").forEach(function (linha) {
    linha.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        linha.querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        linha.classList.toggle("rev", !b.classList.contains("v"));
      });
    });
  });

  var raiz = document.getElementById("exercicios");
  if (!raiz || !D.secoes) return;

  var total = 0, respondidas = 0, certas = 0, estado = [];
  var placar = document.getElementById("placar");
  var fim = document.getElementById("fim");

  function atualizar() {
    placar.querySelector("span").textContent = respondidas + " de " + total + " respondidas · " + certas + " certas";
    placar.querySelector(".barra i").style.width = (100 * respondidas / total) + "%";
    if (respondidas === total) {
      fim.classList.add("on");
      fim.querySelector(".grande").textContent = certas + "/" + total;
      var msg = certas === total ? "Perfeito. Agora é a Missão Chave." :
        certas >= Math.ceil(total * 0.8) ? "Muito bom. Releia as explicações das que errou e siga para a Missão." :
        "Vale rever a aula e refazer os que errou antes da Missão.";
      fim.querySelector("p").textContent = msg;
      fim.querySelector("[data-refazer-erros]").style.display = certas === total ? "none" : "";
    }
  }
  function registrar(i, ok) {
    if (estado[i] != null) return;
    estado[i] = ok;
    respondidas++;
    if (ok) certas++;
    atualizar();
  }
  function resposta(box, cls, texto) {
    box.className = "r " + cls;
    box.innerHTML = texto;
  }

  var construtores = {
    mc: function (it, q, i) {
      var r = el("div", "r");
      var ops = it.o.map(function (txt, k) { return { txt: txt, k: k }; });
      if (it.embaralhar !== false) ops = embaralhar(ops);
      ops.forEach(function (op) {
        var b = el("button", "op");
        b.type = "button";
        b.textContent = op.txt;
        b.addEventListener("click", function () {
          var ok = op.k === it.c;
          q.querySelectorAll(".op").forEach(function (x) { x.disabled = true; });
          b.classList.add(ok ? "ok" : "no");
          if (!ok) q.querySelectorAll(".op").forEach(function (x) { if (x.textContent === it.o[it.c]) x.classList.add("ok"); });
          q.classList.add(ok ? "certo" : "errado");
          resposta(r, ok ? "ok" : "no", (ok ? "<b>Isso.</b> " : "<b>Não é essa.</b> ") + (it.e || ""));
          registrar(i, ok);
        });
        q.appendChild(b);
      });
      q.appendChild(r);
    },
    multi: function (it, q, i) {
      var r = el("div", "r");
      var marcados = {};
      it.o.forEach(function (txt, k) {
        var b = el("button", "op");
        b.type = "button";
        b.textContent = txt;
        b.addEventListener("click", function () {
          marcados[k] = !marcados[k];
          b.classList.toggle("sel", !!marcados[k]);
        });
        q.appendChild(b);
      });
      var conf = el("button", "bt", "Conferir");
      conf.type = "button";
      conf.addEventListener("click", function () {
        var ok = it.o.every(function (_, k) { return !!marcados[k] === (it.c.indexOf(k) >= 0); });
        q.querySelectorAll(".op").forEach(function (b, k) {
          b.disabled = true;
          b.classList.remove("sel");
          if (it.c.indexOf(k) >= 0) b.classList.add("ok");
          else if (marcados[k]) b.classList.add("no");
        });
        conf.disabled = true;
        q.classList.add(ok ? "certo" : "errado");
        resposta(r, ok ? "ok" : "no", (ok ? "<b>Isso.</b> " : "<b>Faltou ou sobrou alguma.</b> ") + (it.e || ""));
        registrar(i, ok);
      });
      q.appendChild(conf);
      q.appendChild(r);
    },
    fill: function (it, q, i) {
      var r = el("div", "r");
      var c = el("div", "campo");
      var inp = el("input");
      inp.type = "text";
      inp.autocomplete = "off";
      inp.spellcheck = false;
      inp.setAttribute("autocapitalize", "off");
      inp.placeholder = it.ph || "Escreva aqui";
      var b = el("button", "bt", "Conferir");
      b.type = "button";
      function conferir() {
        if (!inp.value.trim() || b.disabled) return;
        var v = norm(inp.value);
        var ok = it.a.some(function (a) { return norm(a) === v; });
        var quase = !ok && it.a.some(function (a) { return semAcento(a) === semAcento(inp.value); });
        inp.disabled = true; b.disabled = true;
        q.classList.add(ok ? "certo" : "errado");
        if (ok) resposta(r, "ok", "<b>Isso.</b> " + (it.e || ""));
        else if (quase) resposta(r, "quase", "<b>Quase: falta o acento.</b> O certo é <b>" + it.a[0] + "</b>. " + (it.e || ""));
        else resposta(r, "no", "<b>Resposta:</b> " + it.a[0] + ". " + (it.e || ""));
        registrar(i, ok);
      }
      b.addEventListener("click", conferir);
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") conferir(); });
      c.appendChild(inp); c.appendChild(b);
      q.appendChild(c); q.appendChild(r);
    },
    order: function (it, q, i) {
      var r = el("div", "r");
      var palavras = it.w.split(" ");
      var montada = el("div", "montada");
      var banco = el("div", "chips");
      var escolhidas = [];
      embaralhar(palavras.map(function (w, k) { return { w: w, k: k }; })).forEach(function (p) {
        var b = el("button", "chip");
        b.type = "button";
        b.textContent = p.w;
        b.addEventListener("click", function () {
          b.disabled = true;
          var m = el("button", "chip");
          m.type = "button";
          m.textContent = p.w;
          m.addEventListener("click", function () {
            if (q.classList.contains("certo") || q.classList.contains("errado")) return;
            montada.removeChild(m);
            escolhidas.splice(escolhidas.indexOf(p.w), 1);
            b.disabled = false;
          });
          montada.appendChild(m);
          escolhidas.push(p.w);
        });
        banco.appendChild(b);
      });
      var conf = el("button", "bt", "Conferir");
      conf.type = "button";
      conf.addEventListener("click", function () {
        var frase = Array.prototype.map.call(montada.children, function (x) { return x.textContent; }).join(" ");
        if (!frase) return;
        var ok = [it.w].concat(it.alt || []).some(function (a) { return norm(a) === norm(frase); });
        conf.disabled = true;
        banco.querySelectorAll(".chip").forEach(function (x) { x.disabled = true; });
        q.classList.add(ok ? "certo" : "errado");
        resposta(r, ok ? "ok" : "no", (ok ? "<b>Isso.</b> " : "<b>A ordem é:</b> " + it.w + " ") + (it.e || ""));
        registrar(i, ok);
      });
      q.appendChild(montada); q.appendChild(banco); q.appendChild(conf); q.appendChild(r);
    },
    match: function (it, q, i) {
      var r = el("div", "r");
      var direitas = embaralhar(it.pares.map(function (p) { return p[1]; }));
      var sels = [];
      it.pares.forEach(function (p) {
        var linha = el("div", "par");
        linha.appendChild(el("b", "", p[0]));
        var s = el("select");
        s.appendChild(new Option("Escolha…", ""));
        direitas.forEach(function (d) { s.appendChild(new Option(d, d)); });
        linha.appendChild(s);
        sels.push({ s: s, certo: p[1], linha: linha });
        q.appendChild(linha);
      });
      var conf = el("button", "bt", "Conferir");
      conf.type = "button";
      conf.style.marginTop = "6px";
      conf.addEventListener("click", function () {
        if (sels.some(function (x) { return !x.s.value; })) { resposta(r, "quase", "Escolha uma opção em cada linha."); return; }
        var ok = true;
        sels.forEach(function (x) {
          var bom = x.s.value === x.certo;
          if (!bom) ok = false;
          x.linha.classList.add(bom ? "ok" : "no");
          x.s.disabled = true;
          if (!bom) x.linha.appendChild(el("span", "", ""));
        });
        conf.disabled = true;
        q.classList.add(ok ? "certo" : "errado");
        var gab = it.pares.map(function (p) { return p[0] + " → " + p[1]; }).join(" · ");
        resposta(r, ok ? "ok" : "no", (ok ? "<b>Isso.</b> " : "<b>Gabarito:</b> " + gab + ". ") + (it.e || ""));
        registrar(i, ok);
      });
      q.appendChild(conf); q.appendChild(r);
    }
  };

  function montar(apenasErros) {
    var anteriores = estado.slice();
    raiz.innerHTML = "";
    total = 0; respondidas = 0; certas = 0; estado = [];
    fim.classList.remove("on");
    var idx = 0;
    D.secoes.forEach(function (sec) {
      var itens = sec.itens.map(function (it) { return { it: it, i: idx++ }; });
      if (apenasErros) itens = itens.filter(function (x) { return anteriores[x.i] === false; });
      if (!itens.length) return;
      var h = el("h2", "", sec.titulo + (sec.sub ? "<small>" + sec.sub + "</small>" : ""));
      raiz.appendChild(h);
      itens.forEach(function (x) {
        var it = x.it;
        total++;
        var q = el("div", "q");
        q.appendChild(el("div", "n", "Exercício " + (x.i + 1) + (it.tag ? " · " + it.tag : "")));
        if (it.ctx) q.appendChild(el("div", "ctx", it.ctx));
        if (it.src) {
          var o = el("button", "ouvir", "▶ Ouvir");
          o.type = "button";
          o.addEventListener("click", function () { tocar(it.src); });
          q.appendChild(o);
        }
        q.appendChild(el("p", "p", it.p));
        construtores[it.t](it, q, x.i);
        raiz.appendChild(q);
      });
    });
    // mantém o resultado das que já estavam certas, para "refazer os que errei"
    if (apenasErros) anteriores.forEach(function (v, k) { if (v === true) estado[k] = true; });
    atualizar();
  }
  fim.querySelector("[data-refazer]").addEventListener("click", function () { montar(false); window.scrollTo(0, 0); });
  fim.querySelector("[data-refazer-erros]").addEventListener("click", function () { montar(true); window.scrollTo(0, 0); });
  montar(false);
})();
