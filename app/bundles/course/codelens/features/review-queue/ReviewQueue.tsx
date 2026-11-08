import { useState } from 'react';
import { ArrowLeft, ThumbsDown, ThumbsUp } from 'lucide-react';
import { highlight } from '../../CodeBlock';
import type { ScreenProps } from '../../features';
import { SparkIcon } from '../../icons';
import { scoreText } from '../../LensResult';
import { exercises, findingFound, normalizeComment } from '../../model.js';
import { readTa, writeTa } from '../../practice-log.js';
import { ThemeButton } from '../../bars';
import { PanelFooter, ResultChip, WorkArea } from '../../ui';
import { aiSummary, buildQueue, confidenceOf, flagLabels, makeReview, queueCounts, statusLabels } from './queue.js';
import { allReviews, allSubmissions, exampleTaFeedback } from './submissions.js';
import DemoFill from '../../DemoFill';
import './review-queue.css';
export const loadQueue = () => buildQueue(allSubmissions(), allReviews(), exercises) as any[];
const when = (iso: string) => new Date(iso).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
const first = (name: string) => name.split(' ')[0];
const linesLabel = (a: number, b: number) => a === b ? `Line ${a}` : `Lines ${a}–${b}`;
function Flags({ flags }: { flags: string[] }) {
  if (!flags.length) return <span className="muted-text">Not flagged</span>;
  return <span className="flag-list">{flags.map(f => <span className="chip warn flag" key={f}>{f === 'student-down' && <ThumbsDown size={12} strokeWidth={2}/>}{(flagLabels as any)[f]}</span>)}</span>;
}

export default function ReviewQueue({ go }: ScreenProps) {
  const queue = loadQueue();
  const [filter, setFilter] = useState('waiting');
  const counts = queueCounts(queue);
  const shown = queue.filter(i => filter === 'all' || i.status === filter);
  const next = queue.find(i => i.status === 'waiting');
  const count = (f: string) => f === 'all' ? queue.length : queue.filter(i => i.status === f).length;
  return <>
    <div className="page-head">
      <div><h1 className="page-title">Review Queue</h1><p className="page-lede">Lens Review submissions with AI feedback waiting for your check. Flagged ones come first.</p></div>
      {next && <button className="btn btn-primary" onClick={() => go('ta-review', { id: next.submission.id })}>Review next submission</button>}
    </div>
    <div className="queue-bar">
      <div className="segmented" role="group" aria-label="Filter submissions">{['all', 'waiting', 'sent', 'skipped'].map(f => <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : (statusLabels as any)[f]} {count(f)}</button>)}</div>
      {counts.flagged > 0 && <span className="muted-text">{counts.flagged} flagged for a closer look</span>}
    </div>
    <div className="table-wrap"><table className="ta-table2">
      <thead><tr><th scope="col">Student</th><th scope="col">Exercise</th><th scope="col">AI score</th><th scope="col">Why it is flagged</th><th scope="col">Submitted</th><th scope="col"><span className="sr-only">Action</span></th></tr></thead>
      <tbody>{shown.map(i => {
        const total = i.submission.result.total;
        return <tr key={i.submission.id} className="row-hover">
          <td><strong>{i.submission.student}</strong>{i === next && <span className="next-up">Next up</span>}</td>
          <td>{i.exercise?.title}</td>
          <td><ResultChip value={total / 10}>{scoreText(total)}</ResultChip></td>
          <td>{i.status === 'waiting' ? <Flags flags={i.flags}/> : <span className={'chip ' + (i.status === 'sent' ? 'good' : '')}>{(statusLabels as any)[i.status]}</span>}</td>
          <td className="nowrap">{when(i.submission.date)}</td>
          <td className="right"><button className="text-link strong" onClick={() => go('ta-review', { id: i.submission.id })}>{i.status === 'waiting' ? 'Review' : 'Open'}</button></td>
        </tr>;
      })}</tbody>
    </table>{!shown.length && <p className="muted-text table-empty">Nothing here. Try another filter.</p>}</div>
    <p className="cl-demo-note">Sample submissions with simulated AI scores. Your actions are saved in this browser.</p>
  </>;
}

/* One submission: the student's work on the left; the AI draft and the TA's own review on the right.
   The TA doesn't edit the AI feedback: they add their own feedback and, optionally, their own score. */
