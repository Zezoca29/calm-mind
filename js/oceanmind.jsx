import React, { useState, useEffect, useCallback } from 'react';

const Icon = ({ children, size = 18, className = '' }) => (
  <span className={className} style={{ fontSize: size }}>{children}</span>
);

const Sparkles = (props) => <Icon {...props}>✨</Icon>;
const Moon = (props) => <Icon {...props}>🌙</Icon>;
const Wind = (props) => <Icon {...props}>💨</Icon>;
const Heart = (props) => <Icon {...props}>💙</Icon>;
const BookOpen = (props) => <Icon {...props}>📖</Icon>;
const Settings = (props) => <Icon {...props}>⚙️</Icon>;
const X = (props) => <Icon {...props}>✕</Icon>;
const Send = (props) => <Icon {...props}>📨</Icon>;
const Home = (props) => <Icon {...props}>🏠</Icon>;

// Ícones SVG para controles de áudio (melhor compatibilidade que emojis)
const Volume = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
  </svg>
);

const VolumeOff = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <line x1="23" y1="9" x2="17" y2="15"></line>
    <line x1="17" y1="9" x2="23" y2="15"></line>
  </svg>
);

const Play = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const Pause = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

// ============= CONFIGURAÇÕES =============
const emotionColors = {
  calm: { from: '#6DD5FA', to: '#2980B9', glow: 'rgba(109, 213, 250, 0.3)' },
  anxious: { from: '#FFB347', to: '#FF8C42', glow: 'rgba(255, 179, 71, 0.35)' },
  sleep: { from: '#B19CD9', to: '#6A5ACD', glow: 'rgba(177, 156, 217, 0.25)' },
  happy: { from: '#FFD93D', to: '#FFBE0B', glow: 'rgba(255, 217, 61, 0.3)' },
  sad: { from: '#B0C4DE', to: '#778899', glow: 'rgba(176, 196, 222, 0.25)' },
  neutral: { from: '#E8F5E9', to: '#A5D6A7', glow: 'rgba(232, 245, 233, 0.3)' }
};

const emotionAnimations = {
  calm: { scale: [1, 1.03, 1], duration: 6, glow: '35px' },
  anxious: { scale: [1, 1.08, 1], duration: 2.5, glow: '55px' },
  sleep: { scale: [1, 1.01, 1], duration: 10, glow: '20px' },
  happy: { scale: [1, 1.05, 1], duration: 4, glow: '40px' },
  sad: { scale: [1, 1.02, 1], duration: 7, glow: '25px' },
  neutral: { scale: [1, 1.02, 1], duration: 5, glow: '30px' }
};

const gradients = {
  dawn: 'linear-gradient(135deg, #FFB6A3 0%, #FFDA9E 100%)',
  morning: 'linear-gradient(135deg, #A8D8FF 0%, #E0F4FF 100%)',
  afternoon: 'linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%)',
  evening: 'linear-gradient(135deg, #FFB88C 0%, #D98FBA 100%)',
  night: 'linear-gradient(135deg, #1E2A47 0%, #4A5F7F 100%)'
};

const exercises = {
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
};

// ============= HOOKS CUSTOMIZADOS =============

/**
 * Hook para Text-to-Speech (narração de áudio)
 */
