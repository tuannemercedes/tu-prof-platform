"""Espanhol Chave · Módulo 2 · Minha rotina, meu trabalho (roteiro de 27/11/2026)."""
from base import missao, checklist, corr, fill, match, mc, montar_aula, multi, order, semaforo, vf, video
from gerar import audio, pagina_exercicios, pagina_livre, tabela

R = "Espanhol Chave · Módulo 2"

AULAS = [
    # ---------------------------------------------------------------- AULA 1
    {
        "n": 1,
        "entrega": "texto",
        "titulo": "O presente que move a rotina: verbos em -ar",
        "lead": "Trabajar, hablar, llegar, terminar: os verbos que contam o seu dia e o da sua equipe.",
        "historia": [
            fill("Yo ___ (trabajar) a distancia.", ["trabajo"]),
            fill("¿Tú ___ (hablar) portugués?", ["hablas"], "Com tú, termina em S."),
            fill("Usted ___ (llegar) temprano.", ["llega"], "Usted usa a forma de ele."),
            fill("Nosotros ___ (terminar) a las seis.", ["terminamos"]),
            fill("Ellas ___ (estudiar) inglés.", ["estudian"]),
            mc("«Você trabalha aqui?» (informal):", ["¿Trabajas aquí?", "¿Trabaja aquí?", "¿Tú trabaja aquí?"], 0, "Tú trabajas, com S. «¿Trabaja aquí?» seria com usted."),
        ],
        "trabalho": [
            mc("Qual soa mais natural numa apresentação?", ["Trabajo en una consultora y hablo con clientes de toda la región.", "Yo trabajo en una consultora y yo hablo con clientes de toda la región.", "Trabajo en una consultora y yo hablo con clientes de toda la región yo."], 0, "Em espanhol, a terminação já mostra quem faz. O pronome aparece só para ênfase ou contraste."),
            fill("«Nós falamos com o time de Bogotá toda segunda»: ___ con el equipo de Bogotá todos los lunes.", ["Hablamos"]),
            fill("«Eles terminam o relatório hoje»: Ellos ___ el informe hoy.", ["terminan"]),
            mc("Contraste: «Eles chegam às 8; eu chego às 9».", ["Ellos llegan a las ocho; yo llego a las nueve.", "Llegan a las ocho; llego a las nueve, yo.", "Ellos llega a las ocho; yo llegan a las nueve."], 0, "Quando há contraste, o pronome ajuda: ellos… yo…"),
            mc("Um cliente pergunta: «¿Usted trabaja con proveedores de Chile?». Você responde:", ["Sí, trabajo con dos proveedores de Chile.", "Sí, trabaja con dos proveedores de Chile.", "Sí, trabajas con dos proveedores de Chile."], 0, "A pergunta veio com usted (trabaja); a resposta é com yo (trabajo)."),
            order("Monte a frase sobre o seu dia:", "Normalmente termino de trabajar a las siete.", "Normalmente costuma vir no começo da frase."),
        ],
        "missao": ("Cinco frases sobre o trabalho", "Escreva cinco frases sobre o seu trabalho ou estudos com verbos em -ar: onde trabalha, com quem fala, que língua usa, quando termina. Pelo menos uma com «nosotros»."),
        "prof": ("A sua equipe em três frases", "Descreva a sua equipe para alguém de outra filial: «Trabajamos en…», «Hablamos con…», «Terminamos el cierre del mes los…». Use nosotros."),
        "ficha": tabela(["Pessoa", "trabajar", "hablar", "terminar"], [["yo", "trabajo", "hablo", "termino"], ["tú", "trabajas", "hablas", "terminas"], ["usted, él, ella", "trabaja", "habla", "termina"], ["nosotros", "trabajamos", "hablamos", "terminamos"], ["ustedes, ellos", "trabajan", "hablan", "terminan"]]),
        "banco": ["trabajar", "hablar", "llegar", "terminar", "estudiar", "practicar", "desayunar", "cenar", "escuchar", "tomar un café", "a distancia", "temprano", "tarde", "equipo"],
        "erros": [("tú trabaja", "tú trabajas"), ("yo trabajo, yo hablo, yo termino…", "trabajo, hablo, termino…")],
    },
    # ---------------------------------------------------------------- AULA 2
    {
        "n": 2,
        "titulo": "-er e -ir: completando o presente",
        "lead": "Comer, leer, vivir, escribir, recibir. E as refeições, que mudam de nome e de horário conforme o país.",
        "historia": [
            fill("Nosotros ___ (vivir) en São Paulo.", ["vivimos"], "Nosotros do -ir: vivimos, com I."),
            fill("Nosotros ___ (comer) a las dos.", ["comemos"]),
            fill("¿Tú ___ (leer) el periódico?", ["lees"]),
            fill("Ella ___ (escribir) muchos correos.", ["escribe"]),
            corr("Corrija: «Nosotros vivemos aquí».", ["Nosotros vivimos aquí", "Vivimos aquí"]),
            mc("No México, «la comida» é:", ["a refeição principal, entre duas e quatro da tarde", "o jantar", "o café da manhã"], 0, "Em outros países, a refeição do meio do dia é el almuerzo."),
        ],
        "trabalho": [
            fill("«Recebemos muitos pedidos em dezembro»: ___ muchos pedidos en diciembre.", ["Recibimos"], "Recibir, -ir: recibimos."),
            fill("«Eu escrevo os relatórios»: ___ los informes.", ["Escribo"]),
            mc("Um cliente de Lima propõe «un almuerzo de trabajo». Ele está propondo:", ["um almoço de negócios", "um café da manhã", "um jantar"], 0, "No Peru e em boa parte da América do Sul, almuerzo é o almoço."),
            mc("«Vocês vendem para o Chile?» (para um grupo de clientes):", ["¿Ustedes venden a Chile?", "¿Ustedes vendéis a Chile?", "¿Ustedes vende a Chile?"], 0, "Ustedes: venden."),
            mc("Qual frase está correta?", ["Compartimos la presentación antes de la reunión.", "Compartemos la presentación antes de la reunión.", "Compartimos la presentación antes de la reunión, nosotros compartemos."], 0, "Compartir é -ir: compartimos."),
            mc("No e-mail: «Abrimos la oficina a las ocho». A empresa:", ["abre o escritório às oito", "abriu um escritório novo", "fecha às oito"], 0, "Abrir no presente, com nosotros: abrimos."),
        ],
        "missao": ("As refeições de hoje", "Grave 40 segundos sobre as suas refeições de hoje: o que come no desayuno, na comida e na cena, e onde."),
        "prof": ("O almoço de negócios", "Escreva como você descreveria a um cliente estrangeiro os horários de refeição no Brasil e na sua empresa: «En Brasil almorzamos a las…». Compare com o México."),
        "ficha": tabela(["Pessoa", "comer", "leer", "vivir", "escribir"], [["yo", "como", "leo", "vivo", "escribo"], ["tú", "comes", "lees", "vives", "escribes"], ["usted, él, ella", "come", "lee", "vive", "escribe"], ["nosotros", "comemos", "leemos", "vivimos", "escribimos"], ["ustedes, ellos", "comen", "leen", "viven", "escriben"]])
        + tabela(["Refeição", "Onde", "Verbo"], [["el desayuno", "todos", "desayunar"], ["la comida", "México, Espanha", "comer"], ["el almuerzo", "boa parte da América do Sul", "almorzar"], ["la cena", "todos", "cenar"]]),
        "banco": ["comer", "beber", "leer", "aprender", "vivir", "escribir", "abrir", "compartir", "recibir", "vender", "el desayuno", "la comida", "el almuerzo", "la cena"],
        "erros": [("vivemos", "vivimos"), ("escrevemos", "escribimos"), ("la cena (para almoço)", "la comida / el almuerzo")],
    },
    # ---------------------------------------------------------------- AULA 3
    {
        "n": 3,
        "entrega": "texto",
        "titulo": "Me levanto, me ducho: a rotina da manhã",
        "lead": "Os verbos reflexivos não perdem o pronome. É o que separa «me levanto» de «levanto algo».",
        "historia": [
            fill("Yo ___ levanto temprano.", ["me"]),
            fill("¿Tú ___ duchas por la mañana?", ["te"]),
            fill("Nosotros ___ arreglamos rápido.", ["nos"]),
            corr("Corrija: «Levanto a las seis».", ["Me levanto a las seis"], "Sem o me, a frase quer dizer que você levanta alguma coisa."),
            mc("Qual não é reflexivo?", ["desayuno", "me ducho", "me arreglo"], 0, "Desayunar não volta para a pessoa."),
            fill("Ellos ___ (lavarse) los dientes.", ["se lavan"]),
        ],
        "trabalho": [
            mc("Um colega pergunta como é a sua manhã antes das calls:", ["Me levanto a las seis, me ducho y reviso mis correos.", "Levanto a las seis, ducho y reviso mis correos.", "Me levanto a las seis, me ducho y me reviso mis correos."], 0, "Só os reflexivos levam o pronome. Revisar correos não é reflexivo."),
            mc("«A gente se conecta às 8h» (numa equipe remota):", ["Nos conectamos a las ocho.", "Conectamos a las ocho.", "Se conectamos a las ocho."], 0, "Conectarse: nos conectamos."),
            fill("«Ela se prepara para a reunião»: Ella ___ prepara para la reunión.", ["se"]),
            mc("Onde vai o pronome?", ["Me preparo antes de cada presentación.", "Preparo me antes de cada presentación.", "Preparo-me antes de cada presentación."], 0, "Antes do verbo conjugado. A ênclise do português (preparo-me) não existe aqui."),
            order("Monte a frase:", "Me conecto a las nueve y empiezo con el equipo.", "Me conecto: reflexivo. Empiezo: você vê na Aula 6."),
            vf("«Me baño» e «me ducho» são usados para tomar banho, conforme o país.", True, "No México, bañarse é muito comum; ducharse também se entende em todo lugar."),
        ],
        "missao": ("A sua manhã em cinco frases", "Amanhã de manhã, enquanto faz cada coisa, diga em voz alta: «me levanto», «me ducho», «desayuno». Depois, escreva a sua manhã em cinco frases, na ordem."),
        "prof": ("Antes da primeira reunião", "Descreva o que você faz entre acordar e a primeira reunião do dia, em cinco frases, incluindo «me conecto» ou «llego a la oficina»."),
        "ficha": tabela(["Pessoa", "Pronome", "levantarse", "ducharse"], [["yo", "me", "me levanto", "me ducho"], ["tú", "te", "te levantas", "te duchas"], ["usted, él, ella", "se", "se levanta", "se ducha"], ["nosotros", "nos", "nos levantamos", "nos duchamos"], ["ustedes, ellos", "se", "se levantan", "se duchan"]]),
        "banco": ["levantarse", "ducharse", "bañarse", "arreglarse", "maquillarse", "afeitarse", "lavarse los dientes", "conectarse", "prepararse", "salir de casa", "el metro"],
        "erros": [("levanto a las seis", "me levanto a las seis"), ("levanto me / levanto-me", "me levanto")],
    },
    # ---------------------------------------------------------------- AULA 4
    {
        "n": 4,
        "titulo": "Horas, dias e agenda",
        "lead": "Dizer e perguntar as horas, marcar reuniões e reservar salas. Use o botão Ouvir nas agendas.",
        "historia": [
            mc("1:00 →", ["Es la una.", "Son las una.", "Es una hora."], 0, "Uma hora só: es la una."),
            fill("4:30 → Son las cuatro y ___", ["media"]),
            mc("6:45 →", ["Son las siete menos cuarto.", "Son las seis y cuarenta y cinco menos.", "Es las siete menos cuarto."], 0, "No México também: faltan quince para las siete."),
            mc("«Na quarta» →", ["el miércoles", "en el miércoles", "en miércoles"], 0, "Dias sem preposição."),
            mc("«Todo sábado» →", ["los sábados", "en los sábados", "el sábado todo"], 0, "Los + dia: hábito."),
            corr("Corrija: «Trabajo de lunes hasta viernes».", ["Trabajo de lunes a viernes"], "De… a…, ou desde… hasta…"),
        ],
        "trabalho": [
            mc("Ouça a mensagem da assistente e escolha:", ["terça, às 15h30", "quinta, às 13h30", "terça, às 13h"], 0, "El martes a las tres y media de la tarde.", audio="La reunión con el cliente es el martes a las tres y media de la tarde."),
            mc("Ouça e escolha:", ["sexta, das 9h às 11h", "segunda, das 9h às 11h", "sexta, das 11h às 13h"], 0, "El viernes, de nueve a once.", audio="La sala de juntas está libre el viernes, de nueve a once."),
            mc("Num convite: «la llamada es a las 15:00 (hora de Ciudad de México)». No horário de Brasília, normalmente:", ["é às 18h", "é às 15h", "é às 12h"], 0, "A Cidade do México fica 3 horas atrás de Brasília (o México não tem horário de verão desde 2022). Em convites internacionais, confirme sempre o fuso."),
            fill("Para propor um horário: «¿Le parece bien el jueves ___ las diez?»", ["a"], "A las + hora."),
            mc("Para perguntar a disponibilidade de um cliente:", ["¿Qué día le queda mejor?", "¿Qué día está mejor para tú?", "¿Cuál día usted puede?"], 0, "¿Qué día le queda mejor? é uma pergunta natural e cordial, com usted."),
            order("Monte a frase para reservar a sala:", "Necesito la sala de juntas el lunes de dos a tres.", "Dia + intervalo."),
        ],
        "missao": ("Mi lunes", "Grave um áudio de um minuto contando como é a sua segunda-feira, com horários: a que horas se levanta, começa a trabalhar, come, termina e janta. É a Missão de destaque do módulo; ela volta no Checkpoint."),
        "prof": ("Marque uma reunião", "Escreva uma mensagem curta propondo uma reunião a um cliente: dois dias e horários possíveis, com o fuso, e a pergunta «¿Qué día le queda mejor?»."),
        "ficha": tabela(["Relógio", "Se diz"], [["1:00", "Es la una."], ["2:00", "Son las dos."], ["3:15", "Son las tres y cuarto."], ["4:30", "Son las cuatro y media."], ["5:45", "Son las seis menos cuarto · Faltan quince para las seis (México)"], ["15:00", "Las quince horas (convites e agendas)"]])
        + '<div class="card"><p class="k">Dias</p><p style="margin:0">lunes, martes, miércoles, jueves, viernes, sábado, domingo · <b>el lunes</b> (na segunda) · <b>los lunes</b> (toda segunda) · <b>de lunes a viernes</b></p></div>',
        "banco": ["¿qué hora es?", "es la una", "son las tres", "y cuarto", "y media", "menos cuarto", "de la mañana", "de la tarde", "el fin de semana", "la sala de juntas", "libre", "¿qué día le queda mejor?", "videollamada"],
        "erros": [("son las una", "es la una"), ("en el lunes", "el lunes"), ("de lunes hasta viernes", "de lunes a viernes")],
    },
    # ---------------------------------------------------------------- AULA 5
    {
        "n": 5,
        "entrega": "texto",
        "titulo": "Siempre, a veces, nunca: com que frequência",
        "lead": "Hábitos, rotinas de equipe e a dupla negação que o espanhol aceita.",
        "historia": [
            mc("Do mais para o menos frequente:", ["siempre · a veces · nunca", "a veces · siempre · nunca", "nunca · a veces · siempre"], 0, embaralhar=False),
            mc("«Às vezes» →", ["a veces", "as veces", "a las veces"], 0, "Sem S no a."),
            corr("Corrija: «Trabajo nunca los domingos».", ["Nunca trabajo los domingos", "No trabajo nunca los domingos"], "Nunca antes do verbo, ou no + verbo + nunca."),
            fill("«Duas vezes por semana» → dos ___ por semana", ["veces"]),
            mc("«A menudo» significa:", ["frequentemente", "em pedaços", "raramente"], 0),
            fill("¿Con qué ___ practicas deporte?", ["frecuencia"]),
        ],
        "trabalho": [
            mc("«Fazemos a reunião de status toda segunda»:", ["Hacemos la reunión de seguimiento todos los lunes.", "Hacemos la reunión de seguimiento en todos los lunes.", "Hacemos la reunión de seguimiento cada lunes todos."], 0, "Todos los lunes, sem preposição. Reunião de status costuma ser reunión de seguimiento."),
            mc("«Quase nunca viajo a trabalho»:", ["Casi nunca viajo por trabajo.", "Casi nunca no viajo por trabajo.", "Viajo casi nunca por trabajo, no."], 0, "Casi nunca antes do verbo, sem outro no."),
            mc("Qual também está correta?", ["No viajo nunca por trabajo.", "Nunca no viajo por trabajo.", "No nunca viajo por trabajo."], 0, "Dupla negação: no + verbo + nunca."),
            fill("«Enviamos o relatório uma vez por mês»: Enviamos el informe una vez ___ mes.", ["al", "por"], "Una vez al mes ou una vez por mes."),
            mc("Para perguntar a um colega com que frequência a equipe se reúne:", ["¿Cada cuánto se reúnen?", "¿Cuánto cada se reúnen?", "¿Con qué frecuencia reúnen?"], 0, "¿Cada cuánto…? é curto e natural. Reunirse é reflexivo: se reúnen."),
            match("Ligue:", [["siempre", "sempre"], ["a menudo", "frequentemente"], ["casi nunca", "quase nunca"], ["a veces", "às vezes"]]),
        ],
        "missao": ("Seis níveis de frequência", "Escreva seis frases sobre os seus hábitos, uma para cada nível: siempre, normalmente, a menudo, a veces, casi nunca, nunca. Uma delas sobre o seu estudo de espanhol."),
        "prof": ("As rotinas da sua equipe", "Descreva as rotinas fixas da sua equipe: reuniões, relatórios, viagens, fechamento do mês. Use todos los…, una vez al…, a menudo e casi nunca."),
        "ficha": tabela(["Frequência", "Exemplo"], [["siempre", "Siempre reviso el correo a las nueve."], ["normalmente", "Normalmente llego a las ocho y media."], ["a menudo", "Hablo con el equipo de Bogotá a menudo."], ["a veces", "A veces trabajo los sábados."], ["casi nunca", "Casi nunca viajo por trabajo."], ["nunca", "Nunca trabajo los domingos · No trabajo nunca los domingos."]]),
        "banco": ["siempre", "normalmente", "a menudo", "a veces", "casi nunca", "nunca", "todos los días", "una vez por semana", "dos veces al mes", "¿con qué frecuencia?", "¿cada cuánto?", "reunión de seguimiento"],
        "erros": [("as veces", "a veces"), ("trabajo nunca", "nunca trabajo / no trabajo nunca")],
    },
    # ---------------------------------------------------------------- AULA 6
    {
        "n": 6,
        "titulo": "Verbos que mudam: quiero, puedo, pido",
        "lead": "E→IE, O→UE, E→I. Os irregulares que você usa para aceitar, recusar e negociar horários.",
        "historia": [
            fill("Yo ___ (querer) un café.", ["quiero"]),
            fill("¿Tú ___ (poder) venir mañana?", ["puedes"]),
            mc("Nosotros ___ (poder) ir.", ["podemos", "puedemos"], 0, "Nosotros fica fora da «bota» e não muda.", embaralhar=False),
            fill("Ellos ___ (pedir) tacos.", ["piden"]),
            fill("Yo ___ (empezar) a trabajar a las nueve.", ["empiezo"]),
            fill("Ella ___ (volver) a las siete.", ["vuelve"]),
        ],
        "trabalho": [
            mc("Para recusar um horário com elegância:", ["Me encantaría, pero a esa hora no puedo. ¿Podemos el jueves?", "No quiero a esa hora.", "No podo a esa hora."], 0, "Recusar e propor outra data. «Podo» não existe."),
            fill("«A reunião começa às 10»: La reunión ___ a las diez.", ["empieza"], "Empezar: e→ie."),
            mc("Qual frase está correta?", ["¿Puede repetir la cifra, por favor?", "¿Pode repetir la cifra, por favor?", "¿Puedes repetir la cifra, por favor, usted?"], 0, "Poder com usted: puede."),
            fill("«Nós preferimos o formato híbrido»: ___ el formato híbrido.", ["Preferimos"], "Nosotros não muda: preferimos."),
            mc("Para pedir ao fornecedor uma cotação nova:", ["Le pido una nueva cotización.", "Le pedo una nueva cotización.", "Le pide una nueva cotización yo."], 0, "Pedir com yo: pido. Atenção: «pedo» é palavrão em vários países."),
            match("Ligue cada verbo ao grupo:", [["dormir", "o → ue"], ["preferir", "e → ie"], ["repetir", "e → i"], ["costar", "o → ue"]]),
        ],
        "missao": ("A manhã, versão 2", "Reescreva a sua manhã da Aula 3 com três verbos novos: a que horas se desperta, quando começa a trabalhar e quando volta para casa. Grave lendo em voz alta."),
        "prof": ("Aceitar e recusar", "Escreva duas respostas a um convite de reunião: uma aceitando («Sí, puedo…») e uma recusando com outra proposta («Me encantaría, pero… ¿Podemos…?»)."),
        "ficha": tabela(["Pessoa", "e → ie · querer", "o → ue · poder", "e → i · pedir"], [["yo", "quiero", "puedo", "pido"], ["tú", "quieres", "puedes", "pides"], ["usted, él, ella", "quiere", "puede", "pide"], ["nosotros", "queremos", "podemos", "pedimos"], ["ustedes, ellos", "quieren", "pueden", "piden"]])
        + '<div class="card"><p class="k">A bota</p><p style="margin:0">Yo, tú, él e ellos ficam dentro da bota e mudam. Nosotros fica fora e continua regular.</p></div>',
        "banco": ["querer", "preferir", "empezar", "entender", "pensar", "poder", "volver", "dormir", "almorzar", "costar", "pedir", "repetir", "me encantaría", "cotización"],
        "erros": [("puedemos", "podemos"), ("quero", "quiero"), ("podo, pedo", "puedo, pido")],
    },
    # ---------------------------------------------------------------- AULA 7
    {
        "n": 7,
        "titulo": "Ir, hacer, tener: os três que mais aparecem",
        "lead": "Para onde vai, o que faz, quantos anos tem, o que tem na agenda. E as sensações com tener.",
        "historia": [
            fill("Yo ___ (ir) al gimnasio.", ["voy"]),
            fill("¿Qué ___ (hacer) tú los domingos?", ["haces"]),
            fill("Nosotros ___ (tener) una reunión.", ["tenemos"]),
            mc("Voy a ___ parque.", ["al", "a el", "en el"], 0, "A + el = al."),
            mc("«Tenho 40 anos»:", ["Tengo cuarenta años.", "Soy cuarenta años.", "Estoy con cuarenta años."], 0),
            mc("«Estou com sede»:", ["Tengo sed.", "Estoy con sed.", "Soy sed."], 0),
        ],
        "trabalho": [
            fill("«Tenho uma reunião às três»: ___ una reunión a las tres.", ["Tengo"]),
            fill("«Vamos ao escritório de Monterrey na terça»: ___ a la oficina de Monterrey el martes.", ["Vamos"]),
            mc("«O que você faz na empresa?», a um colega novo:", ["¿Qué haces en la empresa?", "¿Qué hazes en la empresa?", "¿Qué hace tú en la empresa?"], 0, "Hacer com tú: haces."),
            mc("Para encerrar porque está atrasado para outra call:", ["Perdón, tengo prisa: tengo otra llamada a las cuatro.", "Perdón, estoy con prisa: estoy otra llamada.", "Perdón, soy prisa."], 0, "Tener prisa: estar com pressa."),
            fill("Yo ___ (salir) de la oficina a las seis.", ["salgo"], "Salir faz como tener e hacer: salgo."),
            mc("«¿Tienes tiempo mañana?» quer dizer:", ["Você tem um tempo amanhã?", "Que tempo vai fazer amanhã?", "Você tem relógio amanhã?"], 0, "Tener tiempo: ter disponibilidade."),
        ],
        "missao": ("O seu fim de semana", "Grave 45 segundos sobre o seu fim de semana típico: para onde vai, o que faz e com quem. Termine com uma sensação: «y el domingo por la noche, siempre tengo sueño»."),
        "prof": ("A sua agenda da semana", "Conte a sua semana de trabalho com os três verbos: «El lunes tengo…», «El miércoles voy a…», «Los viernes hago…»."),
        "ficha": tabela(["Pessoa", "ir", "hacer", "tener"], [["yo", "voy", "hago", "tengo"], ["tú", "vas", "haces", "tienes"], ["usted, él, ella", "va", "hace", "tiene"], ["nosotros", "vamos", "hacemos", "tenemos"], ["ustedes, ellos", "van", "hacen", "tienen"]])
        + tabela(["Português", "Espanhol"], [["tenho 31 anos", "tengo 31 años"], ["estou com fome · sede", "tengo hambre · sed"], ["estou com frio · calor", "tengo frío · calor"], ["estou com sono · pressa", "tengo sueño · prisa"]]),
        "banco": ["ir a", "al", "hacer", "¿qué haces?", "tener años", "tener hambre", "tener sed", "tener prisa", "tener sueño", "tener tiempo", "salgo", "tengo una reunión"],
        "erros": [("soy treinta años", "tengo treinta años"), ("estoy con hambre", "tengo hambre"), ("voy a el parque", "voy al parque"), ("hazo", "hago")],
    },
    # ---------------------------------------------------------------- AULA 8
    {
        "n": 8,
        "entrega": "feito",
        "titulo": "Me gusta, me encanta: gostos sem traduzir",
        "lead": "O gustar funciona ao contrário do português. É o erro mais clássico do brasileiro, inclusive em conversas de networking.",
        "historia": [
            fill("Me ___ (gustar) los tacos.", ["gustan"], "Várias coisas: gustan."),
            fill("Me ___ (gustar) viajar.", ["gusta"], "Verbo: gusta."),
            fill("A Martín no ___ gusta el picante.", ["le"]),
            corr("Corrija: «Yo gusto de café».", ["Me gusta el café"], "A coisa agrada à pessoa."),
            mc("— No me gusta el frío. — Eu também não:", ["A mí tampoco.", "A mí también.", "Yo tampoco gusto."], 0, "Depois de negativa: tampoco."),
            mc("— Me encanta la playa. — Eu não:", ["A mí no.", "A mí tampoco.", "Yo no gusto."], 0),
        ],
        "trabalho": [
            mc("Num jantar de networking, para dizer que gosta muito do trabalho com a América Latina:", ["Me encanta trabajar con equipos de Latinoamérica.", "Me encantan trabajar con equipos de Latinoamérica.", "Yo encanto trabajar con equipos de Latinoamérica."], 0, "Verbo no infinitivo: encanta, no singular."),
            mc("«Os clientes gostam das nossas apresentações»:", ["A los clientes les gustan nuestras presentaciones.", "Los clientes gustan nuestras presentaciones.", "A los clientes les gusta nuestras presentaciones."], 0, "A quem: a los clientes les. O quê: presentaciones, plural: gustan."),
            fill("«Prefiro reuniões curtas»: ___ las reuniones cortas.", ["Prefiero"], "Preferir funciona como o português; gustar, não."),
            mc("Um cliente diz: «Nos gusta mucho la propuesta». Ele fala:", ["em nome da empresa (nós gostamos)", "só dele (eu gosto)", "de vocês (vocês gostam)"], 0, "Nos gusta: a nós agrada."),
            mc("Para perguntar a um cliente, com usted, se gosta de comida peruana:", ["¿Le gusta la comida peruana?", "¿Te gusta la comida peruana?", "¿Usted gusta de la comida peruana?"], 0, "Com usted: le gusta."),
            mc("— Me gustan los proyectos con plazos claros. — Eu também:", ["A mí también.", "A mí tampoco.", "Yo también gusto."], 0, "Depois de frase afirmativa: también."),
        ],
        "missao": ("Gostos na comunidade", "Escreva três coisas de que gosta, uma de que gosta muito (me encanta) e duas de que não gosta. Poste uma na comunidade e responda a um colega com «a mí también» ou «a mí tampoco»."),
        "prof": ("Conversa de networking", "Prepare três frases para uma conversa informal com um cliente ou colega estrangeiro: do que você gosta no seu trabalho, um hobby e uma comida. Use me gusta, me encanta e prefiero."),
        "ficha": tabela(["A quem", "Pronome", "Uma coisa · verbo", "Várias coisas"], [["a mí", "me", "me gusta el café", "me gustan los tacos"], ["a ti", "te", "te gusta cocinar", "te gustan las series"], ["a usted, a él, a ella", "le", "le gusta el fútbol", "le gustan los perros"], ["a nosotros", "nos", "nos gusta viajar", "nos gustan los museos"], ["a ustedes, a ellos", "les", "les gusta la propuesta", "les gustan las presentaciones"]])
        + '<div class="card"><p class="k">Reagir</p><p style="margin:0">Concorda com afirmativa: <b>a mí también</b>. Concorda com negativa: <b>a mí tampoco</b>. Discorda: <b>a mí sí</b> · <b>a mí no</b>.</p></div>',
        "banco": ["me gusta", "me gustan", "me encanta", "no me gusta", "a mí también", "a mí tampoco", "a mí sí", "a mí no", "prefiero", "¿le gusta?", "la propuesta"],
        "erros": [("yo gusto de", "me gusta"), ("me gusta los tacos", "me gustan los tacos"), ("a mí también (depois de negativa)", "a mí tampoco"), ("me gusta de viajar", "me gusta viajar")],
    },
    # ---------------------------------------------------------------- AULA 9
    {
        "n": 9,
        "titulo": "Família e pessoas próximas: mi, tu, su",
        "lead": "Apresentar a família e as pessoas próximas com os possessivos. O «su» serve para muita gente: o contexto decide.",
        "historia": [
            mc("«Mis padres» são:", ["meu pai e minha mãe", "padres da igreja", "só o meu pai"], 0),
            fill("___ hermanos viven en Rio. (meus)", ["Mis"]),
            fill("¿Cómo se llama ___ madre? (tú)", ["tu"]),
            fill("___ casa es grande. (nossa)", ["Nuestra"]),
            corr("Corrija: «La mi hermana es médica».", ["Mi hermana es médica"], "Sem artigo antes do possessivo."),
            mc("O filho do meu irmão é meu:", ["sobrino", "primo", "nieto"], 0),
        ],
        "trabalho": [
            fill("«Nosso cliente principal é de Bogotá»: ___ cliente principal es de Bogotá.", ["Nuestro"]),
            mc("«A empresa e seus fornecedores»:", ["La empresa y sus proveedores", "La empresa y su proveedores", "La empresa y los sus proveedores"], 0, "Plural: sus."),
            mc("Um cliente diz: «Le envío mi propuesta y la de mi equipo». Ele vai enviar:", ["a proposta dele e a da equipe dele", "a sua proposta", "a proposta da sua equipe"], 0, "Mi = meu, minha."),
            mc("Num e-mail para um cliente (usted): «Gracias por ___ tiempo».", ["su", "tu", "vuestro"], 0, "Com usted: su."),
            mc("Uma colega conta: «Mi pareja trabaja en Santiago». «Pareja» é:", ["companheiro ou companheira", "uma dupla de trabalho", "o par de sapatos"], 0, "Pareja serve para companheiro ou companheira, de qualquer gênero."),
            fill("«Nossas equipes trabalham juntas»: ___ equipos trabajan juntos.", ["Nuestros"], "Equipo é masculino: nuestros equipos."),
        ],
        "missao": ("Uma foto, várias pessoas", "Escolha uma foto sua com pessoas próximas, da família ou amigos. Grave um áudio apresentando cada pessoa: quem é, onde vive, o que faz."),
        "prof": ("A sua equipe e os seus clientes", "Apresente por escrito a sua equipe e dois clientes ou parceiros usando possessivos: «Mi jefa se llama…», «Nuestro cliente principal es…», «Sus oficinas están en…»."),
        "ficha": tabela(["Família", "Masculino", "Feminino"], [["pais", "el padre · papá", "la madre · mamá"], ["irmãos", "el hermano", "la hermana"], ["filhos", "el hijo", "la hija"], ["avós", "el abuelo", "la abuela"], ["sobrinhos", "el sobrino", "la sobrina"], ["casal", "el esposo · la pareja", "la esposa · la pareja"]])
        + tabela(["De quem", "Singular", "Plural"], [["meu, minha", "mi", "mis"], ["seu, sua (de tú)", "tu", "tus"], ["dele, dela, de usted, deles", "su", "sus"], ["nosso, nossa", "nuestro, nuestra", "nuestros, nuestras"]]),
        "banco": ["la familia", "los padres", "hermano", "hermana", "hijo", "hija", "sobrino", "pareja", "esposo", "suegra", "cuñado", "mi", "tu", "su", "nuestro"],
        "erros": [("la mi madre", "mi madre"), ("padres (para só o pai)", "padre"), ("nuestro casa", "nuestra casa")],
        "nota": "Família pode ser tema sensível. A Missão aceita amigos e qualquer pessoa próxima.",
    },
    # ---------------------------------------------------------------- AULA 10
    {
        "n": 10,
        "titulo": "Muy ou mucho? E como devolver a pergunta",
        "lead": "Muy antes de adjetivo, mucho depois de verbo. E os três recursos que transformam respostas em conversa.",
        "historia": [
            fill("Estoy ___ bien.", ["muy"]),
            fill("Me gusta ___ la ciudad.", ["mucho"]),
            fill("Hay ___ gente aquí.", ["mucha"], "Gente é feminino: mucha gente."),
            fill("Tengo ___ amigos en México.", ["muchos"]),
            corr("Corrija: «La comida está muy mucho buena».", ["La comida está muy buena"], "Muy mucho não existe."),
            mc("Para devolver a pergunta a Don Alberto:", ["¿Y usted?", "¿Y tú?"], 0, embaralhar=False),
        ],
        "trabalho": [
            mc("«Temos muito trabalho este trimestre»:", ["Tenemos mucho trabajo este trimestre.", "Tenemos muy trabajo este trimestre.", "Tenemos muchos trabajo este trimestre."], 0, "Antes de substantivo: mucho, concordando."),
            mc("«A apresentação foi muito boa» (do jeito mais simples por enquanto):", ["La presentación es muy buena.", "La presentación es mucho buena.", "La presentación es muy bien."], 0, "Muy + adjetivo: muy buena. Bien é advérbio."),
            fill("«Muito obrigado pela reunião»: ___ gracias por la reunión.", ["Muchas"], "Muchas gracias."),
            mc("Para manter a conversa depois de responder a um cliente:", ["¿Y ustedes? ¿Cómo va el proyecto en Lima?", "Fin.", "Bueno, eso."], 0, "Devolver e abrir: ¿y ustedes? + pergunta aberta."),
            mc("Uma reação natural quando o cliente conta uma boa notícia:", ["¡Qué bien! ¡Felicidades!", "Muy mucho bien.", "Está bueno."], 0, "Reagir também é parte da conversa."),
            mc("«Sinto falta da minha equipe de São Paulo» (América Latina):", ["Extraño a mi equipo de São Paulo.", "Extraño mi equipo de São Paulo a.", "Echo menos mi equipo de São Paulo."], 0, "Extrañar a + pessoa. Na Espanha: echar de menos."),
        ],
        "missao": ("A conversa com o Diego", "Faça a conversa com o Diego da aplicação, gravando as suas respostas sem roteiro escrito. Se puder, faça com alguém de verdade."),
        "prof": ("Os dois minutos antes da reunião", "Muitas reuniões começam com dois minutos de conversa. Escreva quatro perguntas que você pode fazer a um cliente ou colega estrangeiro (semana, cidade, fim de semana, projeto) e uma reação para cada resposta."),
        "ficha": tabela(["Antes de", "Use", "Exemplo"], [["adjetivo, advérbio", "muy", "muy bien · muy amable"], ["depois de verbo", "mucho", "trabajo mucho"], ["substantivo", "mucho, -a, -os, -as", "mucho trabajo · mucha gente"], ["sozinho, como resposta", "mucho", "— ¿Te gusta? — Mucho."]])
        + '<div class="card dark"><p class="k">Manter a conversa</p><p style="margin:0">Devolver: ¿y tú? · ¿y usted? · Reagir: ¡qué bien!, ¿de verdad?, ¡qué interesante! · Puxar assunto: ¿y qué haces este fin de semana?</p></div>',
        "banco": ["muy", "mucho", "mucha gente", "muchas gracias", "¿y tú?", "¿y usted?", "¡qué bien!", "¿de verdad?", "¡qué interesante!", "extrañar", "echar de menos"],
        "erros": [("muy mucho", "muy / mucho"), ("mucho bien", "muy bien"), ("mucho gente", "mucha gente")],
    },
]


