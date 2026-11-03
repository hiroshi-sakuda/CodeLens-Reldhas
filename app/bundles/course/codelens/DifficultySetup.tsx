import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { difficulties, label } from './course.js';
export type Difficulty = 'easy' | 'medium' | 'hard';
const generatingMs = 1500;
export function Generating({ what, onDone }: { what: string; onDone: () => void }) {
  useEffect(() => { const timer = setTimeout(onDone, generatingMs); return () => clearTimeout(timer); }, []);
  return <section className="generating" role="status"><Sparkles size={22}/><h1>Generating {what}…</h1><p className="muted">Using the course material your TA approved.</p><span className="simulated-label">Simulated</span></section>;
}
export default function DifficultySetup({ title, what, levels, autoStart, onStart, onBack }: {
  title: string; what: string; levels: Record<Difficulty, string>; autoStart?: Difficulty;
  onStart: (difficulty: Difficulty) => void; onBack: () => void;
}) {
  const [difficulty, setDifficulty] = useState<Difficulty>(autoStart || 'easy');
  const [generating, setGenerating] = useState(!!autoStart);
  if (generating) return <Generating what={what} onDone={() => onStart(difficulty)}/>;
  return <section className="review-setup difficulty-setup">
    <button className="back-to-setup" onClick={onBack}><ArrowLeft size={15}/>&nbsp;Back to practice</button>
    <h1>{title}</h1>
    <p>Choose a difficulty. The topic is picked for you from what your TA has published.</p>
    <form onSubmit={e=>{e.preventDefault();setGenerating(true);}}>
      <fieldset><legend className="sr-only">Difficulty</legend><div className="setup-focus">
        {(difficulties as Difficulty[]).map(level=><label key={level} className={difficulty===level?'chosen':''}>
          <input type="radio" name="difficulty" checked={difficulty===level} onChange={()=>setDifficulty(level)}/><span>{label(level)}<small>{levels[level]}</small></span>
        </label>)}
      </div></fieldset>
      <div className="setup-actions"><span className="muted">Sample exercises</span><button className="primary" type="submit">Start practice<ArrowRight size={16}/></button></div>
    </form>
  </section>;
}
