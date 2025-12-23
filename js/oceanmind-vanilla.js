/**
 * Ocean Mind - Implementação Vanilla JavaScript
 * Experiência imersiva de meditação sem dependência do React
 *
 * Features:
 * - Background oceânico dinâmico por horário
 * - Esfera emocional animada
 * - Painel de vidro (glassmorphism) com texto animado
 * - Menu radial de exercícios
 * - Modal de exercícios com progresso
 * - Text-to-Speech para narração
 * - Controles de áudio (play/pause, volume)
 * - Integração com EmotionalNLP engine
 */

// ============= CONFIGURAÇÕES =============

const OceanMindConfig = {
    emotionColors: {
        calm: { from: '#6DD5FA', to: '#2980B9', glow: 'rgba(109, 213, 250, 0.3)' },
        anxious: { from: '#FFB347', to: '#FF8C42', glow: 'rgba(255, 179, 71, 0.35)' },
        sleep: { from: '#B19CD9', to: '#6A5ACD', glow: 'rgba(177, 156, 217, 0.25)' },
        happy: { from: '#FFD93D', to: '#FFBE0B', glow: 'rgba(255, 217, 61, 0.3)' },
        sad: { from: '#B0C4DE', to: '#778899', glow: 'rgba(176, 196, 222, 0.25)' },
        neutral: { from: '#E8F5E9', to: '#A5D6A7', glow: 'rgba(232, 245, 233, 0.3)' }
    },

    emotionAnimations: {
        calm: { scale: 1.03, duration: 6, glow: '35px' },
        anxious: { scale: 1.08, duration: 2.5, glow: '55px' },
        sleep: { scale: 1.01, duration: 10, glow: '20px' },
        happy: { scale: 1.05, duration: 4, glow: '40px' },
        sad: { scale: 1.02, duration: 7, glow: '25px' },
        neutral: { scale: 1.02, duration: 5, glow: '30px' }
    },

    gradients: {
        dawn: 'linear-gradient(135deg, #FFB6A3 0%, #FFDA9E 100%)',
        morning: 'linear-gradient(135deg, #A8D8FF 0%, #E0F4FF 100%)',
        afternoon: 'linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%)',
        evening: 'linear-gradient(135deg, #FFB88C 0%, #D98FBA 100%)',
        night: 'linear-gradient(135deg, #1E2A47 0%, #4A5F7F 100%)'
    },

    exercises: {
        'breathing-478': {
            id: 'breathing-478',
            name: 'Respiração 4-7-8',
            duration: 120,
            script: [
                'Vamos começar. Sente-se confortavelmente e relaxe os ombros.',
                'Inspire profundamente pelo nariz... 2... 3... 4...',
                'Agora segure o ar... 2... 3... 4... 5... 6... 7...',
                'E solte lentamente pela boca... 2... 3... 4... 5... 6... 7... 8...',
                'Muito bem. Vamos continuar...',
                'Ótimo trabalho. Perceba como seu corpo está mais calmo agora.'
            ]
        },
        'breathing-box': {
            id: 'breathing-box',
            name: 'Respiração Box',
            duration: 180,
            script: [
                'Respiração Box é perfeita para reduzir ansiedade. Vamos começar.',
                'Inspire... 2... 3... 4... Segure... 2... 3... 4...',
                'Expire... 2... 3... 4... Segure... 2... 3... 4...',
                'Continue nesse ritmo. Você está indo muito bem.'
            ]
        },
        'meditation': {
            id: 'meditation',
            name: 'Meditação Guiada',
            duration: 180,
            script: [
                'Feche os olhos. Imagine uma praia vazia ao amanhecer.',
                'Sinta a areia morna sob seus pés.',
                'Ouça as ondas quebrando suavemente na areia.',
                'O vento toca seu rosto com delicadeza.',
                'Respire o ar salgado do mar.',
                'Você está seguro. Você está em paz.',
                'Aos poucos, traga sua consciência de volta.',
                'Abra os olhos lentamente.'
            ]
        },
        'grounding': {
            id: 'grounding',
            name: 'Técnica 5-4-3-2-1',
            duration: 240,
            script: [
                'Você está seguro. Vamos fazer um exercício para te trazer de volta ao aqui e agora.',
                'Olhe ao seu redor e identifique 5 coisas que você VÊ.',
                'Agora, 4 coisas que você pode TOCAR.',
                '3 coisas que você OUVE.',
                '2 coisas que você pode CHEIRAR ou gosta do cheiro.',
                'E 1 coisa que você pode PROVAR agora, ou lembra do gosto.',
                'Respire fundo. Você fez muito bem. A crise está passando.'
            ]
        },
        'deep-sleep': {
            id: 'deep-sleep',
            name: 'Sono Profundo',
            duration: 480,
            script: [
                'Deite-se confortavelmente. Ajuste o travesseiro. Solte o corpo.',
                'Vamos relaxar cada parte do seu corpo, uma de cada vez.',
                'Comece pelos dedos dos pés. Sinta-os pesados, relaxados.',
                'Agora as pernas. Elas estão ficando pesadas, afundando no colchão.',
                'Seu abdômen sobe e desce suavemente com a respiração.',
                'Os ombros caem, soltos. Não há tensão.',
                'Seu rosto relaxa. A testa, as sobrancelhas, a mandíbula.',
                'Você está pronto para dormir. Não precisa fazer nada. Apenas deixe acontecer.',
                'Boa noite. Durma bem.'
            ]
        },
        'journal': {
            id: 'journal',
            name: 'Diário Guiado',
            duration: 420,
            script: [
                'Como você está se sentindo agora, neste momento?',
                'O que aconteceu hoje que te marcou? Foi bom ou difícil?',
                'Do que você está com medo? Pode colocar em palavras?',
                'Pelo que você é grato hoje, mesmo que seja algo pequeno?',
                'O que você precisa ouvir agora para se sentir melhor?'
            ]
        }
    }
};