def pronuncia():
    secoes = [{"titulo": "R simples, R forte e J", "sub": "Use o botão Ouvir em cada exercício.", "itens": [
        mc("Ouça. Qual palavra você ouviu?", ["perro (cachorro)", "pero (mas)"], 0, "RR vibra várias vezes.", audio="perro", embaralhar=False),
        mc("Ouça. Qual palavra você ouviu?", ["pero (mas)", "perro (cachorro)"], 0, "R simples: uma batidinha.", audio="pero", embaralhar=False),
        mc("Ouça. Qual palavra você ouviu?", ["carro", "caro"], 0, audio="carro", embaralhar=False),
        mc("O R no começo da palavra («Rocha», «rápido»):", ["vibra, como o RR", "é a batidinha simples", "sai da garganta, como no Rio"], 0, "R inicial = R forte, vibrante."),
        mc("O R de «rato» no Rio de Janeiro é um bom ponto de partida para:", ["o J do espanhol", "o R do espanhol", "o LL do espanhol"], 0, "Use esse som no J (trabajo, hijo) e não no R."),
        mc("Ouça. O J de «trabajo» soa:", ["na garganta", "como o J de «janela»"], 0, audio="trabajo", embaralhar=False),
        mc("O R no fim de «trabajar»:", ["batidinha simples", "R puxado do interior", "aspirado, como no Rio"], 0, "No fim da palavra, uma batidinha."),
        mc("Ouça. Qual frase você ouviu?", ["El perro corre por el jardín.", "El pero corre por el jardín."], 0, audio="El perro corre por el jardín.", embaralhar=False),
        multi("Marque as palavras com R forte (vibrante):", ["Rocha", "barrio", "hora", "Enrique"], [0, 1, 3], "Começo de palavra, RR e depois de N vibram. Hora tem R simples."),
        mc("Ouça. Qual nome você ouviu?", ["Rocha", "Ocha"], 0, "Com o R vibrante: Rocha.", audio="Camila Rocha", embaralhar=False),
    ]}]
    url, total = pagina_exercicios("m2/pronuncia-exercicios.html", "Módulo 2 · Pronúncia em Foco", "R, RR e J", "O seu R carioca serve para o J, não para o R. Dez exercícios de escuta.", secoes, R)
    return {"titulo": "Pronúncia em Foco · R, RR e J", "itens": [video("Vídeo · R, RR e J"), {"tipo": "html", "titulo": f"Exercícios de escuta ({total})", "url": url, "exercicios": total}]}


