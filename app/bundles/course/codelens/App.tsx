import { useEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import PythonConsole from './PythonConsole';
import { SlimBar } from './bars';
import { highlight } from './CodeBlock';
import DemoFill from './DemoFill';
import { goodReview, wrongReview } from './lens-demo.js';
import AnswerFeedback, { type AnswerRating } from './AnswerFeedback';
import CriterionGuide from './CriterionGuide';
import LensResult, { ResultCode, scoreText } from './LensResult';
import ReviewSetup, { type PracticeConfig } from './ReviewSetup';
import { submissionError, nextPractice } from './review-flow.js';
import { exercises, dimensions, assess, consoleExample } from './model.js';
import { CheckIcon, LensIcon, SparkIcon, TerminalIcon } from './icons';
import { PanelFooter, ResultChip, WorkArea } from './ui';
import './lens.css';
type Comment = { id: string; start: number; end: number; dimension: string; claim: string; reasoning: string; fix: string };
type Attempt = { id: string; exercise: string; date: string; comments: Comment[]; result: ReturnType<typeof assess>; focus?: string[]; randomFocus?: boolean; noIssues?: boolean; justification?: string };
type Draft = { ratings?: { feedback?: AnswerRating; answer?: AnswerRating }; comments: Comment[]; submitted: boolean; exerciseId?: string; topic?: string; focus?: string[]; randomFocus?: boolean; noIssues?: boolean; justification?: string; attemptId?: string; editor?: { range: number[]; form: typeof empty; editing: string | null } };
const empty = { claim: '', reasoning: '', fix: '', dimension: 'Efficiency' };
export const help = { title: 'How Lens Review works', steps: ['Read the situation and compare the code with the requirements.', 'Click a line number, or drag across lines, to select an issue.', 'Choose the lens, say what is wrong and why, and propose a fix.', 'Nothing to flag? Tick “I found no issues” and say what you checked.', 'Submit to see your score and feedback on each annotation.'] };
function readSaved() { try { const s = JSON.parse(localStorage.getItem('codelens-demo-v1') || '{}'); return { drafts: s.drafts || {}, attempts: Array.isArray(s.attempts) ? s.attempts : [], currentReviewId: s.currentReviewId || Object.keys(s.drafts || {})[0] || 'seats' }; } catch { return { drafts: {}, attempts: [], currentReviewId: 'seats' }; } }
const linesLabel = (a: number, b: number) => a === b ? `Line ${a}` : `Lines ${a}–${b}`;

// Lens Review. params: start (a chosen exercise and lenses), reviewId (open a saved review) or setup (choose lenses first).
export default function App({ onHome, params = {} }: { onHome: () => void; params?: Record<string, any> }) {
  const [initial] = useState(readSaved);
  const [drafts, setDrafts] = useState<Record<string, Draft>>(initial.drafts);
  const [attempts, setAttempts] = useState<Attempt[]>(initial.attempts);
  const [reviewId, setReviewId] = useState(initial.currentReviewId);
  const [showSetup, setShowSetup] = useState(true);
  const [tab, setTab] = useState<'annotations' | 'guide' | 'feedback'>('annotations');
  const [range, setRange] = useState<number[]>([]);
  const [form, setForm] = useState<typeof empty>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [storageError, setStorageError] = useState(false);
  const dragFrom = useRef<number | null>(null);
  const draft = drafts[reviewId] || { comments: [], submitted: false };
  const exerciseId = draft.exerciseId || reviewId;
  const exercise = exercises.find(e => e.id === exerciseId) || exercises[0];
  const focus = draft.focus || dimensions;
  const allowedFocus = draft.randomFocus ? dimensions : focus;
  const result = assess(exercise, draft.comments, { noIssues: !!draft.noIssues, justification: draft.justification || '' });
  useEffect(() => { try { localStorage.setItem('codelens-demo-v1', JSON.stringify({ drafts, attempts, currentReviewId: reviewId })); setStorageError(false); } catch { setStorageError(true); } }, [drafts, attempts, reviewId]);
  useEffect(() => {
    setDrafts(previous => {
      const current = previous[reviewId];
      if (!current || current.submitted) return previous;
      const editor = { range, form, editing };
      if (JSON.stringify(current.editor) === JSON.stringify(editor)) return previous;
      return { ...previous, [reviewId]: { ...current, editor } };
    });
  }, [range, form, editing, reviewId]);
  useEffect(() => {
    const stop = () => { dragFrom.current = null; };
    window.addEventListener('mouseup', stop);
    return () => window.removeEventListener('mouseup', stop);
  }, []);
  function update(next: Draft) { setDrafts(d => ({ ...d, [reviewId]: next })); }
  function startReview(config: PracticeConfig) {
    const id = crypto.randomUUID();
    setDrafts(d => ({ ...d, [id]: { ...config, comments: [], submitted: false, noIssues: false, justification: '' } }));
    setReviewId(id); setShowSetup(false); setTab('annotations');
    setRange([]); setEditing(null); setForm({ ...empty, dimension: config.randomFocus ? dimensions[0] : config.focus[0] }); setError('');
  }
  function resumeReview(id: string) {
    const saved = drafts[id];
    setReviewId(id); setShowSetup(false);
    setRange(saved.submitted ? [] : saved.editor?.range || []); setEditing(saved.submitted ? null : saved.editor?.editing || null);
    setForm(saved.editor?.form || { ...empty, dimension: saved.focus?.[0] || dimensions[0] });
    setTab(saved.submitted ? 'feedback' : 'annotations'); setError('');
  }
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return; // React may run this twice in development; start only one review.
    opened.current = true;
    if (params.start) startReview(params.start);
    else if (params.reviewId && drafts[params.reviewId]) resumeReview(params.reviewId);
  }, []);
  function clearEditor() { setRange([]); setEditing(null); setForm({ ...empty, dimension: allowedFocus[0] }); setError(''); }
  function saveComment(e: React.FormEvent) {
    e.preventDefault();
    if (!form.claim.trim() || !form.reasoning.trim() || !form.fix.trim()) { setError('Complete the claim, reasoning, and proposed fix.'); return; }
    const comment = { ...form, id: editing || crypto.randomUUID(), start: Math.min(...range), end: Math.max(...range) };
    update({ ...draft, noIssues: false, justification: '', comments: editing ? draft.comments.map(c => c.id === editing ? comment : c) : [...draft.comments, comment] });
    clearEditor();
  }
  function submit() {
    const message = submissionError(draft, range.length > 0); if (message) { setError(message); return; }
    const attemptId = crypto.randomUUID();
    update({ ...draft, submitted: true, attemptId });
    setAttempts(a => [...a, { id: attemptId, exercise: exerciseId, date: new Date().toISOString(), comments: draft.comments, result, focus: [...focus], randomFocus: draft.randomFocus, noIssues: draft.noIssues, justification: draft.justification }]);
    clearEditor(); setTab('feedback'); window.scrollTo({ top: 0 });
  }
  function nextExercise() { startReview(nextPractice(exercise.id, focus, !!draft.randomFocus)); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function pickLine(n: number, e: React.MouseEvent) {
    if (draft.submitted || draft.noIssues) return;
    if (editing) clearEditor();
    setError(''); setTab('annotations');
    if (e.detail === 0) { setRange(r => r.length === 1 ? [r[0], n] : [n]); return; } // keyboard: two presses make a range
    if (e.shiftKey && range.length) { setRange([range[0], n]); return; }
    dragFrom.current = n; setRange([n]);
  }

  // Dragging across lines extends the selection to the line under the pointer.
  function dragOver(e: React.MouseEvent) {
    if (dragFrom.current === null) return;
    const n = Number((e.target as HTMLElement).closest('[data-line]')?.getAttribute('data-line'));
    if (n) setRange(r => r[0] === dragFrom.current && r.at(-1) === n ? r : [dragFrom.current!, n]);
  }

  if (showSetup) return <>
    <SlimBar title="Lens Review" meta="Choose your lenses" onExit={onHome} help={help} leave={null}/>
    <ReviewSetup onStart={startReview}/>
  </>;

  const lo = range.length ? Math.min(...range) : 0, hi = range.length ? Math.max(...range) : 0;
  const rows = exercise.code.map((line, i) => {
    const n = i + 1;
    const annotated = draft.comments.some(c => n >= c.start && n <= c.end);
    return <div key={n} data-line={n} className={'lr-line' + (annotated ? ' annotated' : '') + (n >= lo && n <= hi ? ' selected' : '')}>
      <button type="button" className="lr-ln" disabled={draft.submitted || draft.noIssues} aria-label={`Select line ${n}`} aria-pressed={n >= lo && n <= hi}
        onMouseDown={e => { if (e.button === 0) pickLine(n, e); }} onClick={e => { if (e.detail === 0) pickLine(n, e); }}>{n}</button>
      <code>{highlight(line) || ' '}</code>
    </div>;
  });
  // The selected lines sit inside one frame with viewfinder corners.
  const code = range.length ? [...rows.slice(0, lo - 1), <div key="sel" className="lr-sel"><span aria-hidden="true" className="sel-c tl"/><span aria-hidden="true" className="sel-c tr"/><span aria-hidden="true" className="sel-c bl"/><span aria-hidden="true" className="sel-c br"/>{rows.slice(lo - 1, hi)}</div>, ...rows.slice(hi)] : rows;
  const tabs = <div role="tablist" aria-label="Review panel" className="lr-tabs">
    <button role="tab" aria-selected={tab === 'annotations'} onClick={() => setTab('annotations')}>{draft.submitted ? 'Your annotations' : 'Annotations'} {!draft.submitted && draft.comments.length > 0 && <span className="count-badge">{draft.comments.length}</span>}</button>
    <button role="tab" aria-selected={tab === 'guide'} onClick={() => setTab('guide')}>Review guide</button>
    <button role="tab" aria-selected={tab === 'feedback'} onClick={() => setTab('feedback')}>Feedback</button>
  </div>;
  const saved = draft.comments.map((c, i) => <article key={c.id} className="saved-note">
    <div className="note-head"><span className="lines">{linesLabel(c.start, c.end)}</span><span className="lens-tag">{c.dimension}</span>
      {!draft.submitted && <span className="saved-actions"><button className="text-link" onClick={() => { setEditing(c.id); setRange([c.start, c.end]); setForm({ dimension: c.dimension, claim: c.claim, reasoning: c.reasoning, fix: c.fix }); }}>Edit</button>
        <button className="icon-btn" aria-label={'Delete annotation ' + (i + 1)} onClick={() => { update({ ...draft, comments: draft.comments.filter(x => x.id !== c.id) }); if (editing === c.id) clearEditor(); }}><Trash2 size={15} strokeWidth={1.8}/></button></span>}
    </div>
    <p>{c.claim}</p>
    <details className="more-details"><summary>Reasoning and proposed fix</summary><p>{c.reasoning}</p><p className="fix-line"><strong>Fix</strong><span>{c.fix}</span></p></details>
  </article>);
  const guide = <section className="panel-in lr-guide">
    <div><h2 className="panel-title">Your lenses</h2>
      {draft.randomFocus && !draft.submitted ? <p className="muted-text">Random. Any of the four lenses may apply here. You will see which ones after you submit.</p> : <CriterionGuide key={reviewId} criteria={allowedFocus}/>}</div>
    <ol><li>Read the requirements.</li><li>Select lines that break one and explain why.</li><li>Suggest a fix for each.</li><li>Nothing to flag? Tick “I found no issues”.</li></ol>
  </section>;

  if (draft.submitted) return <>
    <SlimBar title={exercise.title} meta={`Lens Review, ${exercise.topic.replace(' & ', ' and ').toLowerCase()}, submitted`} onExit={onHome} help={help} leave={null} aside={<ResultChip value={result.total / 10}>{scoreText(result.total)}</ResultChip>}/>
    <WorkArea>
      <section className="sheet work-main" aria-label="Exercise and code"><Brief exercise={exercise}/><ResultCode exercise={exercise} comments={draft.comments}/></section>
      <aside className="sheet work-side" aria-label="Your review">
        {tabs}
        <div className="work-side-body">
          {tab === 'feedback' ? <LensResult exercise={exercise} comments={draft.comments} result={result} noIssues={draft.noIssues} justification={draft.justification} focus={focus}
            rating={<AnswerFeedback target="AI feedback" value={draft.ratings?.feedback} onChange={rating => update({ ...draft, ratings: { ...draft.ratings, feedback: rating } })}/>}/>
            : tab === 'guide' ? guide : <section className="lr-saved">{draft.noIssues ? <article className="saved-note"><div className="note-head"><span className="lens-tag">No issues found</span></div><p>{draft.justification}</p></article> : saved}</section>}
        </div>
        <PanelFooter><button className="btn btn-outline" onClick={onHome}>Back to Practice</button><button className="btn btn-primary" onClick={nextExercise}>Next Lens Review</button></PanelFooter>
      </aside>
    </WorkArea>
  </>;

  const blocked = submissionError(draft, range.length > 0);
  return <>
    <SlimBar title={exercise.title} meta={`Lens Review, ${exercise.topic.replace(' & ', ' and ').toLowerCase()}${storageError ? ', not saved' : ''}`} onExit={onHome} help={help}/>
    <WorkArea>
      <section className="sheet work-main" aria-label="Exercise and code">
        <Brief exercise={exercise}/>
        <div className="code-card">
          <div className="code-card-head"><span className="lr-instruction"><span className="lr-icon" aria-hidden="true"><LensIcon size={15}/></span>{draft.noIssues ? 'You marked this code as having no issues.' : 'Click a line number, or drag across lines, to add an annotation.'}</span><span className="mono muted-mono">{exercise.file}</span></div>
          <div className="code-lines lr-code" aria-label="Python source code" onMouseMove={dragOver} onMouseUp={dragOver}>{code}</div>
          <details className="lr-terminal"><summary><TerminalIcon size={16}/>Terminal<span>Run the code to test your ideas</span></summary><PythonConsole key={reviewId} source={exercise.code.join('\n')} example={consoleExample(exercise)}/></details>
        </div>
      </section>
      <aside className="sheet work-side" aria-label="Your review">
        {tabs}
        <div className="work-side-body">
          {tab === 'annotations' ? <>
            {range.length > 0 && <form className="lr-form panel-in" onSubmit={saveComment}>
              <div className="row-between"><h2 className="panel-title">{editing ? 'Edit annotation' : 'New annotation'}</h2><span className="lines">{linesLabel(lo, hi)}</span></div>
              <fieldset className="lens-pick"><legend>Which lens fails here?</legend><div>
                {allowedFocus.map(d => <button type="button" key={d} className="chip-toggle" aria-pressed={form.dimension === d} onClick={() => setForm({ ...form, dimension: d })}>{form.dimension === d && <CheckIcon/>}{d}</button>)}
              </div></fieldset>
              <label className="field">Claim<textarea rows={2} placeholder="What is the issue with this code?" value={form.claim} onChange={e => setForm({ ...form, claim: e.target.value })}/></label>
              <label className="field">Reasoning<textarea rows={2} placeholder="Why does it matter? Use an example or explain the complexity." value={form.reasoning} onChange={e => setForm({ ...form, reasoning: e.target.value })}/></label>
              <label className="field">Proposed fix<textarea rows={2} placeholder="How would you change the code?" value={form.fix} onChange={e => setForm({ ...form, fix: e.target.value })}/></label>
              {error && <p className="error-text" role="alert">{error}</p>}
              <div className="lr-form-actions"><button type="button" className="btn btn-outline btn-sm" onClick={clearEditor}>Cancel</button><button type="submit" className="btn btn-primary btn-sm">{editing ? 'Save changes' : 'Save annotation'}</button></div>
            </form>}
            {draft.comments.length > 0 ? <section className="lr-saved" aria-labelledby="saved-title"><h3 id="saved-title" className="small-title">Saved annotations</h3>{saved}</section>
              : !range.length && <p className="muted-text">{draft.noIssues ? 'You ticked “I found no issues”. Untick it to annotate lines.' : 'No annotations yet. Select a line in the code to start one.'}</p>}
            <DemoFill onGood={() => { update({ ...draft, ...goodReview(exercise) }); clearEditor(); }} onWrong={() => { update({ ...draft, ...wrongReview(exercise, dimensions) }); clearEditor(); }}/>
          </> : tab === 'guide' ? guide : <section className="panel-in lr-empty"><span className="tile big" aria-hidden="true"><SparkIcon size={22}/></span><h2 className="panel-title">Your feedback appears here</h2><p className="muted-text">Submit your review to see your score and feedback on each annotation.</p></section>}
        </div>
        <footer className="panel-footer lr-footer">
          <label className="lr-noissues"><input type="checkbox" checked={!!draft.noIssues} disabled={draft.comments.length > 0 || range.length > 0} onChange={e => { update({ ...draft, noIssues: e.target.checked }); setError(''); }}/>I found no issues in this code</label>
          {draft.comments.length > 0 && <span className="muted-text">Remove your annotations to choose this.</span>}
          {draft.noIssues && <label className="field">What did you check?<textarea aria-label="No issues justification" value={draft.justification || ''} placeholder="Explain how the code meets the requirements and what you checked." onChange={e => { update({ ...draft, justification: e.target.value }); setError(''); }}/></label>}
          <div className="row-between lr-submit"><span className="panel-footer-note">{draft.noIssues ? 'No issues found' : `${draft.comments.length} ${draft.comments.length === 1 ? 'annotation' : 'annotations'} saved`}</span>
            <button className="btn btn-primary" disabled={!!blocked} title={blocked || undefined} onClick={submit}>Submit review</button></div>
          {range.length > 0 && <span className="muted-text">Save or cancel the open annotation before submitting.</span>}
        </footer>
      </aside>
    </WorkArea>
  </>;
}

function Brief({ exercise }: { exercise: any }) {
  return <>
    <h2 className="work-prompt">Check the proposed code against the requirements.</h2>
    <div className="lr-brief">
      <div><h3 className="small-title">The situation</h3><p>{exercise.brief}</p></div>
      <div><h3 className="small-title">Requirements</h3><ul>{exercise.requirements.map((r: string) => <li key={r}><CheckIcon className=""/>{r}</li>)}</ul></div>
    </div>
  </>;
}
