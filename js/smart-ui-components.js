// smart-ui-components.js - Componentes de UI para as Recomendações Inteligentes

/**
 * Renderiza a recepção personalizada no dashboard
 */
async function renderSmartGreeting() {
    try {
        // Obter nome do usuário
        const session = JSON.parse(localStorage.getItem('calm_mind_session') || '{}');
        const userName = session?.user?.email?.split('@')[0] || 'Bem-vindo(a)';

        // Gerar saudação
        const greetingData = await smartEngine.generateGreeting(userName);

        // Criar HTML da recepção
        const greetingContainer = document.createElement('div');
        greetingContainer.id = 'smartGreeting';
        greetingContainer.className = 'bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6 mb-6 border border-primary-200/50';
        
        let consistencyHTML = '';
        if (greetingData.consistencyStatus) {
            consistencyHTML = `
                <div class="mt-2 inline-block bg-white px-3 py-1 rounded-full text-sm font-medium">
                    <span>${greetingData.consistencyStatus.emoji}</span>
                    <span class="ml-1">${greetingData.consistencyStatus.text}</span>
                </div>
            `;
        }

        let moodHTML = '';
        if (greetingData.lastMoodStatus) {
            moodHTML = `
                <div class="mt-3 flex items-center gap-2 text-sm">
                    <span class="text-xl">${greetingData.lastMoodStatus.emoji}</span>
                    <span>${greetingData.lastMoodStatus.text}</span>
                    <span class="text-gray-500">(${greetingData.timeSinceLastCheck})</span>
                </div>
            `;
        }

        greetingContainer.innerHTML = `
            <div>
                <div class="flex items-center gap-3 mb-3">
                    <span class="text-4xl">${greetingData.emoji}</span>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">${greetingData.greeting}</h2>
                        <p class="text-gray-600">${greetingData.subtitle}</p>
                    </div>
                </div>
                <p class="text-primary-700 font-medium">${greetingData.insight}</p>
                ${moodHTML}
                ${consistencyHTML}
            </div>
        `;

        // Inserir no início do dashboard
        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection) {
            dashboardSection.prepend(greetingContainer);
        }
    } catch (error) {
        console.error('Erro ao renderizar saudação:', error);
    }
}

/**
 * Renderiza recomendações inteligentes
 */
async function renderSmartRecommendations() {
    try {
        const recommendations = await smartEngine.generateRecommendations();
        
        if (!recommendations.length) return;

        const recommendationsContainer = document.createElement('div');
        recommendationsContainer.id = 'smartRecommendations';
        recommendationsContainer.className = 'mb-6';

        const titleHTML = `
            <div class="flex items-center gap-2 mb-4">
                <span class="text-2xl">💡</span>
                <h3 class="text-xl font-bold text-gray-900">Recomendações Personalizadas</h3>
            </div>
        `;

        let recommendationsHTML = titleHTML;

        recommendations.slice(0, 3).forEach((rec, index) => {
            const { type, emoji, title, message, exercise, action } = rec;
            
            const cardColor = {
                urgent: 'border-l-4 border-red-500 bg-red-50',
                important: 'border-l-4 border-orange-500 bg-orange-50',
                preventive: 'border-l-4 border-yellow-500 bg-yellow-50',
                motivational: 'border-l-4 border-blue-500 bg-blue-50',
                routine: 'border-l-4 border-green-500 bg-green-50'
            }[type] || 'border-l-4 border-primary-500 bg-primary-50';

            const actionHTML = exercise ? `
                <button onclick="startBreathing('${exercise}')" class="mt-3 w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    ${action} →
                </button>
            ` : `
                <button onclick="showSection('mood')" class="mt-3 w-full bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                    ${action} →
                </button>
            `;

            recommendationsHTML += `
                <div class="card-feature ${cardColor} p-4 mb-3 cursor-pointer hover:shadow-lg transition-all" onclick="this.querySelector('button').click()">
                    <div class="flex items-start gap-3">
                        <span class="text-2xl flex-shrink-0">${emoji}</span>
                        <div class="flex-1">
                            <h4 class="font-bold text-gray-900">${title}</h4>
                            <p class="text-sm text-gray-700 mt-1">${message}</p>
                            <p class="text-xs text-gray-500 mt-2">📌 ${rec.reasoning}</p>
                            ${actionHTML}
                        </div>
                    </div>
                </div>
            `;
        });

        recommendationsContainer.innerHTML = recommendationsHTML;

        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection) {
            dashboardSection.appendChild(recommendationsContainer);
        }
    } catch (error) {
        console.error('Erro ao renderizar recomendações:', error);
    }
}

