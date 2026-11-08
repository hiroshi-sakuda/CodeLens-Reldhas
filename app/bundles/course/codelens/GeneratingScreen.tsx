import { useEffect } from 'react';
import { label } from './course.js';
import { SparkIcon } from './icons';
import { SlimBar } from './bars';
export type Difficulty = 'easy' | 'medium' | 'hard';
const generatingMs = 1500;

// Shown briefly after Start, at the level chosen on the Practice card.
export default function GeneratingScreen({ title, what, difficulty, help, onDone, onBack }: {
  title: string; what: string; difficulty: Difficulty; help?: { title: string; steps: string[] }; onDone: () => void; onBack: () => void;
}) {
  useEffect(() => { const timer = setTimeout(onDone, generatingMs); return () => clearTimeout(timer); }, []);
  return <>
    <SlimBar title={title} meta={label(difficulty)} onExit={onBack} help={help} leave={null}/>
    <section className="sheet center-sheet generating2" role="status"><span className="tile big" aria-hidden="true"><SparkIcon size={24}/></span><h2>Generating {what}…</h2><p>Using the course material your TA approved.</p><span className="chip">Simulated</span></section>
  </>;
}
