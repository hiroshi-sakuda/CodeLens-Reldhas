import { useEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import PythonConsole from './PythonConsole';
import { SlimBar } from './bars';
import { highlight } from './CodeBlock';
import DemoFill from './DemoFill';
import { goodReview, wrongReview } from './lens-demo.js';
import AnswerFeedback, { type AnswerRating } from './AnswerFeedback';
import CriterionGuide from './CriterionGuide';
import LensResult, { ResultCode, scoreText, TaNote } from './LensResult';
import { feedbackForAttempt } from './review-comparison.js';
import { sampleHistory, sampleLensAttempt } from './features/skill-map/sample-history.js';
import { allReviews } from './features/review-queue/submissions.js';
import ReviewSetup, { type PracticeConfig } from './ReviewSetup';
import { submissionError, nextPractice, draftForAttempt, attemptAsDraft } from './review-flow.js';
import { exercises, dimensions, assess, consoleExample, normalizeComment } from './model.js';
import { CheckIcon, LensIcon, SparkIcon, TerminalIcon } from './icons';
import { PanelFooter, ResultChip, WorkArea } from './ui';
import './lens.css';
type LiveResult = ReturnType<typeof assess> & { source: 'ai'; summary: string; improvements: string[] };
type Comment = { id: string; start: number; end: number; lenses: string[]; text: string; fix: string };
type Attempt = { id: string; reviewId?: string; exercise: string; date: string; comments: Comment[]; result: ReturnType<typeof assess>; focus?: string[]; randomFocus?: boolean; noIssues?: boolean; justification?: string };
type Draft = { savedResult?: ReturnType<typeof assess>; sample?: boolean; sampleNote?: string; archived?: boolean; liveResult?: LiveResult; ratings?: { feedback?: AnswerRating; answer?: AnswerRating }; comments: Comment[]; submitted: boolean; exerciseId?: string; topic?: string; focus?: string[]; randomFocus?: boolean; noIssues?: boolean; justification?: string; attemptId?: string; editor?: { range: number[]; form: typeof empty; editing: string | null } };
const empty = { text: '', fix: '', lenses: [] as string[] };
// A fresh form starts with the lens already chosen only when there is a single one to choose.
const freshForm = (lenses: string[]) => ({ ...empty, lenses: lenses.length === 1 ? [...lenses] : [] });
// Saved drafts from before the merge had claim, reasoning and one lens; turn them into the new form.
const toForm = (saved: any) => { if (!saved) return null; const c = normalizeComment(saved); return { text: c.text, fix: c.fix, lenses: c.lenses }; };
export const help = { title: 'How Lens Review works', steps: ['Read the situation and compare the code with the requirements.', 'Click a line, or drag across several lines, to select an issue.', 'Choose the lenses that fail, say what is wrong and why, and propose a fix.', 'Nothing to flag? Tick “I found no issues” and say what you checked.', 'Submit to see your score and feedback on each annotation.'] };
function readSaved() { try { const s = JSON.parse(localStorage.getItem('codelens-demo-v1') || '{}'); return { drafts: s.drafts || {}, attempts: Array.isArray(s.attempts) ? s.attempts : [], currentReviewId: s.currentReviewId || Object.keys(s.drafts || {})[0] || 'seats' }; } catch { return { drafts: {}, attempts: [], currentReviewId: 'seats' }; } }
const linesLabel = (a: number, b: number) => a === b ? `Line ${a}` : `Lines ${a}–${b}`;

// Lens Review. params: start (a chosen exercise and lenses), reviewId (open a saved review), attemptId (open a submitted attempt) or setup (choose lenses first).
export default function App({ onHome, onHistoryBack, params = {} }: { onHome: () => void; onHistoryBack?: () => void; params?: Record<string, any> }) {
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
  const [live, setLive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [localAutoLogin, setLocalAutoLogin] = useState(false);
  const [provider, setProvider] = useState('the configured AI provider');
  const [password, setPassword] = useState('');
  useEffect(() => { fetch('/api/status').then(r => r.ok ? r.json() : null).then(s => { setConfigured(!!s?.configured); setLocalAutoLogin(!!s?.localAutoLogin); if (s?.provider) setProvider(s.provider); setAuthenticated(!!s?.authenticated); }).catch(() => {}); }, []);
  const viewingHistory = !!params.attemptId;
  const draft = drafts[reviewId] || { comments: [], submitted: false };
  const exerciseId = draft.exerciseId || reviewId;
  const exercise = exercises.find(e => e.id === exerciseId) || exercises[0];
  const focus = draft.focus || dimensions;
  const allowedFocus = draft.randomFocus ? dimensions : focus;
  // Random mode: any lens may apply, so one annotation can name several.
  const multiLens = !!draft.randomFocus;
  const result = draft.liveResult || draft.savedResult || assess(exercise, draft.comments, { noIssues: !!draft.noIssues, justification: draft.justification || '' });
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
    setRange([]); setEditing(null); setForm(freshForm(config.randomFocus ? dimensions : config.focus)); setError('');
  }
  function resumeReview(id: string) {
    const saved = drafts[id];
    setReviewId(id); setShowSetup(false);
    setRange(saved.submitted ? [] : saved.editor?.range || []); setEditing(saved.submitted ? null : saved.editor?.editing || null);
    setForm(toForm(saved.editor?.form) || freshForm(saved.randomFocus ? dimensions : saved.focus || dimensions));
    setTab(saved.submitted ? 'feedback' : 'annotations'); setError('');
  }
  function showAttempt(id: string) {
    const attempt: any = attempts.find(a => a.id === id) || sampleLensAttempt(id);
    if (!attempt) return;
    const key = draftForAttempt(attempt, drafts) || attempt.id;
    if (!drafts[key]) setDrafts(d => ({ ...d, [key]: attemptAsDraft(attempt) as Draft }));
    setReviewId(key); setShowSetup(false); setTab('feedback');
    setRange([]); setEditing(null); setForm(freshForm(dimensions)); setError('');
  }
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return; // React may run this twice in development; start only one review.
    opened.current = true;
    if (params.attemptId) showAttempt(params.attemptId);
    else if (params.start) startReview(params.start);
    else if (params.reviewId && drafts[params.reviewId]) resumeReview(params.reviewId);
  }, []);
  function clearEditor() { setRange([]); setEditing(null); setForm(freshForm(allowedFocus)); setError(''); }
  function saveComment(e: React.FormEvent) {
    e.preventDefault();
    if (!form.lenses.length || !form.text.trim() || !form.fix.trim()) { setError(!form.lenses.length ? 'Choose the lens that fails here.' : 'Say what is wrong and why, and propose a fix.'); return; }
    const comment = { ...form, id: editing || crypto.randomUUID(), start: Math.min(...range), end: Math.max(...range) };
    update({ ...draft, noIssues: false, justification: '', comments: editing ? draft.comments.map(c => c.id === editing ? comment : c) : [...draft.comments, comment] });
    clearEditor();
  }
  const requestPayload = () => ({ exerciseId, focus: allowedFocus, comments: draft.comments.map(normalizeComment).map(({ start, end, lenses, text, fix }: any) => ({ start, end, lenses, text, fix })), noIssues: !!draft.noIssues, justification: draft.justification || '' });
  // A live review signs in first if needed. If anything fails the draft stays as it was.
  async function submit() {
    const message = submissionError(draft, range.length > 0); if (message) { setError(message); return; }
    setBusy(true); setError(''); window.scrollTo({ top: 0 });
    try {
      const post = (path: string, body: unknown, init: RequestInit = {}) => fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), ...init });
      if (live && !authenticated) {
        const response = await post('/api/session', localAutoLogin ? {} : { password });
        const value = await response.json();
        if (!response.ok) throw new Error(value.error || 'Sign in to use live review.');
        setAuthenticated(true); setPassword('');
      }
      let completed: any = result;
      if (live) {
        const response = await post('/api/review', requestPayload(), { signal: AbortSignal.timeout(50000) });
        const value = await response.json();
        if (!response.ok) { if (response.status === 401) setAuthenticated(false); throw new Error(value.error || 'Review failed.'); }
        completed = value.result;
      }
      const attemptId = crypto.randomUUID();
      update({ ...draft, submitted: true, attemptId, ...(live ? { liveResult: completed as LiveResult } : {}) });
      setAttempts(a => [...a, { id: attemptId, reviewId, exercise: exerciseId, date: new Date().toISOString(), comments: draft.comments, result: completed, focus: [...focus], randomFocus: draft.randomFocus, noIssues: draft.noIssues, justification: draft.justification }]);
      clearEditor(); setTab('feedback');
    } catch (e) { setError(e instanceof Error ? e.message : 'AI review failed. Your draft is safe.'); }
    finally { setBusy(false); }
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
    const from = dragFrom.current;
    if (n) setRange(r => r[0] === from && r.at(-1) === n ? r : [from, n]);
  }

  if (showSetup) return <>
    <SlimBar title="Lens Review" meta="Choose your lenses" onExit={onHome} help={help} leave={null}/>
    <ReviewSetup onStart={startReview} initialFocus={params.focus} topic={params.topic}/>
  </>;

  if (busy) return <>
    <SlimBar title="Lens Review" meta="Evaluating" leave={null}/>
    <section className="sheet center-sheet lr-evaluating" role="status" aria-live="polite"><span className="tile big" aria-hidden="true"><SparkIcon size={24}/></span><h2>Evaluating your review</h2><p>Comparing your annotations with the code and requirements.</p></section>
  </>;

  const lo = range.length ? Math.min(...range) : 0, hi = range.length ? Math.max(...range) : 0;
  const rows = exercise.code.map((line, i) => {
    const n = i + 1;
    const annotated = draft.comments.some(c => n >= c.start && n <= c.end);
    // Press anywhere on a line (number or code) to start; drag to extend. The number button serves the keyboard.
    return <div key={n} data-line={n} className={'lr-line' + (annotated ? ' annotated' : '') + (n >= lo && n <= hi ? ' selected' : '') + (draft.submitted || draft.noIssues ? '' : ' pickable')}
      onMouseDown={e => { if (e.button === 0) { e.preventDefault(); pickLine(n, e); } }}>
      <button type="button" className="lr-ln" disabled={draft.submitted || draft.noIssues} aria-label={`Select line ${n}`} aria-pressed={n >= lo && n <= hi} onClick={e => { if (e.detail === 0) pickLine(n, e); }}>{n}</button>
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
  const saved = draft.comments.map(normalizeComment).map((c, i) => <article key={c.id} className="saved-note">
    <div className="note-head"><span className="lines">{linesLabel(c.start, c.end)}</span>{c.lenses.map((l: string) => <span key={l} className="lens-tag">{l}</span>)}
      {!draft.submitted && <span className="saved-actions"><button className="text-link" onClick={() => { setEditing(c.id); setRange([c.start, c.end]); setForm({ lenses: c.lenses, text: c.text, fix: c.fix }); }}>Edit</button>
        <button className="icon-btn" aria-label={'Delete annotation ' + (i + 1)} onClick={() => { update({ ...draft, comments: draft.comments.filter(x => x.id !== c.id) }); if (editing === c.id) clearEditor(); }}><Trash2 size={15} strokeWidth={1.8}/></button></span>}
    </div>
    <p>{c.text}</p>
    <p className="fix-line"><strong>Fix</strong><span>{c.fix}</span></p>
  </article>);
  const guide = <section className="panel-in lr-guide">
    <div><h2 className="panel-title">Your lenses</h2>
      {draft.randomFocus && !draft.submitted ? <p className="muted-text">Random. Any of the four lenses may apply here. You will see which ones after you submit.</p> : <CriterionGuide key={reviewId} criteria={allowedFocus}/>}</div>
    <ol><li>Read the requirements.</li><li>Select lines that break one and explain why.</li><li>Suggest a fix for each.</li><li>Nothing to flag? Tick “I found no issues”.</li></ol>
  </section>;

  const ta = feedbackForAttempt(params.attemptId || draft.attemptId || '', allReviews(), sampleHistory);
  const leaveResult = viewingHistory && onHistoryBack ? onHistoryBack : onHome;
  if (draft.submitted) return <>
    <SlimBar title={exercise.title} meta={`Lens Review, ${exercise.topic.replace(' & ', ' and ').toLowerCase()}, submitted`} onExit={leaveResult} exitLabel={viewingHistory ? 'Skill map' : undefined} help={help} leave={null} aside={<ResultChip value={result.total / 10}>{scoreText(result.total)}</ResultChip>}/>
    <WorkArea>
      <section className="sheet work-main" aria-label="Exercise and code"><Brief exercise={exercise}/><ResultCode exercise={exercise} comments={draft.comments}/></section>
      <aside className="sheet work-side" aria-label="Your review">
        {tabs}
        <div className="work-side-body">
          {tab === 'feedback' ? <LensResult exercise={exercise} comments={draft.comments} result={result} noIssues={draft.noIssues} justification={draft.justification} focus={allowedFocus} note={draft.sampleNote}
            taScore={ta.adjustedScore} ta={ta.available ? <TaNote comments={ta.comments}/> : undefined}
            rating={<AnswerFeedback target="AI feedback" value={draft.ratings?.feedback} onChange={rating => update({ ...draft, ratings: { ...draft.ratings, feedback: rating } })}/>}/>
            : tab === 'guide' ? guide : <section className="lr-saved">{draft.noIssues ? <article className="saved-note"><div className="note-head"><span className="lens-tag">No issues found</span></div><p>{draft.justification}</p></article> : saved}</section>}
        </div>
        <PanelFooter>{viewingHistory ? <button className="btn btn-outline" onClick={leaveResult}>Back to Skill map</button> : <><button className="btn btn-outline" onClick={onHome}>Back to Practice</button><button className="btn btn-primary" onClick={nextExercise}>Next Lens Review</button></>}</PanelFooter>
      </aside>
    </WorkArea>
  </>;

  const blocked = submissionError(draft, range.length > 0) || (live && !authenticated && !localAutoLogin && !password ? 'Enter the review access password to use live AI.' : '');
  return <>
    <SlimBar title={exercise.title} meta={`Lens Review, ${exercise.topic.replace(' & ', ' and ').toLowerCase()}${storageError ? ', not saved' : ''}`} onExit={onHome} help={help}/>
    <WorkArea>
      <section className="sheet work-main" aria-label="Exercise and code">
        <Brief exercise={exercise}/>
        <div className="code-card">
          <div className="code-card-head"><span className="lr-instruction"><span className="lr-icon" aria-hidden="true"><LensIcon size={15}/></span>{draft.noIssues ? 'You marked this code as having no issues.' : 'Click a line, or drag across several lines, to add an annotation.'}</span><span className="mono muted-mono">{exercise.file}</span></div>
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
              <fieldset className="lens-pick"><legend>{multiLens ? '1. Which lenses fail here? Choose one or more.' : '1. Which lens fails here?'}</legend><div>
                {allowedFocus.map(d => { const on = form.lenses.includes(d); return <button type="button" key={d} className="chip-toggle" aria-pressed={on} onClick={() => { setError(''); setForm({ ...form, lenses: multiLens ? (on ? form.lenses.filter(l => l !== d) : [...form.lenses, d]) : [d] }); }}>{on && <CheckIcon/>}{d}</button>; })}
              </div></fieldset>
              <label className="field">2. What’s wrong, and why?<textarea rows={4} maxLength={8000} placeholder="Describe the problem and why it matters." value={form.text} onChange={e => setForm({ ...form, text: e.target.value })}/></label>
              <label className="field">3. Proposed fix<textarea rows={2} maxLength={4000} placeholder="How would you change the code?" value={form.fix} onChange={e => setForm({ ...form, fix: e.target.value })}/></label>
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
          {configured && <label className="lr-noissues"><input type="checkbox" checked={live} onChange={e => { setLive(e.target.checked); setError(''); }}/>Use live AI feedback</label>}
          {live && <span className="muted-text">Sends this review to {provider}.</span>}
          {live && !authenticated && !localAutoLogin && <label className="field">Review access password<input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}/></label>}
          {error && !range.length && <p className="error-text" role="alert">{error}</p>}
          <div className="row-between lr-submit"><span className="panel-footer-note">{draft.noIssues ? 'No issues found' : `${draft.comments.length} ${draft.comments.length === 1 ? 'annotation' : 'annotations'} saved`}</span>
            <button className="btn btn-primary" disabled={!!blocked} title={blocked || undefined} onClick={submit}>Submit review</button></div>
          {range.length > 0 && <span className="muted-text">Save or cancel the open annotation before submitting.</span>}
        </footer>
      </aside>
    </WorkArea>
  </>;
}

export function Brief({ exercise }: { exercise: any }) {
  return <>
    <h2 className="work-prompt">Check the proposed code against the requirements.</h2>
    <div className="lr-brief">
      <div><h3 className="small-title">The situation</h3><p>{exercise.brief}</p></div>
      <div><h3 className="small-title">Requirements</h3><ul>{exercise.requirements.map((r: string) => <li key={r}><CheckIcon className=""/>{r}</li>)}</ul></div>
    </div>
  </>;
}
