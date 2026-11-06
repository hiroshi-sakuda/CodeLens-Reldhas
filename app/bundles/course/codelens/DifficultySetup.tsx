import { useEffect, useState } from 'react';
import { difficulties, label } from './course.js';
import { Brackets, SparkIcon } from './icons';
import { SlimBar } from './bars';
export type Difficulty = 'easy' | 'medium' | 'hard';
const generatingMs = 1500;
export function Generating({ what, onDone }: { what: string; onDone: () => void }) {
  useEffect(() => { const timer = setTimeout(onDone, generatingMs); return () => clearTimeout(timer); }, []);
  return <section className="sheet center-sheet generating2" role="status"><span className="tile big" aria-hidden="true"><SparkIcon size={24}/></span><h2>Generating {what}…</h2><p>Using the course material your TA approved.</p><span className="chip">Simulated</span></section>;
}
// Shown when a student chooses Change on a Practice card (Start skips it and uses the last difficulty).
export default function DifficultySetup({ title, what, levels, autoStart, help, onStart, onBack }: {
  title: string; what: string; levels: Record<Difficulty, string>; autoStart?: Difficulty; help?: { title: string; steps: string[] };
  onStart: (difficulty: Difficulty) => void; onBack: () => void;
}) {
  const [difficulty, setDifficulty] = useState<Difficulty>(autoStart || 'easy');
  const [generating, setGenerating] = useState(!!autoStart);
  return <>
    <SlimBar title={title} meta={generating ? label(difficulty) : 'Choose a difficulty'} onExit={onBack} help={help} leave={null}/>
    {generating ? <Generating what={what} onDone={() => onStart(difficulty)}/> : <section className="sheet center-sheet">
      <form className="setup-form" onSubmit={e => { e.preventDefault(); setGenerating(true); }}>
        <div><h2 className="setup-title">How hard should it be?</h2><p className="muted-text">The topic is picked for you from what your TA has published.</p></div>
        <fieldset className="option-list"><legend className="sr-only">Difficulty</legend>
          {(difficulties as Difficulty[]).map(level => <label key={level} className="card hoverable vf option-card">
            <Brackets/>
            <input type="radio" name="difficulty" checked={difficulty === level} onChange={() => setDifficulty(level)}/>
            <span className="option-text"><strong>{label(level)}</strong><small>{levels[level]}</small></span>
          </label>)}
        </fieldset>
        <div className="setup-actions2"><span className="muted-text">Sample exercises</span><button className="btn btn-primary" type="submit">Start {title}</button></div>
      </form>
    </section>}
  </>;
}