/**
 * Renderiza análise de padrões
 */
async function renderPatternsAnalysis() {
    try {
        const patterns = await smartEngine.analyzePatterns();
        
        if (!patterns) return;

        const patternsContainer = document.createElement('div');
        patternsContainer.id = 'patternsAnalysis';
        patternsContainer.className = 'grid grid-cols-2 gap-3 mb-6';

        // Tendência de humor
        const moodTrendHTML = `
            <div class="card-feature p-4">
                <div class="text-center">
                    <span class="text-3xl">
                        ${patterns.moodTrend === 'improving' ? '📈' : patterns.moodTrend === 'declining' ? '📉' : '➡️'}
                    </span>
                    <p class="text-xs text-gray-600 mt-2 font-semibold">
                        ${patterns.moodTrend === 'improving' ? 'Melhorando' : patterns.moodTrend === 'declining' ? 'Piorando' : 'Estável'}
                    </p>
                </div>
            </div>
        `;

        // Qualidade de sono
        let sleepHTML = '';
        if (patterns.sleepQuality) {
            const sleepStatus = {
                good: '😴 Ótimo',
                fair: '😐 Médio',
                poor: '😟 Ruim'
            }[patterns.sleepQuality.status];

            sleepHTML = `
                <div class="card-feature p-4">
                    <div class="text-center">
                        <p class="text-lg font-bold text-primary-600">${patterns.sleepQuality.averageQuality.toFixed(1)}/5</p>
                        <p class="text-xs text-gray-600 mt-1 font-semibold">${sleepStatus}</p>
                    </div>
                </div>
            `;
        }

        // Frequência de exercícios
        const exerciseHTML = `
            <div class="card-feature p-4">
                <div class="text-center">
                    <span class="text-3xl">🧘</span>
                    <p class="text-xs text-gray-600 mt-2 font-semibold">
                        ${patterns.exerciseFrequency.status}
                    </p>
                </div>
            </div>
        `;

        // Consistência
        const consistencyHTML = `
            <div class="card-feature p-4">
                <div class="text-center">
                    <p class="text-lg font-bold text-secondary-600">${patterns.consistencyScore}</p>
                    <p class="text-xs text-gray-600 mt-1 font-semibold">dias seguidos</p>
                </div>
            </div>
        `;

        patternsContainer.innerHTML = moodTrendHTML + sleepHTML + exerciseHTML + consistencyHTML;

        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection) {
            dashboardSection.appendChild(patternsContainer);
        }
    } catch (error) {
        console.error('Erro ao renderizar análise:', error);
    }
}

/**
 * Renderiza check-in interativo
 */
