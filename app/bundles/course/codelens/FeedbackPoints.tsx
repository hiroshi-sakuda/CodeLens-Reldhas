import { CircleCheck, CircleArrowUp } from 'lucide-react';
import './feedback-points.css';
// What the student did well and what to improve, shown first in every exercise's feedback.
export default function FeedbackPoints({ good, improve }: { good: string[]; improve: string[] }) {
  return <div className="feedback-points">
    <section className="points good"><h3><CircleCheck size={15} aria-hidden="true"/>What you did well</h3>{good.length?<ul>{good.map(p=><li key={p}>{p}</li>)}</ul>:<p>Not yet. The points below show where to start.</p>}</section>
    <section className="points improve"><h3><CircleArrowUp size={15} aria-hidden="true"/>What to improve</h3>{improve.length?<ul>{improve.map(p=><li key={p}>{p}</li>)}</ul>:<p>Nothing here. Well done.</p>}</section>
  </div>;
}
