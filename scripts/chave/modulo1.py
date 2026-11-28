"""Espanhol Chave · Módulo 1 · Primeiros contatos (roteiro de 27/11/2026)."""
from base import missao, checklist, corr, fill, match, mc, montar_aula, multi, order, semaforo, vf, video
from gerar import audio, pagina_exercicios, pagina_livre, tabela

R = "Espanhol Chave · Módulo 1"

AULAS = [
    # ---------------------------------------------------------------- AULA 1
    {
        "n": 1,
        "entrega": "texto",
        "titulo": "O espanhol não é português com sotaque",
        "lead": "Separe o que é transparente do que engana. Em reuniões e e-mails, os falsos amigos são os erros que mais confundem.",
        "historia": [
            mc("Na ficha do Casa Común, «apellido» significa:", ["sobrenome", "apelido", "nome do meio"], 0, "Apellido é o sobrenome. O nosso apelido é <b>apodo</b> ou <b>sobrenombre</b>."),
            mc("«Su oficina es la número tres.» A Lucía está falando de:", ["um escritório", "uma oficina mecânica", "uma loja"], 0, "Oficina é escritório. Oficina mecânica é <b>taller</b>."),
            mc("«Espera un rato, por favor.» Ela pede:", ["um momento de espera", "cuidado com um rato", "silêncio"], 0, "Un rato é um momento, um tempinho."),
            mc("«La comida está exquisita.» A comida está:", ["deliciosa", "estranha", "fria"], 0, "Exquisito é um elogio: delicioso, refinado."),
            match("Ligue cada campo da ficha ao português:", [["correo electrónico", "e-mail"], ["fecha", "data"], ["ciudad", "cidade"], ["apellido", "sobrenome"]], "Repare: fecha é data, não fechamento."),
            vf("Falar português devagar é suficiente para um hispanofalante entender tudo.", False, "Ajuda a entender um pouco, mas os falsos amigos e a pronúncia atrapalham. Por isso o portunhol cansa quem ouve."),
        ],
        "trabalho": [
            mc("No cadastro de fornecedores de um cliente mexicano aparece o campo «Fecha de alta». «Fecha» é:", ["data", "fechamento", "prazo final"], 0, "Fecha de alta é a data de cadastro. «Dar de alta» é registrar."),
            mc("Um colega de Bogotá escreve no chat: «Te envío el informe en un rato». Você recebe o relatório:", ["daqui a pouco", "no fim do mês", "só se você pedir de novo"], 0, "En un rato: daqui a pouco, em alguns minutos."),
            mc("No onboarding, o RH da filial pede «nombre y apellidos». Por que «apellidos» no plural?", ["Em muitos países se usam dois sobrenomes, o do pai e o da mãe", "É um erro de digitação", "Eles querem os seus apelidos"], 0, "No México, na Colômbia ou na Espanha, a pessoa costuma ter dois sobrenomes: García López. Em documentos, informe os dois, se tiver."),
            mc("Num jantar com clientes, o diretor comenta: «Este vino es exquisito». Ele está:", ["elogiando o vinho", "criticando o vinho", "pedindo outro vinho"], 0, "Exquisito é um elogio. «Esquisito», no sentido do português, seria <b>raro</b> ou <b>extraño</b>."),
            mc("Uma colega de Lima conta na reunião de equipe: «¡Estoy embarazada!». Ela está:", ["grávida", "envergonhada", "atrasada"], 0, "Embarazada é grávida. Envergonhada é <b>avergonzada</b>. Esse é um dos falsos amigos mais conhecidos."),
            mc("No e-mail: «Nuestra oficina de Monterrey abre a las ocho». A empresa tem em Monterrey:", ["um escritório", "uma oficina de carros", "um depósito"], 0, "Oficina continua sendo escritório, também no contexto corporativo."),
        ],
        "missao": ("Caçada de palavras", "Abra o site de um restaurante, uma loja ou um jornal em espanhol. Encontre cinco palavras transparentes e uma que pareça falso amigo. Escreva as seis com o que você acha que significam e envie aqui."),
        "prof": ("O site de um concorrente ou cliente", "Faça a mesma caçada no site de uma empresa do seu setor no México, na Colômbia ou na Espanha: cinco palavras que você entendeu de cara e uma que te enganou. É um ótimo jeito de começar a montar o vocabulário da sua área."),
        "ficha": tabela(["Espanhol", "Parece", "Significa"], [["apellido", "apelido", "sobrenome"], ["oficina", "oficina mecânica", "escritório"], ["un rato", "um rato", "um momento"], ["exquisito", "esquisito", "delicioso"], ["embarazada", "envergonhada", "grávida"]])
        + '<div class="card"><p class="k">Três tipos de palavras</p><ul class="lista"><li><b>Transparentes:</b> nacionalidad, teléfono, empresa.</li><li><b>Parecidas:</b> correo electrónico (e-mail), fecha (data).</li><li><b>Perigosas:</b> os falsos amigos. Desconfie do que parece igual.</li></ul></div>',
        "banco": ["nombre", "apellido", "apodo", "oficina", "correo electrónico", "fecha", "un rato", "exquisito", "embarazada", "bienvenido", "bienvenida"],
        "erros": [("sobrenombre (para sobrenome)", "apellido"), ("oficina (para oficina mecânica)", "taller"), ("estoy embarazada (para envergonhada)", "estoy avergonzada")],
    },
    # ---------------------------------------------------------------- AULA 2
    {
        "n": 2,
        "titulo": "Os sons que mudam tudo",
        "lead": "Vogais limpas, T e D sem chiado, H mudo, J de garganta, Ñ e LL. Use o botão Ouvir antes de responder.",
        "historia": [
            mc("Em «hola», o H:", ["não se pronuncia", "soa como o R de «rato»", "soa como o H do inglês"], 0, "O H do espanhol é sempre mudo: hola, hotel, hasta."),
            mc("Ouça a senha do wifi. No fim de «noche», você ouve:", ["e", "i"], 0, "No espanhol, o E final continua E: noche, nueve, siete.", audio="jardín de noche", embaralhar=False),
            mc("Ouça. O D de «día» soa:", ["seco, como em «dado»", "chiado, como no «dia» carioca"], 0, "T e D ficam secos antes de I: día, tiempo.", audio="Buenos días.", embaralhar=False),
            mc("Qual destas palavras tem o som do nosso NH?", ["mañana", "hola", "llamo"], 0, "Ñ = NH: España, mañana, contraseña."),
            mc("«Jardín» começa com um som:", ["forte, que sai da garganta", "igual ao J de «janela»"], 0, "O J do espanhol, e o G antes de E e I, soam na garganta, parecido com o R de «rato» no Rio."),
            multi("Marque as palavras em que o H não se pronuncia:", ["hasta", "hotel", "hora", "jardín"], [0, 1, 2], "Todo H é mudo. Jardín não tem H: tem J, que soa forte."),
        ],
        "trabalho": [
            mc("Você vai citar numa call o «Grupo Herrera», um cliente. Como sai o H?", ["Mudo: «errera»", "Aspirado, como o R de «rato»", "Como o H do inglês"], 0, "H mudo também em nomes próprios: Herrera, Hernández, Honduras."),
            mc("Ouça. Em «gerente», o G soa:", ["forte, na garganta, como o J", "como o G de «gente» em português"], 0, "G antes de E e I tem o som do J: gerente, gestión, Argentina.", audio="la gerente de proyectos", embaralhar=False),
            mc("Ouça e escolha como se escreve:", ["contraseña", "contrasenha", "contrasella"], 0, "Contraseña, com Ñ: é a senha.", audio="la contraseña"),
            mc("Em «Me llamo Ana», o LL soa:", ["parecido com um «j» bem suave", "como o LH de «olho»", "como um L comum"], 0, "LL e Y soam quase iguais e variam por país. Na Argentina, por exemplo, viram um som de «ch» suave."),
            mc("Ouça e escolha o que você ouviu:", ["Buenos días, equipo.", "Buenas días, equipo.", "Bueno día, equipo."], 0, "Buenos días: masculino e plural. Vamos ver isso na próxima aula.", audio="Buenos días, equipo."),
            mc("Ouça a frase de uma apresentação. Qual palavra termina com som de O, e não de U?", ["todas: Pablo, mucho e proyecto", "nenhuma", "só Pablo"], 0, "O O final do espanhol continua O. «Pablu», «muchu» denunciam o sotaque brasileiro.", audio="Pablo trabaja mucho en el proyecto."),
        ],
        "missao": ("Grave e compare", "Grave as seis palavras da aula (hola, día, noche, jardín, mañana, me llamo) e a senha do wifi, «jardín de noche». Depois, ouça o Banco Chave e compare: qual som ainda está com sotaque de português?"),
        "prof": ("O seu nome e o da sua empresa", "Grave como você diz o seu nome completo, o nome da sua empresa e da sua cidade em espanhol. Repare em H, J, G e nas vogais finais. É a primeira coisa que os seus clientes vão ouvir de você."),
        "ficha": tabela(["Som", "Exemplos", "Cuidado"], [["Vogais", "noche, mucho", "sem i e u no fim, sem nasal"], ["T e D", "día, tiempo", "sem tch e dj"], ["H", "hola, hasta", "sempre mudo"], ["J, GE, GI", "jardín, gerente", "som de garganta"], ["Ñ", "mañana, España", "= nh"], ["LL e Y", "me llamo, yo", "varia por país"]]),
        "banco": ["hola", "día", "noche", "tiempo", "jardín", "gerente", "mañana", "contraseña", "me llamo", "yo", "calle", "hasta luego"],
        "erros": [("«nochi», «Pablu»", "noche, Pablo"), ("«djía», «tchiempo»", "día, tiempo"), ("hola com H pronunciado", "hola com H mudo")],
        "nota": "A aula de Pronúncia em Foco deste módulo treina a produção das vogais.",
    },
    # ---------------------------------------------------------------- AULA 3
    {
        "n": 3,
        "titulo": "Hola, buenas: cumprimentar e se despedir",
        "lead": "Cumprimentos e despedidas de acordo com o horário e a situação, do corredor do coworking à call com cliente.",
        "historia": [
            mc("Às 10h, ao chegar ao Casa Común:", ["Buenos días.", "Buenas días.", "Buenas noches."], 0, "Buenos días, no masculino, porque día é masculino."),
            mc("Às 16h, encontrando o Diego na cozinha:", ["Buenas tardes.", "Buenos días.", "Buenas noches."], 0, "Buenas tardes vai do almoço até escurecer."),
            mc("Às 21h, chegando a um jantar:", ["Buenas noches.", "Buenas tardes.", "Hasta mañana."], 0, "Buenas noches serve para chegar e para sair à noite."),
            fill("Complete: «Buen___ días».", ["Buenos"], "Escreva a palavra inteira: Buenos."),
            mc("Você vai ver a pessoa amanhã. Para se despedir:", ["Hasta mañana.", "Adiós para siempre.", "Buenos días."], 0, "Hasta mañana. Hasta luego e nos vemos servem para qualquer momento."),
            mc("A resposta natural para «¿Qué tal?»:", ["Bien, gracias.", "Me llamo Camila.", "Buenas noches."], 0, "¿Qué tal? pergunta se está tudo bem."),
        ],
        "trabalho": [
            mc("Às 9h em São Paulo, você abre uma call com o time de Lima, onde são 7h. Você diz:", ["Buenos días a todos.", "Buenas tardes a todos.", "Buenas noches a todos."], 0, "O cumprimento segue o horário de quem você cumprimenta. Em Lima ainda é manhã. Com fusos diferentes, «Hola a todos» também resolve."),
            mc("Às 17h, você encerra uma call com um cliente que vai rever na quinta. Para se despedir:", ["Hasta el jueves.", "Hasta mañana.", "Buenas noches."], 0, "Hasta + dia: hasta el jueves, hasta el lunes."),
            mc("No WhatsApp, às 15h, um colega mexicano escreve: «¡Buenas! ¿Tienes un minuto?». O «buenas»:", ["é informal e natural entre colegas", "é grosseiro", "só se usa à noite"], 0, "Buenas sozinho é o jeito curto e informal de qualquer um dos três cumprimentos."),
            mc("Para fechar um e-mail a um cliente que você ainda não conhece pessoalmente:", ["Saludos cordiales,", "¡Chao!", "Besos,"], 0, "Saludos cordiales é o fechamento neutro e profissional. Chao fica para colegas próximos."),
            corr("Corrija a despedida que um brasileiro escreveu no chat: «Até luego, equipo».", ["Hasta luego, equipo", "Hasta luego equipo"], "Hasta, com H mudo."),
            order("Monte a abertura de uma reunião:", "Buenas tardes, ¿qué tal todo?", "Abrir com cumprimento + ¿qué tal? é natural antes de entrar na pauta."),
        ],
        "missao": ("Os três cumprimentos do dia", "Hoje, a cada mudança de período, diga o cumprimento em espanhol, em voz alta. No fim do dia, grave um áudio com os três e uma despedida."),
        "prof": ("A abertura das suas reuniões", "Escreva a abertura e o fechamento de uma reunião real da sua semana em espanhol: o cumprimento certo para o horário de quem estará na call e a despedida até a próxima data («hasta el martes»)."),
        "ficha": tabela(["Quando", "Cumprimento", "Despedida"], [["Manhã", "buenos días", "hasta luego · nos vemos"], ["Tarde", "buenas tardes", "hasta mañana · hasta el lunes"], ["Noite", "buenas noches", "buenas noches"], ["Qualquer hora", "hola · buenas", "chao · adiós"]])
        + '<div class="card"><p class="k">Por escrito</p><p style="margin:0">Fechamento neutro de e-mail: <span class="es">Saludos cordiales</span>. Entre colegas: <span class="es">Saludos</span> ou <span class="es">Un abrazo</span>.</p></div>',
        "banco": ["hola", "buenas", "buenos días", "buenas tardes", "buenas noches", "¿qué tal?", "todo bien", "gracias", "hasta luego", "hasta mañana", "nos vemos", "saludos cordiales"],
        "erros": [("buenas días", "buenos días"), ("até luego", "hasta luego"), ("tchau", "chao (chau na Argentina)")],
    },
    # ---------------------------------------------------------------- AULA 4
    {
        "n": 4,
        "entrega": "texto",
        "titulo": "Tú ou usted: com quem você está falando",
        "lead": "Escolher o tratamento certo é a primeira decisão de qualquer conversa profissional em espanhol.",
        "historia": [
            mc("Com Don Alberto, o dono do prédio, de 68 anos:", ["¿Cómo está usted?", "¿Cómo estás?", "¿Cómo estás usted?"], 0, "Usted para pessoas mais velhas e situações formais."),
            mc("O verbo de usted é igual ao de:", ["él, ella", "tú", "yo"], 0, "¿Cómo está usted? ¿Cómo está él? Mesmo verbo."),
            mc("«Vocês», na América Latina:", ["ustedes", "vosotros", "usted"], 0, "Ustedes serve para qualquer grupo, formal ou informal. Vosotros é da Espanha."),
            fill("Complete: ¿Cómo ___ tú?", ["estás"], "Com tú, o verbo termina em S: estás."),
            corr("Corrija: «¿Cómo estás usted?»", ["¿Cómo está usted?", "Cómo está usted"], "Usted pede o verbo de ele: está."),
            match("Ligue:", [["nós", "nosotros"], ["eles", "ellos"], ["ela", "ella"], ["vocês", "ustedes"]]),
        ],
        "trabalho": [
            mc("Primeira call com a diretora de compras de um cliente em Bogotá:", ["usted", "tú"], 0, "Na Colômbia, usted é muito usado, inclusive entre colegas. Na dúvida, comece com usted e espere a pessoa propor o tú.", embaralhar=False),
            mc("Um colega mexicano da sua área, da sua idade, que já disse «háblame de tú»:", ["tú", "usted"], 0, "Ele propôs o tú. Continuar com usted soaria distante.", embaralhar=False),
            mc("Para perguntar a um grupo de clientes, no início da apresentação, como estão:", ["¿Cómo están?", "¿Cómo estáis?", "¿Cómo está ustedes?"], 0, "Ustedes pede o verbo de ellos: están. Estáis é de vosotros, usado na Espanha."),
            mc("Num e-mail ao diretor regional, que você não conhece:", ["Espero que esté bien.", "Espero que estés bien."], 0, "Esté é a forma de usted. Por enquanto, guarde a frase pronta: «Espero que esté bien».", embaralhar=False),
            fill("Transforme para usted: «¿Y tú?» →", ["¿Y usted?", "Y usted"], "Para devolver a pergunta com respeito: ¿Y usted?"),
            vf("Em reuniões com a Espanha, o normal é usar tú com colegas e até com clientes mais jovens.", True, "Na Espanha o tú é muito mais comum do que na América Latina, inclusive no trabalho. Ainda assim, com um cliente sênior, comece com usted."),
        ],
        "missao": ("Tú ou usted na sua vida", "Escreva o nome de cinco pessoas da sua vida: chefe, colega, vizinho, amigo, alguém da família. Ao lado de cada uma: tú ou usted, e por quê."),
        "prof": ("O mapa do seu trabalho", "Liste os contatos hispânicos com quem você fala (ou vai falar) no trabalho: clientes, fornecedores, colegas de outras filiais. Para cada um: tú ou usted? E qual país? Guarde a lista: ela vai servir no Módulo 11, quando você estudar registro formal."),
        "ficha": tabela(["Pessoa", "Pronome", "Exemplo"], [["eu", "yo", "Yo estoy bien."], ["você informal", "tú", "¿Cómo estás?"], ["você formal", "usted", "¿Cómo está usted?"], ["ele, ela", "él, ella", "¿Cómo está ella?"], ["nós", "nosotros, nosotras", "Estamos bien."], ["vocês", "ustedes", "¿Cómo están?"], ["eles, elas", "ellos, ellas", "Ellos están bien."]])
        + '<div class="card dark"><p class="k">Regra de ouro</p><p style="margin:0">Na dúvida, comece com <b>usted</b> e espere a pessoa propor o tú: «háblame de tú», «tutéame».</p></div>',
        "banco": ["yo", "tú", "usted", "él", "ella", "nosotros", "ustedes", "ellos", "¿Cómo estás?", "¿Cómo está usted?", "¿Y usted?", "háblame de tú", "le presento a", "don", "doña"],
        "erros": [("¿Cómo estás usted?", "¿Cómo está usted?"), ("tú com um cliente sênior no primeiro contato", "usted, até ele propor o tú")],
    },
    # ---------------------------------------------------------------- AULA 5
    {
        "n": 5,
        "titulo": "Me llamo, soy, vivo en: a primeira apresentação",
        "lead": "Nome, origem e onde mora, com tú e com usted. É a base de toda apresentação, no café ou no kick-off.",
        "historia": [
            fill("Yo ___ Camila. (chamar-se)", ["me llamo"], "Me llamo é o jeito mais natural de dizer o nome."),
            fill("¿De dónde ___ (ser) tú?", ["eres"], "Ser com tú: eres."),
            fill("Usted ___ (vivir) en Coyoacán.", ["vive"], "Usted pede a forma de ele: vive."),
            mc("«Eu moro em Recife»:", ["Vivo en Recife.", "Moro en Recife.", "Habito Recife."], 0, "No dia a dia, o espanhol usa vivir."),
            corr("Corrija: «Soy la Camila».", ["Soy Camila"], "Sem artigo antes do nome."),
            mc("Uma mulher, ao ser apresentada, diz:", ["Encantada.", "Encantado.", "Encantadora."], 0, "Encantado para homens, encantada para mulheres. Mucho gusto serve para todos."),
        ],
        "trabalho": [
            mc("Num kick-off com um cliente de Madri, qual apresentação soa mais formal?", ["Mi nombre es Ana Souza.", "Me llamo Ana Souza.", "Soy Ana."], 0, "As três estão certas. Mi nombre es soa mais formal; me llamo é o mais comum; soy Ana é direto."),
            mc("O cliente diz: «Encantado de conocerla». Você, mulher, responde:", ["Encantada, igualmente.", "Encantado, igualmente.", "Encantada de conocerte usted."], 0, "Igualmente devolve a cortesia. Conocerla já indica usted."),
            fill("Um colega pergunta «¿Dónde vives?». Complete: ___ en Campinas.", ["Vivo"], "Vivo en, nunca moro en."),
            mc("Para o resumo do seu perfil no LinkedIn em espanhol:", ["Soy de Brasil y vivo en Lisboa.", "Soy del Brasil y moro en Lisboa.", "Estoy de Brasil y vivo en Lisboa."], 0, "Soy de Brasil, sem artigo, e vivo en."),
            mc("Para perguntar o nome de um cliente que você acaba de conhecer:", ["¿Cómo se llama?", "¿Cómo te llamas?", "¿Cuál es tu nombre?"], 0, "Com usted: ¿Cómo se llama? Também é comum ¿Me recuerda su nombre?"),
            order("Monte a sua primeira frase numa call:", "Hola, me llamo Paula y soy de São Paulo.", "Nome e origem numa frase só."),
        ],
        "missao": ("30 segundos sobre você", "Grave um áudio de 30 segundos: cumprimento, nome, de onde é, onde mora e «mucho gusto». Envie aqui."),
        "prof": ("A sua linha de abertura", "Escreva como você se apresentaria no início de uma call com um cliente novo: cumprimento, nome, cidade e «encantado/encantada». Depois, a versão com usted para perguntar o nome dele."),
        "ficha": tabela(["", "llamarse", "ser", "vivir"], [["yo", "me llamo", "soy", "vivo"], ["tú", "te llamas", "eres", "vives"], ["usted, él, ella", "se llama", "es", "vive"]])
        + '<div class="card"><p class="k">Perguntas</p><table><tr><th>tú</th><th>usted</th></tr><tr><td>¿Cómo te llamas?</td><td>¿Cómo se llama?</td></tr><tr><td>¿De dónde eres?</td><td>¿De dónde es?</td></tr><tr><td>¿Dónde vives?</td><td>¿Dónde vive?</td></tr></table></div>',
        "banco": ["me llamo", "¿cómo te llamas?", "¿cómo se llama?", "mi nombre es", "soy de", "¿de dónde eres?", "vivo en", "¿dónde vives?", "mucho gusto", "encantado", "encantada", "igualmente", "¡qué padre!"],
        "erros": [("moro en", "vivo en"), ("soy la Camila", "soy Camila"), ("me llamo es", "me llamo"), ("encantado (dito por uma mulher)", "encantada")],
    },
    # ---------------------------------------------------------------- AULA 6
    {
        "n": 6,
        "titulo": "De onde você é: países e nacionalidades",
        "lead": "Dizer a nacionalidade, apresentar outras pessoas e não cair nas maiúsculas do português.",
        "historia": [
            fill("Nosotros ___ brasileños.", ["somos"], "Ser com nosotros: somos."),
            fill("Ellos ___ de Chile.", ["son"], "Ser com ellos: son."),
            fill("Feminino de «español»:", ["española"], "Consoante + a: español, española."),
            mc("Feminino de «francés»:", ["francesa", "francésa", "francesa (com maiúscula)"], 0, "Francés perde o acento no feminino: francesa."),
            corr("Corrija: «Soy Brasileña, del Brasil».", ["Soy brasileña, de Brasil", "Soy brasileña de Brasil"], "Nacionalidade com minúscula e Brasil sem artigo."),
            mc("Valeria es de Santiago. Ella es:", ["chilena", "chileno", "Chilena"], 0, "Feminino e com minúscula."),
        ],
        "trabalho": [
            mc("Apresentando o time numa call: «Ella es Mariana, ___ argentina, y él es Tomás, ___ uruguayo».", ["es … es", "está … está", "son … son"], 0, "Nacionalidade com ser: es."),
            mc("No e-mail de apresentação da equipe:", ["Nuestro equipo es mexicano.", "Nuestro equipo es Mexicano.", "Nuestro equipo está mexicano."], 0, "Em espanhol, nacionalidade e idioma vão com minúscula."),
            fill("Os clientes são de Lima: «Los clientes son ___».", ["peruanos"], "Plural masculino: peruanos."),
            mc("Uma colega de Berlim, na sua equipe global:", ["Ella es alemana.", "Ella es alemán.", "Ella es Alemania."], 0, "Alemán, alemana."),
            mc("Um parceiro de Chicago:", ["Es estadounidense.", "Es estadounidensa.", "Es norteamericana."], 0, "Estadounidense é igual no masculino e no feminino. Norteamericano também se ouve, mas inclui Canadá e México."),
            order("Monte a frase para apresentar alguém na reunião:", "Les presento a Lucía, es colombiana.", "Les presento a + nome: o jeito formal de apresentar alguém a um grupo."),
        ],
        "missao": ("Quatro pessoas", "Escolha quatro pessoas (família, trabalho, famosas). Escreva uma frase para cada uma: «Ella es Ana. Es brasileña, de Salvador.» Se quiser, grave também."),
        "prof": ("A sua equipe internacional", "Apresente por escrito quatro pessoas com quem você trabalha ou trabalharia num projeto internacional: nome, nacionalidade e cidade. Use «Les presento a…» na primeira."),
        "ficha": tabela(["Pessoa", "Ser", "Exemplo"], [["yo", "soy", "Soy brasileña."], ["tú", "eres", "¿Eres mexicano?"], ["usted, él, ella", "es", "Ella es chilena."], ["nosotros", "somos", "Somos colegas."], ["ustedes, ellos", "son", "¿De dónde son?"]])
        + tabela(["Padrão", "Masculino", "Feminino"], [["-o / -a", "mexicano, argentino, brasileño", "mexicana, argentina, brasileña"], ["consoante + a", "español, francés, alemán", "española, francesa, alemana"], ["iguais", "estadounidense, canadiense", "estadounidense, canadiense"]]),
        "banco": ["país", "nacionalidad", "¿de dónde son?", "les presento a", "brasileño", "mexicano", "argentino", "colombiano", "chileno", "peruano", "español", "estadounidense"],
        "erros": [("Brasileña (com maiúscula)", "brasileña"), ("del Brasil", "de Brasil"), ("francésa", "francesa")],
    },
    # ---------------------------------------------------------------- AULA 7
    {
        "n": 7,
        "titulo": "¿A qué te dedicas?: profissões e áreas",
        "lead": "Falar do seu cargo, da sua área e de onde trabalha, sem traduzir do português.",
        "historia": [
            mc("«Eu sou advogada»:", ["Soy abogada.", "Soy una abogada.", "Estoy abogada."], 0, "Profissão sem artigo: soy abogada."),
            fill("Feminino de «el diseñador»: la ___", ["diseñadora"], "-or vira -ora."),
            fill("Artigo: ___ periodista (a Valeria).", ["la"], "Periodista é igual nos dois gêneros. O artigo mostra quem é."),
            fill("Trabajo ___ una empresa de energía.", ["en"], "Trabajo en + lugar."),
            mc("No Casa Común, «escritorio» é:", ["a mesa de trabalho", "o escritório", "a recepção"], 0, "Escritorio é a mesa. O escritório é oficina."),
            fill("Plural de «el ingeniero»:", ["los ingenieros"], "Artigo e nome no plural."),
        ],
        "trabalho": [
            mc("Na apresentação a um cliente:", ["Soy gerente de proyectos.", "Soy una gerente de proyectos.", "Soy de gerente de proyectos."], 0, "Sem artigo. Com artigo, só quando você é «a» gerente de algo específico: «Soy la gerente de esta cuenta»."),
            fill("«Trabalho como consultora independente»: Trabajo ___ consultora independiente.", ["como"], "Trabajo como + função."),
            mc("Qual soa mais natural?", ["Trabajo en el área de marketing.", "Trabajo con marketing.", "Trabajo de marketing."], 0, "«Trabajo con marketing» soa traduzido. Prefira trabajo en (el área de) marketing ou me dedico al marketing."),
            mc("Um colega diz «Soy contador». Ele trabalha com:", ["contabilidade", "contação de histórias", "vendas"], 0, "Contador é contador mesmo. Na Espanha se diz contable."),
            mc("Para perguntar a um executivo, com respeito, o que ele faz:", ["¿A qué se dedica?", "¿A qué te dedicas?", "¿Qué trabajas?"], 0, "Com usted: ¿A qué se dedica? Também se ouve ¿En qué trabaja?"),
            mc("«Trabajo en una oficina en Polanco; mi escritorio está junto a la ventana.» O que fica junto à janela?", ["a mesa", "o escritório inteiro", "a empresa"], 0, "Escritorio é a mesa; oficina é o escritório."),
        ],
        "missao": ("Três frases sobre o seu trabalho", "Grave três frases: o que você é, onde trabalha e como trabalha. Se a sua profissão não apareceu na aula, mande para o monitor."),
        "prof": ("O seu cargo, como no crachá", "Escreva como você diz o seu cargo e a sua área em espanhol, do jeito que diria a um cliente: «Soy… Trabajo en el área de… en…». Se o nome do cargo for em inglês (Key Account Manager, por exemplo), escreva como os hispânicos costumam dizer na sua empresa e confirme com o monitor."),
        "ficha": tabela(["Padrão", "Masculino", "Feminino"], [["-o / -a", "el abogado, el ingeniero", "la abogada, la ingeniera"], ["-or / -ora", "el diseñador, el contador", "la diseñadora, la contadora"], ["iguais", "el periodista, el gerente", "la periodista, la gerente"]])
        + '<div class="card"><p class="k">Três estruturas</p><ul class="lista"><li><b>Soy</b> + profissão, sem artigo: soy ingeniera.</li><li><b>Trabajo en</b> + lugar ou área: trabajo en una empresa de logística.</li><li><b>Trabajo como</b> + função: trabajo como consultor.</li></ul></div>',
        "banco": ["¿a qué te dedicas?", "¿a qué se dedica?", "trabajo en", "trabajo como", "me dedico a", "empresa", "el área de", "escritorio", "gerente", "ingeniero", "abogada", "contador", "autónomo", "jubilado"],
        "erros": [("soy una diseñadora", "soy diseñadora"), ("trabajo con marketing", "trabajo en marketing"), ("escritorio (para escritório)", "oficina")],
    },
    # ---------------------------------------------------------------- AULA 8
    {
        "n": 8,
        "entrega": "feito",
        "titulo": "¿Cómo estás?: ser e estar no primeiro contato",
        "lead": "Ser para quem você é, estar para como você está. A distinção que mais aparece já nas primeiras conversas.",
        "historia": [
            fill("Hoy ___ muy cansada.", ["estoy"], "Como você está agora: estar."),
            fill("Yo ___ mexicano.", ["soy"], "Nacionalidade: ser."),
            fill("¿Cómo ___ usted?", ["está"], "Estar com usted: está."),
            fill("Nosotros ___ bien.", ["estamos"], "Estar com nosotros: estamos."),
            mc("Para dizer que está bem:", ["Estoy bien.", "Estoy bueno.", "Soy bien."], 0, "Sempre bien. «Estoy bueno», em vários países, quer dizer que a pessoa se acha atraente."),
            corr("Corrija: «Estoy brasileña».", ["Soy brasileña"], "Nacionalidade é ser."),
        ],
        "trabalho": [
            mc("Antes de apresentar para a diretoria:", ["Estoy un poco nerviosa, pero estoy preparada.", "Soy un poco nerviosa, pero soy preparada.", "Estoy un poco nerviosa, pero soy preparando."], 0, "Estados do momento: estar."),
            fill("«A equipe está muito ocupada esta semana»: El equipo ___ muy ocupado esta semana.", ["está"], "Estado temporário: está."),
            mc("No começo de uma call, alguém pergunta «¿Cómo estás?». Você responde:", ["Muy bien, gracias. ¿Y tú?", "Muy bueno, gracias.", "Bien, ¿y tú estás?"], 0, "Responder e devolver a pergunta."),
            mc("Escolha a frase correta:", ["Soy ingeniera y hoy estoy muy contenta con el resultado.", "Estoy ingeniera y hoy soy muy contenta con el resultado.", "Soy ingeniera y hoy soy muy contenta con el resultado."], 0, "Profissão: ser. Como se sente hoje: estar."),
            mc("«Meus colegas são do Chile e hoje estão em São Paulo»:", ["Mis colegas son de Chile y hoy están en São Paulo.", "Mis colegas están de Chile y hoy son en São Paulo.", "Mis colegas son de Chile y hoy son en São Paulo."], 0, "Origem: ser. Onde estão agora: estar."),
            mc("Uma colega pergunta no chat: «¿Estás ocupado?». Ela quer saber:", ["se você pode falar agora", "qual é a sua profissão", "se você trabalha muito em geral"], 0, "Estar + ocupado: o momento. Para dizer que está livre: «No, dime».", tag="no chat"),
        ],
        "missao": ("¿Cómo estoy?", "Hoje, em três momentos do dia, pergunte a si mesmo «¿Cómo estoy?» e escreva a resposta em espanhol. Amanhã, leia as três em voz alta."),
        "prof": ("O check-in da reunião", "Muitas equipes abrem a reunião perguntando como cada um está. Escreva a sua resposta curta para três dias diferentes: um dia tranquilo, um dia muito ocupado e um dia de entrega importante. Use estar e um adjetivo."),
        "ficha": '<div class="grid2"><div class="card"><p class="k">Ser · quem você é</p><p style="margin:0">Soy Camila. Soy brasileña. Soy diseñadora.</p></div><div class="card dark"><p class="k">Estar · como você está</p><p style="margin:0">Estoy cansada. Estoy contento. Estoy ocupado.</p></div></div>'
        + tabela(["Pessoa", "Estar"], [["yo", "estoy"], ["tú", "estás"], ["usted, él, ella", "está"], ["nosotros", "estamos"], ["ustedes, ellos", "están"]]),
        "banco": ["¿cómo estás?", "¿cómo está?", "estoy bien", "muy bien", "más o menos", "regular", "cansado", "cansada", "contento", "nerviosa", "ocupado", "tranquila"],
        "erros": [("soy cansada", "estoy cansada"), ("estoy brasileña", "soy brasileña"), ("estoy bueno (para dizer que está bem)", "estoy bien")],
        "nota": "Ser e estar voltam no Módulo 6 e no Módulo 9, com os outros usos.",
    },
    # ---------------------------------------------------------------- AULA 9
    {
        "n": 9,
        "titulo": "Números e soletração: telefone, e-mail e nome",
        "lead": "De 0 a 100, telefone em pares, e-mail com arroba e punto, e o seu nome soletrado. Use o botão Ouvir.",
        "historia": [
            fill("16 →", ["dieciséis"], "De 16 a 29, tudo numa palavra só."),
            mc("25 →", ["veinticinco", "veinte y cinco", "vinte y cinco"], 0, "Veinticinco, numa palavra."),
            fill("47 →", ["cuarenta y siete"], "A partir de 31, com y."),
            mc("Ouça e escolha o número:", ["setenta", "sesenta"], 0, "Setenta é 70; sesenta é 60.", audio="setenta", embaralhar=False),
            mc("@ se diz:", ["arroba", "arrouba", "at"], 0, "Arroba. E o ponto é punto."),
            mc("A letra J se chama:", ["jota", "ge", "hache"], 0, "J = jota; G = ge; H = hache."),
        ],
        "trabalho": [
            fill("Ouça o telefone de um fornecedor e escreva só os números:", ["5521431890", "55 21 43 18 90"], "No México, o telefone se dita em pares.", audio="cincuenta y cinco, veintiuno, cuarenta y tres, dieciocho, noventa", ph="Ex.: 5512345678"),
            fill("Ouça o e-mail do contato do cliente e escreva:", ["m.garcia@andes-log.com"], "Punto, arroba, guion.", audio="eme punto garcía, arroba, andes guion log, punto com", ph="nome@empresa.com"),
            mc("«Guion bajo» é:", ["_", "-", "."], 0, "Guion é o hífen (-); guion bajo é o sublinhado (_)."),
            mc("Para pedir que um cliente soletre o sobrenome:", ["¿Me lo deletrea, por favor?", "¿Me lo deletreas, por favor?", "¿Puede soletrar?"], 0, "Com usted: deletrea. Soletrar, em espanhol, é deletrear."),
            fill("Ouça o número do pedido e escreva só os números:", ["7684", "76 84"], "Setenta y seis, ochenta y cuatro.", audio="El pedido es el setenta y seis, ochenta y cuatro.", ph="Ex.: 1234"),
            fill("Complete a contagem regressiva: cien, noventa y nueve, ___", ["noventa y ocho"], "Noventa y ocho."),
        ],
        "missao": ("Os seus contatos em espanhol", "Grave um áudio soletrando o seu nome completo e ditando o seu telefone e o seu e-mail, como a Camila fez com a Lucía."),
        "prof": ("A sua assinatura de e-mail", "Escreva a sua assinatura de e-mail em espanhol (nome, cargo, empresa, teléfono, correo) e grave-se ditando o telefone em pares e o e-mail com arroba, punto e guion."),
        "ficha": tabela(["Faixa", "Como fica"], [["0 a 15", "cero, uno … catorce, quince"], ["16 a 29", "dieciséis … veintinueve (uma palavra)"], ["31 em diante", "treinta y uno, cuarenta y tres"], ["dezenas", "treinta, cuarenta, cincuenta, sesenta, setenta, ochenta, noventa, cien"]])
        + tabela(["No e-mail", "Se diz"], [["@", "arroba"], [".", "punto"], ["-", "guion"], ["_", "guion bajo"], ["tudo junto", "todo junto"], ["minúsculas", "en minúscula"]]),
        "banco": ["número de teléfono", "correo electrónico", "arroba", "punto", "guion", "guion bajo", "todo junto", "¿cómo se escribe?", "deletrear", "dieciséis", "veinte", "cincuenta", "setenta", "cien"],
        "erros": [("veinte y cinco", "veinticinco"), ("vinte", "veinte"), ("chamar o J de «ge»", "jota")],
    },
    # ---------------------------------------------------------------- AULA 10
    {
        "n": 10,
        "entrega": "feito",
        "titulo": "Frases para não travar",
        "lead": "Pedir repetição, calma, significado e tradução. Saber pedir ajuda é o que mantém uma reunião andando.",
        "historia": [
            mc("Com Don Alberto, para pedir que repita:", ["¿Puede repetir, por favor?", "¿Puedes repetir, por favor?", "¿Repite?"], 0, "Com usted: puede."),
            mc("«Fala mais devagar»:", ["Más despacio, por favor.", "Más devagar, por favor.", "Más lento, por favor, usted."], 0, "Devagar é despacio."),
            mc("Para chamar a atenção de alguém que você não conhece:", ["Disculpe.", "Desculpe.", "Con licencia."], 0, "Disculpe (usted) ou disculpa (tú), com I."),
            mc("Para pedir passagem no metrô:", ["Con permiso.", "Con licencia.", "Disculpa, paso."], 0, "Con permiso é o nosso «com licença»."),
            fill("¿Cómo se ___ «senha» en español?", ["dice"], "¿Cómo se dice…?"),
            mc("No México se diz «elevador». Na Espanha:", ["ascensor", "elevador", "subidor"], 0, "Ascensor."),
        ],
        "trabalho": [
            mc("Numa call, o cliente fala rápido demais:", ["Perdón, ¿puede hablar un poco más despacio, por favor?", "Fale devagar, por favor.", "¿Puede más despacio?"], 0, "Pedir com educação mostra interesse, não fraqueza."),
            mc("No e-mail do cliente aparece «plazo», e você não conhece. No chat, você pergunta:", ["¿Qué significa «plazo»?", "¿Qué es significa «plazo»?", "¿Cómo se dice «plazo»?"], 0, "Plazo é prazo. ¿Qué significa…? para palavras que você ouviu ou leu."),
            mc("O áudio da videochamada cortou bem na hora do número:", ["Perdón, se cortó el audio. ¿Me lo puede repetir?", "Desculpa, cortou.", "No entiendo nada."], 0, "Se cortó el audio: a frase mais útil das calls."),
            mc("Você precisa de «planilha» em espanhol. A palavra mais segura:", ["hoja de cálculo", "planilla", "plano"], 0, "Hoja de cálculo (ou simplesmente «el Excel»). Planilla, em vários países, é a folha de pagamento ou um formulário."),
            vf("Numa reunião, fingir que entendeu é mais profissional do que pedir para repetir.", False, "Fingir gera retrabalho e erro. Pedir para repetir é normal até entre nativos."),
            order("Monte a frase para pedir que repitam uma parte:", "¿Puede repetir la última parte, por favor?", "La última parte: só o trecho que você perdeu."),
        ],
        "missao": ("¿Qué significa…?", "Assista a dois minutos de qualquer vídeo em espanhol. A cada palavra que não entender, pause e diga em voz alta «¿Qué significa…?». Anote três dessas palavras e mande para o monitor ou procure no Banco Chave."),
        "prof": ("O seu kit de sobrevivência para calls", "Copie as seis frases da ficha num post-it ao lado do computador. Na próxima reunião em espanhol (ou num vídeo de uma reunião no YouTube), use pelo menos uma delas."),
        "ficha": tabela(["Para", "Com tú", "Com usted"], [["pedir licença", "Disculpa · Perdón", "Disculpe · Perdón"], ["dizer que não entendeu", "No entiendo.", "No entiendo."], ["pedir repetição", "¿Puedes repetir?", "¿Puede repetir?"], ["pedir calma", "Más despacio, por favor.", "Más despacio, por favor."], ["perguntar o significado", "¿Qué significa…?", "¿Qué significa…?"], ["perguntar como se diz", "¿Cómo se dice…?", "¿Cómo se dice…?"]]),
        "banco": ["disculpe", "perdón", "no entiendo", "¿puede repetir?", "más despacio", "¿qué significa…?", "¿cómo se dice…?", "con permiso", "un momento", "se cortó el audio", "hoja de cálculo", "plazo"],
        "erros": [("desculpa", "disculpa"), ("más devagar", "más despacio"), ("¿Puedes repetir? (com um cliente)", "¿Puede repetir?")],
    },
]