export function TaReview({ params, go }: ScreenProps) {
  const queue = loadQueue();
  const item = queue.find(i => i.submission.id === params.id);
  const [ta, setTa] = useState(readTa);
  const [comment, setComment] = useState('');
  const [score, setScore] = useState('');
  const [error, setError] = useState('');
  if (!item) return <section className="sheet center-sheet"><p>This submission is no longer in the queue.</p><button className="btn btn-outline" onClick={() => go('review-queue')}>Back to Review Queue</button></section>;
  const { submission: s, exercise } = item;
  const comments = s.comments.map(normalizeComment);
  const original = aiSummary(exercise, s.comments, s.noIssues);
  const waiting = queue.filter(i => i.status === 'waiting');
  const position = waiting.findIndex(i => i.submission.id === s.id);
  const nextWaiting = waiting.find(i => i.submission.id !== s.id);
  const save = (state: any) => { writeTa(state); setTa(state); };
  const vote = ta.ratings[s.id]?.vote;
  const rate = (v: 'up' | 'down') => save({ ...ta, ratings: { ...ta.ratings, [s.id]: { vote: vote === v ? null : v, comment: '', updatedAt: new Date().toISOString() } } });
  function act(action: 'send' | 'skip') {
    const value = score.trim() === '' ? null : Number(score);
    if (action === 'send' && value != null && !(value >= 0 && value <= 10)) { setError('Your score must be between 0 and 10, or empty.'); return; }
    const review = makeReview({ attemptId: s.id, action, summary: null, originalSummary: original, score: value, originalScore: s.result.total, comment });
    save({ ...ta, reviews: [...ta.reviews, review] });
    go(nextWaiting ? 'ta-review' : 'review-queue', nextWaiting ? { id: nextWaiting.submission.id } : {});
  }
  const name = first(s.student);
  return <>
    <header className="cl-slimbar">
      <button className="icon-btn boxed" aria-label="Back to Review Queue" onClick={() => go('review-queue')}><ArrowLeft size={18} strokeWidth={1.8}/></button>
      <div className="cl-slimbar-title"><h1>{s.student}, {exercise.title}</h1><span>Lens Review, submitted {when(s.date)}</span></div>
      {position >= 0 ? <span className="chip">{position + 1} of {waiting.length} waiting</span> : <span className={'chip ' + (item.status === 'sent' ? 'good' : '')}>{(statusLabels as any)[item.status]}</span>}
      <ThemeButton/>
      {item.status === 'waiting' && <button className="btn btn-outline btn-sm" onClick={() => act('skip')}>Skip for now</button>}
    </header>
    <WorkArea>
      <section className="sheet work-main" aria-label="Submission">
        {item.flags.length > 0 && <div className="why-flagged"><h2 className="panel-title">Why this is flagged</h2><Flags flags={item.flags}/></div>}
        <div className="code-card">
          <div className="code-card-head"><span className="mono">{exercise.file}</span><span className="code-card-note">Lines the student annotated are framed</span></div>
          <div className="code-lines">{framedCode(exercise.code, comments)}</div>
        </div>
        <section aria-labelledby="student-title" className="feedback-block">
          <h2 id="student-title" className="panel-title">{name}’s {s.noIssues ? 'conclusion' : comments.length === 1 ? 'annotation' : 'annotations'}</h2>
          {s.noIssues ? <article className="saved-note"><div className="note-head"><span className="lens-tag">No issues found</span></div><p>{s.justification}</p></article>
            : comments.length ? comments.map((c: any) => <article className="saved-note" key={c.id}>
              <div className="note-head"><span className="lines">{linesLabel(c.start, c.end)}</span>{c.lenses.map((l: string) => <span className="lens-tag" key={l}>{l}</span>)}</div>
              <p>{c.text}</p><p className="fix-line"><strong>Proposed fix</strong><code>{c.fix}</code></p>
            </article>) : <p className="muted-text">No annotations.</p>}
        </section>
      </section>
      <aside className="sheet work-side" aria-label="Your review">
        <div className="work-side-body">
          <section aria-labelledby="ai-title" className="feedback-block">
            <div className="score-head"><div><div className="ai-title"><SparkIcon/><h2 id="ai-title" className="panel-title">AI feedback draft</h2></div><span className="muted-text">{s.result.source === 'ai' ? 'Written by live AI and shown to the student' : 'Based on the answer key and the rubric'}</span></div><div className="big-score"><strong>{+s.result.total.toFixed(1)}</strong><span>/ 10</span></div></div>
            <p>{original}</p>
            {s.result.source === 'ai' && <><p>{s.result.summary}</p>{s.result.improvements?.length > 0 && <div className="ai-steps"><h3 className="small-title">To strengthen the review</h3><ol>{s.result.improvements.map((text: string, i: number) => <li key={i}>{text}</li>)}</ol></div>}</>}
            <span className={'chip ' + (confidenceOf(exercise, s.comments) === 'low' ? 'warn' : '')}>AI confidence: {confidenceOf(exercise, s.comments)}</span>
          </section>
          <section aria-labelledby="key-title" className="feedback-block">
            <h3 id="key-title" className="small-title">Answer key</h3>
            {exercise.findings.length ? exercise.findings.map((f: any, i: number) => <p key={i} className="key-row"><span className="lines">{linesLabel(f.start, f.end)}</span><span className="lens-tag">{f.dimension}</span><span>{f.claim}</span></p>) : <p>This code has no planted issues.</p>}
          </section>
          {item.reviews.length > 0 && <section className="feedback-block"><h3 className="small-title">Earlier</h3>{item.reviews.map((r: any) => <p key={r.id} className="muted-text">{r.sentAt ? `Sent ${when(r.sentAt)}` : `Skipped ${when(r.createdAt)}`}{r.adjustedScore != null ? `, your score ${r.adjustedScore} / 10` : r.setsScore && ', AI score restored'}{r.comment && `: “${r.comment}”`}</p>)}</section>}
          <section aria-labelledby="yours-title" className="feedback-block ta-yours">
            <h2 id="yours-title" className="panel-title">Your review</h2>
            <fieldset className="helpful"><legend>Was the AI feedback right?</legend>
              <button type="button" className="chip-toggle" aria-pressed={vote === 'up'} onClick={() => rate('up')}><ThumbsUp size={14} strokeWidth={2}/>Yes</button>
              <button type="button" className="chip-toggle" aria-pressed={vote === 'down'} onClick={() => rate('down')}><ThumbsDown size={14} strokeWidth={2}/>No</button>
            </fieldset>
            <label className="field">Your feedback to {name}<small>{name} sees it above the AI feedback.</small>
              <textarea rows={5} value={comment} placeholder={`What did ${name} get right, and what should they do next?`} onChange={e => setComment(e.target.value)}/>
            </label>
            <label className="field">Your score<small>Optional. Shown next to the AI score.</small>
              <span className="score-input"><input type="number" min={0} max={10} step={0.5} value={score} placeholder="–" onChange={e => { setScore(e.target.value); setError(''); }}/><span>/ 10</span></span>
            </label>
            {error && <p className="error-text" role="alert">{error}</p>}
            <DemoFill goodLabel="Fill example feedback" onGood={() => setComment(exampleFeedback(s, exercise, name))}/>
          </section>
        </div>
        <PanelFooter note={`${name} gets the AI feedback and yours.`}>
          <button className="btn btn-primary" onClick={() => act('send')}>{item.status === 'sent' ? 'Send again' : 'Approve and send'}</button>
        </PanelFooter>
      </aside>
    </WorkArea>
  </>;
}

