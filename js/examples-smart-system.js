// EXEMPLOS DE USO - Sistema Inteligente de Recomendações

/**
 * ========================================
 * 1. USAR O MOTOR DE RECOMENDAÇÕES
 * ========================================
 */

// Exemplo 1: Gerar todas as recomendações
async function exemploRecomendacoes() {
    const recomendacoes = await smartEngine.generateRecommendations();
    
    console.log('Recomendações geradas:');
    recomendacoes.forEach((rec, i) => {
        console.log(`${i + 1}. [${rec.priority}] ${rec.title}`);
        console.log(`   Mensagem: ${rec.message}`);
        console.log(`   Razão: ${rec.reasoning}`);
    });
}

// Exemplo 2: Obter saudação personalizada
async function exemploSaudacao() {
    const saudacao = await smartEngine.generateGreeting('Maria');
    
    console.log(`${saudacao.emoji} ${saudacao.greeting}`);
    console.log(`Subtitle: ${saudacao.subtitle}`);
    console.log(`Insight: ${saudacao.insight}`);
    
    if (saudacao.lastMoodStatus) {
        console.log(`Último check-in: ${saudacao.lastMoodStatus.text} (${saudacao.timeSinceLastCheck})`);
    }
}

// Exemplo 3: Gerar perguntas de check-in
function exemploCheckIn() {
    const checkIn = smartEngine.generateCheckInQuestions();
    
    console.log(`Contexto: ${checkIn.context}`);
    console.log(`Pergunta: ${checkIn.question}`);
}

// Exemplo 4: Sugerir próximos passos
function exemploProximos(moodValue = 2, anxietyLevel = 7) {
    const steps = smartEngine.suggestNextSteps(moodValue, anxietyLevel);
    
    steps.forEach(step => {
        console.log(`${step.emoji} ${step.suggestion}`);
        console.log(`   ${step.description}`);
    });
}

// Exemplo 5: Analisar padrões completos
async function exemploAnalise() {
    const patterns = await smartEngine.analyzePatterns();
    
    if (patterns) {
        console.log('=== ANÁLISE DE PADRÕES ===');
        console.log(`Tendência de Humor: ${patterns.moodTrend}`);
        console.log(`Qualidade de Sono: ${patterns.sleepQuality?.status}`);
        console.log(`Frequência de Ansiedade: ${patterns.anxietyPatterns?.frequencyPerWeek}x/semana`);
        console.log(`Melhor Horário: ${patterns.bestTimeForExercises}h`);
        console.log(`Consistência: ${patterns.consistencyScore} dias`);
    }
}

/**
 * ========================================
 * 2. CUSTOMIZAR RECOMENDAÇÕES
 * ========================================
 */

// Exemplo 6: Adicionar novas frases motivacionais
function adicionarFrasesMotivacionais() {
    // Modifique smart-recommendations.js:
    const novasFrases = [
        'Você é capaz de superar qualquer desafio',
        'Cada dia é uma nova oportunidade',
        'Respirar é viver plenamente',
        'Você merece paz mental',
        'Pequenos passos, grandes resultados'
    ];
    
    // Integre com:
    // smartEngine.getMotivationalMessage() // já usa frase aleatória
}

// Exemplo 7: Modificar cores de recomendações
function customizarCores() {
    // Em smart-ui-components.js, modifique:
    const cardColor = {
        urgent: 'border-l-4 border-purple-500 bg-purple-50',      // Mudou
        important: 'border-l-4 border-pink-500 bg-pink-50',       // Mudou
        preventive: 'border-l-4 border-indigo-500 bg-indigo-50',  // Mudou
        motivational: 'border-l-4 border-cyan-500 bg-cyan-50',    // Mudou
        routine: 'border-l-4 border-emerald-500 bg-emerald-50'    // Mudou
    }[type];
}

// Exemplo 8: Customizar perguntas de check-in
function customizarPerguntas() {
    // Modifique em smart-recommendations.js:
    const customQuestions = [
        {
            context: 'morning',
            timeRange: [5, 12],
            questions: [
                'Você se sente energizado(a) hoje?',
                'Qual é seu objetivo para hoje?',
                'Como você dormiu?'
            ]
        },
        // Adicione mais contextos...
    ];
}

/**
 * ========================================
 * 3. RENDERIZAR COMPONENTES
 * ========================================
 */