def pronuncia():
    secoes = [{"titulo": "Ouça e escolha", "sub": "Vogais limpas, sem nasal, sem fechar o fim.", "itens": [
        mc("Ouça. Como termina?", ["noche, com E", "nochi, com I"], 0, "E final continua E.", audio="noche", embaralhar=False),
        mc("Ouça. Como termina?", ["Pablo, com O", "Pablu, com U"], 0, "O final continua O.", audio="Pablo", embaralhar=False),
        mc("Em «también», a vogal antes do N:", ["fica limpa e o N se pronuncia", "fica nasal, como em «também»"], 0, "No espanhol não há vogal nasal: tam-bi-én.", embaralhar=False),
        mc("Ouça. Em «bien», você ouve:", ["bi-en, com o N no fim", "bêin, nasal"], 0, "Bien, sem nasal.", audio="bien", embaralhar=False),
        mc("Quantas vogais tem o espanhol?", ["cinco", "sete", "doze"], 0, "A, E, I, O, U, sempre com o mesmo som. O português do Brasil tem sete orais e ainda as nasais."),
        mc("O E do espanhol é:", ["entre o «é» e o «ê»", "sempre aberto, como em «café»", "sempre fechado, como em «você»"], 0, "Fica no meio, e não muda conforme a posição."),
        mc("Ouça e escolha o que foi dito:", ["Mucho gusto.", "Muchu gustu."], 0, "Sem U no fim.", audio="Mucho gusto.", embaralhar=False),
        mc("Ouça e escolha o que foi dito:", ["Me llamo Camila.", "Me chamo Camila."], 0, "Me llamo, com LL.", audio="Me llamo Camila.", embaralhar=False),
        mc("Em «con», o O:", ["fica limpo e o N se pronuncia", "vira «cõ», nasal"], 0, "Con: C-O-N.", embaralhar=False),
        mc("Ouça. Qual frase você ouviu?", ["Estoy bien, también.", "Estoy bien, tambêin."], 0, "Sem nasal.", audio="Estoy bien, también.", embaralhar=False),
    ]}]
    url, total = pagina_exercicios("m1/pronuncia-exercicios.html", "Módulo 1 · Pronúncia em Foco", "Vogais limpas", "Dez exercícios de escuta. Depois, faça a sombra e o desafio do vídeo.", secoes, R)
    return {"titulo": "Pronúncia em Foco · Vogais limpas", "itens": [video("Vídeo · Vogais limpas: sem nasal, sem chiado"), {"tipo": "html", "titulo": f"Exercícios de escuta ({total})", "url": url, "exercicios": total}]}