def aprender():
    url = pagina_livre("m2/aprender-a-aprender.html", "Módulo 2 · Aprender a Aprender", "Revisar sem começar do zero", "Esquecer faz parte de aprender. A pergunta é como trazer de volta em poucos minutos.",
        '<div class="grid2"><div class="card"><p class="k">Espaçada</p><h3>Hoje → 1 dia → 3 dias → 7 dias</h3><p style="margin:0">Revisões curtas em intervalos crescentes firmam mais do que uma hora seguida.</p></div>'
        + '<div class="card dark"><p class="k">Ativa</p><h3>Tente lembrar antes de ouvir</h3><p style="margin:0">No Banco Chave, cubra o espanhol, olhe o português e diga em voz alta antes de tocar o áudio. Errou? É aí que a memória se fortalece.</p></div></div>'
        + '<div class="missao"><p class="k">Missão Chave · esta semana</p><h3>Dez favoritos</h3><p style="margin:0">Marque dez favoritos no Banco Chave com os verbos e expressões que você mais erra. Nas próximas três sessões, comece pelos cinco minutos de revisão ativa.</p></div>'
        + '<div class="card"><p class="k">No trabalho</p><p style="margin:0">Use a mesma lógica com o vocabulário da sua área: antes de uma reunião em espanhol, cinco minutos revisando as palavras que você vai precisar (o nome dos produtos, os números do trimestre, as datas).</p></div>', R)
    return {"titulo": "Aprender a Aprender · Revisar sem começar do zero", "itens": [video("Vídeo · Revisão espaçada e ativa"), {"tipo": "html", "titulo": "Revisar sem começar do zero", "url": url}]}


