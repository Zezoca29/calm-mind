/**
 * Emotional NLP Engine - Sistema de Processamento de Linguagem Natural para Emoções
 * Calm Mind App - Respostas acolhedoras sem IA
 *
 * Técnicas utilizadas:
 * - Normalização de texto
 * - Detecção de negação
 * - Análise de intensidade
 * - Match de padrões (regex)
 * - Scoring emocional graduado
 * - Respostas contextuais variadas
 */

// ============= CONFIGURAÇÃO DO LEXICON EMOCIONAL =============

const EmotionalLexicon = {
  ansiedade: {
    // Palavras diretas - peso alto
    primarias: [
      'ansioso', 'ansiosa', 'ansiedade', 'nervoso', 'nervosa', 'tenso', 'tensa',
      'apreensivo', 'apreensiva', 'aflito', 'aflita', 'angustiado', 'angustiada',
      'agitado', 'agitada', 'inquieto', 'inquieta', 'preocupado', 'preocupada'
    ],
    // Expressões coloquiais brasileiras - peso médio
    coloquiais: [
      'pilhado', 'pilhada', 'ligado', 'ligada', 'elétrico', 'elétrica',
      'a mil', 'mil por hora', 'não paro', 'acelerado', 'acelerada',
      'noiado', 'noiada', 'paranóico', 'paranoica', 'surtando', 'pirando',
      'passando mal', 'mal estar', 'ruim', 'estranho', 'estranha'
    ],
    // Sintomas físicos/somáticos - peso alto (indica intensidade)
    somaticos: [
      'coração acelerado', 'coração disparado', 'coração batendo forte',
      'taquicardia', 'suando', 'suor frio', 'mãos suando', 'tremendo',
      'aperto no peito', 'peito apertado', 'dor no peito', 'falta de ar',
      'não consigo respirar', 'sufocando', 'formigando', 'formigamento',
      'tontura', 'tonto', 'tonta', 'enjoo', 'náusea', 'boca seca',
      'tensão muscular', 'ombros tensos', 'mandíbula travada', 'dor de cabeça'
    ],
    // Pensamentos ansiosos - peso médio
    pensamentos: [
      'vai dar errado', 'e se', 'não vai dar certo', 'preocupado com',
      'não consigo parar de pensar', 'pensando demais', 'mente acelerada',
      'não sai da minha cabeça', 'pensamento intrusivo', 'ruminando',
      'catastrofizando', 'imaginando o pior', 'antecipando', 'medo de'
    ],
    // Expressões de crise/pânico - peso muito alto (URGENTE)
    crise: [
      'pânico', 'ataque de pânico', 'crise de ansiedade', 'crise de pânico',
      'desespero', 'desesperado', 'desesperada', 'vou morrer', 'morrendo',
      'infarto', 'enfartando', 'enlouquecer', 'enlouquecendo', 'ficando louco',
      'perder o controle', 'perdendo o controle', 'surtar', 'surtando',
      'não aguento', 'não suporto', 'socorro', 'me ajuda', 'ajuda'
    ]
  },

  tristeza: {
    primarias: [
      'triste', 'tristeza', 'deprimido', 'deprimida', 'depressão', 'depressivo',
      'pra baixo', 'para baixo', 'desanimado', 'desanimada', 'melancólico',
      'melancólica', 'abatido', 'abatida', 'desalentado', 'desalentada',
      'sem ânimo', 'sem vontade', 'desmotivado', 'desmotivada'
    ],
    coloquiais: [
      'na fossa', 'fossa', 'down', 'mal', 'péssimo', 'péssima', 'horrível',
      'uma merda', 'uma porcaria', 'lixo', 'me sentindo lixo', 'fracassado',
      'fracassada', 'inútil', 'imprestável', 'não sirvo pra nada'
    ],
    somaticos: [
      'sem energia', 'exausto', 'exausta', 'cansado', 'cansada', 'peso',
      'pesado', 'pesada', 'vazio', 'vazia', 'oco', 'oca', 'apático',
      'apática', 'letárgico', 'letárgica', 'arrastando', 'corpo pesado',
      'não consigo levantar', 'sem forças'
    ],
    pensamentos: [
      'não tenho vontade', 'pra que', 'pra quê', 'nada faz sentido',
      'sem sentido', 'não importa', 'tanto faz', 'dane-se', 'foda-se',
      'ninguém liga', 'ninguém se importa', 'não faz diferença',
      'nunca vai mudar', 'sempre assim', 'não tem jeito', 'sem esperança'
    ],
    solidao: [
      'sozinho', 'sozinha', 'solitário', 'solitária', 'isolado', 'isolada',
      'abandonado', 'abandonada', 'rejeitado', 'rejeitada', 'excluído', 'excluída',
      'ninguém me entende', 'incompreendido', 'incompreendida', 'sem amigos',
      'invisível', 'ignorado', 'ignorada', 'esquecido', 'esquecida',
      'não tenho ninguém', 'não tenho com quem conversar'
    ],
    luto: [
      'perdi', 'perda', 'luto', 'morreu', 'faleceu', 'saudade', 'falta',
      'sinto falta', 'queria que estivesse aqui', 'nunca mais vou ver'
    ],
    crise: [
      'não aguento mais', 'cansei', 'cansei de tudo', 'quero sumir',
      'queria sumir', 'desaparecer', 'quero desistir', 'vou desistir',
      'não vale a pena', 'não quero mais', 'acabou pra mim'
    ]
  },

  raiva: {
    primarias: [
      'raiva', 'irritado', 'irritada', 'bravo', 'brava', 'furioso', 'furiosa',
      'com ódio', 'ódio', 'indignado', 'indignada', 'revoltado', 'revoltada',
      'irado', 'irada', 'enfurecido', 'enfurecida'
    ],
    coloquiais: [
      'puto', 'puta', 'putasso', 'de saco cheio', 'estressado', 'estressada',
      'no limite', 'explodindo', 'a ponto de explodir', 'perdendo a paciência',
      'sem paciência', 'não aguento mais isso', 'chega', 'basta'
    ],
    gatilhos: [
      'injusto', 'injusta', 'injustiça', 'não é justo', 'cansei de',
      'sempre eu', 'ninguém ajuda', 'abusando', 'abuso', 'desrespeito',
      'falta de respeito', 'humilhado', 'humilhada', 'traído', 'traída',
      'mentira', 'mentiram', 'enganado', 'enganada'
    ],
    frustração: [
      'frustrado', 'frustrada', 'frustração', 'não consigo', 'impossível',
      'não dá', 'deu errado', 'falhou', 'fracassei', 'não funcionou',
      'travado', 'travada', 'empacado', 'empacada', 'bloqueado', 'bloqueada'
    ]
  },

  medo: {
    primarias: [
      'medo', 'com medo', 'assustado', 'assustada', 'apavorado', 'apavorada',
      'aterrorizado', 'aterrorizada', 'temor', 'receio', 'receoso', 'receosa',
      'amedrontado', 'amedrontada'
    ],
    especificos: [
      'fobia', 'pavor', 'horror', 'pânico de', 'medo de morrer',
      'medo de ficar louco', 'medo de perder o controle', 'medo do futuro',
      'medo de ficar sozinho', 'medo de falhar', 'medo de errar'
    ],
    inseguranca: [
      'inseguro', 'insegura', 'insegurança', 'vulnerável', 'frágil',
      'exposto', 'exposta', 'desprotegido', 'desprotegida', 'em perigo',
      'ameaçado', 'ameaçada'
    ]
  },

  sono: {
    primarias: [
      'insônia', 'não durmo', 'sem sono', 'acordado', 'acordada',
      'não consigo dormir', 'dificuldade pra dormir', 'dificuldade para dormir'
    ],
    coloquiais: [
      'virado', 'virada', 'não prego o olho', 'revirando na cama',
      'olho arregalado', 'não vem o sono', 'fugiu o sono'
    ],
    qualidade: [
      'dormindo mal', 'sono ruim', 'acordo várias vezes', 'acordo no meio da noite',
      'pesadelos', 'pesadelo', 'sonho ruim', 'sono leve', 'não descanso',
      'acordo cansado', 'acordo cansada', 'noite mal dormida'
    ],
    causas: [
      'pensando demais', 'mente não para', 'não desligo', 'preocupações',
      'ansiedade na hora de dormir', 'medo de dormir', 'medo do escuro'
    ],
    cansaco: [
      'exausto', 'exausta', 'morto de cansaço', 'morta de cansaço',
      'esgotado', 'esgotada', 'destruído', 'destruída', 'acabado', 'acabada',
      'precisando dormir', 'preciso descansar', 'não aguento de sono'
    ]
  },

  calma: {
    primarias: [
      'calmo', 'calma', 'tranquilo', 'tranquila', 'em paz', 'paz',
      'sereno', 'serena', 'relaxado', 'relaxada', 'zen', 'centrado', 'centrada'
    ],
    positivas: [
      'bem', 'melhor', 'aliviado', 'aliviada', 'leve', 'descansado', 'descansada',
      'renovado', 'renovada', 'revigorado', 'revigorada', 'equilibrado', 'equilibrada'
    ],
    conquistas: [
      'consegui', 'superei', 'venci', 'passou', 'melhorou', 'está passando',
      'estou conseguindo', 'deu certo', 'funcionou'
    ]
  },

  alegria: {
    primarias: [
      'feliz', 'alegre', 'contente', 'animado', 'animada', 'empolgado', 'empolgada',
      'entusiasmado', 'entusiasmada', 'radiante', 'vibrante', 'eufórico', 'eufórica'
    ],
    expressoes: [
      'muito bom', 'ótimo', 'ótima', 'maravilhoso', 'maravilhosa', 'incrível',
      'fantástico', 'fantástica', 'sensacional', 'demais', 'top', 'perfeito', 'perfeita'
    ],
    gratidao: [
      'grato', 'grata', 'gratidão', 'agradeço', 'obrigado', 'obrigada',
      'abençoado', 'abençoada', 'sortudo', 'sortuda', 'privilegiado', 'privilegiada'
    ],
    amor: [
      'amor', 'amado', 'amada', 'querido', 'querida', 'acolhido', 'acolhida',
      'abraçado', 'abraçada', 'carinho', 'afeto', 'conexão', 'pertencimento'
    ]
  },

  confusao: {
    primarias: [
      'confuso', 'confusa', 'perdido', 'perdida', 'sem rumo', 'desorientado',
      'desorientada', 'não sei', 'não entendo', 'não faço ideia'
    ],
    existencial: [
      'sentido da vida', 'propósito', 'por que estou aqui', 'qual o sentido',
      'crise existencial', 'quem eu sou', 'o que fazer da vida'
    ],
    decisao: [
      'não sei o que fazer', 'indeciso', 'indecisa', 'dúvida', 'em dúvida',
      'não sei escolher', 'difícil decidir', 'muitas opções'
    ]
  },

  culpa: {
    primarias: [
      'culpa', 'culpado', 'culpada', 'me culpo', 'arrependido', 'arrependida',
      'remorso', 'vergonha', 'envergonhado', 'envergonhada'
    ],
    expressoes: [
      'não devia ter', 'me arrependo', 'foi minha culpa', 'estraguei tudo',
      'fiz besteira', 'fiz merda', 'magoei', 'machuquei', 'erro meu',
      'devia ter feito diferente', 'se eu tivesse'
    ]
  },

  estresse: {
    primarias: [
      'estressado', 'estressada', 'estresse', 'stress', 'sobrecarregado',
      'sobrecarregada', 'overwhelmed', 'sufocado', 'sufocada'
    ],
    trabalho: [
      'trabalho demais', 'muito trabalho', 'deadline', 'prazo', 'cobrança',
      'pressão', 'chefe', 'reunião', 'demanda', 'burnout', 'esgotamento profissional'
    ],
    vida: [
      'muita coisa', 'não dou conta', 'não consigo dar conta', 'acumulando',
      'pilha de coisas', 'mil coisas', 'correria', 'loucura', 'caos'
    ]
  }
};