def aprender():
    url = pagina_livre("m1/aprender-a-aprender.html", "Módulo 1 · Aprender a Aprender", "A rotina mínima", "Estudar espanhol dentro da vida real, sem depender de motivação.",
        tabela(["Peça", "Quanto", "Como"], [["Sessão de estudo", "3 por semana, de 25 a 30 min", "1 ou 2 aulas, a ficha e os exercícios"], ["Missão Chave", "1 por aula, em 24 h", "É ela que leva o espanhol para fora da tela"], ["Revisão", "5 min no começo de cada sessão", "Ouvir os favoritos do Banco Chave"], ["Contato leve", "10 min nos outros dias", "Uma música, um vídeo, um podcast"]])
        + '<div class="grid2"><div class="card"><p class="k">Combinado 1</p><h3>Hora marcada</h3><p style="margin:0">Se o horário não funciona, mude o horário, e não o dia. Quem espera a motivação estuda pouco.</p></div>'
        + '<div class="card"><p class="k">Combinado 2</p><h3>Travou, pergunta</h3><p style="margin:0">Mande a dúvida ao monitor, por texto ou áudio. A resposta chega em até um dia útil.</p></div></div>'
        + '<div class="card dark"><p class="k">Combinado 3</p><h3>Errar faz parte</h3><p style="margin:0">Esquecer palavras, trocar ser e estar, falar com sotaque: é o processo funcionando.</p></div>'
        + '<div class="missao"><p class="k">Missão Chave · hoje</p><h3>Revise a sua semana</h3><p style="margin:0">Olhe a última semana no Plano: quantas sessões você fez? Ajuste o que precisar e conte na comunidade, na sexta do «conta como foi».</p></div>'
        + '<div class="card"><p class="k">Para quem tem agenda de executivo</p><p style="margin:0">Trate as três sessões como reuniões com você mesmo: bloqueadas no calendário, com nome e horário. Viagem na semana? Troque por duas sessões de 15 minutos no aeroporto ou no hotel, com os exercícios no celular.</p></div>', R)
    return {"titulo": "Aprender a Aprender · A rotina mínima", "itens": [video("Vídeo · A rotina mínima"), {"tipo": "html", "titulo": "A rotina mínima, na prática", "url": url}]}