function renderInteractiveCheckIn() {
    const checkInContainer = document.createElement('div');
    checkInContainer.id = 'interactiveCheckIn';
    checkInContainer.className = 'bg-white rounded-2xl p-6 mb-6 border border-primary-200/50 shadow-lg';

    const checkInData = smartEngine.generateCheckInQuestions();

    checkInContainer.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center gap-3">
                <span class="text-2xl">❓</span>
                <h3 class="text-lg font-bold text-gray-900">${checkInData.question}</h3>
            </div>
            
            <div class="grid grid-cols-5 gap-2 my-4">
                <button class="check-in-mood-btn p-2 rounded-lg text-xl hover:scale-110 transition-transform" data-mood="1" title="Muito ansioso">😰</button>
                <button class="check-in-mood-btn p-2 rounded-lg text-xl hover:scale-110 transition-transform" data-mood="2" title="Ansioso">😟</button>
                <button class="check-in-mood-btn p-2 rounded-lg text-xl hover:scale-110 transition-transform" data-mood="3" title="Neutro">😐</button>
                <button class="check-in-mood-btn p-2 rounded-lg text-xl hover:scale-110 transition-transform" data-mood="4" title="Bem">😊</button>
                <button class="check-in-mood-btn p-2 rounded-lg text-xl hover:scale-110 transition-transform" data-mood="5" title="Muito bem">😄</button>
            </div>
            
            <textarea id="checkInNotes" placeholder="Algo mais que você quer compartilhar?" class="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"></textarea>
            
            <button onclick="submitCheckIn()" class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                Enviar Check-in
            </button>
        </div>
    `;

    const dashboardSection = document.getElementById('dashboard-section');
    if (dashboardSection) {
        // Remover check-in anterior se existir
        const oldCheckIn = document.getElementById('interactiveCheckIn');
        if (oldCheckIn) oldCheckIn.remove();
        
        dashboardSection.appendChild(checkInContainer);
    }

    // Adicionar event listeners
    document.querySelectorAll('.check-in-mood-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.check-in-mood-btn').forEach(b => {
                b.classList.remove('bg-primary-200', 'scale-110');
            });
            this.classList.add('bg-primary-200', 'scale-110');
        });
    });
}

/**
 * Submete o check-in e mostra próximos passos
 */
async function submitCheckIn() {
    const selectedMoodBtn = document.querySelector('.check-in-mood-btn.bg-primary-200');
    const notes = document.getElementById('checkInNotes')?.value || '';

    if (!selectedMoodBtn) {
        showToast('Por favor, selecione um emoji para continuar');
        return;
    }

    const mood = parseInt(selectedMoodBtn.dataset.mood);
    
    // Salvar entrada de humor
    const moodEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        mood: mood,
        anxiety_level: 5 - mood, // Inverso do mood
        notes: notes,
        synced: false
    };

    try {
        await saveToStore('moodEntries', moodEntry);
        showToast('✅ Check-in registrado com sucesso!');

        // Mostrar próximos passos
        const anxietyLevel = 5 - mood;
        const nextSteps = smartEngine.suggestNextSteps(mood, anxietyLevel);
        showNextStepsModal(nextSteps);

        // Atualizar dashboard
        setTimeout(() => {
            updateDashboard();
        }, 1000);
    } catch (error) {
        console.error('Erro ao salvar check-in:', error);
        showToast('❌ Erro ao salvar check-in');
    }
}

/**
 * Mostra modal com próximos passos recomendados
 */
function showNextStepsModal(steps) {
    const modal = document.createElement('div');
    modal.id = 'nextStepsModal';
    modal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4';

    let stepsHTML = '';
    steps.forEach(step => {
        stepsHTML += `
            <div class="bg-white rounded-lg p-4 mb-3 border-l-4 border-primary-600 hover:shadow-lg transition-all cursor-pointer" onclick="handleStepClick('${step.suggestion}')">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">${step.emoji}</span>
                    <div class="flex-1">
                        <p class="font-bold text-gray-900">${step.suggestion}</p>
                        <p class="text-sm text-gray-600">${step.description}</p>
                    </div>
                    <span class="text-gray-400">→</span>
                </div>
            </div>
        `;
    });

    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div class="flex items-center gap-3 mb-4">
                <span class="text-3xl">🎯</span>
                <h2 class="text-2xl font-bold">Próximos Passos</h2>
            </div>
            
            <p class="text-gray-600 mb-4">Baseado no seu estado, aqui estão algumas sugestões:</p>
            
            <div>
                ${stepsHTML}
            </div>
            
            <button onclick="closeNextStepsModal()" class="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors">
                Fechar
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Fecha modal de próximos passos
 */
function closeNextStepsModal() {
    const modal = document.getElementById('nextStepsModal');
    if (modal) modal.remove();
}

/**
 * Manipula clique em um passo sugerido
 */
function handleStepClick(suggestion) {
    closeNextStepsModal();

    if (suggestion.includes('SOS')) {
        activateSOS();
    } else if (suggestion.includes('Ancoragem')) {
        startGrounding();
    } else if (suggestion.includes('Box')) {
        startBreathing('box');
    } else if (suggestion.includes('Comunidade')) {
        openCommunityModal();
    } else if (suggestion.includes('Diário')) {
        showSection('diary');
    }
}

/**
 * Renderiza tudo de uma vez
 */
async function renderAllSmartComponents() {
    try {
        // Pequeno delay para melhor UX
        setTimeout(() => {
            renderInteractiveCheckIn();
        }, 100);

        setTimeout(() => {
            renderSmartRecommendations();
        }, 200);

        setTimeout(() => {
            renderPatternsAnalysis();
        }, 300);
    } catch (error) {
        console.error('Erro ao renderizar componentes inteligentes:', error);
    }
}

// Exportar para uso global
window.renderSmartGreeting = renderSmartGreeting;
window.renderSmartRecommendations = renderSmartRecommendations;
window.renderPatternsAnalysis = renderPatternsAnalysis;
window.renderInteractiveCheckIn = renderInteractiveCheckIn;
window.renderAllSmartComponents = renderAllSmartComponents;
window.submitCheckIn = submitCheckIn;
window.showNextStepsModal = showNextStepsModal;
window.closeNextStepsModal = closeNextStepsModal;
window.handleStepClick = handleStepClick;
