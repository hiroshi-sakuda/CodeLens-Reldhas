import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { Feature, ScreenProps } from '../../features';
import { exercises } from '../../model.js';
import { readTa, writeTa } from '../../practice-log.js';
import { aiSummary, taFeedbackFor } from '../review-queue/queue.js';
import { allReviews, allSubmissions, demoStudent } from '../review-queue/submissions.js';
const mine = () => allSubmissions().filter(s => s.student === demoStudent);
const titleOf = (exercise: string) => exercises.find(e => e.id === exercise)?.title;
function Notices({ go }: ScreenProps) {
  const seen = readTa().seen as string[];
  const reviews = allReviews();
  const fresh = mine().filter(s => {
    const sent = taFeedbackFor(reviews.filter((r: any) => r.attemptId === s.id)).sent.length;
    return sent > 0 && !seen.includes(s.id + ':' + sent);
  });
  return <>{fresh.map(s=><section className="ta-notice" key={s.id}><p><strong>New TA feedback</strong> on your Lens Review of {titleOf(s.exercise)}.</p><button className="primary" onClick={()=>go('ta-feedback',{attemptId:s.id})}>View feedback<ArrowRight size={16}/></button></section>)}</>;
}
function TaFeedback({ params, go }: ScreenProps) {
  const submission = mine().find(s => s.id === params.attemptId);
  const feedback = taFeedbackFor(allReviews().filter((r: any) => r.attemptId === params.attemptId));
  useEffect(() => {
    const ta = readTa();
    const stamp = params.attemptId + ':' + feedback.sent.length;
    if (feedback.sent.length && !ta.seen.includes(stamp)) writeTa({ ...ta, seen: [...ta.seen, stamp] });
  }, []);
  if (!submission) return <section className="ta-page"><p>This review is no longer available.</p><button className="secondary" onClick={()=>go('home')}>Back to practice</button></section>;
  const exercise = exercises.find(e => e.id === submission.exercise)!;
  const score = feedback.adjustedScore ?? submission.result.total;
  return <div className="ta-page ta-feedback-page">
    <button className="progress-back" onClick={()=>go('home')}><ArrowLeft size={17}/>Back to practice</button>
    <h1>{exercise.title}</h1>
    <p className="ta-intro"><span className="queue-status sent"><Check size={10}/> Reviewed by your TA</span> AI feedback reviewed and approved by your TA</p>
    <section className="progress-card"><div className="feedback-score-row"><h2>Your score</h2><div className="compact-score"><strong>{score.toFixed(1)}</strong><span>/ 10</span></div></div>
      <p className="feedback-summary">{feedback.editedSummary || aiSummary(exercise, submission.result, submission.noIssues)}</p></section>
    <section className="progress-card"><h2>Your TA's comments</h2>{feedback.comments.length?feedback.comments.map((c: string,i: number)=><div className="answer-fix ta-comment" key={i}><strong>Your TA</strong><p>{c}</p></div>):<p className="muted">Your TA approved the feedback without a comment.</p>}</section>
    <section className="progress-card"><h2>Your comments</h2>{submission.noIssues?<div className="history-comment"><strong>No issues found</strong><p>{submission.justification}</p></div>:submission.comments.map((c: any)=><div className="history-comment" key={c.id}><strong>{c.dimension} · L{c.start}–{c.end}</strong><p>{c.claim}</p><p>{c.reasoning}</p><code>{c.fix}</code></div>)}</section>
  </div>;
}
const feature: Feature = { id: 'ta-feedback', role: 'student', kind: 'hidden', order: 30, label: 'TA feedback', Screen: TaFeedback, HomePanel: Notices };
export default feature;
