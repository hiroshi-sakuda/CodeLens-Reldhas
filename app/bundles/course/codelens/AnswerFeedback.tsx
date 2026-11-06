import { ThumbsDown, ThumbsUp } from 'lucide-react';
export type AnswerRating = { vote: 'up' | 'down' | null; comment: string; updatedAt: string };
// "Was this feedback helpful?" Two pill buttons; a short note opens once you vote.
export default function AnswerFeedback({ target, value, onChange }: {
  target: string;
  value?: AnswerRating;
  onChange: (rating: AnswerRating) => void;
}) {
  function vote(next: 'up' | 'down') {
    onChange({ vote: value?.vote === next ? null : next, comment: value?.comment || '', updatedAt: new Date().toISOString() });
  }
  return <fieldset className="helpful">
    <legend>Was this {target === 'AI feedback' ? 'feedback' : target} helpful?</legend>
    <button type="button" className="chip-toggle" aria-pressed={value?.vote === 'up'} onClick={() => vote('up')}><ThumbsUp size={14} strokeWidth={2}/>Yes</button>
    <button type="button" className="chip-toggle" aria-pressed={value?.vote === 'down'} onClick={() => vote('down')}><ThumbsDown size={14} strokeWidth={2}/>No</button>
    {value?.vote && <span className="helpful-saved" role="status">Thanks, saved</span>}
    {value?.vote && <label className="field helpful-note">{value.vote === 'down' ? 'What should improve?' : 'What helped?'} <small>Optional</small>
      <textarea value={value.comment} maxLength={2000} aria-label={'Comment on ' + target} placeholder="Add a short note" onChange={e => onChange({ ...value, comment: e.target.value, updatedAt: new Date().toISOString() })}/>
    </label>}
  </fieldset>;
}
