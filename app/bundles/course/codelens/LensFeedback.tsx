import FeedbackPoints from './FeedbackPoints';
import { commentFeedback, overallFeedback } from './lens-feedback.js';
const resultNames: Record<string, string> = { found: 'Issue found', 'wrong-lens': 'Wrong focus area', unclear: 'Issue not named', 'not-an-issue': 'Not an issue' };
// Per-comment feedback under the Lens Review score.
export default function LensFeedback({ exercise, comments, noIssues, justification, found }: { exercise: any; comments: any[]; noIssues: boolean; justification: string; found: number }) {
  const overall = overallFeedback(exercise, found, { noIssues, justification });
  return <section className="lens-feedback" aria-label="Feedback on your review">
    <FeedbackPoints good={overall.good} improve={overall.improve}/>
    {comments.map((c, i) => { const f = commentFeedback(exercise, c); return <article className="lens-comment-feedback" key={c.id}>
      <h4><span className="annotation-index">{i + 1}</span>{f.label}<span className={'comment-result ' + f.result}>{resultNames[f.result]}</span></h4>
      <FeedbackPoints good={f.good} improve={f.improve}/>
    </article>; })}
  </section>;
}
