import { useEffect } from 'react';
import { help, Brief } from '../../App';
import { SlimBar } from '../../bars';
import type { Feature, Note, ScreenProps } from '../../features';
import LensResult, { ResultCode, scoreText, TaNote } from '../../LensResult';
import { dimensions, exercises } from '../../model.js';
import { nextPractice } from '../../review-flow.js';
import { readTa, writeTa } from '../../practice-log.js';
import { PanelFooter, ResultChip, WorkArea } from '../../ui';
import { taFeedbackFor } from '../review-queue/queue.js';
import { allReviews, allSubmissions, demoStudent } from '../review-queue/submissions.js';
const mine = () => allSubmissions().filter(s => s.student === demoStudent);
const titleOf = (exercise: string) => exercises.find(e => e.id === exercise)?.title;
const stampOf = (id: string, sent: number) => id + ':' + sent;
function markSeen(stamp: string) { const ta = readTa(); if (!ta.seen.includes(stamp)) writeTa({ ...ta, seen: [...ta.seen, stamp] }); }

// One bell notification per review with TA feedback the student hasn't opened yet. It opens the review at the comment.
function notifications(): Note[] {
  const reviews = allReviews();
  return mine().flatMap(s => {
    const sent = taFeedbackFor(reviews.filter((r: any) => r.attemptId === s.id)).sent.length;
    if (!sent) return [];
    const stamp = stampOf(s.id, sent);
    return [{ id: stamp, title: 'Your TA commented', text: `on your Lens Review of ${titleOf(s.exercise)}`, unread: !readTa().seen.includes(stamp), to: 'ta-feedback', params: { attemptId: s.id, comment: true }, markRead: () => markSeen(stamp) }];
  });
}

// A submitted Lens Review, read-only: the code with what was found and missed, the TA's comment and the AI feedback.
function ReviewResult({ params, go }: ScreenProps) {
  const submission = mine().find(s => s.id === params.attemptId);
  const feedback = taFeedbackFor(allReviews().filter((r: any) => r.attemptId === params.attemptId));
  const reviewed = feedback.sent.length > 0;
  useEffect(() => {
    if (reviewed) markSeen(stampOf(params.attemptId, feedback.sent.length));
    if (params.comment) { const note = document.getElementById('ta-comment'); note?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); note?.focus({ preventScroll: true }); }
  }, []);
  if (!submission) return <><SlimBar title="Lens Review" onExit={() => go('home')} leave={null}/><section className="sheet center-sheet"><p>This review is no longer available.</p><button className="btn btn-outline" onClick={() => go('home')}>Back to Practice</button></section></>;
  const exercise = exercises.find(e => e.id === submission.exercise)!;
  const draft = Object.values(readDrafts()).find((d: any) => d.attemptId === submission.id) as any;
  const focus = draft?.randomFocus ? dimensions : draft?.focus || [...new Set(exercise.findings.map((f: any) => f.dimension))];
  const shown = feedback.adjustedScore ?? submission.result.total;
  const next = () => { try { go('lens-review', { start: nextPractice(exercise.id, focus, draft ? !!draft.randomFocus : true) }); } catch { go('lens-review', { setup: true }); } };
  return <>
    <SlimBar title={exercise.title} meta={`Lens Review, ${exercise.topic.replace(' & ', ' and ').toLowerCase()}, ${reviewed ? 'reviewed by your TA' : 'submitted'}`} onExit={() => go('home')} help={help} leave={null}
      aside={<ResultChip value={shown / 10}>{scoreText(shown)}</ResultChip>}/>
    <WorkArea>
      <section className="sheet work-main" aria-label="Exercise and code"><Brief exercise={exercise}/><ResultCode exercise={exercise} comments={submission.comments}/></section>
      <aside className="sheet work-side" aria-label="Your review">
        <div className="work-side-body">
          <LensResult exercise={exercise} comments={submission.comments} result={submission.result} noIssues={submission.noIssues} justification={submission.justification} focus={focus}
            taScore={feedback.adjustedScore} ta={reviewed ? <TaNote comments={feedback.comments} highlight={!!params.comment}/> : undefined}/>
        </div>
        <PanelFooter><button className="btn btn-outline" onClick={() => go('home')}>Back to Practice</button><button className="btn btn-primary" onClick={next}>Next Lens Review</button></PanelFooter>
      </aside>
    </WorkArea>
  </>;
}
function readDrafts(): Record<string, any> { try { return JSON.parse(localStorage.getItem('codelens-demo-v1') || '{}').drafts || {}; } catch { return {}; } }
const feature: Feature = { id: 'ta-feedback', role: 'student', kind: 'hidden', bare: true, order: 30, label: 'Lens Review result', Screen: ReviewResult, notifications };
export default feature;
