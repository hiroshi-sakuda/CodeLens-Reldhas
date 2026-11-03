import { useEffect, useState } from 'react';
import { Sparkles, ScanLine, ChevronRight, ArrowLeft, ArrowRight, Check, Plus, X, MessageSquare, BookOpen, BarChart3, FileCode2, CircleHelp, Trash2, Sun, Moon } from 'lucide-react';
import PythonConsole from './PythonConsole';
import { highlight } from './CodeBlock';
import AnswerFeedback, { type AnswerRating } from './AnswerFeedback';
import CriterionGuide from './CriterionGuide';
import ReviewSetup, { type PracticeConfig } from './ReviewSetup';
import { submissionError, nextPractice } from './review-flow.js';
import { exercises, dimensions, assess, consoleExample } from './model.js';
type Comment = { id: string; start: number; end: number; dimension: string; claim: string; reasoning: string; fix: string };
type Attempt = { id: string; exercise: string; date: string; comments: Comment[]; result: ReturnType<typeof assess>; focus?: string[]; randomFocus?: boolean; noIssues?: boolean; justification?: string };
type Draft = { ratings?: { feedback?: AnswerRating; answer?: AnswerRating }; comments: Comment[]; submitted: boolean; exerciseId?: string; topic?: string; focus?: string[]; randomFocus?: boolean; noIssues?: boolean; justification?: string; editor?: { range: number[]; form: typeof empty; editing: string | null } };
const empty = { claim: '', reasoning: '', fix: '', dimension: 'Efficiency' };
function readSaved() { try { const s = JSON.parse(localStorage.getItem('codelens-demo-v1') || '{}'); return { drafts: s.drafts || {}, attempts: Array.isArray(s.attempts) ? s.attempts : [], currentReviewId: s.currentReviewId || Object.keys(s.drafts || {})[0] || 'seats' }; } catch { return { drafts: {}, attempts: [], currentReviewId: 'seats' }; } }
export default function App({ onHome }: { onHome?: () => void }) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try { return localStorage.getItem('codelens-theme') === 'light' ? 'light' : 'dark'; }
    catch { return 'dark'; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f5f7f8' : '#111517');
    try { localStorage.setItem('codelens-theme', theme); } catch { /* Theme still works for this session. */ }
  }, [theme]);
  const [initial] = useState(readSaved);
  const [drafts,setDrafts] = useState<Record<string,Draft>>(initial.drafts);
  const [attempts,setAttempts] = useState<Attempt[]>(initial.attempts);
  const [reviewId,setReviewId] = useState(initial.currentReviewId);
  const [showSetup,setShowSetup] = useState(true);
  const [page,setPage] = useState('workspace');
  const [tab,setTab] = useState('brief');
  const [range,setRange] = useState<number[]>(initial.drafts[initial.currentReviewId]?.editor?.range || []);
  const [form,setForm] = useState<typeof empty>(initial.drafts[initial.currentReviewId]?.editor?.form || empty);
  const [editing,setEditing] = useState<string|null>(initial.drafts[initial.currentReviewId]?.editor?.editing || null);
  const [error,setError] = useState('');
  const [storageError,setStorageError] = useState(false);
  const [showHelp,setShowHelp] = useState(false);
  const draft = drafts[reviewId] || { comments: [], submitted: false };
  const exerciseId = draft.exerciseId || reviewId;
  const exercise = exercises.find(e=>e.id === exerciseId) || exercises[0];
  const focus = draft.focus || dimensions;
  const allowedFocus = draft.randomFocus ? dimensions : focus;
  const result = assess(exercise,draft.comments,{noIssues:!!draft.noIssues,justification:draft.justification||''});
  useEffect(()=>{ try { localStorage.setItem('codelens-demo-v1',JSON.stringify({ drafts, attempts, currentReviewId: reviewId })); setStorageError(false); } catch { setStorageError(true); } },[drafts,attempts,reviewId]);
  useEffect(()=>{
    setDrafts(previous=>{
      const current = previous[reviewId];
      if (!current || current.submitted) return previous;
      const editor = { range, form, editing };
      if (JSON.stringify(current.editor) === JSON.stringify(editor)) return previous;
      return { ...previous, [reviewId]: { ...current, editor } };
    });
  },[range,form,editing,reviewId]);
  function update(next: Draft) { setDrafts(d=>({...d,[reviewId]:next})); }
  function startReview(config: PracticeConfig) {
    const id = crypto.randomUUID();
    setDrafts(d=>({...d,[id]:{...config,comments:[],submitted:false,noIssues:false,justification:''}}));
    setReviewId(id); setShowSetup(false); setPage('workspace'); setTab('brief');
    setRange([]); setEditing(null); setForm({...empty,dimension:config.randomFocus?dimensions[0]:config.focus[0]}); setError('');
  }
  function resumeReview(id: string) {
    const saved = drafts[id];
    setReviewId(id); setShowSetup(false);
    setRange(saved.submitted?[]:saved.editor?.range || []); setEditing(saved.submitted?null:saved.editor?.editing || null);
    setForm(saved.editor?.form || {...empty,dimension:saved.focus?.[0] || dimensions[0]});
    setTab(saved.submitted?'feedback':saved.editor?.range.length?'annotations':'brief'); setError('');
  }
  function clearEditor() { setRange([]); setEditing(null); setForm({...empty,dimension:allowedFocus[0]}); setError(''); }
  function selectExercise(_id:string) { setPage('workspace'); setShowSetup(true); }
  function saveComment(e:React.FormEvent) { e.preventDefault(); if (!form.claim.trim() || !form.reasoning.trim() || !form.fix.trim()) { setError('Complete the claim, reasoning, and proposed fix.'); return; } const comment = { ...form, id: editing || crypto.randomUUID(), start: Math.min(...range), end: Math.max(...range) }; update({...draft,noIssues:false,justification:'',comments: editing ? draft.comments.map(c=>c.id===editing?comment:c) : [...draft.comments,comment]}); clearEditor(); }
  function submit() { const message = submissionError(draft,range.length>0); if (message) { setError(message); return; } update({...draft,submitted:true}); setAttempts(a=>[...a,{id:crypto.randomUUID(),exercise:exerciseId,date:new Date().toISOString(),comments:draft.comments,result,focus:[...focus],randomFocus:draft.randomFocus,noIssues:draft.noIssues,justification:draft.justification}]); clearEditor(); setTab('feedback'); }
  function nextExercise() { startReview(nextPractice(exercise.id, focus, !!draft.randomFocus)); window.scrollTo({top:0,behavior:'smooth'}); }
  const recent = attempts.filter(a=>Date.now()-new Date(a.date).getTime()<=30*86400000);
  return <div className="app-shell">
    <div className="main-shell"><header className="topbar"><nav className="breadcrumb-nav" aria-label="Breadcrumb"><span className="breadcrumb">CodeLens</span><ChevronRight size={14}/>{onHome&&<><button onClick={onHome}>Practice</button><ChevronRight size={14}/></>}{page==='workspace'?showSetup?<span aria-current="page">Training criteria</span>:<><button onClick={()=>setShowSetup(true)}>Training criteria</button><ChevronRight size={14}/><span aria-current="page">Lens Review</span></>:<span aria-current="page">My progress</span>}</nav><div className="topbar-actions"><button className="icon-button" aria-label="How it works" onClick={()=>setShowHelp(true)}><CircleHelp size={17}/></button><button className="theme-toggle" onClick={()=>setTheme(theme==='dark'?'light':'dark')} aria-label={theme==='dark'?'Switch to light mode':'Switch to dark mode'} title={theme==='dark'?'Switch to light mode':'Switch to dark mode'}>{theme==='dark'?<Sun size={16}/>:<Moon size={16}/>}<span>{theme==='dark'?'Light mode':'Dark mode'}</span></button><span className="local-status"><span className="live-dot"/>{storageError?'Not saved':'Saved locally'}</span></div></header>
      <main className={page==='workspace'?(showSetup?'setup-page':'review-page'):'progress-page'}>{page==='progress'&&<><button className="progress-back" onClick={()=>{setPage('workspace');setShowSetup(true);}}><ArrowLeft size={17}/>Back to review selection</button><h1 className="progress-heading">My progress</h1></>}
      {page==='workspace' ? showSetup ? <><ReviewSetup onStart={startReview}/>{Object.entries(drafts).some(([,d])=>!d.submitted)&&<details className="saved-reviews"><summary>Saved reviews</summary>{Object.entries(drafts).filter(([,d])=>!d.submitted).map(([id,d])=><button className="secondary" key={id} onClick={()=>resumeReview(id)}>{exercises.find(e=>e.id===(d.exerciseId||id))?.title || 'Review'} · {d.randomFocus?'Random focus':(d.focus||dimensions).join(', ')} · {d.comments.length} annotations</button>)}</details>}</> : <><div className="workspace-toolbar"><div className="exercise-select"><strong>{exercise.topic}</strong></div><div className="exercise-meta"><span>Python</span></div></div>
      <div className="review-focus-summary"><span>Criteria</span><strong>{draft.randomFocus&&!draft.submitted?'Random · revealed after submission':focus.join(' · ')}</strong></div>
      <section className="exercise-brief" aria-labelledby="exercise-brief-title"><div><h1 id="exercise-brief-title">{exercise.title}</h1><p>{exercise.brief}</p></div><div><h3>Requirements</h3><ul className="requirements">{exercise.requirements.map(r=><li key={r}><Check size={15}/><span>{r}</span></li>)}</ul></div></section>
      <div className="workspace"><section className="editor-panel"><div className="editor-tab"><span><FileCode2 size={16}/>{exercise.file}<span className="tiny-dot"/></span><span className="muted">Sample code</span></div><div className="editor-info"><span><ScanLine size={14}/>{draft.submitted?'Submitted':'Select lines to annotate'}</span><span>{exercise.code.length} lines</span></div><div className="code-area" aria-label="Python source code">{exercise.code.map((line,i)=>{const n=i+1;const selected=range.length>0&&n>=Math.min(...range)&&n<=Math.max(...range);const annotated=draft.comments.some(c=>n>=c.start&&n<=c.end);return <button key={i} disabled={draft.submitted||draft.noIssues} className={'code-line '+(selected?'selected ':'')+(annotated?'annotated':'')} aria-label={'Select line '+n+': '+line} aria-pressed={selected} onClick={()=>{if(editing)clearEditor();setRange(r=>r.length===1?[r[0],n]:[n]);setTab('annotations');setError('');}}><span className="line-marker">{annotated?<MessageSquare size={10}/>:null}</span><span className="line-number">{n}</span><code>{highlight(line)||' '}</code></button>})}</div><div className="editor-bottom"><span><span className="python-dot"/>Python 3</span><span>Read-only</span></div><PythonConsole key={reviewId} source={exercise.code.join('\n')} example={consoleExample(exercise)}/></section>
      <aside className="review-panel"><div className="panel-tabs"><button className={tab==='brief'?'current':''} onClick={()=>setTab('brief')}><BookOpen size={15}/>Review guide</button><button className={tab==='annotations'?'current':''} onClick={()=>setTab('annotations')}><MessageSquare size={15}/>Annotations ({draft.comments.length})</button><button className={tab==='feedback'?'current':''} disabled={!draft.submitted} onClick={()=>setTab('feedback')}><Sparkles size={15}/>Feedback{draft.submitted&&<span className="live-dot"/>}</button></div>
      {tab==='annotations'&&range.length>0&&!draft.submitted?<form className="annotation-form" onSubmit={saveComment}><div className="section-title"><h3>{editing?'Edit annotation':'Add annotation'}</h3><button type="button" className="icon-button" aria-label="Cancel annotation" onClick={clearEditor}><X size={18}/></button></div><span className="line-pill">Lines {Math.min(...range)}–{Math.max(...range)}</span><label>Focus area<select value={form.dimension} onChange={e=>setForm({...form,dimension:e.target.value})}>{allowedFocus.map(d=><option key={d}>{d}</option>)}</select></label><label>Claim<textarea required placeholder="What is the issue with this code?" value={form.claim} onChange={e=>setForm({...form,claim:e.target.value})}/></label><label>Reasoning<textarea required placeholder="Why does it matter? Use an example or explain the complexity." value={form.reasoning} onChange={e=>setForm({...form,reasoning:e.target.value})}/></label><label>Proposed fix<textarea required placeholder="How would you improve it?" value={form.fix} onChange={e=>setForm({...form,fix:e.target.value})}/></label>{error&&<p role="alert">{error}</p>}<button className="primary" type="submit"><Plus size={16}/>{editing?'Save changes':'Save annotation'}</button></form>:tab==='annotations'?<div className="review-list"><div className="section-title"><h3>Your annotations <span>{draft.comments.length}</span></h3><span>{draft.submitted?'Submitted':''}</span></div>{draft.noIssues?<p className="muted">No issues found selected.</p>:draft.comments.length===0?<div className="empty-annotations"><MessageSquare size={22}/><div><p>Select a line or range to add an annotation.</p></div></div>:draft.comments.map((c,i)=><article className="annotation" key={c.id}><div className="annotation-head"><span className="annotation-index">{i+1}</span><strong>{c.dimension}</strong><span className="line-pill">L{c.start}{c.end!==c.start?'–'+c.end:''}</span>{!draft.submitted&&<div className="annotation-actions"><button onClick={()=>{setEditing(c.id);setRange([c.start,c.end]);setForm({dimension:c.dimension,claim:c.claim,reasoning:c.reasoning,fix:c.fix});}}>Edit</button><button aria-label={'Delete annotation '+(i+1)} onClick={()=>{update({...draft,comments:draft.comments.filter(x=>x.id!==c.id)});if(editing===c.id)clearEditor();}}><Trash2 size={14}/></button></div>}</div><p>{c.claim}</p><details><summary>Reasoning & proposed fix</summary><p>{c.reasoning}</p><code>{c.fix}</code></details></article>)}</div>:tab==='feedback'&&draft.submitted?<div className="feedback-content">
        <div className="feedback-score-row"><div className="ai-heading"><h2><Sparkles size={18} aria-hidden="true"/>AI feedback</h2><span className="simulated-label">Simulated</span></div><div className="compact-score"><strong>{result.total.toFixed(1)}</strong><span>/ 10</span></div></div>
        <p className="feedback-summary">{exercise.findings.length===0?(draft.noIssues?'Correct conclusion.':'No issues were present.'):`${result.found} of ${exercise.findings.length} issues identified.`}</p>
        <AnswerFeedback target="AI feedback" value={draft.ratings?.feedback} onChange={rating=>update({...draft,ratings:{...draft.ratings,feedback:rating}})}/>
        <section className="answer-section" aria-label="Model answer"><div className="ai-heading answer-heading"><h3><Sparkles size={16} aria-hidden="true"/>Model answer</h3><span className="simulated-label">Sample</span></div>
          {exercise.findings.length===0?<p className="clean-answer">The code meets the requirements. No changes needed.</p>:exercise.findings.map((finding,index)=><article className="answer-finding" key={index}>
            <span className="line-pill">{finding.dimension} · L{finding.start}{finding.end!==finding.start?'–'+finding.end:''}</span>
            <h4>{finding.claim}</h4><p>{finding.reasoning}</p><div className="answer-fix"><strong>Fix</strong><p>{finding.fix}</p></div>
          </article>)}
          <h4 className="solution-heading">{exercise.findings.length?'Corrected code':'Reference code'}</h4><pre className="answer-code">{exercise.reference}</pre><AnswerFeedback target="Model answer" value={draft.ratings?.answer} onChange={rating=>update({...draft,ratings:{...draft.ratings,answer:rating}})}/>
        </section>
        <details className="scoring-details"><summary>Scoring details · simulated</summary>
          <p className="muted">Demo scoring uses keywords and line ranges. Model answers are curated samples, not live AI output. Ratings are stored on this device; they are not sent for model training.</p>
          {Object.keys(result.rubric).length?Object.entries(result.rubric).map(([key,value])=><div className="rubric" key={key}><div><span>{key}</span><strong>{value.toFixed(1)} <small>/ 2.5</small></strong></div><div className="track"><span style={{width:(value/2.5*100)+'%'}}/></div></div>):<p>Full credit requires a correct “No issues found” conclusion and a justification. Justification wording is not graded.</p>}
        </details>
        <button className="text-button" onClick={()=>setPage('progress')}>My progress<ArrowRight size={16}/></button>
      </div>:<div className="brief-content"><div className="focus-block"><h3>Your review criteria</h3><CriterionGuide key={reviewId} criteria={allowedFocus}/></div><ol className="review-steps"><li>Check the requirements.</li><li>Annotate issues and suggest fixes.</li><li>Nothing to flag? Choose “No issues found”.</li></ol></div>}
      </aside></div><div className="submission-bar"><div className="no-issues-control"><label className="no-issues-choice"><input type="checkbox" checked={!!draft.noIssues} disabled={draft.submitted||draft.comments.length>0||range.length>0} onChange={e=>{update({...draft,noIssues:e.target.checked});setError('');}}/><span>No issues found</span></label>{draft.comments.length>0&&!draft.submitted&&<p>Remove annotations to select.</p>}{range.length>0&&!draft.submitted&&<p>Save or cancel the open annotation.</p>}{draft.noIssues&&<label>Justification<textarea aria-label="No issues justification" required readOnly={draft.submitted} value={draft.justification||''} placeholder="Explain how the code meets the requirements and what you checked." onChange={e=>{update({...draft,justification:e.target.value});setError('');}}/></label>}</div>{draft.submitted?<div className="completed-actions"><button className="secondary" onClick={()=>{setShowSetup(true);window.scrollTo({top:0,behavior:'smooth'});}}><ArrowLeft size={16}/>Back to criteria selection</button><button className="primary" onClick={nextExercise}>Next exercise<ArrowRight size={17}/></button></div>:<button className="primary" disabled={!!submissionError(draft,range.length>0)} onClick={submit}>Submit review<ArrowRight size={17}/></button>}</div></>:<section className="progress-view"><div className="stat-grid"><article><span>Reviews completed</span><strong>{recent.length}</strong><small>Last 30 days</small></article><article><span>Average review score</span><strong>{recent.length?(recent.reduce((s,a)=>s+a.result.total,0)/recent.length).toFixed(1):'—'}<small> / 10</small></strong><small>Simulated assessment</small></article><article><span>Annotations written</span><strong>{recent.reduce((s,a)=>s+a.comments.length,0)}</strong><small>Last 30 days</small></article></div><div className="progress-card"><h2>Review history</h2><p className="muted">Practice recorded on this browser in the last 30 days.</p>{!recent.length?<div className="progress-empty"><ScanLine size={32}/><h3>No reviews yet.</h3><p>Complete a review to see your progress.</p><button className="primary" onClick={()=>{setPage('workspace');setShowSetup(true);}}>Start reviewing<ArrowRight size={16}/></button></div>:recent.slice().reverse().map(a=><details className="history-item" key={a.id}><summary><FileCode2 size={20}/><span><strong>{exercises.find(e=>e.id===a.exercise)?.title}</strong><small>{new Date(a.date).toLocaleString()} · {a.comments.length} annotations</small></span><b>{a.result.total.toFixed(1)} / 10</b></summary>{a.noIssues&&<div className="history-comment"><strong>No issues found</strong><p>{a.justification}</p></div>}{a.comments.map(c=><div className="history-comment" key={c.id}><strong>{c.dimension} · L{c.start}–{c.end}</strong><p>{c.claim}</p><p>{c.reasoning}</p><code>{c.fix}</code></div>)}</details>)}</div></section>}
      <footer><span>Demo · Sample exercises and simulated grading</span></footer></main></div>
      {showHelp&&<div className="modal-backdrop" onClick={()=>setShowHelp(false)}><section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={e=>e.stopPropagation()}><button autoFocus className="icon-button close-modal" aria-label="Close help" onClick={()=>setShowHelp(false)}><X/></button><h2 id="help-title">How to review</h2><ol><li>Read the brief and compare the code with the requirements.</li><li>Select the first and last lines of an issue.</li><li>Choose a focus and explain your claim, reasoning, and fix.</li><li>Save your annotations and submit to see the scoring breakdown.</li></ol><p>This standalone demo uses sample material and deterministic feedback. The Python console executes locally in your browser; no API key or account is required.</p><button className="primary" onClick={()=>setShowHelp(false)}>Got it<Check size={16}/></button></section></div>}
  </div>;
}
