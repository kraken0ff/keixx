import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, LayoutGroup, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';
import AnimatedBackground from './components/AnimatedBackground';
import CustomCursor from './components/CustomCursor';

// === КОНСТАНТЫ ===
const SECTION_MAIN = [
  ['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
  ['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace'],
  ['Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'],
  ['CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter'],
  ['ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight'],
  ['ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'MetaRight', 'ContextMenu', 'ControlRight']
];

const SECTION_NAV = [
  ['PrintScreen', 'ScrollLock', 'Pause'],
  ['Insert', 'Home', 'PageUp'],
  ['Delete', 'End', 'PageDown']
];

const LABELS = {
  Backquote: '~', Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']', Backslash: '\\', Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/', Space: '', 
  ControlLeft: 'Ctrl', MetaLeft: 'Win', AltLeft: 'Alt', ControlRight: 'Ctrl', MetaRight: 'Win', AltRight: 'Alt', ShiftLeft: 'Shift', ShiftRight: 'Shift', Backspace: 'Backspace', Enter: 'Enter', CapsLock: 'Caps', Tab: 'Tab', ContextMenu: 'Fn', Escape: 'ESC',
  PrintScreen: 'PrSc', ScrollLock: 'ScLk', Pause: 'Pause', Insert: 'Ins', Home: 'Home', PageUp: 'PgUp', Delete: 'Del', End: 'End', PageDown: 'PgDn',
  ArrowUp: '↑', ArrowLeft: '←', ArrowDown: '↓', ArrowRight: '→',
  NumLock: 'Num', NumpadDivide: '/', NumpadMultiply: '*', NumpadSubtract: '-', NumpadAdd: '+', NumpadEnter: 'Ent', NumpadDecimal: '.',
  Numpad0: '0', Numpad1: '1', Numpad2: '2', Numpad3: '3', Numpad4: '4', Numpad5: '5', Numpad6: '6', Numpad7: '7', Numpad8: '8', Numpad9: '9'
};

const TEXTS = [
  "Элегантный код подобен музыке. Каждая строка должна иметь свой ритм.",
  "Совершенство достигнуто не тогда, когда нечего добавить, а когда нечего убрать.",
  "Качественные переключатели создают тактильную симфонию для пальцев.",
  "В мире цифрового шума чистота дизайна и скорость реакции решают всё."
];

// === 3D КЛАВИША (ULTIMATE OPTIMIZATION) ===
// Custom comparison function:
// React перерисует компонент ТОЛЬКО если изменились пропсы active или tested.
// Игнорируем className и label, так как они статичны.
const propsAreEqual = (prevProps, nextProps) => {
    return prevProps.active === nextProps.active && 
           prevProps.tested === nextProps.tested;
};

const Key3D = memo(({ code, label, active, tested, className = "" }) => {
  let widthClass = 'w-[50px]'; 
  if (className.includes('w-') || className.includes('flex-grow')) widthClass = ''; 
  else if (code === 'Backspace') widthClass = 'w-[90px]';
  else if (code === 'Tab') widthClass = 'w-[70px]';
  else if (code === 'CapsLock') widthClass = 'w-[80px]';
  else if (code === 'Enter' || code === 'ShiftLeft') widthClass = 'w-[105px]';
  else if (code === 'ShiftRight') widthClass = 'w-[125px]';
  else if (['ControlLeft', 'ControlRight'].includes(code)) widthClass = 'w-[65px]';
  else if (['MetaLeft', 'MetaRight', 'AltLeft', 'AltRight'].includes(code)) widthClass = 'w-[55px]';
  else if (code === 'Space') widthClass = 'flex-grow';

  // Пружины стали чуть "мягче" по stiffness, но "легче" по mass
  // Это помогает браузеру быстрее просчитать старт движения
  const transitionConfig = {
      transform: { type: "spring", stiffness: 800, damping: 25, mass: 0.5 },
      backgroundColor: { duration: 0.05 },
      boxShadow: { duration: 0.05 },
      borderColor: { duration: 0.05 },
      borderBottomWidth: { duration: 0.05 }
  };

  return (
    <div className={`relative h-[50px] ${widthClass} ${className}`} style={{ transformStyle: 'preserve-3d' }}>
      <motion.div
        initial={false}
        animate={{
            transform: active ? "translateZ(2px)" : "translateZ(6px)",
            backgroundColor: active ? '#6366f1' : tested ? 'rgba(99, 102, 241, 0.15)' : 'rgba(30, 41, 59, 0.7)',
            borderColor: active ? '#a5b4fc' : tested ? '#6366f1' : 'rgba(255,255,255,0.08)',
            borderBottomWidth: active ? '0px' : '4px',
            borderBottomColor: 'rgba(0,0,0,0.4)',
            boxShadow: active ? '0 0 25px rgba(99, 102, 241, 0.8)' : 'none',
        }}
        transition={transitionConfig}
        // Force GPU layer promotion explicitly
        style={{ backfaceVisibility: 'hidden', WebkitFontSmoothing: 'subpixel-antialiased' }}
        className="w-full h-full rounded-md border-t border-l border-r flex items-center justify-center relative select-none box-border"
      >
        <span className={`font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider ${active ? 'text-white' : tested ? 'text-indigo-300' : 'text-slate-400'}`}
              style={{ transform: active ? 'translateY(0px)' : 'translateY(-2px)' }} >
            {label || code.replace('Key', '').replace('Digit', '')}
        </span>
        <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent rounded-t-md pointer-events-none" />
      </motion.div>
    </div>
  );
}, propsAreEqual);

// === KEYBOARD WRAPPER (WARMED UP) ===
const Keyboard3DWrapper = ({ children }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const smoothX = useSpring(x, { stiffness: 40, damping: 25 });
    const smoothY = useSpring(y, { stiffness: 40, damping: 25 });

    const rotateX = useTransform(smoothY, [-0.5, 0.5], ["8deg", "-8deg"]);
    const rotateY = useTransform(smoothX, [-0.5, 0.5], ["-8deg", "8deg"]);
    
    // !!! FORCE GPU WAKE UP HACK !!!
    // Это значение незаметно анимируется, заставляя браузер всегда держать слой активным,
    // имитируя нагрузку, как будто ты спамишь клавиши.
    const controls = useAnimation();
    useEffect(() => {
        controls.start({
            scale: [1, 1.0001, 1], // Микро-анимация
            transition: { repeat: Infinity, duration: 1, ease: "linear" }
        });
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            x.set((e.clientX / window.innerWidth) - 0.5);
            y.set((e.clientY / window.innerHeight) - 0.5);
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [x, y]);

    return (
        <div className="w-full min-h-[60vh] flex items-center justify-center perspective-container">
            <motion.div 
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                animate={controls} // Применяем "грелку"
                className="relative"
            >
                <div className="absolute inset-0 bg-[#0f172a] rounded-[28px]"
                    style={{ transform: "translateZ(-20px) translateY(8px) translateX(6px)", boxShadow: '0 40px 60px -15px rgba(0,0,0,0.8)' }}
                />
                <div className="absolute inset-0 bg-[#1e293b] rounded-[28px]" style={{ transform: "translateZ(-8px)" }} />
                
                <div className="bg-[#111827] p-5 rounded-[24px] border-[2px] border-[#1e293b] relative"
                     style={{ transformStyle: "preserve-3d", background: '#111827' }}>
                    {children}
                    <div className="absolute top-4 left-6 flex items-center gap-2 pointer-events-none opacity-80" style={{ transform: "translateZ(1px)" }}>
                         <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></div>
                         <span className="text-[9px] text-slate-500 font-mono tracking-widest font-bold">KeiX 3D</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const TesterMode = () => {
  const [activeKeys, setActiveKeys] = useState([]);
  const [history, setHistory] = useState(new Set());
  const [lastKey, setLastKey] = useState(null);

  useEffect(() => {
    const handleDown = (e) => {
      e.preventDefault();
      if(e.repeat) return;
      const c = e.code;
      // Внимание: мы передаем ССЫЛКУ на массив (новую), но мемо-компоненты сравнивают строки.
      setActiveKeys(p => [...p, c]);
      setHistory(p => { const n = new Set(p); n.add(c); return n; });
      setLastKey(c);
    };
    const handleUp = (e) => setActiveKeys(p => p.filter(k => k !== e.code));

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => { 
        window.removeEventListener('keydown', handleDown); 
        window.removeEventListener('keyup', handleUp); 
    };
  }, []);

  // ИСПОЛЬЗУЕМ useMemo ДЛЯ КЭШИРОВАНИЯ ВСЕЙ СТРУКТУРЫ (DOM TREE)
  // Мы пересоздаем структуру DOM клавиатуры только если меняются activeKeys или history.
  // Это избавляет React от лишнего маппинга массивов (SECTION_MAIN.map...) при каждом чихе родителя.
  const keyboardLayout = useMemo(() => {
      return (
        <Keyboard3DWrapper>
            <div className="flex gap-4 p-4" style={{ transformStyle: 'preserve-3d' }}>
                <div className="flex flex-col gap-[8px]" style={{ transformStyle: 'preserve-3d' }}>
                     {SECTION_MAIN.map((row, i) => (
                        <div key={i} className="flex gap-[6px]" style={{ transformStyle: 'preserve-3d' }}>
                            {row.map(code => (
                                <Key3D key={code} code={code} label={LABELS[code]} 
                                       active={activeKeys.includes(code)} 
                                       tested={history.has(code)} 
                                       className={code === 'Escape' ? 'mr-10' : ''} />
                            ))}
                        </div>
                     ))}
                </div>
                <div className="flex flex-col justify-between" style={{ transformStyle: 'preserve-3d' }}>
                    <div className="flex flex-col gap-[8px]">
                         {SECTION_NAV.map((row, i) => (
                             <div key={i} className="flex gap-[6px]" style={{ transformStyle: 'preserve-3d' }}>
                                {row.map(code => <Key3D key={code} code={code} label={LABELS[code]} active={activeKeys.includes(code)} tested={history.has(code)} />)}
                             </div>
                         ))}
                    </div>
                    <div className="mt-auto flex flex-col items-center gap-[6px]" style={{ transformStyle: 'preserve-3d' }}>
                        <Key3D code="ArrowUp" label="↑" active={activeKeys.includes('ArrowUp')} tested={history.has('ArrowUp')} />
                        <div className="flex gap-[6px]" style={{ transformStyle: 'preserve-3d' }}>
                            <Key3D code="ArrowLeft" label="←" active={activeKeys.includes('ArrowLeft')} tested={history.has('ArrowLeft')} />
                            <Key3D code="ArrowDown" label="↓" active={activeKeys.includes('ArrowDown')} tested={history.has('ArrowDown')} />
                            <Key3D code="ArrowRight" label="→" active={activeKeys.includes('ArrowRight')} tested={history.has('ArrowRight')} />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-[6px] w-[225px]" style={{ transformStyle: 'preserve-3d', alignContent: 'start' }}>
                     <Key3D code="NumLock" label="Num" active={activeKeys.includes("NumLock")} tested={history.has("NumLock")} className="w-full" />
                     <Key3D code="NumpadDivide" label="/" active={activeKeys.includes("NumpadDivide")} tested={history.has("NumpadDivide")} className="w-full" />
                     <Key3D code="NumpadMultiply" label="*" active={activeKeys.includes("NumpadMultiply")} tested={history.has("NumpadMultiply")} className="w-full" />
                     <Key3D code="NumpadSubtract" label="-" active={activeKeys.includes("NumpadSubtract")} tested={history.has("NumpadSubtract")} className="w-full" />
                     <Key3D code="Numpad7" label="7" active={activeKeys.includes("Numpad7")} tested={history.has("Numpad7")} className="w-full" />
                     <Key3D code="Numpad8" label="8" active={activeKeys.includes("Numpad8")} tested={history.has("Numpad8")} className="w-full" />
                     <Key3D code="Numpad9" label="9" active={activeKeys.includes("Numpad9")} tested={history.has("Numpad9")} className="w-full" />
                     <Key3D code="NumpadAdd" label="+" active={activeKeys.includes("NumpadAdd")} tested={history.has("NumpadAdd")} className="w-full h-full row-span-2 flex items-center" />
                     <Key3D code="Numpad4" label="4" active={activeKeys.includes("Numpad4")} tested={history.has("Numpad4")} className="w-full" />
                     <Key3D code="Numpad5" label="5" active={activeKeys.includes("Numpad5")} tested={history.has("Numpad5")} className="w-full" />
                     <Key3D code="Numpad6" label="6" active={activeKeys.includes("Numpad6")} tested={history.has("Numpad6")} className="w-full" />
                     <Key3D code="Numpad1" label="1" active={activeKeys.includes("Numpad1")} tested={history.has("Numpad1")} className="w-full" />
                     <Key3D code="Numpad2" label="2" active={activeKeys.includes("Numpad2")} tested={history.has("Numpad2")} className="w-full" />
                     <Key3D code="Numpad3" label="3" active={activeKeys.includes("Numpad3")} tested={history.has("Numpad3")} className="w-full" />
                     <Key3D code="NumpadEnter" label="Ent" active={activeKeys.includes("NumpadEnter")} tested={history.has("NumpadEnter")} className="w-full h-full row-span-2 flex items-center" />
                     <Key3D code="Numpad0" label="0" active={activeKeys.includes("Numpad0")} tested={history.has("Numpad0")} className="w-full col-span-2" />
                     <Key3D code="NumpadDecimal" label="." active={activeKeys.includes("NumpadDecimal")} tested={history.has("NumpadDecimal")} className="w-full" />
                </div>
            </div>
        </Keyboard3DWrapper>
      );
  }, [activeKeys, history]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Рендерим закешированный лэйаут */}
      {keyboardLayout}

      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-12 glass-panel px-10 py-5 rounded-full flex gap-10 items-center border border-white/10 z-20">
        <div className="text-center group">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Pressed</div>
            <div className="font-mono text-2xl text-white">{history.size}</div>
        </div>
        <div className="w-[1px] h-8 bg-white/10" />
        <div className="text-center min-w-[120px]">
             <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Last Key</div>
             <div className="font-mono text-xl text-indigo-400 font-bold h-8 flex items-center justify-center relative">
                 <AnimatePresence mode="popLayout">
                    {lastKey && (
                        <motion.span
                            key={lastKey}
                            initial={{ opacity: 0, scale: 0.5, y: 10, filter: "blur(5px)" }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            className="block whitespace-nowrap drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                        >
                            {LABELS[lastKey] || lastKey.replace('Key', '')}
                        </motion.span>
                    )}
                 </AnimatePresence>
             </div>
        </div>
        <div className="w-[1px] h-8 bg-white/10" />
        <button onClick={() => { setHistory(new Set()); setLastKey(null) }} className="text-xs text-red-400 hover:text-white transition-colors font-bold uppercase tracking-wider px-2 py-1 outline-none">Reset</button>
      </motion.div>
    </div>
  );
};

// ... TypingMode И App КОПИРУЮТСЯ СНИЗУ без изменений по логике (оставляем старое) ...

const TypingMode = () => {
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [stats, setStats] = useState({ wpm: 0 });
  const inputRef = useRef(null);

  const restart = () => {
    setText(TEXTS[Math.floor(Math.random() * TEXTS.length)]);
    setInput("");
    setStarted(false);
    setFinished(false);
    setStats({ wpm: 0 });
    setStartTime(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  useEffect(() => restart(), []);

  const handleChange = (e) => {
    if(finished) return;
    const val = e.target.value;
    if(!started) { setStarted(true); setStartTime(Date.now()); }
    setInput(val);
    if(val === text) {
      setFinished(true);
      const wpm = Math.round((text.length / 5) / ((Date.now() - startTime) / 60000));
      setStats({ wpm });
      confetti({ particleCount: 200, spread: 150, origin: { y: 0.6 }, colors: ['#818cf8', '#c084fc'] });
    }
  };
  const liveWpm = started && !finished && startTime ? Math.round((input.length/5) / ((Date.now() - startTime)/60000)) || 0 : stats.wpm;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-5xl mx-auto flex flex-col items-center mt-20 perspective-container">
      <div 
        className="w-full bg-[#1e293b]/60 p-16 rounded-[40px] border border-white/5 relative overflow-hidden backdrop-blur-xl"
        style={{ transform: 'rotateX(5deg)', transformStyle: 'preserve-3d' }}
      >
        <div className="flex justify-between items-end mb-12 relative z-10">
          <div>
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] mb-2 opacity-80">Speed</div>
            <div className="text-7xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 font-bold">{liveWpm}</div>
          </div>
          <div className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider border ${finished ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>{finished ? "Completed" : "Type to start"}</div>
        </div>
        <div className="relative text-3xl font-light leading-loose font-mono text-left tracking-wider min-h-[160px]" onClick={() => inputRef.current.focus()}>
          <input ref={inputRef} type="text" value={input} onChange={handleChange} className="opacity-0 absolute inset-0 -z-10" autoFocus />
          {text.split('').map((char, i) => {
            const isMatch = i < input.length ? input[i] === char : false;
            return <span key={i} className={`transition-colors duration-75 ${i < input.length ? (isMatch ? "text-slate-200" : "text-red-400 underline decoration-red-500") : "text-slate-600"} ${i === input.length && !finished ? "border-l-2 border-indigo-500 pl-[1px]" : ""}`}>{char}</span>
          })}
        </div>
        {finished && <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-10 flex justify-center z-10 relative"><button onClick={restart} className="px-8 py-3 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-500 transition-all shadow-lg">Next Test ↻</button></motion.div>}
      </div>
    </motion.div>
  );
};

export default function App() {
  const [tab, setTab] = useState('tester'); 
  return (
    <div className="min-h-screen w-full flex flex-col p-6 overflow-hidden relative selection:bg-indigo-500 selection:text-white">
      <AnimatedBackground />
      <CustomCursor />
      <header className="flex justify-between items-center w-full max-w-[1400px] mx-auto mb-6 relative z-50">
        <div className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-white font-mono font-bold text-xl">K</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">KeiX</h1>
        </div>
        <LayoutGroup>
            <nav className="glass-panel p-1 rounded-xl flex relative">
            {['tester', 'typing'].map((mode) => (
                <button 
                    key={mode} 
                    onClick={() => setTab(mode)} 
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors relative z-10 outline-none ${tab === mode ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                >
                {tab === mode && (
                    <motion.div 
                        layoutId="nav-bg" 
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="absolute inset-0 bg-indigo-600 rounded-lg -z-10 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                    />
                )}
                {mode === 'tester' ? 'Switch Tester' : 'Speed Type'}
                </button>
            ))}
            </nav>
        </LayoutGroup>
      </header>
      <main className="flex-grow w-full relative z-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div 
             key={tab}
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 1.02, transition: { duration: 0.15 } }}
             transition={{ duration: 0.2 }}
             className="w-full"
          >
            {tab === 'tester' ? <TesterMode /> : <TypingMode />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}