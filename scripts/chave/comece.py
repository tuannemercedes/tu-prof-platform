"""Espanhol Chave · Comece aqui (roteiro de 27/11/2026)."""
from gerar import pagina_livre, tabela

R = "Espanhol Chave · Comece aqui"


def video(titulo):
    return {"tipo": "video", "titulo": titulo, "url": None}


def gerar():
    partida = pagina_livre(
        "comece/ponto-de-partida.html",
        "Comece aqui · Tarefa",
        "Ponto de partida",
        "Antes da primeira aula, registre de onde você está saindo. Leva de 1 a 3 minutos.",
        """
<div class="missao"><p class="k">Para todos · 1 a 3 min</p><h3>A gravação de partida: <span class="es">¿Quién eres?</span></h3>
<p>Grave um áudio de até um minuto respondendo <b>¿Quién eres?</b> (quem é você?). Fale como conseguir, sem preparar. Pode misturar português, pode travar.</p>
<p style="margin:0">Ninguém vai avaliar este áudio. Ele fica guardado e volta para você no fim de cada etapa, para você ouvir o quanto mudou. Envie pela aba <b>Plano → Tarefas</b>.</p></div>
<div class="grid2">
<div class="card"><p class="k">Se você já estudou espanhol</p><h3>Teste de Ponto de Partida</h3><p style="margin:0">Três blocos de 12 questões, um por etapa, e uma gravação curta. Com 80% ou mais num bloco, os módulos daquela etapa ficam como revisão opcional. O monitor ouve a gravação e confirma o seu ponto de início em até um dia útil.</p></div>
<div class="card dark"><p class="k">O que não muda</p><h3>Certificado e Club</h3><p style="margin:0">Para o certificado continuam valendo todos os Checkpoints e os três Desafios Finais. Quem começa na Ampliação faz o Desafio da Base para liberar o Club Hispano.</p></div>
</div>
<p class="nota">O teste completo entra aqui junto com o Módulo 4, quando a Base estiver fechada. Até lá, quem já estudou pode falar com o monitor para combinar o ponto de início.</p>
""",
        R,
    )
    semana = pagina_livre(
        "comece/monte-sua-semana.html",
        "Comece aqui · Tarefa",
        "Monte sua semana",
        "Três passos para a intenção de estudar virar agenda, antes da primeira aula.",
        """
<div class="card"><p class="k">Passo 1</p><h3>Escolha o ritmo</h3>
<table><tr><th>Ritmo</th><th>Sessões</th><th>Resultado</th></tr>
<tr><td>Recomendado</td><td>3 por semana, de 25 a 30 min</td><td>1 módulo por mês, a formação em 12 meses</td></tr>
<tr><td>Intensivo</td><td>5 por semana</td><td>2 módulos por mês, a formação em 6 a 7 meses</td></tr></table></div>
<div class="card"><p class="k">Passo 2</p><h3>Marque dias e horários no Plano</h3><p style="margin:0">Escolha dias e horas que existem de verdade na sua agenda, como faria com uma reunião. Se um horário não funcionar, mude o horário, e não o dia.</p></div>
<div class="card"><p class="k">Passo 3</p><h3>Entre na comunidade</h3><p style="margin:0">O link da comunidade no WhatsApp chega na mensagem de boas-vindas do monitor. Ao entrar, o seu número fica visível para os outros participantes do grupo de conversa.</p></div>
<div class="card"><p class="k">Antes de sair desta página</p><div class="check">
<label><input type="checkbox"> Escolhi o meu ritmo</label>
<label><input type="checkbox"> Marquei três dias e horários no Plano</label>
<label><input type="checkbox"> Entrei na comunidade</label>
<label><input type="checkbox"> Gravei o meu áudio de partida</label></div></div>
<div class="card ouro"><h3 style="margin:0">¡Listo! Se quiser, já pode começar a Aula 1 agora mesmo.</h3></div>
""",
        R,
    )
    combinados = pagina_livre(
        "comece/combinados.html",
        "Comece aqui · Página",
        "Combinados",
        "O que você precisa saber sobre a formação, num lugar só.",
        """
<div class="grid2">
<div class="card"><h3>Seu acesso</h3><p style="margin:0">12 meses de acesso ao Espanhol Chave, contados a partir da compra. Nesse período, você assiste às aulas quantas vezes quiser.</p></div>
<div class="card"><h3>Garantia</h3><p style="margin:0">Nos primeiros 7 dias, se a formação não for para você, devolvemos 100% do valor. É só falar com a gente.</p></div>
<div class="card"><h3>Certificado</h3><p style="margin:0">Ao concluir os 12 módulos, com os Checkpoints, os três Desafios Finais e a gravação final.</p></div>
<div class="card"><h3>Monitor</h3><p style="margin:0">Dúvidas sobre as aulas por texto, áudio de até 2 minutos ou vídeo de pronúncia, com resposta em até 1 dia útil. A correção completa dos seus textos e áudios acontece nos Desafios Finais.</p></div>
<div class="card"><h3>Club Hispano</h3><p style="margin:0">Liberado ao concluir a Base. Encontro semanal ao vivo; quem perde um encontro participa do seguinte, sem reposição.</p></div>
<div class="card"><h3>Comunidade</h3><p style="margin:0">Respeito sempre. Tente em espanhol, sem medo de errar. Dúvidas individuais vão para o monitor. Nada de divulgação ou venda no grupo.</p></div>
</div>
<div class="card dark"><h3>Suas gravações</h3><p style="margin:0">Seus áudios e vídeos ficam guardados na plataforma e são ouvidos só pela equipe da Tu Prof, para acompanhar a sua evolução. Nada é publicado sem a sua autorização por escrito.</p></div>
<p class="nota">Texto do roteiro de 27/11/2026. Antes de abrir as vendas, conferir prazo de acesso, garantia e uso das gravações com os termos da Kiwify e o contrato.</p>
""",
        R,
    )
    return {
        "titulo": "Comece aqui",
        "descricao": "O primeiro dia no Espanhol Chave: como a formação funciona, quem está com você, a gravação de partida e a sua semana marcada. Cerca de 20 minutos.",
        "capa": "/capas-prontas/pronta-globo.jpg",
        "fases": [
            {"titulo": "Os três vídeos", "itens": [
                video("Vídeo 1 · Boas-vindas ao Espanhol Chave"),
                video("Vídeo 2 · Como funciona a plataforma e a aula"),
                video("Vídeo 3 · Você não está só: monitor, comunidade e Club"),
            ]},
            {"titulo": "Antes da primeira aula", "itens": [
                {"tipo": "html", "titulo": "Ponto de partida: ¿Quién eres?", "url": partida},
                {"tipo": "html", "titulo": "Monte sua semana", "url": semana},
                {"tipo": "html", "titulo": "Combinados", "url": combinados},
            ]},
        ],
    }
