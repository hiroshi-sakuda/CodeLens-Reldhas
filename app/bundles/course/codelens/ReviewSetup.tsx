import { useState } from 'react';
import { ArrowRight, Shuffle } from 'lucide-react';
import { dimensions } from './model.js';
import { choosePractice } from './review-flow.js';
export type PracticeConfig = { exerciseId: string; topic: string; focus: string[]; randomFocus: boolean };
export default function ReviewSetup({ onStart }: { onStart: (config: PracticeConfig) => void }) {
  const [focus, setFocus] = useState<string[]>(['Efficiency']);
  const [randomFocus, setRandomFocus] = useState(false);
  const [error, setError] = useState('');
  function start(e: React.FormEvent) {
    e.preventDefault();
    if (!randomFocus && !focus.length) { setError('Choose at least one criterion, or Random criteria.'); return; }
    try { onStart(choosePractice('Random', focus, randomFocus)); } catch (err) { setError((err as Error).message); }
  }
  return <section className="review-setup">
    <h1>What do you want to practise?</h1>
    <p>Choose one or more criteria.</p>
    <form onSubmit={start}>
      <fieldset><legend className="sr-only">Training criteria</legend><div className="setup-focus">
        {dimensions.map(area=><label key={area} className={focus.includes(area)&&!randomFocus?'chosen':''}>
          <input type="checkbox" checked={!randomFocus&&focus.includes(area)} disabled={randomFocus} onChange={()=>{setFocus(f=>f.includes(area)?f.filter(a=>a!==area):[...f,area]);setError('');}}/><span>{area}<small>{({Correctness:"Bugs & edge cases",Appropriateness:"The right approach",Efficiency:"Time & memory",Maintainability:"Readable, adaptable code"} as Record<string,string>)[area]}</small></span>
        </label>)}
      </div><label className="random-focus"><input type="checkbox" checked={randomFocus} onChange={e=>{setRandomFocus(e.target.checked);setError('');}}/><Shuffle size={15}/>Random</label></fieldset>

      {error&&<p className="validation-error" role="alert">{error}</p>}
      <div className="setup-actions"><span className="muted">Sample exercises</span><button className="primary" type="submit">Start practice<ArrowRight size={16}/></button></div>
    </form>
  </section>;
}
