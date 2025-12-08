const { useState, useEffect, useCallback } = React;
const fm = window.framerMotion || window.FramerMotion || {};
let motion = fm.motion;
let AnimatePresence = fm.AnimatePresence;
if (!motion) {
  motion = {
    div: (props) => React.createElement('div', props),
    span: (props) => React.createElement('span', props),
    button: (props) => React.createElement('button', props),
    svg: (props) => React.createElement('svg', props),
    path: (props) => React.createElement('path', props),
    h2: (props) => React.createElement('h2', props),
  };
}
if (!AnimatePresence) {
  AnimatePresence = ({ children }) => children;
}

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

// ============= CONFIGURAÇÕES =============
const emotionColors = {
  calm: { from: '#6DD5FA', to: '#2980B9', glow: 'rgba(109, 213, 250, 0.4)' },
  anxious: { from: '#FFB347', to: '#FF8C42', glow: 'rgba(255, 179, 71, 0.4)' },
  sleep: { from: '#B19CD9', to: '#6A5ACD', glow: 'rgba(177, 156, 217, 0.4)' },
  happy: { from: '#FFD93D', to: '#FFBE0B', glow: 'rgba(255, 217, 61, 0.4)' },
  sad: { from: '#B0C4DE', to: '#778899', glow: 'rgba(176, 196, 222, 0.4)' },
  neutral: { from: '#E8F5E9', to: '#A5D6A7', glow: 'rgba(232, 245, 233, 0.4)' }
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

// Fundo Oceano com Ondas Animadas
const OceanBackground = ({ timeOfDay }) => {
  return (
    <div 
      className="fixed inset-0 -z-10 transition-all duration-[2000ms] ease-in-out"
      style={{ background: gradients[timeOfDay] }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wave1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id="wave2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id="wave3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        
        {/* Onda 1 - Lenta */}
        <motion.path
          d="M0,100 Q250,80 500,100 T1000,100 T1500,100 L1500,300 L0,300 Z"
          fill="url(#wave1)"
          animate={{ x: [-500, 0] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Onda 2 - Média */}
        <motion.path
          d="M0,150 Q200,130 400,150 T800,150 T1200,150 L1200,300 L0,300 Z"
          fill="url(#wave2)"
          animate={{ x: [-400, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Onda 3 - Rápida */}
        <motion.path
          d="M0,180 Q150,165 300,180 T600,180 T900,180 L900,300 L0,300 Z"
          fill="url(#wave3)"
          animate={{ x: [-300, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
};

// Esfera Emocional Central
const EmotionalSphere = ({ emotion, onTap }) => {
  const colors = emotionColors[emotion];
  
  return (
    <motion.div
      className="absolute top-[30%] left-1/2 cursor-pointer"
      style={{
        width: 180,
        height: 180,
        marginLeft: -90,
        marginTop: -90,
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${colors.from}, ${colors.to})`,
        boxShadow: `0 0 60px ${colors.glow}, 0 0 100px ${colors.glow}`,
      }}
      animate={{ 
        scale: [1, 1.08, 1],
        rotate: [0, 5, -5, 0]
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      onClick={onTap}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    />
  );
};

// Texto Animado (palavra por palavra)
const AnimatedText = ({ text }) => {
  const words = text.split(' ');
  
  return (
    <div className="text-white/90 text-lg font-medium leading-relaxed">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

// Painel Inferior Glassmorphism
const GlassPanel = ({ message, actions, onInputSubmit }) => {
  const [inputText, setInputText] = useState('');
  
  const handleSubmit = () => {
    if (inputText.trim()) {
      onInputSubmit(inputText);
      setInputText('');
    }
  };
  
  return (
    <motion.div
      initial={{ y: 400 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl rounded-t-[32px] border-t border-white/20 shadow-2xl p-6"
      style={{ height: '35vh', minHeight: 280 }}
    >
      <AnimatedText text={message} />
      
      <div className="flex gap-3 mt-6 flex-wrap">
        {actions.map((action, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            onClick={action.onClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white text-sm font-semibold transition-all border border-white/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <action.icon size={18} />
            {action.label}
          </motion.button>
        ))}
      </div>
      
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Digite como você está se sentindo..."
          className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-all"
        />
        <motion.button
          onClick={handleSubmit}
          className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all border border-white/30"
          whileTap={{ scale: 0.9 }}
        >
          <Send size={20} className="text-white" />
        </motion.button>
      </div>
    </motion.div>
  );
};

// Menu Radial
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {buttons.map((btn, i) => {
          const angle = (angles[i] * Math.PI) / 180;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <motion.button
              key={i}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{ scale: 1, x, y }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 200 }}
              onClick={btn.action}
              className="absolute w-16 h-16 -ml-8 -mt-8 flex flex-col items-center justify-center gap-1 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:scale-110 transition-transform"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <btn.icon size={24} className="text-slate-700" />
              <span className="text-[9px] font-semibold text-slate-700">{btn.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

// Modal de Exercício
const ExerciseModal = ({ exercise, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const stepDuration = (exercise.duration / exercise.script.length) * 1000;
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return p + (100 / exercise.duration);
      });
    }, 1000);
    
    const stepInterval = setInterval(() => {
      setCurrentStep(s => {
        if (s >= exercise.script.length - 1) {
          clearInterval(stepInterval);
          return s;
        }
        return s + 1;
      });
    }, stepDuration);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [exercise]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-slate-900 to-slate-800"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors z-10"
      >
        <X size={24} />
      </button>
      
      <div className="flex flex-col items-center justify-center h-full px-6">
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 shadow-2xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        
        <motion.h2
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 text-2xl text-center text-white font-semibold max-w-md leading-relaxed"
        >
          {exercise.script[currentStep]}
        </motion.h2>
        
        <div className="absolute bottom-12 left-6 right-6">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/80 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-center text-white/60 text-sm mt-2">
            {Math.floor(progress)}% concluído
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// ============= APP PRINCIPAL =============
function OceanoEmocional() {
  const [emotion, setEmotion] = useState('neutral');
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [showMenu, setShowMenu] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [assistantMessage, setAssistantMessage] = useState('');
  const [userName] = useState('Luna');
  
  // Detectar horário do dia
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
  
  // Mensagem inicial do assistente
  useEffect(() => {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour >= 5 && hour < 12) greeting = `Bom dia. Como você está se sentindo hoje?`;
    else if (hour >= 12 && hour < 18) greeting = `Boa tarde. Vejo que você voltou. Como foi o seu dia até agora?`;
    else if (hour >= 18 && hour < 22) greeting = `Boa noite. Está tudo bem?`;
    else greeting = `Oi. Parece que o sono não vem fácil hoje, né?`;
    
    setAssistantMessage(greeting);
  }, []);
  
  // Interpretar mensagem do usuário
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
      setTimeout(() => setCurrentExercise('breathing-478'), 2000);
    } else if (keywords.sleep.some(k => lower.includes(k))) {
      setEmotion('sleep');
      setAssistantMessage('Percebi que você está com dificuldade para dormir. Vamos tentar uma meditação para sono profundo?');
      setTimeout(() => setCurrentExercise('deep-sleep'), 2000);
    } else if (keywords.panic.some(k => lower.includes(k))) {
      setEmotion('anxious');
      setAssistantMessage('Você está seguro. Vamos fazer a técnica 5-4-3-2-1 para te trazer de volta ao presente.');
      setTimeout(() => setCurrentExercise('grounding'), 2000);
    } else if (keywords.calm.some(k => lower.includes(k))) {
      setEmotion('calm');
      setAssistantMessage('Que tal uma meditação rápida de 3 minutos para acalmar a mente?');
      setTimeout(() => setCurrentExercise('meditation'), 2000);
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
  
  const quickActions = [
    { icon: Wind, label: 'Respirar', onClick: () => setCurrentExercise('breathing-478') },
    { icon: Sparkles, label: 'Meditar', onClick: () => setCurrentExercise('meditation') },
    { icon: Moon, label: 'Dormir', onClick: () => setCurrentExercise('deep-sleep') }
  ];
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <OceanBackground timeOfDay={timeOfDay} />
      
      <EmotionalSphere 
        emotion={emotion} 
        onTap={() => setShowMenu(true)} 
      />
      
      <GlassPanel 
        message={assistantMessage}
        actions={quickActions}
        onInputSubmit={interpretMessage}
      />
      
      <AnimatePresence>
        {showMenu && (
          <RadialMenu 
            onClose={() => setShowMenu(false)}
            onSelectExercise={(type) => {
              setShowMenu(false);
              setCurrentExercise(type);
            }}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {currentExercise && (
          <ExerciseModal 
            exercise={exercises[currentExercise]}
            onClose={() => setCurrentExercise(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

window.OceanoEmocional = OceanoEmocional;
export default OceanoEmocional;