// ============= MODIFICADORES DE INTENSIDADE =============

const Intensificadores = {
  muito_alto: [
    'extremamente', 'absurdamente', 'completamente', 'totalmente', 'demais',
    'pra caralho', 'pra caramba', 'muito muito', 'super', 'mega', 'ultra',
    'insuportável', 'insuportavelmente', 'terrivelmente'
  ],
  alto: [
    'muito', 'bastante', 'bem', 'realmente', 'verdadeiramente', 'profundamente',
    'intensamente', 'fortemente', 'seriamente'
  ],
  medio: [
    'um tanto', 'meio', 'mais ou menos', 'relativamente', 'razoavelmente'
  ],
  baixo: [
    'um pouco', 'levemente', 'ligeiramente', 'suavemente', 'de leve',
    'pouquinho', 'só um pouco'
  ]
};

// ============= DETECTORES DE NEGAÇÃO =============

const Negacoes = {
  diretas: ['não', 'nem', 'nunca', 'jamais', 'nada', 'nenhum', 'nenhuma', 'de jeito nenhum'],
  inversores: ['mas', 'porém', 'entretanto', 'contudo', 'só que', 'no entanto', 'todavia'],
  parciais: ['quase não', 'mal', 'dificilmente', 'raramente']
};

// ============= PADRÕES REGEX =============