def imersao():
    vozes = [("mx", "México"), ("ar", "Argentina"), ("es", "Espanha")]
    sotaques = "".join(f'<button type="button" class="ouvir" data-ouvir="{audio("Hola, ¿cómo estás? Me llamo Lucía y trabajo en una empresa internacional.", v)}">▶ Voz {i + 1}</button> ' for i, (v, _) in enumerate(vozes))
    secoes = [{"titulo": "Os sotaques", "sub": "Ouça as três vozes no alto da página e responda.", "itens": [
        mc("A Voz 1 é do:", ["México", "Argentina", "Espanha"], 0, "O espanhol mexicano tem as vogais muito claras e o S bem marcado.", embaralhar=False),
        mc("A Voz 2 é da:", ["Argentina", "Espanha", "México"], 0, "Repare no LL e no Y de «me llamo»: na Argentina soam como um «ch» suave.", embaralhar=False),
        mc("A Voz 3 é da:", ["Espanha", "México", "Argentina"], 0, "Na Espanha, o C antes de E e I e o Z soam com a língua entre os dentes.", embaralhar=False),
    ]}, {"titulo": "¿De dónde es?", "sub": "Escreva a nacionalidade, com minúscula.", "itens": [
        fill("Uma cliente de Bogotá es ___", ["colombiana"]),
        fill("Um fornecedor de Lima es ___", ["peruano"]),
        fill("Uma diretora de Madri es ___", ["española"]),
        fill("Um colega de Montevidéu es ___", ["uruguayo"]),
        fill("Uma gerente de Quito es ___", ["ecuatoriana"]),
        fill("Um parceiro de Caracas es ___", ["venezolano"]),
        fill("Uma colega de San José, Costa Rica, es ___", ["costarricense"], "Costarricense é igual no masculino e no feminino."),
    ]}]
    url, total = pagina_exercicios("m1/imersao.html", "Módulo 1 · Imersão Cultural", "O mapa do espanhol: 20 países e Porto Rico",
        "Mais de 600 milhões de pessoas usam o espanhol no mundo (Instituto Cervantes). Ouça as vozes antes dos exercícios: " + sotaques
        + '<br><small>Vozes sintéticas, usadas só para reconhecer sotaques.</small>', secoes, R)
    return {"titulo": "Imersão Cultural · O mapa do espanhol", "itens": [{"tipo": "html", "titulo": f"Sotaques e nacionalidades ({total})", "url": url, "exercicios": total}]}