// ============= CLASSE TEXT-TO-SPEECH =============

class TextToSpeechManager {
    constructor() {
        this.isSpeaking = false;
        this.isPaused = false;
        this.isSupported = 'speechSynthesis' in window;
        this.currentUtterance = null;
    }

    speak(text, options = {}) {
        if (!this.isSupported) {
            console.warn('Text-to-Speech não é suportado neste navegador');
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = options.rate || 0.85;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        // Tenta encontrar uma voz em português
        const voices = window.speechSynthesis.getVoices();
        const ptBRVoice = voices.find(v => v.lang === 'pt-BR') ||
                          voices.find(v => v.lang.startsWith('pt')) ||
                          voices.find(v => v.lang === 'pt-PT');

        if (ptBRVoice) {
            utterance.voice = ptBRVoice;
        }

        utterance.onstart = () => {
            this.isSpeaking = true;
            this.isPaused = false;
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.isPaused = false;
            if (options.onEnd) options.onEnd();
        };

        utterance.onerror = (event) => {
            console.error('Erro no Text-to-Speech:', event);
            this.isSpeaking = false;
            this.isPaused = false;
        };

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    }

    pause() {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            this.isPaused = true;
        }
    }

    resume() {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            this.isPaused = false;
        }
    }

    stop() {
        window.speechSynthesis.cancel();
        this.isSpeaking = false;
        this.isPaused = false;
    }
}

// ============= CLASSE PRINCIPAL OCEAN MIND =============

class OceanMind {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.mainApp = document.getElementById('main-app');

        // Estado
        this.state = {
            emotion: 'neutral',
            timeOfDay: 'morning',
            showMenu: false,
            currentExercise: null,
            assistantMessage: '',
            suggestedExercise: null,
            isPlaying: true,
            audioEnabled: true
        };

        // Managers
        this.tts = new TextToSpeechManager();

        // Intervalos
        this.timeInterval = null;
        this.progressInterval = null;
        this.stepInterval = null;
        this.exerciseProgress = 0;
        this.exerciseStep = 0;