const Padroes = {
  // Pedidos de ajuda
  pedindoAjuda: /\b(me ajuda|ajuda|socorro|preciso de ajuda|pode me ajudar|ajude-me)\b/i,

  // Expressões de crise severa (ALERTA)
  criseSevera: /\b(quero morrer|vou me matar|não quero mais viver|acabar com tudo|suicid|me machucar|me cortar|me ferir)\b/i,

  // Buscando conversa
  querConversar: /\b(preciso (falar|desabafar|conversar|de alguém)|alguém (pra|para) (ouvir|conversar)|posso (falar|desabafar)|quero (falar|desabafar|conversar))\b/i,

  // Expressando gratidão
  gratidao: /\b(obrigad[oa]|valeu|muito obrigad|brigad[oa]|ajudou|ajudando|funcionou|deu certo)\b/i,

  // Cumprimentos
  cumprimento: /^(oi|olá|hey|ola|e aí|eai|boa noite|boa tarde|bom dia|oie|oii)\b/i,

  // Despedidas
  despedida: /\b(tchau|até mais|até logo|vou dormir|vou descansar|boa noite|obrigad[oa] por tudo)\b/i,

  // Perguntas sobre o assistente
  perguntaSobreAssistente: /\b(quem é você|você é quem|o que você é|é uma ia|é um robô|é humano)\b/i,

  // Como está se sentindo (reflexivo)
  reflexivo: /\b(não sei (como|o que) (estou sentindo|me sinto|sinto)|confuso sobre (meus sentimentos|como me sinto))\b/i,

  // Expressões de tempo
  tempoAgudo: /\b(agora|neste momento|nessa hora|hoje|acabei de)\b/i,
  tempoRecorrente: /\b(sempre|todo dia|toda hora|frequentemente|constantemente|direto|vira e mexe)\b/i,
  tempoPassado: /\b(ontem|semana passada|mês passado|antigamente|antes|no passado)\b/i
};