def revisao():
    secoes = [{"titulo": "Quiz final", "sub": "O primeiro dia da Camila, do começo ao fim.", "itens": [
        mc("Às 15h:", ["buenas tardes", "buenos días", "buenas noches"], 0),
        mc("«Apellido»:", ["sobrenome", "apelido", "endereço"], 0),
        mc("Com Don Alberto:", ["¿Cómo está usted?", "¿Cómo estás?"], 0, embaralhar=False),
        fill("Yo ___ en México. (morar)", ["vivo"]),
        fill("Ella es de Chile: es ___", ["chilena"]),
        fill("Hoy ___ cansado.", ["estoy"]),
        fill("35 →", ["treinta y cinco"]),
        mc("«Fala mais devagar», com usted:", ["Más despacio, por favor.", "Más devagar, por favor."], 0, embaralhar=False),
        mc("Numa call, para apresentar a sua colega mexicana ao cliente:", ["Le presento a Sofía, es mexicana.", "Le presento a Sofía, está mexicana.", "Le presento a la Sofía, es Mexicana."], 0),
        mc("«Soy gerente de cuentas y trabajo ___ una empresa de tecnología.»", ["en", "con", "de"], 0),
        corr("Corrija: «Mucho gusto, soy la Marina, soy Brasileña.»", ["Mucho gusto, soy Marina, soy brasileña"], "Sem artigo antes do nome e nacionalidade com minúscula."),
        mc("O áudio cortou na call:", ["Perdón, se cortó el audio. ¿Me lo puede repetir?", "Perdón, no escucho nada, adiós."], 0, embaralhar=False),
    ]}]
    url, total = pagina_exercicios("m1/revisao-quiz.html", "Módulo 1 · Revisão Inteligente", "Quiz do Módulo 1", "Doze questões. Depois, marque o semáforo na página seguinte.", secoes, R)
    sem = pagina_livre("m1/revisao-semaforo.html", "Módulo 1 · Revisão Inteligente", "O semáforo do Módulo 1", "Verde: consigo sem pensar. Amarelo: consigo com esforço. Vermelho: ainda não. Cada amarelo ou vermelho mostra qual aula rever.",
        semaforo([("Cumprimentar conforme o horário", "Aula 3"), ("Escolher tú ou usted", "Aula 4"), ("Dizer nome, origem e onde moro", "Aula 5"), ("Apresentar outras pessoas e nacionalidades", "Aula 6"), ("Dizer meu cargo e minha área", "Aula 7"), ("Dizer como estou, com o verbo certo", "Aula 8"), ("Ditar telefone e e-mail", "Aula 9"), ("Pedir para repetir numa call", "Aula 10")])
        + '<p class="nota">Nada aqui é salvo: é um retrato honesto para você decidir o que rever antes do Checkpoint.</p>', R)
    return {"titulo": "Revisão Inteligente", "itens": [video("Vídeo · O primeiro dia da Camila, do começo ao fim"), {"tipo": "html", "titulo": f"Quiz do módulo ({total})", "url": url, "exercicios": total}, {"tipo": "html", "titulo": "Semáforo: o que rever", "url": sem}]}


