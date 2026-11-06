import { Sparkles } from 'lucide-react';
import { commentFeedback } from './lens-feedback.js';
import './lens-feedback.css';
const resultNames: Record<string, string> = { found: 'Issue found', 'wrong-lens': 'Wrong focus area', unclear: 'Issue not named', 'not-an-issue': 'Not an issue' };
// One AI feedback box for each of the student's comments, under the Lens Review score.
export default function LensFeedback({ exercise, comments }: { exercise: any; comments: any[] }) {
  if (!comments.length) return null;
  return <section className="lens-feedback" aria-label="Feedback on your comments">
    {comments.map((c, i) => { const f = commentFeedback(exercise, c); return <article className="lens-comment-feedback" key={c.id}>
      <h4><span className="annotation-index">{i + 1}</span>{f.label}<span className={'comment-result ' + f.result}>{resultNames[f.result]}</span></h4>
      <p className="comment-claim">“{c.claim}”</p>
      <div className="comment-ai"><strong><Sparkles size={13} aria-hidden="true"/>AI feedback</strong><ul>{f.points.map(p => <li key={p}>{p}</li>)}</ul></div>
    </article>; })}
  </section>;
}