// ============= BANCO DE RESPOSTAS EMPÁTICAS =============

const RespostasEmpaticas = {
  ansiedade: {
    validacao: [
      'Faz sentido você se sentir assim. A ansiedade pode ser muito intensa.',
      'O que você está sentindo é real e válido.',
      'Eu entendo. Ansiedade é difícil de lidar.',
      'Seu corpo está respondendo a algo que percebe como ameaça. É uma reação natural, mesmo que desconfortável.',
      'É corajoso da sua parte reconhecer e falar sobre isso.'
    ],
    normalizacao: [
      'Muita gente passa por isso. Você não está sozinho.',
      'Não há nada de errado com você por sentir ansiedade.',
      'Isso não significa fraqueza. É uma resposta humana.',
      'A ansiedade é mais comum do que parece. Faz parte de ser humano.'
    ],
    acolhimento: [
      'Estou aqui com você.',
      'Vamos passar por isso juntos.',
      'Você não precisa enfrentar isso sozinho.',
      'Estou aqui, no seu tempo.'
    ],
    acaoLeve: [
      'Que tal respirarmos juntos? Só alguns minutos.',
      'Vamos tentar trazer você de volta ao presente?',
      'Posso te guiar em uma respiração que ajuda a acalmar.',
      'Quer experimentar um exercício rápido que pode aliviar?'
    ],
    acaoUrgente: [
      'Vamos respirar agora. Inspire comigo... segure... e solte devagar.',
      'Foque na minha voz. Você está seguro. Vamos fazer o 4-7-8 juntos.',
      'Estou aqui. Vamos usar a técnica 5-4-3-2-1 para te ancorar no presente.'
    ]
  },

  tristeza: {
    validacao: [
      'Está tudo bem sentir tristeza. É uma emoção importante.',
      'A tristeza faz parte da vida. Não precisa lutar contra ela.',
      'O que você está sentindo é válido.',
      'Eu ouço você. Isso parece muito difícil.',
      'Ter dias assim faz parte. Não precisa se cobrar.'
    ],
    normalizacao: [
      'Todo mundo tem dias difíceis.',
      'Você não está errado por se sentir assim.',
      'A tristeza vem e vai. Ela não define quem você é.'
    ],
    acolhimento: [
      'Estou aqui se precisar.',
      'Você não está sozinho nisso.',
      'Pode falar o que quiser. Estou ouvindo.',
      'Às vezes só precisamos de alguém que escute, sem julgamento.'
    ],
    acaoLeve: [
      'Quer escrever um pouco sobre o que está sentindo? Pode ajudar.',
      'Que tal colocar isso em palavras no diário?',
      'Às vezes expressar ajuda a processar. Quer tentar?'
    ],
    solidao: [
      'Mesmo que pareça que ninguém entende, você importa.',
      'Solidão dói. Mas você não está tão sozinho quanto parece.',
      'Obrigado por compartilhar isso comigo. Já é um passo.'
    ]
  },

  raiva: {
    validacao: [
      'Raiva é uma emoção válida. Faz sentido você sentir isso.',
      'O que você está sentindo é compreensível.',
      'Parece que algo te incomodou bastante.',
      'É natural sentir raiva diante de situações injustas.'
    ],
    acolhimento: [
      'Estou aqui para ouvir, sem julgamento.',
      'Pode desabafar. É para isso que estou aqui.',
      'Às vezes precisamos colocar pra fora.'
    ],
    acaoLeve: [
      'Quer tentar uma respiração para ajudar a processar essa energia?',
      'Que tal escrever o que está sentindo? Pode ajudar a clarear.',
      'Respirar fundo pode ajudar a pensar com mais clareza depois.'
    ],
    reflexao: [
      'O que você acha que está por trás dessa raiva?',
      'Às vezes a raiva mascara outras emoções. O que mais você sente?'
    ]
  },

  medo: {
    validacao: [
      'Medo é uma emoção protetora. Seu corpo está tentando te cuidar.',
      'É normal sentir medo. Não precisa ter vergonha.',
      'O que você está sentindo faz sentido.',
      'Reconhecer o medo já é um passo corajoso.'
    ],
    seguranca: [
      'Você está seguro agora.',
      'Neste momento, você está bem.',
      'Vamos focar no aqui e agora. Neste instante, você está a salvo.'
    ],
    acaoLeve: [
      'Vamos fazer um exercício de ancoragem para te trazer ao presente?',
      'A técnica 5-4-3-2-1 pode ajudar a se sentir mais no controle.',
      'Respirar devagar pode ajudar seu corpo a entender que está seguro.'
    ]
  },

  sono: {
    validacao: [
      'Insônia é muito difícil. Afeta tudo.',
      'Não conseguir dormir é frustrante, eu sei.',
      'O cansaço pesa, né? Faz sentido você estar esgotado.'
    ],
    acolhimento: [
      'Estou aqui para te ajudar a relaxar.',
      'Vamos tentar acalmar sua mente juntos.',
      'Não precisa forçar o sono. Vamos só relaxar.'
    ],
    acaoLeve: [
      'Que tal uma meditação guiada para sono?',
      'Vamos relaxar seu corpo aos poucos?',
      'Uma respiração lenta pode preparar seu corpo para descansar.'
    ],
    dicas: [
      'Tente não olhar as horas. Isso aumenta a ansiedade.',
      'Pensamentos acelerados são comuns à noite. Vamos acalmá-los.',
      'Seu único trabalho agora é relaxar. O sono vem depois.'
    ]
  },

  calma: {
    validacao: [
      'Que bom saber que você está bem.',
      'Fico feliz em ouvir isso.',
      'Momentos de calma são preciosos. Aproveite.'
    ],
    encorajamento: [
      'Você está fazendo um ótimo trabalho cuidando de si.',
      'Continue se ouvindo assim.',
      'Essa consciência sobre si mesmo é valiosa.'
    ],
    oferta: [
      'Quer manter esse estado com uma meditação leve?',
      'Posso te ajudar a aproveitar esse momento com um exercício de presença.',
      'Se quiser, temos exercícios para aprofundar essa sensação de paz.'
    ]
  },

  alegria: {
    validacao: [
      'Que maravilha! Fico muito feliz por você.',
      'Isso é ótimo de ouvir!',
      'Momentos assim são especiais. Que bom que está vivendo isso.'
    ],
    encorajamento: [
      'Você merece se sentir bem.',
      'Aproveite esse momento. Você trabalhou para isso.',
      'A alegria também faz parte do processo. Celebre!'
    ],
    gratidao: [
      'Obrigado por compartilhar isso comigo.',
      'É bom saber que você está bem.',
      'Sua alegria me alegra também.'
    ]
  },

  confusao: {
    validacao: [
      'Não ter certeza sobre os próprios sentimentos é comum.',
      'Às vezes as emoções são confusas mesmo. Está tudo bem.',
      'Não precisamos rotular tudo. Às vezes só sentimos.'
    ],
    acolhimento: [
      'Estou aqui para ajudar você a explorar o que está sentindo.',
      'Vamos descobrir juntos, no seu tempo.',
      'Não precisa ter todas as respostas agora.'
    ],
    exploracao: [
      'Como seu corpo está se sentindo fisicamente agora?',
      'Se fosse dar uma cor para o que sente, qual seria?',
      'O que você gostaria de sentir agora?'
    ]
  },

  culpa: {
    validacao: [
      'Culpa é um sentimento pesado. Entendo.',
      'Errar faz parte de ser humano. Não significa que você é ruim.',
      'Reconhecer o erro já mostra consciência. Isso é positivo.'
    ],
    acolhimento: [
      'Você não é seus erros.',
      'Todo mundo falha às vezes. Isso não te define.',
      'Se perdoar é difícil, mas importante.'
    ],
    reflexao: [
      'O que você aprendeu com essa situação?',
      'O que você faria diferente se pudesse?',
      'Como você pode ser gentil consigo mesmo agora?'
    ]
  },

  estresse: {
    validacao: [
      'Parece que tem muita coisa acontecendo. É compreensível se sentir sobrecarregado.',
      'Estresse constante é esgotante. Você não está exagerando.',
      'É muita coisa para uma pessoa só dar conta.'
    ],
    acolhimento: [
      'Você não precisa resolver tudo agora.',
      'Uma coisa de cada vez.',
      'Está tudo bem fazer uma pausa.'
    ],
    acaoLeve: [
      'Vamos respirar um pouco? Pode ajudar a clarear a mente.',
      'Que tal pausar por 5 minutos para descomprimir?',
      'Um exercício de respiração pode te ajudar a pensar melhor depois.'
    ]
  },

  crise: {
    acolhimento: [
      'Estou aqui com você. Você não está sozinho.',
      'Eu ouço você. Isso parece muito difícil.',
      'Obrigado por me contar. Isso foi corajoso.'
    ],
    seguranca: [
      'Você está seguro comigo agora.',
      'Vamos passar por esse momento juntos.',
      'Um passo de cada vez. Agora, só respira comigo.'
    ],
    acao: [
      'Vamos focar apenas na respiração agora. Inspire... e expire...',
      'Olhe ao seu redor. Você está no presente. Está seguro.',
      'Vamos fazer o 5-4-3-2-1 juntos para te ancorar.'
    ],
    recursos: [
      'Se você está pensando em se machucar, por favor ligue para o CVV: 188.',
      'O CVV (188) está disponível 24 horas. Eles podem ajudar.',
      'Você importa. Por favor, considere ligar para o 188 ou ir a uma emergência.'
    ]
  },

  cumprimento: {
    manha: [
      'Bom dia! Como você está se sentindo hoje?',
      'Bom dia! Que bom te ver por aqui. Como está?',
      'Olá! Bom dia. Em que posso te ajudar hoje?'
    ],
    tarde: [
      'Boa tarde! Como está sendo seu dia?',
      'Olá! Boa tarde. Como você está?',
      'Boa tarde! Tudo bem com você?'
    ],
    noite: [
      'Boa noite! Como você está se sentindo?',
      'Olá! Boa noite. Como foi seu dia?',
      'Boa noite! Estou aqui se precisar.'
    ],
    madrugada: [
      'Oi! O sono não veio, né? Estou aqui se quiser conversar.',
      'Olá! Noite difícil? Posso te ajudar com algo.',
      'Oi. Insônia? Vamos ver se consigo te ajudar a relaxar.'
    ]
  },

  despedida: [
    'Cuide-se! Volte quando precisar.',
    'Até mais! Estarei aqui quando você quiser.',
    'Boa noite! Durma bem.',
    'Tchau! Foi bom conversar com você.',
    'Até logo! Lembre-se: você não está sozinho.'
  ],

  gratidao: [
    'Fico feliz em poder ajudar!',
    'É para isso que estou aqui. Sempre que precisar.',
    'Que bom que ajudou! Volte quando quiser.',
    'Obrigado por confiar em mim.'
  ],

  naoEntendi: [
    'Hmm, não tenho certeza se entendi. Pode me contar mais?',
    'Estou aqui para ouvir. Como você está se sentindo?',
    'Pode me explicar melhor o que está sentindo?',
    'Conte-me mais sobre o que está passando.',
    'Estou ouvindo. O que está acontecendo com você?'
  ],

  sobreAssistente: [
    'Sou um assistente do Calm Mind, aqui para te acompanhar em momentos difíceis. Como posso ajudar?',
    'Sou parte do Calm Mind, criado para oferecer acolhimento e exercícios de bem-estar. Como você está?',
    'Sou seu companheiro aqui no Calm Mind. Não sou terapeuta, mas posso te ouvir e sugerir exercícios. Como está se sentindo?'
  ]
};