        // Bind methods
        this.handleInputSubmit = this.handleInputSubmit.bind(this);
        this.handleSphereTap = this.handleSphereTap.bind(this);
        this.selectExercise = this.selectExercise.bind(this);
        this.closeExercise = this.closeExercise.bind(this);
        this.closeMenu = this.closeMenu.bind(this);
        this.returnHome = this.returnHome.bind(this);
    }

    // ============= UTILITÁRIOS =============

    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 8) return 'dawn';
        if (hour >= 8 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 20) return 'evening';
        return 'night';
    }

    getGreeting() {
        if (window.EmotionalNLP) {
            return window.EmotionalNLP.getGreeting();
        }

        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Bom dia. Como você está se sentindo hoje?';
        if (hour >= 12 && hour < 18) return 'Boa tarde. Vejo que você voltou. Como foi o seu dia até agora?';
        if (hour >= 18 && hour < 22) return 'Boa noite. Está tudo bem?';
        return 'Oi. Parece que o sono não vem fácil hoje, né?';
    }

    // ============= RENDERIZAÇÃO DO HTML =============

    render() {
        const colors = OceanMindConfig.emotionColors[this.state.emotion];
        const animation = OceanMindConfig.emotionAnimations[this.state.emotion];
        const gradient = OceanMindConfig.gradients[this.state.timeOfDay];

        this.container.innerHTML = `
            <div class="ocean-mind-container">
                <!-- Estilos CSS -->
                <style>
                    .ocean-mind-container {
                        position: fixed;
                        inset: 0;
                        width: 100%;
                        height: 100vh;
                        overflow: hidden;
                        font-family: 'Inter', sans-serif;
                    }

                    /* Background Oceânico */
                    .ocean-background {
                        position: fixed;
                        inset: 0;
                        z-index: -1;
                        transition: background 3s ease-in-out;
                    }

                    .ocean-overlay {
                        position: absolute;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.15);
                    }

                    .ocean-waves {
                        position: absolute;
                        inset: 0;
                        width: 100%;
                        height: 100%;
                        opacity: 0.1;
                    }

                    /* Esfera Emocional */
                    .emotional-sphere {
                        position: absolute;
                        top: 30%;
                        left: 50%;
                        width: 150px;
                        height: 150px;
                        margin-left: -75px;
                        margin-top: -75px;
                        border-radius: 50%;
                        cursor: pointer;
                        transition: box-shadow 0.5s ease;
                    }

                    @keyframes breathe-calm { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
                    @keyframes breathe-anxious { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
                    @keyframes breathe-sleep { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.01); } }
                    @keyframes breathe-happy { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
                    @keyframes breathe-sad { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
                    @keyframes breathe-neutral { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }

                    /* Painel de Vidro */
                    .glass-panel {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 38vh;
                        min-height: 300px;
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(24px);
                        -webkit-backdrop-filter: blur(24px);
                        border-top-left-radius: 40px;
                        border-top-right-radius: 40px;
                        border-top: 1px solid rgba(255, 255, 255, 0.2);
                        box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.2);
                        padding: 2rem;
                        z-index: 20;
                    }

                    /* Texto Animado */
                    .animated-text {
                        color: rgba(255, 255, 255, 0.75);
                        font-size: 1.125rem;
                        font-weight: 300;
                        line-height: 1.8;
                    }

                    .animated-word {
                        display: inline-block;
                        margin-right: 0.25rem;
                        opacity: 0;
                        animation: fadeInWord 0.4s ease-out forwards;
                    }

                    @keyframes fadeInWord {
                        from { opacity: 0; transform: translateY(8px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    /* Botões de Ação */
                    .primary-action-btn {
                        margin-top: 2rem;
                        padding: 1rem 2rem;
                        background: rgba(255, 255, 255, 0.3);
                        backdrop-filter: blur(12px);
                        border-radius: 9999px;
                        color: white;
                        font-size: 1rem;
                        font-weight: 500;
                        border: 1px solid rgba(255, 255, 255, 0.4);
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.75rem;
                        transition: all 0.3s ease;
                    }

                    .primary-action-btn:hover {
                        background: rgba(255, 255, 255, 0.4);
                        transform: translateY(-2px);
                    }

                    .secondary-actions {
                        display: flex;
                        gap: 0.75rem;
                        margin-top: 1rem;
                        flex-wrap: wrap;
                    }

                    .secondary-action-btn {
                        padding: 0.5rem 1rem;
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(8px);
                        border-radius: 9999px;
                        color: rgba(255, 255, 255, 0.7);
                        font-size: 0.875rem;
                        font-weight: 300;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        transition: all 0.3s ease;
                    }

                    .secondary-action-btn:hover {
                        background: rgba(255, 255, 255, 0.2);
                    }

                    /* Input de Texto */
                    .input-container {
                        display: flex;
                        gap: 0.5rem;
                        margin-top: 1.5rem;
                    }

                    .message-input {
                        flex: 1;
                        padding: 0.75rem 1.25rem;
                        background: rgba(255, 255, 255, 0.05);
                        backdrop-filter: blur(8px);
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        border-radius: 9999px;
                        color: rgba(255, 255, 255, 0.8);
                        font-size: 0.875rem;
                        font-weight: 300;
                        outline: none;
                        transition: border-color 0.3s ease;
                    }

                    .message-input::placeholder {
                        color: rgba(255, 255, 255, 0.4);
                    }

                    .message-input:focus {
                        border-color: rgba(255, 255, 255, 0.3);
                    }

                    .send-btn {
                        width: 48px;
                        height: 48px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(255, 255, 255, 0.15);
                        border-radius: 50%;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }

                    .send-btn:hover {
                        background: rgba(255, 255, 255, 0.25);
                    }

                    /* Botão Home */
                    .home-btn {
                        position: fixed;
                        top: 1.5rem;
                        left: 1.5rem;
                        width: 48px;
                        height: 48px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(12px);
                        border-radius: 50%;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        cursor: pointer;
                        z-index: 30;
                        opacity: 0.4;
                        transition: all 0.3s ease;
                    }

                    .home-btn:hover {
                        background: rgba(255, 255, 255, 0.2);
                        opacity: 1;
                    }

                    /* Menu Radial */
                    .radial-menu-overlay {
                        position: fixed;
                        inset: 0;
                        z-index: 40;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }

                    .radial-menu-backdrop {
                        position: absolute;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.5);
                        backdrop-filter: blur(12px);
                    }

                    .radial-menu-container {
                        position: relative;
                        width: 250px;
                        height: 250px;
                    }

                    .radial-menu-btn {
                        position: absolute;
                        width: 64px;
                        height: 64px;
                        margin-left: -32px;
                        margin-top: -32px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 4px;
                        background: rgba(255, 255, 255, 0.95);
                        backdrop-filter: blur(12px);
                        border-radius: 50%;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                        cursor: pointer;
                        border: none;
                        transition: transform 0.2s ease;
                        animation: fadeInScale 0.3s ease-out backwards;
                    }

                    .radial-menu-btn:hover {
                        transform: scale(1.1);
                    }

                    .radial-menu-btn .icon {
                        font-size: 22px;
                    }

                    .radial-menu-btn .label {
                        font-size: 9px;
                        font-weight: 600;
                        color: #334155;
                    }

                    @keyframes fadeInScale {
                        from { opacity: 0; transform: scale(0); }
                        to { opacity: 1; transform: scale(1); }
                    }

                    /* Modal de Exercício */
                    .exercise-modal {
                        position: fixed;
                        inset: 0;
                        z-index: 50;
                        background: linear-gradient(to bottom, #0f172a, #1e293b);
                    }

                    .exercise-close-btn {
                        position: absolute;
                        top: 1.5rem;
                        right: 1.5rem;
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: rgba(255, 255, 255, 0.4);
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        font-size: 24px;
                        transition: color 0.3s ease;
                        z-index: 10;
                    }

                    .exercise-close-btn:hover {
                        color: rgba(255, 255, 255, 0.7);
                    }

                    .exercise-controls {
                        position: absolute;
                        top: 1.5rem;
                        left: 1.5rem;
                        display: flex;
                        gap: 0.5rem;
                        z-index: 10;
                    }

                    .exercise-control-btn {
                        width: 40px;
                        height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(12px);
                        border-radius: 50%;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }

                    .exercise-control-btn:hover {
                        background: rgba(255, 255, 255, 0.2);
                    }

                    .exercise-control-btn svg {
                        width: 18px;
                        height: 18px;
                        color: rgba(255, 255, 255, 0.7);
                    }

                    .exercise-content {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                        padding: 2rem;
                    }

                    .exercise-sphere {
                        width: 112px;
                        height: 112px;
                        border-radius: 50%;
                        background: linear-gradient(to bottom right, #60a5fa, #a855f7);
                        box-shadow: 0 10px 40px rgba(96, 165, 250, 0.4);
                        animation: breatheSphere 5s ease-in-out infinite;
                    }

                    @keyframes breatheSphere {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.15); }
                    }

                    .exercise-text {
                        margin-top: 4rem;
                        font-size: 1.5rem;
                        text-align: center;
                        color: rgba(255, 255, 255, 0.9);
                        font-weight: 300;
                        max-width: 500px;
                        line-height: 1.8;
                        animation: fadeInText 0.8s ease-out;
                    }

                    @keyframes fadeInText {
                        from { opacity: 0; transform: translateY(15px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    .exercise-progress-container {
                        position: absolute;
                        bottom: 3rem;
                        left: 2rem;
                        right: 2rem;
                    }

                    .exercise-progress-bar {
                        height: 4px;
                        background: rgba(255, 255, 255, 0.15);
                        border-radius: 9999px;
                        overflow: hidden;
                    }

                    .exercise-progress-fill {
                        height: 100%;
                        background: rgba(255, 255, 255, 0.7);
                        border-radius: 9999px;
                        transition: width 0.5s ease;
                    }

                    .exercise-progress-text {
                        text-align: center;
                        color: rgba(255, 255, 255, 0.5);
                        font-size: 0.875rem;
                        margin-top: 0.75rem;
                        font-weight: 300;
                    }

                    /* Responsividade */
                    @media (max-width: 640px) {
                        .glass-panel {
                            height: 45vh;
                            padding: 1.5rem;
                            border-top-left-radius: 30px;
                            border-top-right-radius: 30px;
                        }

                        .animated-text {
                            font-size: 1rem;
                        }

                        .emotional-sphere {
                            width: 120px;
                            height: 120px;
                            margin-left: -60px;
                            margin-top: -60px;
                        }

                        .exercise-text {
                            font-size: 1.25rem;
                        }
                    }
                </style>

                <!-- Background Oceânico -->
                <div class="ocean-background" style="background: ${gradient};">
                    <div class="ocean-overlay"></div>
                    <svg class="ocean-waves" preserveAspectRatio="none" viewBox="0 0 1500 300">
                        <defs>
                            <linearGradient id="oceanWaveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="rgba(255,255,255,0.2)" />
                                <stop offset="100%" stop-color="rgba(255,255,255,0)" />
                            </linearGradient>
                        </defs>
                        <path d="M0,100 Q250,80 500,100 T1000,100 T1500,100 L1500,300 L0,300 Z" fill="url(#oceanWaveGradient)">
                            <animate attributeName="d" dur="90s" repeatCount="indefinite"
                                values="M0,100 Q250,80 500,100 T1000,100 T1500,100 L1500,300 L0,300 Z;
                                        M0,100 Q250,120 500,100 T1000,100 T1500,100 L1500,300 L0,300 Z;
                                        M0,100 Q250,80 500,100 T1000,100 T1500,100 L1500,300 L0,300 Z" />
                        </path>
                    </svg>
                </div>

                <!-- Botão Home -->
                <button class="home-btn" id="oceanmind-home-btn" aria-label="Retornar ao início">
                    <span style="font-size: 20px; color: white;">🏠</span>
                </button>

                <!-- Esfera Emocional -->
                <div class="emotional-sphere" id="emotional-sphere"
                    style="background: radial-gradient(circle at 30% 30%, ${colors.from}, ${colors.to});
                           box-shadow: 0 0 ${animation.glow} ${colors.glow};
                           animation: breathe-${this.state.emotion} ${animation.duration}s ease-in-out infinite;">
                </div>

                <!-- Painel de Vidro -->
                <div class="glass-panel">
                    <div class="animated-text" id="animated-text"></div>
                    <div id="actions-container"></div>
                    <div class="input-container">
                        <input type="text" class="message-input" id="message-input"
                               placeholder="Digite como você está se sentindo...">
                        <button class="send-btn" id="send-btn">
                            <span style="font-size: 18px; color: rgba(255,255,255,0.7);">📨</span>
                        </button>
                    </div>
                </div>

                <!-- Menu Radial (inicialmente oculto) -->
                <div class="radial-menu-overlay" id="radial-menu" style="display: none;"></div>

                <!-- Modal de Exercício (inicialmente oculto) -->
                <div class="exercise-modal" id="exercise-modal" style="display: none;"></div>
            </div>
        `;

        this.attachEventListeners();
        this.renderAnimatedText(this.state.assistantMessage);
        this.renderActions();
    }

    renderAnimatedText(text) {
        const container = document.getElementById('animated-text');
        if (!container || !text) return;

        const words = text.split(' ');
        container.innerHTML = words.map((word, i) =>
            `<span class="animated-word" style="animation-delay: ${i * 0.12}s">${word}</span>`
        ).join('');
    }

    renderActions() {
        const container = document.getElementById('actions-container');
        if (!container) return;

        const { emotion, suggestedExercise } = this.state;

        // Mapeamento de exercícios
        const exerciseConfig = {
            'breathing-478': { icon: '💨', label: 'Respirar 4-7-8' },
            'breathing-box': { icon: '💨', label: 'Respirar Box' },
            'meditation': { icon: '✨', label: 'Meditar' },
            'deep-sleep': { icon: '🌙', label: 'Sono Profundo' },
            'grounding': { icon: '💙', label: 'Grounding 5-4-3-2-1' },
            'journal': { icon: '📖', label: 'Diário' }
        };

        let primaryAction = null;
        let secondaryActions = [];

        // Se o NLP sugeriu um exercício específico
        if (suggestedExercise && exerciseConfig[suggestedExercise]) {
            const config = exerciseConfig[suggestedExercise];
            primaryAction = {
                icon: config.icon,
                label: config.label,
                exercise: suggestedExercise
            };

            // Adiciona outras opções baseadas no estado emocional
            if (emotion === 'anxious') {
                secondaryActions = [
                    { icon: '💙', label: 'Grounding', exercise: 'grounding' },
                    { icon: '💨', label: 'Respirar', exercise: 'breathing-478' }
                ].filter(a => a.exercise !== suggestedExercise);
            } else if (emotion === 'sleep') {
                secondaryActions = [
                    { icon: '🌙', label: 'Sono Profundo', exercise: 'deep-sleep' },
                    { icon: '✨', label: 'Meditar', exercise: 'meditation' }
                ].filter(a => a.exercise !== suggestedExercise);
            } else if (emotion === 'sad') {
                secondaryActions = [
                    { icon: '📖', label: 'Diário', exercise: 'journal' },
                    { icon: '✨', label: 'Meditar', exercise: 'meditation' }
                ].filter(a => a.exercise !== suggestedExercise);
            } else {
                secondaryActions = [
                    { icon: '💨', label: 'Respirar', exercise: 'breathing-478' },
                    { icon: '✨', label: 'Meditar', exercise: 'meditation' }
                ].filter(a => a.exercise !== suggestedExercise);
            }
        } else if (emotion === 'anxious') {
            primaryAction = { icon: '💨', label: 'Respirar agora', exercise: 'breathing-478' };
            secondaryActions = [{ icon: '💙', label: 'Grounding', exercise: 'grounding' }];
        } else if (emotion === 'sleep') {
            primaryAction = { icon: '🌙', label: 'Começar meditação', exercise: 'deep-sleep' };
            secondaryActions = [{ icon: '✨', label: 'Meditar', exercise: 'meditation' }];
        } else if (emotion === 'sad') {
            primaryAction = { icon: '📖', label: 'Escrever no diário', exercise: 'journal' };
            secondaryActions = [{ icon: '✨', label: 'Meditar', exercise: 'meditation' }];
        } else if (emotion === 'happy' || emotion === 'calm') {
            secondaryActions = [
                { icon: '✨', label: 'Meditar', exercise: 'meditation' },
                { icon: '📖', label: 'Diário', exercise: 'journal' }
            ];
        } else {
            secondaryActions = [
                { icon: '💨', label: 'Respirar', exercise: 'breathing-478' },
                { icon: '✨', label: 'Meditar', exercise: 'meditation' },
                { icon: '🌙', label: 'Dormir', exercise: 'deep-sleep' }
            ];
        }

        let html = '';

        if (primaryAction) {
            html += `
                <button class="primary-action-btn" data-exercise="${primaryAction.exercise}">
                    <span>${primaryAction.icon}</span>
                    ${primaryAction.label}
                </button>
            `;
        }

        if (secondaryActions.length > 0) {
            html += '<div class="secondary-actions">';
            secondaryActions.forEach(action => {
                html += `
                    <button class="secondary-action-btn" data-exercise="${action.exercise}">
                        <span>${action.icon}</span>
                        ${action.label}
                    </button>
                `;
            });
            html += '</div>';
        }

        container.innerHTML = html;

        // Attach click events to action buttons
        container.querySelectorAll('[data-exercise]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectExercise(btn.dataset.exercise);
            });
        });
    }

    renderRadialMenu() {
        const menu = document.getElementById('radial-menu');
        if (!menu) return;

        const buttons = [
            { icon: '💨', label: 'Respirar', exercise: 'breathing-478' },
            { icon: '✨', label: 'Meditar', exercise: 'meditation' },
            { icon: '🌙', label: 'Dormir', exercise: 'deep-sleep' },
            { icon: '📖', label: 'Diário', exercise: 'journal' },
            { icon: '💙', label: 'Grounding', exercise: 'grounding' },
            { icon: '⚙️', label: 'Fechar', exercise: null }
        ];

        const angles = [0, 60, 120, 180, 240, 300];
        const radius = 100;
        const centerX = 125;
        const centerY = 125;

        let buttonsHtml = '';
        buttons.forEach((btn, i) => {
            const angle = (angles[i] * Math.PI) / 180;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            buttonsHtml += `
                <button class="radial-menu-btn"
                        data-exercise="${btn.exercise || ''}"
                        style="left: ${x}px; top: ${y}px; animation-delay: ${i * 0.05}s;">
                    <span class="icon">${btn.icon}</span>
                    <span class="label">${btn.label}</span>
                </button>
            `;
        });

        menu.innerHTML = `
            <div class="radial-menu-backdrop" id="radial-menu-backdrop"></div>
            <div class="radial-menu-container">
                ${buttonsHtml}
            </div>
        `;

        menu.style.display = 'flex';

        // Event listeners
        document.getElementById('radial-menu-backdrop').addEventListener('click', this.closeMenu);
        menu.querySelectorAll('.radial-menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const exercise = btn.dataset.exercise;
                this.closeMenu();
                if (exercise) {
                    this.selectExercise(exercise);
                }
            });
        });
    }

    renderExerciseModal(exerciseId) {
        const modal = document.getElementById('exercise-modal');
        const exercise = OceanMindConfig.exercises[exerciseId];
        if (!modal || !exercise) return;

        this.exerciseProgress = 0;
        this.exerciseStep = 0;
        this.state.isPlaying = true;
        this.state.audioEnabled = true;

        modal.innerHTML = `
            <button class="exercise-close-btn" id="exercise-close-btn">✕</button>

            <div class="exercise-controls">
                <button class="exercise-control-btn" id="exercise-play-pause" title="Pausar">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                </button>
                <button class="exercise-control-btn" id="exercise-audio-toggle" title="Desativar áudio">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    </svg>
                </button>
            </div>

            <div class="exercise-content">
                <div class="exercise-sphere"></div>
                <h2 class="exercise-text" id="exercise-text">${exercise.script[0]}</h2>
            </div>

            <div class="exercise-progress-container">
                <div class="exercise-progress-bar">
                    <div class="exercise-progress-fill" id="exercise-progress-fill" style="width: 0%"></div>
                </div>
                <p class="exercise-progress-text" id="exercise-progress-text">0% concluído</p>
            </div>
        `;

        modal.style.display = 'block';

        // Event listeners
        document.getElementById('exercise-close-btn').addEventListener('click', this.closeExercise);
        document.getElementById('exercise-play-pause').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('exercise-audio-toggle').addEventListener('click', () => this.toggleAudio());

        // Iniciar TTS
        if (this.state.audioEnabled) {
            this.tts.speak(exercise.script[0], { rate: 0.85 });
        }

        // Iniciar progresso
        this.startExerciseProgress(exercise);
    }

    startExerciseProgress(exercise) {
        const stepDuration = (exercise.duration / exercise.script.length) * 1000;

        // Intervalo de progresso
        this.progressInterval = setInterval(() => {
            if (this.exerciseProgress >= 100) {
                this.exerciseProgress = 100;
                return;
            }
            this.exerciseProgress += (100 / exercise.duration);
            this.updateProgressUI();
        }, 1000);

        // Intervalo de mudança de step
        this.stepInterval = setInterval(() => {
            if (this.exerciseStep >= exercise.script.length - 1) return;

            this.exerciseStep++;
            this.updateExerciseText(exercise.script[this.exerciseStep]);

            if (this.state.audioEnabled) {
                this.tts.speak(exercise.script[this.exerciseStep], { rate: 0.85 });
            }
        }, stepDuration);
    }

    updateProgressUI() {
        const fill = document.getElementById('exercise-progress-fill');
        const text = document.getElementById('exercise-progress-text');
        if (fill) fill.style.width = `${Math.min(this.exerciseProgress, 100)}%`;
        if (text) text.textContent = `${Math.floor(Math.min(this.exerciseProgress, 100))}% concluído`;
    }

    updateExerciseText(text) {
        const textEl = document.getElementById('exercise-text');
        if (textEl) {
            textEl.style.animation = 'none';
            textEl.offsetHeight; // Trigger reflow
            textEl.style.animation = 'fadeInText 0.8s ease-out';
            textEl.textContent = text;
        }
    }

    togglePlayPause() {
        const btn = document.getElementById('exercise-play-pause');
        if (!btn) return;

        if (this.state.isPlaying) {
            // Pausar
            clearInterval(this.progressInterval);
            clearInterval(this.stepInterval);
            if (this.state.audioEnabled) this.tts.pause();
            this.state.isPlaying = false;
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
            `;
            btn.title = 'Continuar';
        } else {
            // Retomar
            const exercise = OceanMindConfig.exercises[this.state.currentExercise];
            if (exercise) {
                this.startExerciseProgress(exercise);
            }
            if (this.state.audioEnabled) this.tts.resume();
            this.state.isPlaying = true;
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
            `;
            btn.title = 'Pausar';
        }
    }

    toggleAudio() {
        const btn = document.getElementById('exercise-audio-toggle');
        if (!btn) return;

        if (this.state.audioEnabled) {
            this.tts.stop();
            this.state.audioEnabled = false;
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
            `;
            btn.title = 'Ativar áudio';
        } else {
            this.state.audioEnabled = true;
            const exercise = OceanMindConfig.exercises[this.state.currentExercise];
            if (exercise && exercise.script[this.exerciseStep]) {
                this.tts.speak(exercise.script[this.exerciseStep], { rate: 0.85 });
            }
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
            `;
            btn.title = 'Desativar áudio';
        }
    }

    // ============= EVENT HANDLERS =============

    attachEventListeners() {
        // Home button
        const homeBtn = document.getElementById('oceanmind-home-btn');
        if (homeBtn) {
            homeBtn.addEventListener('click', this.returnHome);
        }

        // Emotional sphere
        const sphere = document.getElementById('emotional-sphere');
        if (sphere) {
            sphere.addEventListener('click', this.handleSphereTap);
        }

        // Input and send button
        const input = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');

        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handleInputSubmit();
                }
            });
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', this.handleInputSubmit);
        }
    }

    handleInputSubmit() {
        const input = document.getElementById('message-input');
        if (!input || !input.value.trim()) return;

        const text = input.value.trim();
        input.value = '';

        this.interpretMessage(text);
    }

    interpretMessage(text) {
        // Usa o engine de NLP emocional
        if (window.EmotionalNLP) {
            const result = window.EmotionalNLP.process(text);

            // Atualiza estado
            this.state.emotion = result.emotion;
            this.state.assistantMessage = result.message;
            this.state.suggestedExercise = result.suggestedExercise;

            // Re-renderiza
            this.updateEmotionalSphere();
            this.renderAnimatedText(result.message);
            this.renderActions();
        } else {
            // Fallback simples
            this.state.assistantMessage = 'Estou aqui para você. Como posso te ajudar agora?';
            this.renderAnimatedText(this.state.assistantMessage);
        }
    }

    updateEmotionalSphere() {
        const sphere = document.getElementById('emotional-sphere');
        if (!sphere) return;

        const colors = OceanMindConfig.emotionColors[this.state.emotion];
        const animation = OceanMindConfig.emotionAnimations[this.state.emotion];

        sphere.style.background = `radial-gradient(circle at 30% 30%, ${colors.from}, ${colors.to})`;
        sphere.style.boxShadow = `0 0 ${animation.glow} ${colors.glow}`;
        sphere.style.animation = `breathe-${this.state.emotion} ${animation.duration}s ease-in-out infinite`;
    }

    handleSphereTap() {
        this.state.showMenu = true;
        this.renderRadialMenu();
    }

    selectExercise(exerciseId) {
        this.state.currentExercise = exerciseId;
        this.renderExerciseModal(exerciseId);
    }

    closeExercise() {
        // Limpa intervalos
        if (this.progressInterval) clearInterval(this.progressInterval);
        if (this.stepInterval) clearInterval(this.stepInterval);

        // Para TTS
        this.tts.stop();

        // Esconde modal
        const modal = document.getElementById('exercise-modal');
        if (modal) modal.style.display = 'none';

        this.state.currentExercise = null;
        this.exerciseProgress = 0;
        this.exerciseStep = 0;
    }

    closeMenu() {
        const menu = document.getElementById('radial-menu');
        if (menu) menu.style.display = 'none';
        this.state.showMenu = false;
    }

    returnHome() {
        this.close();
    }

    // ============= CICLO DE VIDA =============

    open() {
        // Esconder app principal
        if (this.mainApp) this.mainApp.style.display = 'none';

        // Inicializar estado
        this.state.timeOfDay = this.getTimeOfDay();
        this.state.assistantMessage = this.getGreeting();
        this.state.emotion = 'neutral';
        this.state.suggestedExercise = null;

        // Renderizar
        this.render();

        // Atualizar horário periodicamente
        this.timeInterval = setInterval(() => {
            const newTimeOfDay = this.getTimeOfDay();
            if (newTimeOfDay !== this.state.timeOfDay) {
                this.state.timeOfDay = newTimeOfDay;
                const bg = this.container.querySelector('.ocean-background');
                if (bg) {
                    bg.style.background = OceanMindConfig.gradients[newTimeOfDay];
                }
            }
        }, 60000);
    }

    close() {
        // Limpa intervalos
        if (this.timeInterval) clearInterval(this.timeInterval);
        if (this.progressInterval) clearInterval(this.progressInterval);
        if (this.stepInterval) clearInterval(this.stepInterval);

        // Para TTS
        this.tts.stop();

        // Limpa container
        this.container.innerHTML = '';

        // Mostra app principal
        if (this.mainApp) this.mainApp.style.display = 'block';

        // Limpa histórico do NLP
        if (window.EmotionalNLP) {
            window.EmotionalNLP.clearHistory();
        }
    }
}

// ============= INICIALIZAÇÃO GLOBAL =============

let oceanMindInstance = null;

function openOceanMind() {
    if (!oceanMindInstance) {
        oceanMindInstance = new OceanMind('ocean-mind-root');
    }
    oceanMindInstance.open();
}

function closeOceanMind() {
    if (oceanMindInstance) {
        oceanMindInstance.close();
    }
}

// Exporta para uso global
window.openOceanMind = openOceanMind;
window.closeOceanMind = closeOceanMind;
window.OceanMind = OceanMind;
