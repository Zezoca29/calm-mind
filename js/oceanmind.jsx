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
  
  useEffect(() => {
    const stepDuration = (exercise.duration / exercise.script.length) * 1000;
    const progressInterval = setInterval(() => {
      setProgress(p => (p >= 100 ? 100 : p + (100 / exercise.duration)));
    }, 1000);
    
    const stepInterval = setInterval(() => {
      setCurrentStep(s => (s >= exercise.script.length - 1 ? s : s + 1));
    }, stepDuration);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [exercise]);
  
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-900 to-slate-800">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors z-10"
      >
        <X size={24} />
      </button>
      
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
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour >= 5 && hour < 12) greeting = 'Bom dia. Como você está se sentindo hoje?';
    else if (hour >= 12 && hour < 18) greeting = 'Boa tarde. Vejo que você voltou. Como foi o seu dia até agora?';
    else if (hour >= 18 && hour < 22) greeting = 'Boa noite. Está tudo bem?';
    else greeting = 'Oi. Parece que o sono não vem fácil hoje, né?';
    
    setAssistantMessage(greeting);
  }, []);
  
  const handleReturnHome = () => {
    setCurrentExercise(null);
    setShowMenu(false);
    setEmotion('neutral');
    setAssistantMessage('Olá. Estou aqui. Como você está agora?');
  };
  
  const interpretMessage = useCallback((text) => {
    const lower = text.toLowerCase();
    
    const keywords = {
      anxiety: ['ansioso', 'nervoso', 'agitado', 'inquieto', 'ansiedade'],
      sleep: ['dormir', 'insônia', 'cansado', 'sono', 'não durmo'],
      calm: ['calma', 'paz', 'relaxar', 'tranquilo'],
      panic: ['pânico', 'desespero', 'medo intenso', 'crise'],
      sad: ['triste', 'sozinho', 'vazio', 'deprimido'],
      happy: ['feliz', 'bem', 'melhor', 'alegre']
    };
    
    if (keywords.anxiety.some(k => lower.includes(k))) {
      setEmotion('anxious');
      setAssistantMessage('Sinto que você está ansioso. Vamos respirar juntos? Só 2 minutos do 4-7-8.');
    } else if (keywords.sleep.some(k => lower.includes(k))) {
      setEmotion('sleep');
      setAssistantMessage('Percebi que você está com dificuldade para dormir. Vamos tentar uma meditação para sono profundo?');
    } else if (keywords.panic.some(k => lower.includes(k))) {
      setEmotion('anxious');
      setAssistantMessage('Você está seguro. Vamos fazer a técnica 5-4-3-2-1 para te trazer de volta ao presente.');
    } else if (keywords.calm.some(k => lower.includes(k))) {
      setEmotion('calm');
      setAssistantMessage('Que tal uma meditação rápida de 3 minutos para acalmar a mente?');
    } else if (keywords.sad.some(k => lower.includes(k))) {
      setEmotion('sad');
      setAssistantMessage('Está difícil hoje, né? Tudo bem ter dias assim. Quer escrever um pouco no diário?');
    } else if (keywords.happy.some(k => lower.includes(k))) {
      setEmotion('happy');
      setAssistantMessage('Que bom saber que você está bem! Isso é maravilhoso 💙');
    } else {
      setAssistantMessage('Estou aqui para você. Como posso te ajudar agora?');
    }
  }, []);
  
  let primaryAction = null;
  let secondaryActions = [];
  
  if (emotion === 'anxious') {
    primaryAction = { icon: Wind, label: 'Respirar agora', onClick: () => setCurrentExercise('breathing-478') };
    secondaryActions = [
      { icon: Heart, label: 'Grounding', onClick: () => setCurrentExercise('grounding') }
    ];
  } else if (emotion === 'sleep') {
    primaryAction = { icon: Moon, label: 'Começar meditação', onClick: () => setCurrentExercise('deep-sleep') };
    secondaryActions = [
      { icon: Sparkles, label: 'Meditar', onClick: () => setCurrentExercise('meditation') }
    ];
  } else {
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