// The code with each annotated range framed by viewfinder corners.
function framedCode(code: string[], comments: any[]) {
  const rows = code.map((line, i) => <div key={i} className="code-row"><span className="ln">{i + 1}</span><code>{highlight(line) || ' '}</code></div>);
  const ranges = comments.map(c => [c.start, c.end]).sort((a, b) => a[0] - b[0]).filter((r, i, all) => i === 0 || r[0] > all[i - 1][1]);
  const out: any[] = []; let at = 1;
  for (const [a, b] of ranges) {
    out.push(...rows.slice(at - 1, a - 1));
    out.push(<div key={'f' + a} className="lr-sel"><span aria-hidden="true" className="sel-c tl"/><span aria-hidden="true" className="sel-c tr"/><span aria-hidden="true" className="sel-c bl"/><span aria-hidden="true" className="sel-c br"/>{rows.slice(a - 1, b)}</div>);
    at = b + 1;
  }
  out.push(...rows.slice(at - 1));
  return out;
}

// Demo shortcut only (?demo): feedback a TA might write, so a presenter doesn't have to type.
function exampleFeedback(s: any, exercise: any, name: string) {
  if ((exampleTaFeedback as any)[s.id]) return (exampleTaFeedback as any)[s.id];
  const missed = exercise.findings.find((f: any) => !findingFound(f, s.comments));
  if (!exercise.findings.length) return s.noIssues ? `Right call, ${name}: the code meets every requirement. Next time, list the inputs you tried.` : `This code has no issues, ${name}. Before annotating, try your idea in the terminal to check it.`;
  if (missed) return `Good start, ${name}. You missed one: ${missed.claim} Check each requirement against a line of code before you submit.`;
  return `Well done, ${name}: you found every issue. Next time, add an example input that shows each bug.`;
}