def checkpoint():
    url = pagina_livre("m1/checkpoint.html", "Módulo 1 · Checkpoint", "Minha apresentação em seis frases", "A tarefa que fecha o módulo e libera o Módulo 2. Grave e envie no item seguinte, «Entregar o Checkpoint». Não tem nota: a correção humana chega no Desafio da Base, ao fim do Módulo 4.",
        '<div class="grid2"><div class="card"><p class="k">Versão guiada</p><p style="margin:0">Hola, me llamo ___. Soy ___ (nacionalidade), de ___. Vivo en ___. Soy ___ / Trabajo en ___. Hoy estoy ___. Mucho gusto.</p></div>'
        + '<div class="card dark"><p class="k">Versão oral · recomendada</p><p style="margin:0">Um áudio de até um minuto com as seis frases, sem ler, se possível.</p></div></div>'
        + '<div class="card"><p class="k">Versão profissional</p><p style="margin:0">As seis frases como você diria na abertura de uma reunião com um cliente novo, com usted: «Buenos días. Mi nombre es… Soy… Trabajo en el área de… de… Es un placer conocerlos.»</p></div>'
        + '<div class="card"><p class="k">Modelo · a Camila</p><p class="es" style="margin:0">Hola, me llamo Camila Rocha. Soy brasileña, de Belo Horizonte. Ahora vivo en la Ciudad de México. Soy diseñadora. Trabajo en una agencia de publicidad. Hoy estoy muy bien, ¡y un poco cansada! Mucho gusto.</p></div>'
        + '<div class="card"><p class="k">Antes de enviar</p>' + checklist(["Usei «me llamo» ou «soy» sem artigo antes do nome", "Escrevi a nacionalidade com minúscula e no gênero certo", "Usei «vivo en», e não «moro en»", "Usei «soy» para a profissão e «estoy» para como estou", "Falei as vogais finais sem fechar (Pablo, noche)", "Comparei com a minha gravação de partida"]) + "</div>", R)
    return {"titulo": "Checkpoint · Minha apresentação", "itens": [
        {"tipo": "html", "titulo": "Checkpoint: minha apresentação em seis frases", "url": url},
        missao("Entregar o Checkpoint do Módulo 1", "Grave a sua apresentação em seis frases, de preferência sem ler: cumprimento, nome, nacionalidade e cidade, onde vive, o que faz e como está hoje. Até um minuto.\n\nAntes de enviar, confira a lista da página anterior e compare com a sua gravação de partida.", ("A abertura de uma reunião", "Se quiser, grave também a versão com usted, como na abertura de uma reunião com um cliente novo."), "audio"),
    ]}


def gerar():
    fases = [{"titulo": "Boas-vindas", "itens": [video("Vídeo 0 · A Camila chega")]}]
    for a in AULAS:
        fases.append(montar_aula(1, a, R))
        if a["n"] == 3:
            fases.append(aprender())
        if a["n"] == 5:
            fases.append(pronuncia())
    fases += [imersao(), revisao(), checkpoint()]
    return {
        "titulo": "Módulo 1 · Primeiros contatos",
        "descricao": "Do «eu entendo um pouco» à primeira apresentação: cumprimentar, escolher tú ou usted, dizer quem você é, o que faz e como está, ditar contatos e não travar.",
        "capa": "/capas-prontas/pronta-constelacao.jpg",
        "fases": fases,
    }
