import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import AnswerFeedback from '../../AnswerFeedback';
import CodeBlock from '../../CodeBlock';
import type { ScreenProps } from '../../features';
import { exercises } from '../../model.js';
import { readTa, writeTa } from '../../practice-log.js';
import { aiSummary, buildQueue, confidenceOf, flagLabels, makeReview, queueCounts, statusLabels } from './queue.js';
import { allReviews, allSubmissions } from './submissions.js';
import './review-queue.css';
const loadQueue = () => buildQueue(allSubmissions(), allReviews(), readTa().watching, exercises) as any[];
const when = (iso: string) => new Date(iso).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
function Flags({ flags }: { flags: string[] }) { return <>{flags.map(f=><span className="queue-flag" key={f}>{(flagLabels as any)[f]}</span>)}</>; }
export default function ReviewQueue({ params, go }: ScreenProps) {
  const queue = loadQueue();
  const [filter, setFilter] = useState('all');
  if (params.id) { const item = queue.find(i => i.submission.id === params.id); if (item) return <Review item={item} queue={queue} go={go}/>; }
  const counts = queueCounts(queue);
  const shown = queue.filter(i => filter === 'all' || i.status === filter);
  return <div className="ta-page">
    <h1>Review Queue</h1>
    <p className="ta-intro">{counts.waiting} waiting · {counts.flagged} flagged <span className="simulated-label">Sample submissions</span></p>
    <div className="queue-filters" role="group" aria-label="Filter by status">{['all','waiting','sent','skipped'].map(f=><button key={f} aria-pressed={filter===f} onClick={()=>setFilter(f)}>{f==='all'?'All':(statusLabels as any)[f]}</button>)}</div>
    <section className="progress-card queue-card">
      <div className="ta-table-scroll"><table className="ta-table"><thead><tr><th>Student</th><th>Exercise</th><th>AI score</th><th>Submitted</th><th>Status</th><th>Flags</th><th><span className="sr-only">Open</span></th></tr></thead>
        <tbody>{shown.map(i=><tr key={i.submission.id}><td><strong>{i.submission.student}</strong></td><td>{i.exercise?.title}</td><td>{i.submission.result.total.toFixed(1)} / 10</td><td>{when(i.submission.date)}</td><td><span className={'queue-status '+i.status}>{(statusLabels as any)[i.status]}</span></td><td><Flags flags={i.flags}/></td><td><button className="text-button" onClick={()=>go('review-queue',{id:i.submission.id})}>Open<ArrowRight size={14}/></button></td></tr>)}</tbody></table></div>
      {!shown.length&&<p className="muted">Nothing here. Try another filter.</p>}
    </section>
  </div>;
}
function Review({ item, queue, go }: { item: any; queue: any[]; go: ScreenProps['go'] }) {
  const { submission: s, exercise } = item;
  const original = aiSummary(exercise, s.result, s.noIssues);
  const [ta, setTa] = useState(readTa);
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState(original);
  const [adjusting, setAdjusting] = useState(false);
  const [score, setScore] = useState<number>(s.result.total);
  const [comment, setComment] = useState('');
  const next = queue.find(i => i.status === 'waiting' && i.submission.id !== s.id);
  const watching = ta.watching.includes(s.student);
  const save = (state: any) => { writeTa(state); setTa(state); };
  function act(action: 'send' | 'skip') {
    const review = makeReview({ attemptId: s.id, action, summary: editing ? summary : null, originalSummary: original, score: adjusting ? score : null, originalScore: s.result.total, comment });
    save({ ...ta, reviews: [...ta.reviews, review] });
    if (action === 'skip' && next) go('review-queue', { id: next.submission.id });
    else go('review-queue', action === 'send' ? { id: s.id, sent: Date.now() } : {});
  }
  return <div className="ta-page">
    <button className="progress-back" onClick={()=>go('review-queue')}><ArrowLeft size={17}/>Review Queue</button>
    <h1>{s.student} · {exercise.title}</h1>
    <p className="ta-intro"><span className={'queue-status '+item.status}>{(statusLabels as any)[item.status]}</span> Submitted {when(s.date)} <Flags flags={item.flags}/></p>
    <div className="workspace ta-review-grid">
      <section className="editor-panel"><CodeBlock file={exercise.file} code={exercise.code.join('\n')}/>
        <div className="ta-student-work"><h3>Student's comments</h3>
          {s.noIssues?<div className="annotation"><div className="annotation-head"><strong>No issues found</strong></div><p>{s.justification}</p></div>:s.comments.length?s.comments.map((c: any)=><article className="annotation" key={c.id}><div className="annotation-head"><strong>{c.dimension}</strong><span className="line-pill">L{c.start}{c.end!==c.start?'–'+c.end:''}</span></div><p>{c.claim}</p><p>{c.reasoning}</p><code>{c.fix}</code></article>):<p className="muted">No comments.</p>}
        </div>
      </section>
      <aside className="review-panel"><div className="feedback-content">
        <div className="feedback-score-row"><div className="ai-heading"><h2><Sparkles size={18} aria-hidden="true"/>AI feedback draft</h2><span className="simulated-label">Simulated</span></div><div className="compact-score"><strong>{s.result.total.toFixed(1)}</strong><span>/ 10</span></div></div>
        <p className="feedback-summary">{original} Confidence: {confidenceOf(exercise, s.comments)==='low'?'low':'high'}. Based on the answer key and the rubric.</p>
        <section className="answer-section"><h3>Answer key</h3>{exercise.findings.length?exercise.findings.map((f: any,i: number)=><div className="answer-finding" key={i}><span className="line-pill">{f.dimension} · L{f.start}{f.end!==f.start?'–'+f.end:''}</span><h4>{f.claim}</h4></div>):<p className="clean-answer">This code has no planted issues.</p>}</section>
        <section className="answer-section ta-actions"><div className="section-title"><h3>Your review</h3><label className="ta-check"><input type="checkbox" checked={watching} onChange={()=>save({...ta,watching:watching?ta.watching.filter((n: string)=>n!==s.student):[...ta.watching,s.student]})}/>Watch {s.student}</label></div>
          {item.reviews.map((r: any)=><p className="history-note" key={r.id}>{r.sentAt?`Sent ${when(r.sentAt)}`:`Skipped ${when(r.createdAt)}`}{r.adjustedScore!=null&&` · score ${r.adjustedScore} / 10`}{r.editedSummary&&' · summary edited'}{r.comment&&` · “${r.comment}”`}</p>)}
          <AnswerFeedback target="AI feedback" value={ta.ratings[s.id]} onChange={rating=>save({...ta,ratings:{...ta.ratings,[s.id]:rating}})}/>
          <label className="ta-check"><input type="checkbox" checked={editing} onChange={e=>setEditing(e.target.checked)}/>Edit the AI's summary</label>
          {editing&&<textarea aria-label="Edited summary" value={summary} onChange={e=>setSummary(e.target.value)}/>}
          <label className="ta-check"><input type="checkbox" checked={adjusting} onChange={e=>setAdjusting(e.target.checked)}/>Adjust score</label>
          {adjusting&&<div className="ta-score"><input type="range" min={0} max={10} step={0.5} value={score} aria-label="Adjusted score" onChange={e=>setScore(Number(e.target.value))}/><strong>{score} / 10</strong></div>}
          <label className="ta-label">Your comment to the student <span className="muted">(optional)</span><textarea value={comment} placeholder="What should this student do next?" onChange={e=>setComment(e.target.value)}/></label>
          <div className="ta-buttons"><button className="primary" onClick={()=>act('send')}><Check size={16}/>{item.status==='sent'?'Send again':'Approve and send'}</button>{item.status!=='sent'&&<button className="secondary" onClick={()=>act('skip')}>Skip</button>}</div>
          {next&&<button className="text-button" onClick={()=>go('review-queue',{id:next.submission.id})}>Next in queue<ArrowRight size={15}/></button>}
        </section>
      </div></aside>
    </div>
  </div>;
}