def imersao():
    secoes = [{"titulo": "Expressões mexicanas", "sub": "Para reconhecer quando ouvir.", "itens": [
        mc("«¡Qué padre!»", ["Que legal!", "Que pai!", "Que absurdo!"], 0),
        mc("«Ahorita»", ["agora, ou daqui a pouco", "uma hora exata", "ontem"], 0, "Na dúvida, pergunte: ¿ahorita ahorita?"),
        mc("«Chamba»", ["trabalho", "festa", "chuva"], 0),
        mc("«¿Mande?»", ["Como? (pedindo para repetir, com educação)", "Pode mandar o e-mail?", "Quem manda aqui?"], 0, "Muito usado no México no lugar de ¿perdón?"),
        mc("«¡Órale!»", ["Opa! Combinado! Vamos!", "Que horror!", "Silêncio!"], 0),
        mc("«La sala de juntas»", ["a sala de reuniões", "a sala de estar", "a recepção"], 0),
        mc("Num restaurante, antes de pedir a salsa, vale perguntar:", ["¿Pica?", "¿Quema?", "¿Es caliente?"], 0, "¿Pica? = é apimentado?"),
        mc("«La comida», no México, acontece:", ["entre duas e quatro da tarde", "às sete da noite", "às dez da manhã"], 0),
    ]}]
    url, total = pagina_exercicios("m2/imersao.html", "Módulo 2 · Imersão Cultural", "México: a cidade da Camila",
        "Coyoacán, o bairro do Diego, onde fica a Casa Azul, o museu de Frida Kahlo; o metrô da manhã; as taquerías em quase toda esquina. Para o contato leve da semana: o filme <i>Roma</i>, de Alfonso Cuarón, e as músicas de Café Tacvba e Julieta Venegas.", secoes, R)
    return {"titulo": "Imersão Cultural · México", "itens": [{"tipo": "html", "titulo": f"Expressões mexicanas ({total})", "url": url, "exercicios": total}]}