// Exemplo 9: Renderizar apenas recepção
async function renderApenasRecepcao() {
    await renderSmartGreeting();
}

// Exemplo 10: Renderizar apenas check-in
function renderApenasCheckIn() {
    renderInteractiveCheckIn();
}

// Exemplo 11: Renderizar recomendações e análise
async function renderRecomendacoesEAnalise() {
    await renderSmartRecommendations();
    await renderPatternsAnalysis();
}

// Exemplo 12: Atualizar componentes a cada hora
function atualizarComponentesHoraria() {
    setInterval(() => {
        renderAllSmartComponents();
    }, 60 * 60 * 1000); // A cada hora
}

/**
 * ========================================
 * 4. DADOS AVANÇADOS
 * ========================================
 */

// Exemplo 13: Obter últimas entradas de mood
async function obterUltimosMoods() {
    const moodEntries = await smartEngine.getMoodEntriesLast30Days();
    
    console.log(`Total de registros: ${moodEntries.length}`);
    moodEntries.forEach(entry => {
        console.log(`${new Date(entry.date).toLocaleString()}: ${entry.mood}/5`);
    });
}

// Exemplo 14: Obter histórico de sono
async function obterHistoricoSono() {
    const sleepEntries = await smartEngine.getSleepEntriesLast30Days();
    
    sleepEntries.forEach(entry => {
        console.log(`${entry.date}: ${entry.duration}h, Qualidade: ${entry.quality}/5`);
    });
}

// Exemplo 15: Obter últimos exercícios
async function obterUltimosExercicios() {
    const sessions = await smartEngine.getBreathingSessionsLast30Days();
    
    console.log(`Exercícios realizados: ${sessions.length}`);
    sessions.forEach(s => {
        console.log(`${s.date}: ${s.type} (${s.duration}min)`);
    });
}

/**
 * ========================================
 * 5. CASOS DE USO ESPECÍFICOS
 * ========================================
 */

// Exemplo 16: Detectar crise de ansiedade
async function detectarCriseDrop() {
    const moodEntries = await smartEngine.getMoodEntriesLast30Days();
    
    if (moodEntries.length < 2) return;
    
    const ultimoMood = moodEntries[moodEntries.length - 1].mood;
    const mediaAnterior = moodEntries.slice(-10, -1)
        .reduce((a, b) => a + b.mood, 0) / 9;
    
    if (ultimoMood < mediaAnterior - 2) {
        console.warn('⚠️ Detectada queda significativa no humor!');
        return true;
    }
    return false;
}

// Exemplo 17: Verificar se é hora de exercício
async function ehHoraDeExercicio() {
    const patterns = await smartEngine.analyzePatterns();
    
    if (!patterns) return false;
    
    const agora = new Date().getHours();
    const melhorHora = patterns.bestTimeForExercises;
    const diferenca = Math.abs(agora - melhorHora);
    
    if (diferenca <= 1) {
        console.log(`✅ Agora é um ótimo momento para exercício!`);
        return true;
    }
    return false;
}

// Exemplo 18: Mostrar consistência
async function mostrarConsistencia() {
    const patterns = await smartEngine.analyzePatterns();
    
    if (!patterns) return;
    
    const badge = smartEngine.getConsistencyBadge(patterns.consistencyScore);
    
    if (badge) {
        console.log(`${badge.emoji} ${badge.text}`);
        console.log(`Você tem ${patterns.consistencyScore} dias consecutivos!`);
    }
}

// Exemplo 19: Gerar relatório diário
async function gerarRelatorioDiario() {
    const patterns = await smartEngine.analyzePatterns();
    const greeting = await smartEngine.generateGreeting('Usuário');
    const recomendacoes = await smartEngine.generateRecommendations();
    
    const relatorio = {
        data: new Date().toLocaleDateString(),
        saudacao: greeting.greeting,
        insights: greeting.insight,
        tendencia: patterns?.moodTrend,
        recomendacoes: recomendacoes.slice(0, 3),
        consistencia: patterns?.consistencyScore
    };
    
    console.log('=== RELATÓRIO DO DIA ===');
    console.log(JSON.stringify(relatorio, null, 2));
    
    return relatorio;
}

/**
 * ========================================
 * 6. INTEGRAÇÃO COM EVENTOS
 * ========================================
 */

