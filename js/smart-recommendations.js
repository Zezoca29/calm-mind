// smart-recommendations.js - Sistema Inteligente de Recomendações e Recepção Personalizada

class SmartRecommendationEngine {
    constructor() {
        this.userProfile = {};
        this.dailyPatterns = {};
        this.emotionalState = {};
        this.recommendationHistory = [];
    }

    // ==========================================
    // ANÁLISE DE PADRÕES E TENDÊNCIAS
    // ==========================================

    /**
     * Analisa padrões dos últimos 7-30 dias
     */
    async analyzePatterns() {
        try {
            const moodEntries = await this.getMoodEntriesLast30Days();
            const sleepEntries = await this.getSleepEntriesLast30Days();
            const breathingSessions = await this.getBreathingSessionsLast30Days();

            if (!moodEntries.length) return null;

            return {
                moodTrend: this.calculateMoodTrend(moodEntries),
                sleepQuality: this.analyzeSleepQuality(sleepEntries),
                anxietyPatterns: this.detectAnxietyPatterns(moodEntries),
                bestTimeForExercises: this.identifyBestExerciseTime(moodEntries),
                weekdayVsWeekend: this.compareWeekdayPatterns(moodEntries),
                triggerTimes: this.identifyTriggerTimes(moodEntries),
                recoveryRate: this.calculateRecoveryRate(moodEntries),
                exerciseFrequency: this.analyzeExerciseFrequency(breathingSessions),
                consistencyScore: this.calculateConsistencyScore(moodEntries, sleepEntries)
            };
        } catch (error) {
            console.error('Erro ao analisar padrões:', error);
            return null;
        }
    }

    /**
     * Calcula tendência geral de humor (melhorando, piorando, estável)
     */
    calculateMoodTrend(entries) {
        if (entries.length < 3) return 'insufficient_data';

        const recentMood = entries.slice(-7).reduce((sum, e) => sum + e.mood, 0) / Math.min(7, entries.length);
        const previousMood = entries.slice(-14, -7).reduce((sum, e) => sum + e.mood, 0) / Math.min(7, entries.slice(-14, -7).length);

        if (recentMood > previousMood + 0.5) return 'improving';
        if (recentMood < previousMood - 0.5) return 'declining';
        return 'stable';
    }

    /**
     * Analisa qualidade do sono
     */
    analyzeSleepQuality(entries) {
        if (!entries.length) return null;

        // Filter out invalid entries and ensure duration is a valid number
        const validEntries = entries.filter(e => {
            const duration = e.duration || 0;
            return typeof duration === 'number' && !isNaN(duration) && duration >= 0 && duration <= 99.99;
        });

        if (!validEntries.length) return null;

        const avgDuration = validEntries.reduce((sum, e) => sum + (e.duration || 0), 0) / validEntries.length;
        const avgQuality = validEntries.reduce((sum, e) => sum + (e.quality || 0), 0) / validEntries.length;

        return {
            averageDuration: Math.round(avgDuration * 10) / 10,
            averageQuality: Math.round(avgQuality * 10) / 10,
            status: avgQuality >= 3.5 ? 'good' : avgQuality >= 2.5 ? 'fair' : 'poor',
            trend: this.calculateSleepTrend(validEntries)
        };
    }

    /**
     * Detecta padrões de ansiedade (picos, horários, frequência)
     */
    detectAnxietyPatterns(entries) {
        if (entries.length < 5) return null;

        const anxious = entries.filter(e => e.mood <= 2);
        const hourlyDistribution = {};
        const dayDistribution = {};

        entries.forEach(entry => {
            const date = new Date(entry.date);
            const hour = date.getHours();
            const day = date.toLocaleDateString('pt-BR', { weekday: 'long' });

            hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
            dayDistribution[day] = (dayDistribution[day] || 0) + 1;
        });

        const peakHour = Object.entries(hourlyDistribution).reduce((a, b) => b[1] > a[1] ? b : a)[0];
        const frequencyPerWeek = (anxious.length / (entries.length / 7)).toFixed(1);

        return {
            frequencyPerWeek: parseFloat(frequencyPerWeek),
            peakHour: parseInt(peakHour),
            percentageOfDays: ((anxious.length / entries.length) * 100).toFixed(1),
            dayDistribution,
            severity: anxious.reduce((sum, e) => sum + e.anxiety_level, 0) / anxious.length || 0
        };
    }