def revisao():
    boletim = pagina_livre("m2/revisao-boletim.html", "Módulo 2 · Revisão Inteligente", "O boletim saiu: «Gente de Casa Común»", "Leia o texto da Valeria e encontre um exemplo de cada aula.",
        f'<button type="button" class="ouvir" data-ouvir="{audio("Camila es brasileña, de Belo Horizonte, y tiene treinta y un años. Es diseñadora y trabaja a distancia para una agencia de publicidad. Vive en la Ciudad de México por tres meses. Se levanta temprano, se ducha, desayuna y llega a Casa Común a las nueve, casi siempre. Empieza a trabajar a las nueve y media y termina tarde, por la diferencia de horario con Brasil. Practica yoga dos veces por semana y camina todos los días. Casi nunca cocina: prefiere comer fuera. Le encantan los tacos, pero no le gusta mucho el picante. Sus padres viven en Belo Horizonte y tiene un hermano, Lucas. Extraña mucho a su familia, y el pan de queso. ¡Bienvenida, Camila!")}">▶ Ouvir o boletim</button>'
        + '<div class="card"><p class="k">Gente de Casa Común</p><h3>Camila Rocha</h3><p class="es">Camila es brasileña, de Belo Horizonte, y tiene treinta y un años. Es diseñadora y trabaja a distancia para una agencia de publicidad. Vive en la Ciudad de México por tres meses.</p><p class="es">Se levanta temprano, se ducha, desayuna y llega a Casa Común a las nueve… ¡casi siempre! Empieza a trabajar a las nueve y media y termina tarde, por la diferencia de horario con Brasil.</p><p class="es">Practica yoga dos veces por semana y camina todos los días. Casi nunca cocina: prefiere comer fuera. Le encantan los tacos, pero no le gusta mucho el picante.</p><p class="es" style="margin:0">Sus padres viven en Belo Horizonte y tiene un hermano, Lucas. Extraña mucho a su familia… y el pan de queso. ¡Bienvenida, Camila!</p></div>'
        + '<div class="card"><p class="k">Caça</p><ul class="lista"><li>um verbo em -ar (Aula 1)</li><li>um em -er ou -ir (Aula 2)</li><li>um reflexivo (Aula 3)</li><li>um horário (Aula 4)</li><li>uma frequência (Aula 5)</li><li>um verbo que muda (Aula 6)</li><li>tener com idade (Aula 7)</li><li>gustar ou encantar (Aula 8)</li><li>um possessivo (Aula 9)</li><li>mucho (Aula 10)</li></ul></div>'
        + semaforo([("Conjugar verbos regulares", "Aulas 1 e 2"), ("Contar minha manhã", "Aula 3"), ("Dizer as horas e marcar reuniões", "Aula 4"), ("Dizer com que frequência", "Aula 5"), ("Usar quiero, puedo, pido", "Aula 6"), ("Dizer idade e sensações com tener", "Aula 7"), ("Falar do que gosto", "Aula 8"), ("Apresentar família e equipe", "Aula 9"), ("Manter uma conversa com ¿y tú?", "Aula 10")]), R)
    secoes = [{"titulo": "Quiz final", "itens": [
        fill("Nosotros ___ (vivir) en Brasil.", ["vivimos"]),
        fill("Yo ___ (levantarse) a las siete.", ["me levanto"]),
        mc("5:30 →", ["Son las cinco y media.", "Es las cinco y media.", "Son las cinco y medio."], 0),
        fill("Ellos ___ (poder) venir.", ["pueden"]),
        mc("«Estou com frio»:", ["Tengo frío.", "Estoy con frío.", "Soy frío."], 0),
        fill("Me ___ (gustar) las películas.", ["gustan"]),
        fill("___ padres viven en Recife. (meus)", ["Mis"]),
        fill("La comida está ___ buena.", ["muy"]),
        mc("Para propor uma reunião a um cliente:", ["¿Le queda bien el martes a las diez?", "¿Te queda bien el martes en las diez, usted?", "¿Le queda bien en el martes a diez?"], 0),
        mc("«Fazemos o fechamento uma vez por mês»:", ["Hacemos el cierre una vez al mes.", "Hacemos el cierre una vez en el mes.", "Hazemos el cierre una vez al mes."], 0),
        mc("«Os clientes gostam muito da proposta»:", ["A los clientes les gusta mucho la propuesta.", "Los clientes gustan mucho la propuesta.", "A los clientes les gustan muy la propuesta."], 0),
        mc("«Tenho outra reunião às quatro»:", ["Tengo otra reunión a las cuatro.", "Estoy otra reunión a las cuatro.", "Tengo otra reunión en las cuatro."], 0),
    ]}]
    url, total = pagina_exercicios("m2/revisao-quiz.html", "Módulo 2 · Revisão Inteligente", "Quiz do Módulo 2", "Doze questões sobre o módulo inteiro.", secoes, R)
    return {"titulo": "Revisão Inteligente", "itens": [video("Vídeo · O boletim publicado"), {"tipo": "html", "titulo": "O boletim e o semáforo", "url": boletim}, {"tipo": "html", "titulo": f"Quiz do módulo ({total})", "url": url, "exercicios": total}]}