// Exemplo 20: Atualizar ao fazer login
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App carregado, renderizando componentes inteligentes...');
    await renderAllSmartComponents();
});

// Exemplo 21: Atualizar ao salvar entrada
function salvarEntradaComAtualizacao(novaEntrada) {
    // Salvar a entrada normalmente
    saveToStore('moodEntries', novaEntrada);
    
    // Depois atualizar componentes
    setTimeout(() => {
        renderAllSmartComponents();
    }, 500);
}

// Exemplo 22: Atualizar ao abrir dashboard
function mostrarDashboard() {
    showSection('dashboard');
    
    // Aguardar DOM ser renderizado
    setTimeout(() => {
        renderAllSmartComponents();
    }, 100);
}

/**
 * ========================================
 * 7. DEBUGGING E TESTES
 * ========================================
 */

// Exemplo 23: Testar análise de padrões
async function testarAnalise() {
    console.log('=== TESTE DE ANÁLISE ===');
    
    try {
        const analysis = await smartEngine.analyzePatterns();
        
        if (analysis) {
            console.log('✅ Análise bem-sucedida:');
            console.table(analysis);
        } else {
            console.warn('⚠️ Dados insuficientes para análise');
        }
    } catch (error) {
        console.error('❌ Erro na análise:', error);
    }
}

// Exemplo 24: Listar dados no IndexedDB
async function listarDados() {
    console.log('=== DADOS NO INDEXEDDB ===');
    
    const stores = ['moodEntries', 'sleepEntries', 'breathingSessions', 'diaryEntries'];
    
    for (const store of stores) {
        const dados = await getAllFromStore(store);
        console.log(`${store}: ${dados.length} registros`);
    }
}

// Exemplo 25: Simular novo usuário
function simularNovoUsuario() {
    // Limpar dados
    localStorage.clear();
    
    // Recarregar
    location.reload();
    
    // Sistema mostrará recomendações padrão
}

/**
 * ========================================
 * 8. CASES DE NEGÓCIO
 * ========================================
 */

// Exemplo 26: Aumentar engajamento
async function fomentarEngajamento() {
    const patterns = await smartEngine.analyzePatterns();
    
    if (!patterns) {
        // Novo usuário: recomendar primeiro exercício
        showToast('🎁 Bem-vindo! Vamos começar com um exercício simples?');
        return;
    }
    
    if (patterns.consistencyScore < 7) {
        // Pouca consistência: motivar
        showToast('🔥 Continue assim! Você está no caminho certo!');
    }
    
    if (patterns.moodTrend === 'improving') {
        // Humor melhorando: comemorar
        showToast('✨ Que ótimo progresso! Você é incrível!');
    }
}

// Exemplo 27: Reduzir churn
async function reduzirChurn() {
    const moodEntries = await smartEngine.getMoodEntriesLast30Days();
    
    // Se sem registros há 7 dias
    if (moodEntries.length === 0) {
        showToast('👋 Sentimos sua falta! Vamos fazer um check-in?');
    }
}

// Exemplo 28: Promover premium
async function promoverPremium() {
    const patterns = await smartEngine.analyzePatterns();
    
    if (patterns?.consistencyScore > 20) {
        // Usuário muito engajado
        showNotification(
            '🌟 Premium Disponível',
            'Seu comprometimento merece análises avançadas',
            'Conhecer Planos'
        );
    }
}

/**
 * ========================================
 * COMO USAR ESSES EXEMPLOS
 * ========================================
 
// No console do navegador (F12):

// Testar análise:
await exemploAnalise();

// Gerar recomendações:
await exemploRecomendacoes();

// Obter saudação:
await exemploSaudacao();

// Gerar relatório:
await gerarRelatorioDiario();

// Listar dados:
await listarDados();

// Detectar crise:
await detectarCriseDrop();

// Etc...

 * ========================================
 */

// Exportar exemplos
window.exemploRecomendacoes = exemploRecomendacoes;
window.exemploSaudacao = exemploSaudacao;
window.exemploCheckIn = exemploCheckIn;
window.exemploProximos = exemploProximos;
window.exemploAnalise = exemploAnalise;
window.testarAnalise = testarAnalise;
window.listarDados = listarDados;
window.gerarRelatorioDiario = gerarRelatorioDiario;
window.detectarCriseDrop = detectarCriseDrop;