// ============= CLASSE PRINCIPAL DO ENGINE =============

class EmotionalNLPEngine {
  constructor() {
    this.conversationHistory = [];
    this.currentEmotion = 'neutral';
    this.emotionIntensity = 0;
    this.lastResponseType = null;
  }

  /**
   * Normaliza o texto removendo acentos e convertendo para minúsculas
   */
  normalizeText(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Detecta se há negação no texto
   */
  detectNegation(text, keyword) {
    const words = text.split(' ');
    const keywordIndex = words.findIndex(w => w.includes(keyword));

    if (keywordIndex === -1) return false;

    // Verifica até 3 palavras antes
    for (let i = Math.max(0, keywordIndex - 3); i < keywordIndex; i++) {
      if (Negacoes.diretas.some(neg => words[i].includes(neg))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Detecta inversores (mas, porém) que mudam o sentido
   */
  detectInversion(text) {
    for (const inversor of Negacoes.inversores) {
      if (text.includes(inversor)) {
        const parts = text.split(inversor);
        // Retorna a parte após o inversor (mais relevante)
        return parts[parts.length - 1].trim();
      }
    }
    return text;
  }

  /**
   * Calcula a intensidade baseada em modificadores
   */
  calculateIntensity(text) {
    const normalizedText = this.normalizeText(text);

    for (const intensifier of Intensificadores.muito_alto) {
      if (normalizedText.includes(intensifier)) return 1.0;
    }
    for (const intensifier of Intensificadores.alto) {
      if (normalizedText.includes(intensifier)) return 0.8;
    }
    for (const intensifier of Intensificadores.medio) {
      if (normalizedText.includes(intensifier)) return 0.5;
    }
    for (const intensifier of Intensificadores.baixo) {
      if (normalizedText.includes(intensifier)) return 0.3;
    }

    return 0.6; // Intensidade padrão
  }

  /**
   * Verifica padrões especiais (regex)
   */
  checkPatterns(text) {
    const results = {};

    for (const [pattern, regex] of Object.entries(Padroes)) {
      results[pattern] = regex.test(text);
    }

    return results;
  }

  /**
   * Calcula score para uma categoria emocional
   */
  scoreEmotion(text, category) {
    const normalizedText = this.normalizeText(text);
    const lexicon = EmotionalLexicon[category];

    if (!lexicon) return 0;

    let score = 0;
    const weights = {
      primarias: 3,
      crise: 5,
      somaticos: 4,
      pensamentos: 2,
      coloquiais: 2,
      solidao: 3,
      luto: 3,
      gatilhos: 2,
      frustração: 2,
      especificos: 3,
      inseguranca: 2,
      qualidade: 2,
      causas: 2,
      cansaco: 3,
      positivas: 3,
      conquistas: 3,
      expressoes: 2,
      gratidao: 3,
      amor: 3,
      existencial: 2,
      decisao: 2,
      trabalho: 2,
      vida: 2
    };

    for (const [subcategory, keywords] of Object.entries(lexicon)) {
      const weight = weights[subcategory] || 1;

      for (const keyword of keywords) {
        const normalizedKeyword = this.normalizeText(keyword);

        if (normalizedText.includes(normalizedKeyword)) {
          // Verifica negação
          if (this.detectNegation(normalizedText, normalizedKeyword)) {
            score -= weight * 0.5; // Reduz se negado
          } else {
            score += weight;
          }
        }
      }
    }

    return score;
  }

  /**
   * Identifica a emoção principal do texto
   */
  identifyEmotion(text) {
    const processedText = this.detectInversion(text);
    const patterns = this.checkPatterns(text);

    // Verifica padrões especiais primeiro
    if (patterns.criseSevera) {
      return { emotion: 'crise', intensity: 1.0, urgent: true };
    }

    if (patterns.cumprimento) {
      return { emotion: 'cumprimento', intensity: 0.5, urgent: false };
    }

    if (patterns.despedida) {
      return { emotion: 'despedida', intensity: 0.5, urgent: false };
    }

    if (patterns.gratidao) {
      return { emotion: 'gratidao', intensity: 0.7, urgent: false };
    }

    if (patterns.perguntaSobreAssistente) {
      return { emotion: 'sobreAssistente', intensity: 0.5, urgent: false };
    }

    // Calcula scores para cada emoção
    const scores = {};
    for (const category of Object.keys(EmotionalLexicon)) {
      scores[category] = this.scoreEmotion(processedText, category);
    }

    // Encontra a emoção com maior score
    let maxScore = 0;
    let dominantEmotion = 'neutral';

    for (const [emotion, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        dominantEmotion = emotion;
      }
    }

    // Verifica se há pedido de ajuda (aumenta urgência)
    const urgent = patterns.pedindoAjuda || patterns.criseSevera || maxScore >= 10;

    // Calcula intensidade
    const intensity = this.calculateIntensity(text);

    // Se score muito baixo, pode ser que não entendemos
    if (maxScore < 2) {
      // Verifica se está buscando conversa
      if (patterns.querConversar) {
        return { emotion: 'conversa', intensity: 0.6, urgent: false };
      }

      // Verifica se é reflexivo
      if (patterns.reflexivo) {
        return { emotion: 'confusao', intensity: 0.5, urgent: false };
      }

      return { emotion: 'indefinido', intensity: 0.5, urgent: false };
    }

    return {
      emotion: dominantEmotion,
      intensity,
      urgent,
      score: maxScore,
      patterns
    };
  }

  /**
   * Seleciona resposta aleatória de um array
   */
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Gera resposta empática baseada na emoção identificada
   */
  generateResponse(emotionData) {
    const { emotion, intensity, urgent } = emotionData;
    let response = '';
    let suggestedExercise = null;
    let emotionState = 'neutral';

    // Tratamento especial para crise
    if (emotion === 'crise' || urgent) {
      const criseResponses = RespostasEmpaticas.crise;
      response = `${this.randomChoice(criseResponses.acolhimento)} ${this.randomChoice(criseResponses.seguranca)}`;

      // Verifica se é ideação suicida
      if (emotionData.patterns?.criseSevera) {
        response += ` ${this.randomChoice(criseResponses.recursos)}`;
      } else {
        response += ` ${this.randomChoice(criseResponses.acao)}`;
      }

      suggestedExercise = 'grounding';
      emotionState = 'anxious';

      return { response, suggestedExercise, emotionState };
    }

    // Mapeamento de emoção para estado visual
    const emotionToState = {
      ansiedade: 'anxious',
      medo: 'anxious',
      estresse: 'anxious',
      tristeza: 'sad',
      culpa: 'sad',
      solidao: 'sad',
      raiva: 'anxious',
      sono: 'sleep',
      calma: 'calm',
      alegria: 'happy',
      confusao: 'neutral'
    };

    // Mapeamento de emoção para exercício sugerido
    const emotionToExercise = {
      ansiedade: intensity > 0.7 ? 'breathing-478' : 'meditation',
      medo: 'grounding',
      estresse: 'breathing-box',
      tristeza: 'journal',
      culpa: 'journal',
      raiva: 'breathing-478',
      sono: 'deep-sleep',
      calma: 'meditation',
      alegria: null,
      confusao: 'journal'
    };

    emotionState = emotionToState[emotion] || 'neutral';
    suggestedExercise = emotionToExercise[emotion] || null;

    // Gera resposta baseada na emoção
    switch (emotion) {
      case 'cumprimento':
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
          response = this.randomChoice(RespostasEmpaticas.cumprimento.manha);
        } else if (hour >= 12 && hour < 18) {
          response = this.randomChoice(RespostasEmpaticas.cumprimento.tarde);
        } else if (hour >= 18 && hour < 23) {
          response = this.randomChoice(RespostasEmpaticas.cumprimento.noite);
        } else {
          response = this.randomChoice(RespostasEmpaticas.cumprimento.madrugada);
        }
        break;

      case 'despedida':
        response = this.randomChoice(RespostasEmpaticas.despedida);
        break;

      case 'gratidao':
        response = this.randomChoice(RespostasEmpaticas.gratidao);
        break;

      case 'sobreAssistente':
        response = this.randomChoice(RespostasEmpaticas.sobreAssistente);
        break;

      case 'ansiedade':
        const ansiedadeResp = RespostasEmpaticas.ansiedade;
        if (intensity > 0.7) {
          response = `${this.randomChoice(ansiedadeResp.validacao)} ${this.randomChoice(ansiedadeResp.acaoUrgente)}`;
        } else {
          response = `${this.randomChoice(ansiedadeResp.validacao)} ${this.randomChoice(ansiedadeResp.acolhimento)} ${this.randomChoice(ansiedadeResp.acaoLeve)}`;
        }
        break;

      case 'tristeza':
        const tristezaResp = RespostasEmpaticas.tristeza;
        response = `${this.randomChoice(tristezaResp.validacao)} ${this.randomChoice(tristezaResp.acolhimento)} ${this.randomChoice(tristezaResp.acaoLeve)}`;
        break;

      case 'raiva':
        const raivaResp = RespostasEmpaticas.raiva;
        response = `${this.randomChoice(raivaResp.validacao)} ${this.randomChoice(raivaResp.acolhimento)} ${this.randomChoice(raivaResp.acaoLeve)}`;
        break;

      case 'medo':
        const medoResp = RespostasEmpaticas.medo;
        response = `${this.randomChoice(medoResp.validacao)} ${this.randomChoice(medoResp.seguranca)} ${this.randomChoice(medoResp.acaoLeve)}`;
        break;

      case 'sono':
        const sonoResp = RespostasEmpaticas.sono;
        response = `${this.randomChoice(sonoResp.validacao)} ${this.randomChoice(sonoResp.acolhimento)} ${this.randomChoice(sonoResp.acaoLeve)}`;
        break;

      case 'calma':
        const calmaResp = RespostasEmpaticas.calma;
        response = `${this.randomChoice(calmaResp.validacao)} ${this.randomChoice(calmaResp.encorajamento)}`;
        break;

      case 'alegria':
        const alegriaResp = RespostasEmpaticas.alegria;
        response = `${this.randomChoice(alegriaResp.validacao)} ${this.randomChoice(alegriaResp.encorajamento)}`;
        break;

      case 'confusao':
        const confusaoResp = RespostasEmpaticas.confusao;
        response = `${this.randomChoice(confusaoResp.validacao)} ${this.randomChoice(confusaoResp.acolhimento)} ${this.randomChoice(confusaoResp.exploracao)}`;
        break;

      case 'culpa':
        const culpaResp = RespostasEmpaticas.culpa;
        response = `${this.randomChoice(culpaResp.validacao)} ${this.randomChoice(culpaResp.acolhimento)}`;
        break;

      case 'estresse':
        const estresseResp = RespostasEmpaticas.estresse;
        response = `${this.randomChoice(estresseResp.validacao)} ${this.randomChoice(estresseResp.acolhimento)} ${this.randomChoice(estresseResp.acaoLeve)}`;
        break;

      case 'conversa':
        response = 'Estou aqui para ouvir você. Pode falar o que quiser, sem julgamento. O que está passando pela sua cabeça?';
        suggestedExercise = null;
        break;

      default:
        response = this.randomChoice(RespostasEmpaticas.naoEntendi);
        break;
    }

    return { response, suggestedExercise, emotionState };
  }

  /**
   * Processa entrada do usuário e retorna resposta completa
   */
  process(userInput) {
    // Adiciona ao histórico
    this.conversationHistory.push({
      role: 'user',
      content: userInput,
      timestamp: new Date()
    });

    // Identifica emoção
    const emotionData = this.identifyEmotion(userInput);

    // Gera resposta
    const { response, suggestedExercise, emotionState } = this.generateResponse(emotionData);

    // Atualiza estado interno
    this.currentEmotion = emotionState;
    this.emotionIntensity = emotionData.intensity;

    // Adiciona resposta ao histórico
    this.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    });

    return {
      message: response,
      emotion: emotionState,
      intensity: emotionData.intensity,
      suggestedExercise,
      originalEmotion: emotionData.emotion,
      urgent: emotionData.urgent || false
    };
  }

  /**
   * Retorna saudação baseada no horário
   */
  getGreeting() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return this.randomChoice([
        'Bom dia! Como você está se sentindo hoje?',
        'Bom dia! Que bom te ver. Como você está?',
        'Bom dia! Estou aqui para você. Como está se sentindo?'
      ]);
    } else if (hour >= 12 && hour < 18) {
      return this.randomChoice([
        'Boa tarde! Como está sendo o seu dia?',
        'Boa tarde! Vejo que você voltou. Como está se sentindo?',
        'Boa tarde! Estou aqui. Como você está?'
      ]);
    } else if (hour >= 18 && hour < 23) {
      return this.randomChoice([
        'Boa noite! Como você está se sentindo?',
        'Boa noite! Como foi o seu dia?',
        'Boa noite! Estou aqui se precisar conversar.'
      ]);
    } else {
      return this.randomChoice([
        'Oi! O sono não veio, né? Estou aqui com você.',
        'Oi! Noite difícil? Posso te ajudar.',
        'Olá! Não consegue dormir? Vamos ver como posso ajudar.'
      ]);
    }
  }

  /**
   * Limpa histórico da conversa
   */
  clearHistory() {
    this.conversationHistory = [];
    this.currentEmotion = 'neutral';
    this.emotionIntensity = 0;
  }
}

// Exporta instância única (singleton)
window.EmotionalNLP = new EmotionalNLPEngine();

// Exporta classe para uso externo se necessário
window.EmotionalNLPEngine = EmotionalNLPEngine;

// Exporta lexicon para possível customização
window.EmotionalLexicon = EmotionalLexicon;
window.RespostasEmpaticas = RespostasEmpaticas;
