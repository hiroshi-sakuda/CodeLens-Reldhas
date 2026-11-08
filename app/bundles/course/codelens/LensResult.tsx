import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { CheckIcon, SparkIcon } from './icons';
import { commentFeedback } from './lens-feedback.js';
import { findingFound } from './model.js';
import { CodeCard } from './ui';
// The Lens Review result, shared by the review screen after Submit and by the page the bell opens.
// It shows the student's score, the TA's comment when there is one, and AI feedback per planted issue.
// It never shows the corrected code.
const lines = (f: { start: number; end: number }) => f.start === f.end ? `Line ${f.start}` : `Lines ${f.start}–${f.end}`;
export const scoreText = (total: number) => `${+total.toFixed(1)} / 10`;

export function lensMarks(exercise: any, comments: any[]) {
  const marks: Record<number, 'found' | 'missed'> = {};
  for (const f of exercise.findings) for (let n = f.start; n <= f.end; n++) marks[n] = findingFound(f, comments) ? 'found' : marks[n] || 'missed';
  return marks;
}
export function ResultCode({ exercise, comments }: { exercise: any; comments: any[] }) {
  return <CodeCard file={exercise.file} code={exercise.code.join('\n')} marks={lensMarks(exercise, comments)}
    legend={exercise.findings.length ? <span className="legend"><span><i className="found"/>You found</span><span><i className="missed"/>You missed</span></span> : <span>No planted issues in this code</span>} note={null}/>;
}

/* The TA's own feedback, shown above the AI's. The bell opens the review here (id ta-comment). */
export function TaNote({ comments, highlight = false }: { comments: string[]; highlight?: boolean }) {
  return <section id="ta-comment" tabIndex={-1} aria-labelledby="ta-title" className={'ta-note' + (highlight ? ' flash' : '')}>
    <span className="ta-avatar" aria-hidden="true">TA</span>
    <div><h2 id="ta-title">Your TA</h2>{comments.length ? comments.map((c, i) => <p key={i}>{c}</p>) : <p>Your TA checked this review and agreed with the AI feedback.</p>}</div>
  </section>;
}

export default function LensResult({ exercise, comments, result, noIssues, justification, focus, ta, taScore, rating, note }: {
  exercise: any; comments: any[]; result: any; noIssues?: boolean; justification?: string; focus: string[];
  ta?: ReactNode; taScore?: number | null; rating?: ReactNode; note?: string;
}) {
  const live = result.source === 'ai';
  // Found and missed always come from the answer key, also when the score comes from live AI.
  const found = exercise.findings.filter((f: any) => findingFound(f, comments)).length;
  const extra = live ? [] : comments.map(c => commentFeedback(exercise, c)).filter(f => f.result !== 'found');
  const clean = !exercise.findings.length;
  const summary = live ? result.summary : note || (clean
    ? (noIssues ? 'Correct conclusion: this code meets the requirements.' : 'This code has no issues, so the annotations were not needed.')
    : found === exercise.findings.length ? 'You found every planted issue.' : found ? `You found ${found} of ${exercise.findings.length} issues. Check the one you missed below.` : 'You missed the planted issues. Each one is explained below.');
  return <>
    <div className="score-head">
      <div className="score-pair">
        <div className="big-score"><strong>{+result.total.toFixed(1)}</strong><span>/ 10</span>{taScore != null && <small>AI</small>}</div>
        {taScore != null && <div className="big-score ta"><strong>{+taScore.toFixed(1)}</strong><span>/ 10</span><small>Your TA</small></div>}
      </div>
      <div className="score-sub"><strong>{clean ? (noIssues ? 'Right conclusion' : 'No issues to find') : `Found ${found} of ${exercise.findings.length} ${exercise.findings.length === 1 ? 'issue' : 'issues'}`}</strong><span>Lenses practised: {focus.join(', ')}</span><span>Topic: {exercise.topic}</span></div>
    </div>
    {ta}
    <section aria-labelledby="ai-title" className="feedback-block">
      <div className="ai-title"><SparkIcon/><h2 id="ai-title" className="panel-title">AI feedback</h2><span className="chip">{live ? 'Live AI' : ta ? 'Checked by your TA' : 'Simulated'}</span></div>
      <p>{summary}</p>
      {noIssues && <article className={'note-box ' + (clean ? 'good' : 'warn')}><div className="note-head"><span className={'chip ' + (clean ? 'good' : 'warn')}>{clean ? <CheckIcon/> : <X size={14} strokeWidth={2.6}/>}No issues found</span></div><p>{justification}</p></article>}
      {live && result.improvements.length > 0 && <div className="ai-steps"><h3 className="small-title">To strengthen your review</h3><ol>{result.improvements.map((s: string, i: number) => <li key={i}>{s}</li>)}</ol></div>}
      {exercise.findings.map((f: any, i: number) => {
        const hit = findingFound(f, comments);
        return <article key={i} className={'note-box ' + (hit ? 'good' : 'warn')}>
          <div className="note-head"><span className={'chip ' + (hit ? 'good' : 'warn')}>{hit ? <CheckIcon/> : <X size={14} strokeWidth={2.6}/>}{hit ? 'You found this' : 'You missed this'}</span><span className="lines">{lines(f)}</span><span className="lens-tag">{f.dimension}</span></div>
          <p><strong>{f.claim}</strong></p>
          {!hit && <><p>{f.reasoning}</p><p className="fix-line"><strong>Fix</strong><span>{f.fix}</span></p></>}
        </article>;
      })}
      {extra.map(f => <article key={f.id} className="note-box plain">
        <div className="note-head"><span className="chip">{({ 'wrong-lens': 'Wrong lens', unclear: 'Issue not named', 'not-an-issue': 'Not an issue' } as Record<string, string>)[f.result]}</span><span className="lines">{f.label}</span></div>
        {f.points.map(p => <p key={p}>{p}</p>)}
      </article>)}
    </section>
    {!ta && <section className="note-box plain" aria-label="TA review"><div className="note-head"><strong>TA review</strong><span className="chip">Not available yet</span></div><p>A teaching assistant will check this review and add feedback here.</p></section>}
    {Object.keys(result.rubric).length > 0 && <details className="more-details"><summary>How this was scored{live ? '' : ' (simulated)'}</summary>
      {Object.entries(result.rubric).map(([key, value]: [string, any]) => <p key={key} className="row-between"><span style={{ textTransform: 'capitalize' }}>{key}</span><strong>{value.toFixed(1)} / 2.5</strong></p>)}
      <p className="muted-text">{live ? 'The score comes from live AI, which can be imperfect. Found and missed come from the answer key.' : 'Demo scoring uses keywords and line ranges, not live AI.'}</p>
    </details>}
    {rating}
  </>;
}