def checkpoint():
    perguntas = [("¿A qué te dedicas y dónde trabajas?", "Soy diseñadora. Trabajo a distancia para una agencia."), ("¿A qué hora empiezas a trabajar?", "Empiezo a las nueve y media."), ("¿Qué haces por la mañana?", "Me levanto temprano, me ducho y desayuno."), ("¿Con qué frecuencia haces ejercicio?", "Practico yoga dos veces por semana."), ("¿Qué haces los fines de semana?", "Voy al parque y a veces voy al cine."), ("¿Qué te gusta comer?", "Me encantan los tacos, pero no me gusta el picante."), ("¿Tienes hermanos?", "Sí, tengo un hermano. Se llama Lucas."), ("¿Qué extrañas de tu ciudad? ¿O qué te gusta de ella?", "Extraño a mi familia y el pan de queso.")]
    linhas = [[f'<button type="button" class="ouvir" data-ouvir="{audio(p)}">▶</button> <span class="es">{p}</span>', r] for p, r in perguntas]
    url = pagina_livre("m2/checkpoint.html", "Módulo 2 · Checkpoint", "Minha semana em espanhol", "A Valeria agora entrevista você. Ouça cada pergunta e responda em áudio, uma de cada vez. Grave e envie no item seguinte, «Entregar o Checkpoint». Não tem nota: a correção humana chega no Desafio da Base.",
        tabela(["A Valeria pergunta", "Modelo da Camila"], linhas)
        + '<div class="grid2"><div class="card"><p class="k">Versões</p><ul class="lista"><li><b>Guiada:</b> por escrito, com os modelos visíveis.</li><li><b>Oral (recomendada):</b> em áudio, sem ler.</li><li><b>Ampliada:</b> depois de cada resposta, uma pergunta de volta («¿y tú?»).</li></ul></div>'
        + '<div class="card dark"><p class="k">Versão profissional</p><p style="margin:0">Responda às perguntas 1, 2, 4 e 5 pensando no seu trabalho: cargo, horário, rotinas fixas da equipe e o que você faz quando não está trabalhando.</p></div></div>'
        + '<div class="card"><p class="k">Antes de enviar</p>' + checklist(["Usei o pronome nos reflexivos (me levanto)", "Usei «tengo» para idade e sensações", "Usei «me gusta» ou «me gustan», nunca «yo gusto»", "Usei «nosotros vivimos», e não «vivemos»", "Fiz o R forte em palavras como «Rocha» e «perro»", "Comparei com o meu áudio «Mi lunes» da Aula 4"]) + "</div>", R)
    return {"titulo": "Checkpoint · Minha semana em espanhol", "itens": [
        {"tipo": "html", "titulo": "Checkpoint: as perguntas da Valeria", "url": url},
        missao("Entregar o Checkpoint do Módulo 2", "Responda em áudio às oito perguntas da Valeria, uma depois da outra, como numa conversa. Ouça cada pergunta na página anterior, pause e responda. Até três minutos no total.\n\nNa versão ampliada, depois de cada resposta, faça uma pergunta de volta («¿y tú?»).", ("A sua semana de trabalho", "Nas perguntas 1, 2, 4 e 5, responda pensando no seu trabalho: cargo, horário, rotinas fixas da equipe."), "audio"),
    ]}


def gerar():
    fases = [{"titulo": "Boas-vindas", "itens": [video("Vídeo 0 · A semana começa")]}]
    for a in AULAS:
        fases.append(montar_aula(2, a, R))
        if a["n"] == 4:
            fases.append(pronuncia())
        if a["n"] == 6:
            fases.append(aprender())
    fases += [imersao(), revisao(), checkpoint()]
    return {
        "titulo": "Módulo 2 · Minha rotina, meu trabalho",
        "descricao": "A primeira semana da Camila: presente dos verbos, rotina, horários e agenda, frequência, gostos, família e como sustentar uma conversa sobre você.",
        "capa": "/capas-prontas/pronta-ondas.jpg",
        "fases": fases,
    }