const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speak = useCallback((text, options = {}) => {
    if (!isSupported) {
      console.warn('Text-to-Speech não é suportado neste navegador');
      return;
    }

    // Cancela qualquer fala anterior
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Configurações de voz em português do Brasil
    utterance.lang = 'pt-BR';
    utterance.rate = options.rate || 0.85; // Velocidade um pouco mais lenta para relaxamento
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    // Tenta encontrar uma voz em português
    const voices = window.speechSynthesis.getVoices();
    const ptBRVoice = voices.find(voice => voice.lang === 'pt-BR') ||
                      voices.find(voice => voice.lang.startsWith('pt')) ||
                      voices.find(voice => voice.lang === 'pt-PT');

    if (ptBRVoice) {
      utterance.voice = ptBRVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (event) => {
      console.error('Erro no Text-to-Speech:', event);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isSupported
  };
};

// ============= COMPONENTES =============

const OceanBackground = ({ timeOfDay }) => {
  return (
    <div className="fixed inset-0 -z-10">
      <div 
        className="absolute inset-0 transition-all duration-[3000ms] ease-in-out"
        style={{ background: gradients[timeOfDay] }}
      />
      
      <div className="absolute inset-0 bg-black/15" />
      
      <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wave1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        
        <path
          d="M0,100 Q250,80 500,100 T1000,100 T1500,100 L1500,300 L0,300 Z"
          fill="url(#wave1)"
        >
          <animate
            attributeName="d"
            dur="90s"
            repeatCount="indefinite"
            values="
              M0,100 Q250,80 500,100 T1000,100 T1500,100 L1500,300 L0,300 Z;
              M0,100 Q250,120 500,100 T1000,100 T1500,100 L1500,300 L0,300 Z;
              M0,100 Q250,80 500,100 T1000,100 T1500,100 L1500,300 L0,300 Z
            "
          />
        </path>
      </svg>
    </div>
  );
};

const EmotionalSphere = ({ emotion, onTap }) => {
  const colors = emotionColors[emotion];
  const animation = emotionAnimations[emotion];
  
  return (
    <div
      className="absolute top-[30%] left-1/2 cursor-pointer"
      style={{
        width: 150,
        height: 150,
        marginLeft: -75,
        marginTop: -75,
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${colors.from}, ${colors.to})`,
        boxShadow: `0 0 ${animation.glow} ${colors.glow}`,
        animation: `breathe-${emotion} ${animation.duration}s ease-in-out infinite`,
      }}
      onClick={onTap}
    >
      <style>{`
        @keyframes breathe-${emotion} {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(${animation.scale[1]}); }
        }
      `}</style>
    </div>
  );
};

const AnimatedText = ({ text }) => {
  const words = text.split(' ');
  
  return (
    <div className="text-white/75 text-lg font-light leading-loose">
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block mr-1 opacity-0"
          style={{
            animation: `fadeInWord 0.4s ease-out ${i * 0.12}s forwards`
          }}
        >
          {word}
        </span>
      ))}
      <style>{`
        @keyframes fadeInWord {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const GlassPanel = ({ message, primaryAction, secondaryActions, onInputSubmit }) => {
  const [inputText, setInputText] = useState('');
  
  const handleSubmit = () => {
    if (inputText.trim()) {
      onInputSubmit(inputText);
      setInputText('');
    }
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl rounded-t-[40px] border-t border-white/20 shadow-2xl p-8" style={{ height: '38vh', minHeight: 300 }}>
      <AnimatedText text={message} />
      
      {primaryAction && (
        <button
          onClick={primaryAction.onClick}
          className="mt-8 px-8 py-4 bg-white/30 hover:bg-white/40 backdrop-blur-md rounded-full text-white text-base font-medium transition-all border border-white/40 shadow-lg inline-flex items-center gap-3"
        >
          <primaryAction.icon size={20} />
          {primaryAction.label}
        </button>
      )}
      
      {secondaryActions.length > 0 && (
        <div className="flex gap-3 mt-4">
          {secondaryActions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white/70 text-sm font-light transition-all border border-white/20"
            >
              <action.icon size={16} className="inline mr-2" />
              {action.label}
            </button>
          ))}
        </div>
      )}
      
      <div className="mt-6 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Digite como você está se sentindo..."
          className="flex-1 px-5 py-3 bg-white/5 backdrop-blur-sm border border-white/15 rounded-full text-white/80 placeholder-white/40 focus:outline-none focus:border-white/30 transition-all text-sm font-light"
        />
        <button
          onClick={handleSubmit}
          className="w-12 h-12 flex items-center justify-center bg-white/15 hover:bg-white/25 rounded-full transition-all border border-white/20"
        >
          <Send size={18} className="text-white/70" />
        </button>
      </div>
    </div>
  );
};

const RadialMenu = ({ onClose, onSelectExercise }) => {
  const buttons = [
    { icon: Wind, label: 'Respirar', action: () => onSelectExercise('breathing-478') },
    { icon: Sparkles, label: 'Meditar', action: () => onSelectExercise('meditation') },
    { icon: Moon, label: 'Dormir', action: () => onSelectExercise('deep-sleep') },
    { icon: BookOpen, label: 'Diário', action: () => onSelectExercise('journal') },
    { icon: Heart, label: 'Grounding', action: () => onSelectExercise('grounding') },
    { icon: Settings, label: 'Config', action: onClose }
  ];
  
  const angles = [0, 60, 120, 180, 240, 300];
  const radius = 100;
  
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
      
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {buttons.map((btn, i) => {
          const angle = (angles[i] * Math.PI) / 180;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <button
              key={i}
              onClick={btn.action}
              className="absolute w-16 h-16 -ml-8 -mt-8 flex flex-col items-center justify-center gap-1 bg-white/95 backdrop-blur-md rounded-full shadow-xl hover:scale-110 transition-transform"
              style={{
                transform: `translate(${x}px, ${y}px)`,
                animation: `fadeInScale 0.3s ease-out ${i * 0.05}s both`
              }}
            >
              <btn.icon size={22} className="text-slate-700" />
              <span className="text-[9px] font-semibold text-slate-700">{btn.label}</span>
            </button>
          );
        })}
      </div>
      
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: translate(0, 0) scale(0); }
          to { opacity: 1; transform: translate(var(--x), var(--y)) scale(1); }
        }
      `}</style>
    </div>
  );
};

const ExerciseModal = ({ exercise, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const { speak, pause, resume, stop, isSpeaking, isPaused } = useTextToSpeech();

  // Refs para controlar os intervalos
  const progressIntervalRef = React.useRef(null);
  const stepIntervalRef = React.useRef(null);

  // Cleanup quando fechar
  useEffect(() => {
    return () => {
      stop();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, [stop]);

  // Inicia o exercício
  useEffect(() => {
    const stepDuration = (exercise.duration / exercise.script.length) * 1000;

    // Intervalo de progresso
    progressIntervalRef.current = setInterval(() => {
      setProgress(p => (p >= 100 ? 100 : p + (100 / exercise.duration)));
    }, 1000);

    // Intervalo de mudança de step
    stepIntervalRef.current = setInterval(() => {
      setCurrentStep(s => {
        const nextStep = s >= exercise.script.length - 1 ? s : s + 1;
        return nextStep;
      });
    }, stepDuration);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, [exercise]);

  // Narra o texto quando muda de step (se áudio estiver ativado)
  useEffect(() => {
    if (audioEnabled && exercise.script[currentStep]) {
      speak(exercise.script[currentStep], {
        rate: 0.85,
        pitch: 1.0,
        volume: 1.0
      });
    }
  }, [currentStep, audioEnabled, exercise, speak]);

  // Toggle de play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      // Pausar
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      if (audioEnabled && isSpeaking) pause();
      setIsPlaying(false);
    } else {
      // Retomar
      const stepDuration = (exercise.duration / exercise.script.length) * 1000;

      progressIntervalRef.current = setInterval(() => {
        setProgress(p => (p >= 100 ? 100 : p + (100 / exercise.duration)));
      }, 1000);

      stepIntervalRef.current = setInterval(() => {
        setCurrentStep(s => (s >= exercise.script.length - 1 ? s : s + 1));
      }, stepDuration);

      if (audioEnabled && isPaused) resume();
      setIsPlaying(true);
    }
  };

  // Toggle de áudio
  const toggleAudio = () => {
    if (audioEnabled) {
      stop();
      setAudioEnabled(false);
    } else {
      setAudioEnabled(true);
      // Fala o texto atual
      speak(exercise.script[currentStep], {
        rate: 0.85,
        pitch: 1.0,
        volume: 1.0
      });
    }
  };

  const handleClose = () => {
    stop();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Botão Fechar */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors z-10"
      >
        <X size={24} />
      </button>

      {/* Controles de Áudio (canto superior esquerdo) */}
      <div className="absolute top-6 left-6 flex gap-2 z-10">
        {/* Toggle Play/Pause */}
        <button
          onClick={togglePlayPause}
          className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all border border-white/20"
          title={isPlaying ? 'Pausar' : 'Continuar'}
        >
          {isPlaying ? <Pause size={18} className="text-white/70" /> : <Play size={18} className="text-white/70" />}
        </button>

        {/* Toggle Áudio */}
        <button
          onClick={toggleAudio}
          className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all border border-white/20"
          title={audioEnabled ? 'Desativar áudio' : 'Ativar áudio'}
        >
          {audioEnabled ? <Volume size={18} className="text-white/70" /> : <VolumeOff size={18} className="text-white/70" />}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center h-full px-8">
        <div
          className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 shadow-2xl"
          style={{
            animation: 'breatheSphere 5s ease-in-out infinite'
          }}
        />

        <h2
          key={currentStep}
          className="mt-16 text-2xl text-center text-white/90 font-light max-w-lg leading-loose"
          style={{ animation: 'fadeInText 0.8s ease-out' }}
        >
          {exercise.script[currentStep]}
        </h2>

        <div className="absolute bottom-12 left-8 right-8">
          <div className="h-1 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/70 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-white/50 text-sm mt-3 font-light">
            {Math.floor(progress)}% concluído
          </p>
        </div>
      </div>

      <style>{`
        @keyframes breatheSphere {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes fadeInText {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ============= APP PRINCIPAL =============
export default function OceanoEmocional() {
  const [emotion, setEmotion] = useState('neutral');
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [showMenu, setShowMenu] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [assistantMessage, setAssistantMessage] = useState('');
  
  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 8) setTimeOfDay('dawn');
      else if (hour >= 8 && hour < 12) setTimeOfDay('morning');
      else if (hour >= 12 && hour < 17) setTimeOfDay('afternoon');
      else if (hour >= 17 && hour < 20) setTimeOfDay('evening');
      else setTimeOfDay('night');
    };
    
    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    // Usa o NLP para gerar saudação contextual
    if (window.EmotionalNLP) {
      setAssistantMessage(window.EmotionalNLP.getGreeting());
    } else {
      // Fallback caso o NLP não esteja carregado ainda
      const hour = new Date().getHours();
      let greeting = '';

      if (hour >= 5 && hour < 12) greeting = 'Bom dia. Como você está se sentindo hoje?';
      else if (hour >= 12 && hour < 18) greeting = 'Boa tarde. Vejo que você voltou. Como foi o seu dia até agora?';
      else if (hour >= 18 && hour < 22) greeting = 'Boa noite. Está tudo bem?';
      else greeting = 'Oi. Parece que o sono não vem fácil hoje, né?';

      setAssistantMessage(greeting);
    }
  }, []);
  
  const handleReturnHome = () => {
    // Redireciona para a página principal do app
    window.location.href = '/';
  };
  
  // Estado para armazenar sugestão de exercício do NLP
  const [suggestedExercise, setSuggestedExercise] = useState(null);

  const interpretMessage = useCallback((text) => {
    // Usa o engine de NLP emocional
    if (window.EmotionalNLP) {
      const result = window.EmotionalNLP.process(text);

      // Atualiza estado emocional visual
      setEmotion(result.emotion);

      // Atualiza mensagem do assistente
      setAssistantMessage(result.message);

      // Guarda sugestão de exercício
      setSuggestedExercise(result.suggestedExercise);

      // Se for urgente, pode iniciar exercício automaticamente
      if (result.urgent && result.suggestedExercise) {
        // Aguarda 3 segundos para o usuário ler a mensagem antes de sugerir
        setTimeout(() => {
          // O exercício será mostrado como ação primária
        }, 3000);
      }
    } else {
      // Fallback caso o NLP não esteja carregado
      setAssistantMessage('Estou aqui para você. Como posso te ajudar agora?');
    }
  }, []);
  
  // Mapeamento de exercícios para ícones e labels
  const exerciseConfig = {
    'breathing-478': { icon: Wind, label: 'Respirar 4-7-8' },
    'breathing-box': { icon: Wind, label: 'Respirar Box' },
    'meditation': { icon: Sparkles, label: 'Meditar' },
    'deep-sleep': { icon: Moon, label: 'Sono Profundo' },
    'grounding': { icon: Heart, label: 'Grounding 5-4-3-2-1' },
    'journal': { icon: BookOpen, label: 'Diário' }
  };

  let primaryAction = null;
  let secondaryActions = [];

  // Se o NLP sugeriu um exercício específico, usa ele como ação primária
  if (suggestedExercise && exerciseConfig[suggestedExercise]) {
    const config = exerciseConfig[suggestedExercise];
    primaryAction = {
      icon: config.icon,
      label: config.label,
      onClick: () => setCurrentExercise(suggestedExercise)
    };

    // Adiciona outras opções como secundárias baseadas no estado emocional
    if (emotion === 'anxious') {
      secondaryActions = [
        { icon: Heart, label: 'Grounding', onClick: () => setCurrentExercise('grounding') },
        { icon: Wind, label: 'Respirar', onClick: () => setCurrentExercise('breathing-478') }
      ].filter(a => a.label !== config.label);
    } else if (emotion === 'sleep') {
      secondaryActions = [
        { icon: Moon, label: 'Sono Profundo', onClick: () => setCurrentExercise('deep-sleep') },
        { icon: Sparkles, label: 'Meditar', onClick: () => setCurrentExercise('meditation') }
      ].filter(a => a.label !== config.label);
    } else if (emotion === 'sad') {
      secondaryActions = [
        { icon: BookOpen, label: 'Diário', onClick: () => setCurrentExercise('journal') },
        { icon: Sparkles, label: 'Meditar', onClick: () => setCurrentExercise('meditation') }
      ].filter(a => a.label !== config.label);
    } else {
      secondaryActions = [
        { icon: Wind, label: 'Respirar', onClick: () => setCurrentExercise('breathing-478') },
        { icon: Sparkles, label: 'Meditar', onClick: () => setCurrentExercise('meditation') }
      ].filter(a => a.label !== config.label);
    }
  } else if (emotion === 'anxious') {
    // Lógica original por estado emocional
    primaryAction = { icon: Wind, label: 'Respirar agora', onClick: () => setCurrentExercise('breathing-478') };
    secondaryActions = [
      { icon: Heart, label: 'Grounding', onClick: () => setCurrentExercise('grounding') }
    ];
  } else if (emotion === 'sleep') {
    primaryAction = { icon: Moon, label: 'Começar meditação', onClick: () => setCurrentExercise('deep-sleep') };
    secondaryActions = [
      { icon: Sparkles, label: 'Meditar', onClick: () => setCurrentExercise('meditation') }
    ];
  } else if (emotion === 'sad') {
    primaryAction = { icon: BookOpen, label: 'Escrever no diário', onClick: () => setCurrentExercise('journal') };
    secondaryActions = [
      { icon: Sparkles, label: 'Meditar', onClick: () => setCurrentExercise('meditation') }
    ];
  } else if (emotion === 'happy' || emotion === 'calm') {
    // Estados positivos - oferece opções sem pressão
    secondaryActions = [
      { icon: Sparkles, label: 'Meditar', onClick: () => setCurrentExercise('meditation') },
      { icon: BookOpen, label: 'Diário', onClick: () => setCurrentExercise('journal') }
    ];
  } else {
    // Estado neutro ou indefinido
    secondaryActions = [
      { icon: Wind, label: 'Respirar', onClick: () => setCurrentExercise('breathing-478') },
      { icon: Sparkles, label: 'Meditar', onClick: () => setCurrentExercise('meditation') },
      { icon: Moon, label: 'Dormir', onClick: () => setCurrentExercise('deep-sleep') }
    ];
  }
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <OceanBackground timeOfDay={timeOfDay} />
      
      <button
        onClick={handleReturnHome}
        onKeyDown={(e) => e.key === 'Enter' && handleReturnHome()}
        tabIndex={0}
        className="fixed top-6 left-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all border border-white/20 z-30 opacity-40 hover:opacity-100"
        aria-label="Retornar ao início"
      >
        <Home size={20} className="text-white" />
      </button>
      
      <EmotionalSphere 
        emotion={emotion} 
        onTap={() => setShowMenu(true)} 
      />
      
      <GlassPanel 
        message={assistantMessage}
        primaryAction={primaryAction}
        secondaryActions={secondaryActions}
        onInputSubmit={interpretMessage}
      />
      
      {showMenu && (
        <RadialMenu 
          onClose={() => setShowMenu(false)}
          onSelectExercise={(type) => {
            setShowMenu(false);
            setCurrentExercise(type);
          }}
        />
      )}
      
      {currentExercise && (
        <ExerciseModal 
          exercise={exercises[currentExercise]}
          onClose={() => setCurrentExercise(null)}
        />
      )}
    </div>
  );
}