import { useState } from 'react';
import { Brackets } from './icons';
import { dimensions } from './model.js';
import { choosePractice } from './review-flow.js';
export type PracticeConfig = { exerciseId: string; topic: string; focus: string[]; randomFocus: boolean };
const hints: Record<string, string> = { Correctness: 'Bugs and edge cases', Appropriateness: 'The right approach', Efficiency: 'Time and memory', Maintainability: 'Readable, adaptable code' };
// Shown when a student chooses Change on the Lens Review card.
export default function ReviewSetup({ onStart }: { onStart: (config: PracticeConfig) => void }) {
  const [focus, setFocus] = useState<string[]>(['Efficiency']);
  const [randomFocus, setRandomFocus] = useState(false);
  const [error, setError] = useState('');
  function start(e: React.FormEvent) {
    e.preventDefault();
    if (!randomFocus && !focus.length) { setError('Choose at least one lens, or Random.'); return; }
    try { onStart(choosePractice('Random', focus, randomFocus)); } catch (err) { setError((err as Error).message); }
  }
  return <section className="sheet center-sheet">
    <form className="setup-form" onSubmit={start}>
      <div><h2 className="setup-title">Which lenses do you want to practise?</h2><p className="muted-text">Choose one or more, or let CodeLens pick at random.</p></div>
      <fieldset className="option-list"><legend className="sr-only">Lenses</legend>
        <label className="card hoverable vf option-card"><Brackets/><input type="checkbox" checked={randomFocus} onChange={e => { setRandomFocus(e.target.checked); setError(''); }}/><span className="option-text"><strong>Random</strong><small>Any lens may apply. You see which ones after you submit.</small></span></label>
        {dimensions.map(area => <label key={area} className="card hoverable vf option-card"><Brackets/>
          <input type="checkbox" checked={!randomFocus && focus.includes(area)} disabled={randomFocus} onChange={() => { setFocus(f => f.includes(area) ? f.filter(a => a !== area) : [...f, area]); setError(''); }}/>
          <span className="option-text"><strong>{area}</strong><small>{hints[area]}</small></span>
        </label>)}
      </fieldset>
      {error && <p className="error-text" role="alert">{error}</p>}
      <div className="setup-actions2"><span className="muted-text">Sample exercises</span><button className="btn btn-primary" type="submit">Start Lens Review</button></div>
    </form>
  </section>;
}