    /**
     * Identifica horários mais produtivos para exercícios
     */
    identifyBestExerciseTime(entries) {
        const successByHour = {};
        
        entries.forEach(entry => {
            const date = new Date(entry.date);
            const hour = date.getHours();
            
            if (!successByHour[hour]) {
                successByHour[hour] = { count: 0, moodAfter: 0 };
            }
            
            successByHour[hour].count++;
            successByHour[hour].moodAfter += entry.mood;
        });

        let bestHour = null;
        let bestScore = -Infinity;

        Object.entries(successByHour).forEach(([hour, data]) => {
            const score = (data.moodAfter / data.count);
            if (score > bestScore) {
                bestScore = score;
                bestHour = parseInt(hour);
            }
        });

        return bestHour || 14; // 14h como padrão
    }

    /**
     * Detecta horários gatilho de ansiedade
     */
    identifyTriggerTimes(entries) {
        const triggersByHour = {};
        const anxiousEntries = entries.filter(e => e.mood <= 2 || e.anxiety_level > 5);

        anxiousEntries.forEach(entry => {
            const date = new Date(entry.date);
            const hour = date.getHours();
            triggersByHour[hour] = (triggersByHour[hour] || 0) + 1;
        });

        return Object.entries(triggersByHour)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([hour, count]) => ({ hour: parseInt(hour), frequency: count }));
    }

    /**
     * Calcula taxa de recuperação (tempo para voltar ao mood normal após ansiedade)
     */
    calculateRecoveryRate(entries) {
        const anxiousIndices = entries
            .map((e, i) => ({ index: i, mood: e.mood }))
            .filter(e => e.mood <= 2);

        if (anxiousIndices.length === 0) return 100;

        let totalRecoveryDays = 0;
        let recoveryCount = 0;

        anxiousIndices.forEach(anxious => {
            for (let i = anxious.index + 1; i < entries.length; i++) {
                if (entries[i].mood >= 3) {
                    totalRecoveryDays += (i - anxious.index);
                    recoveryCount++;
                    break;
                }
            }
        });

        return recoveryCount > 0 ? Math.round(totalRecoveryDays / recoveryCount) : 0;
    }

    /**
     * Analisa consistência (quantos dias consecutivos registrou)
     */
    calculateConsistencyScore(moodEntries, sleepEntries) {
        const allEntries = [...moodEntries, ...sleepEntries]
            .map(e => new Date(e.date).toDateString())
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort();

        if (allEntries.length === 0) return 0;

        let maxStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < allEntries.length; i++) {
            const current = new Date(allEntries[i]);
            const previous = new Date(allEntries[i - 1]);
            const dayDiff = (current - previous) / (1000 * 60 * 60 * 24);

            if (dayDiff === 1) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return maxStreak;
    }

    /**
     * Compara padrões de dias úteis vs fins de semana
     */
    compareWeekdayPatterns(entries) {
        const weekday = { count: 0, mood: 0, anxiety: 0 };
        const weekend = { count: 0, mood: 0, anxiety: 0 };

        entries.forEach(entry => {
            const date = new Date(entry.date);
            const day = date.getDay();
            const isWeekend = day === 0 || day === 6;

            if (isWeekend) {
                weekend.count++;
                weekend.mood += entry.mood;
                weekend.anxiety += entry.anxiety_level || 0;
            } else {
                weekday.count++;
                weekday.mood += entry.mood;
                weekday.anxiety += entry.anxiety_level || 0;
            }
        });

        return {
            weekday: {
                avgMood: weekday.count > 0 ? (weekday.mood / weekday.count).toFixed(2) : 0,
                avgAnxiety: weekday.count > 0 ? (weekday.anxiety / weekday.count).toFixed(2) : 0
            },
            weekend: {
                avgMood: weekend.count > 0 ? (weekend.mood / weekend.count).toFixed(2) : 0,
                avgAnxiety: weekend.count > 0 ? (weekend.anxiety / weekend.count).toFixed(2) : 0
            }
        };
    }

    /**
     * Analisa frequência de exercícios respiratórios
     */
    analyzeExerciseFrequency(sessions) {
        if (sessions.length === 0) return { frequency: 'none', status: 'não pratica' };

        const daysWithExercise = new Set(sessions.map(s => new Date(s.date).toDateString())).size;
        const frequency = daysWithExercise / 7; // por semana

        if (frequency > 3) return { frequency: 'frequent', status: 'pratica regularmente' };
        if (frequency > 1) return { frequency: 'moderate', status: 'pratica ocasionalmente' };
        return { frequency: 'rare', status: 'pratica raramente' };
    }

    /**
     * Calcula tendência de sono
     */
    calculateSleepTrend(entries) {
        // Filter out invalid entries
        const validEntries = entries.filter(e => {
            const duration = e.duration || 0;
            return typeof duration === 'number' && !isNaN(duration) && duration >= 0 && duration <= 99.99;
        });

        if (validEntries.length < 3) return 'insufficient_data';

        const recentQuality = validEntries.slice(-7).reduce((sum, e) => sum + (e.quality || 0), 0) / Math.min(7, validEntries.length);
        const previousQuality = validEntries.slice(-14, -7).reduce((sum, e) => sum + (e.quality || 0), 0) / Math.min(7, validEntries.slice(-14, -7).length);

        if (recentQuality > previousQuality + 0.5) return 'improving';
        if (recentQuality < previousQuality - 0.5) return 'declining';
        return 'stable';
    }

    // ==========================================
    // SISTEMA DE RECOMENDAÇÕES INTELIGENTES
    // ==========================================

    /**
     * Gera recomendações personalizadas baseadas em padrões
     */
    async generateRecommendations() {
        try {
            const patterns = await this.analyzePatterns();
            const currentHour = new Date().getHours();
            const recommendations = [];

            if (!patterns) {
                return this.getDefaultRecommendations();
            }

            // Recomendação baseada em tendência de humor
            if (patterns.moodTrend === 'declining') {
                recommendations.push({
                    type: 'urgent',
                    priority: 1,
                    emoji: '🔴',
                    title: 'Seu humor está em declínio',
                    message: 'Notamos que seu bem-estar pode estar sendo afetado. Vamos tentar um exercício de respiração?',
                    exercise: 'simple',
                    action: 'Comece agora',
                    reasoning: 'Mudança negativa detectada'
                });
            }

            // Recomendação baseada em qualidade de sono
            if (patterns.sleepQuality && patterns.sleepQuality.status === 'poor') {
                recommendations.push({
                    type: 'important',
                    priority: 2,
                    emoji: '😴',
                    title: 'Qualidade do sono em baixa',
                    message: `Seus registros mostram média de ${patterns.sleepQuality.averageDuration}h de sono. Tente exercícios relaxantes antes de dormir.`,
                    exercise: 'box',
                    action: 'Exercício para dormir',
                    reasoning: 'Sono insuficiente detectado'
                });
            }

            // Recomendação por padrão de ansiedade
            if (patterns.anxietyPatterns && patterns.anxietyPatterns.frequencyPerWeek > 2) {
                const peakHour = patterns.anxietyPatterns.peakHour;
                const hoursUntilPeak = (peakHour - currentHour + 24) % 24;

                recommendations.push({
                    type: 'preventive',
                    priority: 3,
                    emoji: '⚠️',
                    title: 'Hora de ansiedade detectada',
                    message: `Você costuma ficar ansioso(a) por volta das ${peakHour}h. Quer começar um exercício preventivo agora?`,
                    exercise: '478',
                    action: 'Começar exercício',
                    reasoning: `Pico de ansiedade em ${hoursUntilPeak}h`
                });
            }

            // Recomendação por consistência
            if (patterns.consistencyScore < 3) {
                recommendations.push({
                    type: 'motivational',
                    priority: 4,
                    emoji: '💪',
                    title: 'Mantenha a consistência',
                    message: 'Registros regulares ajudam a identificar padrões. Você já registrou hoje?',
                    exercise: null,
                    action: 'Fazer check-in',
                    reasoning: 'Consistência baixa'
                });
            }

            // Recomendação de exercício baseada na hora ideal
            if (!recommendations.some(r => r.exercise)) {
                recommendations.push({
                    type: 'routine',
                    priority: 5,
                    emoji: '🧘',
                    title: 'Hora do exercício diário',
                    message: `${patterns.bestTimeForExercises}h é geralmente seu melhor horário para exercícios. Quer começar?`,
                    exercise: 'simple',
                    action: 'Começar exercício',
                    reasoning: 'Horário ideal identificado'
                });
            }

            this.recommendationHistory = recommendations;
            return recommendations.sort((a, b) => a.priority - b.priority);
        } catch (error) {
            console.error('Erro ao gerar recomendações:', error);
            return this.getDefaultRecommendations();
        }
    }

    /**
     * Recomendações padrão quando não há dados suficientes
     */
    getDefaultRecommendations() {
        const hour = new Date().getHours();
        const recommendations = [];

        if (hour >= 22 || hour < 6) {
            recommendations.push({
                type: 'routine',
                priority: 1,
                emoji: '🌙',
                title: 'Hora de descanso',
                message: 'Que tal um exercício relaxante para preparar uma boa noite de sono?',
                exercise: 'box',
                action: 'Exercício relaxante',
                reasoning: 'Horário noturno'
            });
        } else if (hour >= 12 && hour < 13) {
            recommendations.push({
                type: 'routine',
                priority: 1,
                emoji: '☀️',
                title: 'Pausa do almoço',
                message: 'Que tal uma pausa com um exercício de respiração rápido?',
                exercise: 'simple',
                action: 'Começar exercício',
                reasoning: 'Horário do almoço'
            });
        } else {
            recommendations.push({
                type: 'routine',
                priority: 1,
                emoji: '🧘',
                title: 'Bem-estar do dia',
                message: 'Como você está se sentindo? Que tal um exercício de respiração?',
                exercise: 'simple',
                action: 'Começar exercício',
                reasoning: 'Sugestão geral'
            });
        }

        recommendations.push({
            type: 'motivational',
            priority: 2,
            emoji: '📝',
            title: 'Registre seu dia',
            message: 'Seus registros nos ajudam a conhecer você melhor e criar recomendações mais precisas.',
            exercise: null,
            action: 'Fazer check-in',
            reasoning: 'Importância do registro'
        });

        return recommendations;
    }

    // ==========================================
    // RECEPÇÃO DINÂMICA E PERSONALIZADA
    // ==========================================

    /**
     * Gera saudação personalizada baseada em padrões e hora
     */
    async generateGreeting(userName) {
        try {
            const hour = new Date().getHours();
            const patterns = await this.analyzePatterns();
            const lastMood = await this.getLastMoodEntry();

            let greeting = this.getTimeBasedGreeting(hour, userName);
            let emoji = this.getTimeBasedEmoji(hour);
            let subtitle = '';
            let insight = '';

            // Adicionar insights personalizados
            if (patterns) {
                if (patterns.moodTrend === 'improving') {
                    insight = '✨ Que ótimo! Seu bem-estar está melhorando!';
                } else if (patterns.moodTrend === 'declining') {
                    insight = '💙 Vemos que você pode estar precisando de apoio. Estamos aqui!';
                } else {
                    insight = `🎯 Seu humor está estável. ${this.getMotivationalMessage()}`;
                }

                // Adicionar contexto de sono
                if (patterns.sleepQuality) {
                    if (patterns.sleepQuality.status === 'good') {
                        subtitle = `Que noite de sono fantástica! Você dormiu bem.`;
                    } else if (patterns.sleepQuality.status === 'poor') {
                        subtitle = `Notamos que seu sono está afetando seu bem-estar. Vamos cuidar disso hoje.`;
                    }
                }
            }

            // Informações sobre histórico
            const info = {
                greeting,
                emoji,
                subtitle,
                insight,
                lastMoodStatus: lastMood ? this.getMoodStatus(lastMood.mood) : null,
                timeSinceLastCheck: lastMood ? this.getTimeSinceLastCheck(lastMood.date) : null,
                consistencyStatus: patterns?.consistencyScore ? this.getConsistencyBadge(patterns.consistencyScore) : null
            };

            return info;
        } catch (error) {
            console.error('Erro ao gerar saudação:', error);
            return this.getDefaultGreeting(userName);
        }
    }

    /**
     * Saudação baseada na hora do dia
     */
    getTimeBasedGreeting(hour, userName) {
        const name = userName ? `, ${userName.split(' ')[0]}!` : '!';

        if (hour >= 5 && hour < 12) {
            return `Bom dia${name}`;
        } else if (hour >= 12 && hour < 17) {
            return `Boa tarde${name}`;
        } else if (hour >= 17 && hour < 21) {
            return `Boa noite${name}`;
        } else {
            return `Bem-vindo(a) de volta${name}`;
        }
    }

    /**
     * Emoji baseado na hora do dia
     */
    getTimeBasedEmoji(hour) {
        if (hour >= 5 && hour < 12) return '🌅';
        if (hour >= 12 && hour < 17) return '☀️';
        if (hour >= 17 && hour < 21) return '🌆';
        return '🌙';
    }

    /**
     * Mensagem motivacional aleatória
     */
    getMotivationalMessage() {
        const messages = [
            'Você é mais forte do que pensa.',
            'Cada respiração traz uma nova oportunidade.',
            'Pequenos passos levam a grandes mudanças.',
            'Você está fazendo um ótimo trabalho.',
            'Este é um ótimo dia para cuidar de si mesmo.'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Status do humor em forma legível
     */
    getMoodStatus(mood) {
        if (mood <= 1) return { text: 'Muito ansioso(a)', emoji: '😰', color: 'red' };
        if (mood <= 2) return { text: 'Ansioso(a)', emoji: '😟', color: 'orange' };
        if (mood <= 3) return { text: 'Neutro', emoji: '😐', color: 'yellow' };
        if (mood <= 4) return { text: 'Bem', emoji: '😊', color: 'green' };
        return { text: 'Muito bem', emoji: '😄', color: 'green' };
    }

    /**
     * Calcula tempo desde último check-in
     */
    getTimeSinceLastCheck(date) {
        const now = new Date();
        const lastCheck = new Date(date);
        const diffHours = Math.floor((now - lastCheck) / (1000 * 60 * 60));

        if (diffHours < 1) return 'Hoje';
        if (diffHours < 24) return `Há ${diffHours}h`;
        if (diffHours < 48) return 'Ontem';
        return `Há ${Math.floor(diffHours / 24)} dias`;
    }

    /**
     * Badge de consistência
     */
    getConsistencyBadge(days) {
        if (days >= 30) return { level: 'master', emoji: '🏆', text: 'Você é um mestre de consistência!' };
        if (days >= 14) return { level: 'excellent', emoji: '⭐', text: 'Sequência excelente!' };
        if (days >= 7) return { level: 'good', emoji: '✨', text: 'Semana consistente!' };
        if (days >= 3) return { level: 'good', emoji: '🔥', text: 'Começando bem!' };
        return null;
    }

    /**
     * Saudação padrão
     */
    getDefaultGreeting(userName) {
        const name = userName ? `, ${userName.split(' ')[0]}!` : '!';
        return {
            greeting: `Bem-vindo(a)${name}`,
            emoji: '👋',
            subtitle: 'Como você está se sentindo hoje?',
            insight: 'Comece registrando seu estado emocional para que possamos ajudá-lo melhor.',
            lastMoodStatus: null,
            timeSinceLastCheck: null,
            consistencyStatus: null
        };
    }

    // ==========================================
    // CHECK-IN PROATIVO
    // ==========================================

    /**
     * Gera perguntas de check-in contextuais
     */
    generateCheckInQuestions() {
        const hour = new Date().getHours();
        const questions = [
            {
                context: 'morning',
                timeRange: [5, 12],
                questions: [
                    'Como você dormiu ontem?',
                    'Você está descansado(a)?',
                    'Como você se sente nesta manhã?',
                    'Qual é sua expectativa para hoje?'
                ]
            },
            {
                context: 'afternoon',
                timeRange: [12, 17],
                questions: [
                    'Como está seu dia até agora?',
                    'Você se sente produtivo(a)?',
                    'Algo o(a) incomodou hoje?',
                    'Que tal fazer uma pausa com um exercício?'
                ]
            },
            {
                context: 'evening',
                timeRange: [17, 21],
                questions: [
                    'Como foi seu dia?',
                    'Você se sentiu motivado(a)?',
                    'Houve algo estressante?',
                    'Que tal relaxar antes de dormir?'
                ]
            },
            {
                context: 'night',
                timeRange: [21, 24],
                questions: [
                    'Como você se sente antes de dormir?',
                    'Está ansioso(a)?',
                    'Quer um exercício para relaxar?',
                    'Qual é sua expectativa de sono?'
                ]
            }
        ];

        const currentContext = questions.find(q => {
            if (q.timeRange[0] <= q.timeRange[1]) {
                return hour >= q.timeRange[0] && hour < q.timeRange[1];
            }
        });

        if (currentContext) {
            const randomQuestion = currentContext.questions[
                Math.floor(Math.random() * currentContext.questions.length)
            ];
            return {
                context: currentContext.context,
                question: randomQuestion
            };
        }

        return {
            context: 'general',
            question: 'Como você está se sentindo?'
        };
    }

    /**
     * Sugere próximos passos baseado na resposta
     */
    suggestNextSteps(moodValue, anxietyLevel) {
        const steps = [];

        // Nível de ansiedade muito alto
        if (anxietyLevel >= 7) {
            steps.push({
                priority: 1,
                type: 'urgent',
                suggestion: 'Modo SOS - Respiração de Emergência',
                emoji: '🆘',
                description: 'Vamos acalmar você com uma respiração guiada imediatamente'
            });
        }

        // Humor muito baixo
        if (moodValue <= 1) {
            steps.push({
                priority: 2,
                type: 'important',
                suggestion: 'Técnica de Ancoragem (5-4-3-2-1)',
                emoji: '🧘',
                description: 'Vamos trazer você de volta ao presente'
            });
        }

        // Sugestões gerais
        if (anxietyLevel <= 3) {
            steps.push({
                priority: 3,
                type: 'routine',
                suggestion: 'Exercício de Respiração Box (4-4-4-4)',
                emoji: '📦',
                description: 'Um exercício balanceado e calmante'
            });
        }

        if (moodValue <= 2) {
            steps.push({
                priority: 4,
                type: 'support',
                suggestion: 'Comunidade de Apoio',
                emoji: '👥',
                description: 'Conecte-se com psicólogos e pessoas com interesses similares'
            });
        }

        // Sugestão de diário
        steps.push({
            priority: 5,
            type: 'reflection',
            suggestion: 'Escrever no Diário',
            emoji: '📔',
            description: 'Expressar seus sentimentos pode ajudar a processá-los'
        });

        return steps.sort((a, b) => a.priority - b.priority);
    }

    // ==========================================
    // HELPERS - OBTER DADOS
    // ==========================================

    async getMoodEntriesLast30Days() {
        try {
            const entries = await getAllFromStore('moodEntries');
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            return entries.filter(e => new Date(e.date) >= thirtyDaysAgo) || [];
        } catch {
            return [];
        }
    }

    async getSleepEntriesLast30Days() {
        try {
            const entries = await getAllFromStore('sleepEntries');
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Filter out invalid entries and ensure duration is a valid number
            const validEntries = entries.filter(e => {
                // Check if entry has required fields
                if (!e.date) return false;
                
                // Check if date is valid
                const entryDate = new Date(e.date);
                if (isNaN(entryDate.getTime())) return false;
                
                // Check if duration is valid (between 0 and 99.99 hours)
                const duration = e.duration || 0;
                if (typeof duration !== 'number' && typeof duration !== 'string') return false;
                
                const durationValue = typeof duration === 'string' ? parseFloat(duration) : duration;
                if (isNaN(durationValue) || durationValue < 0 || durationValue > 99.99) return false;
                
                // Check if quality is valid (between 1 and 5)
                const quality = e.quality || 0;
                if (typeof quality !== 'number' || quality < 1 || quality > 5) return false;
                
                return entryDate >= thirtyDaysAgo;
            });

            return validEntries;
        } catch {
            return [];
        }
    }

    async getBreathingSessionsLast30Days() {
        try {
            const sessions = await getAllFromStore('breathingSessions');
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            return sessions.filter(s => new Date(s.date) >= thirtyDaysAgo) || [];
        } catch {
            return [];
        }
    }

    
    async getLastMoodEntry() {
        try {
            const entries = await getAllFromStore('moodEntries');
            return entries.length > 0 ? entries[entries.length - 1] : null;
        } catch {
            return null;
        }
    }
}

// Instância global
const smartEngine = new SmartRecommendationEngine();

// Exportar para uso no index.html
window.SmartRecommendationEngine = SmartRecommendationEngine;
window.smartEngine = smartEngine;
