import { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import AnswerFeedback from '../../AnswerFeedback';
import { SlimBar } from '../../bars';
import GeneratingScreen, { type Difficulty } from '../../GeneratingScreen';
import type { ScreenProps } from '../../features';
import { approvedItems, eligibleForTopic, pickItems, readCourse, topicName } from '../../course.js';
import { Brackets, CheckIcon, SparkIcon } from '../../icons';
import { createAttempt, getAttempt, listAttempts, updateAttempt } from '../../practice-log.js';
import DemoFill from '../../DemoFill';
import { ScoreBar } from '../../ui';
import { demoAnswer, questionFeedback, setFeedback } from './feedback.js';
import { questions as library } from './questions.js';
import './concept-match.css';
export const help = { title: 'How Concept Match works', steps: ['Read the story. Each set has 5.', 'Pick the concept that fits it best and say why in one line.', 'Check your answer. It locks and the feedback explains every option.', 'Finish the set to see your results.'] };
const reasonLabel = { good: 'Good reason', partly: 'Could say more', missing: 'No reason given' };
const summaryStep = -1;
const setSize = 5;
export default function ConceptMatchScreen({ params, go }: ScreenProps) {
  const [attemptId, setAttemptId] = useState<string | null>(params.attemptId || null);
  const [again, setAgain] = useState<Difficulty | undefined>();
  const [error, setError] = useState('');
  function start(difficulty: Difficulty) {
    const done = listAttempts('concept-match').flatMap((a: any) => a.exerciseIds);
    const picked = pickItems(eligibleForTopic(approvedItems('concept-match', library), difficulty, readCourse().publishedTopics, params.topicId), setSize, done);
    if (!picked.length) { setError('Your TA is preparing this: nothing is approved and published at this difficulty yet.'); return; }
    setAttemptId(createAttempt({ function: 'concept-match', title: `Set of ${picked.length} questions`, difficulty, topicId: new Set(picked.map((q: any) => q.topicId)).size === 1 ? picked[0].topicId : null, exerciseIds: picked.map((q: any) => q.id), answers: { choices: {}, reasons: {}, checked: [] }, fromSuggestion: !!params.fromSuggestion }).id);
  }
  if (error) return <><SlimBar title="Concept Match" onExit={() => go('home')} leave={null}/><section className="sheet center-sheet"><p>{error}</p><button className="btn btn-outline" onClick={() => go('home')}>Back to Practice</button></section></>;
  if (!attemptId) { const difficulty: Difficulty = again || params.difficulty || 'easy'; return <GeneratingScreen title="Concept Match" what="a set of questions" difficulty={difficulty} help={help} onDone={() => start(difficulty)} onBack={() => go('home')}/>; }
  return <QuestionSet key={attemptId} attemptId={attemptId} onHome={() => go('home')} onNewSet={() => { setAgain(getAttempt(attemptId).difficulty); setAttemptId(null); }}/>;
}
function QuestionSet({ attemptId, onHome, onNewSet }: { attemptId: string; onHome: () => void; onNewSet: () => void }) {
  const [attempt, setAttempt] = useState<any>(() => getAttempt(attemptId));
  const questions: any[] = attempt.exerciseIds.map((id: string) => library.find(q => q.id === id)).filter(Boolean);
  const { choices, reasons, checked } = attempt.answers;
  const [current, setCurrent] = useState(() => { const open = questions.findIndex(q => !checked.includes(q.id)); return open === -1 ? summaryStep : open; });
  const saveAnswers = (patch: object) => setAttempt(updateAttempt(attemptId, { answers: { ...attempt.answers, ...patch } }));
  function check(id: string) {
    const answers = { ...attempt.answers, checked: [...checked, id] };
    if (answers.checked.length < questions.length) { setAttempt(updateAttempt(attemptId, { answers })); return; }
    const feedback = setFeedback(questions, choices, reasons);
    setAttempt(updateAttempt(attemptId, { answers, feedback, status: 'submitted', submittedAt: new Date().toISOString(), score: feedback.correctCount / questions.length }));
  }
  function next() {
    const after = questions.findIndex((q, i) => i > current && !checked.includes(q.id));
    const open = questions.findIndex(q => !checked.includes(q.id));
    setCurrent(after !== -1 ? after : open !== -1 ? open : summaryStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const rate = (id: string, rating: any) => setAttempt(updateAttempt(attemptId, { ratings: { ...attempt.ratings, [id]: rating } }));
  const meta = `Concept Match, ${attempt.difficulty}`;
  const progress = <div className="set-progress2">
    <div className="segments" role="group" aria-label="Questions in this set">{questions.map((q, i) => {
      const done = checked.includes(q.id); const right = done && choices[q.id] === q.correct;
      return <button key={q.id} disabled={!done && i !== current} className={(i === current ? 'at' : done ? (right ? 'right' : 'wrong') : '')} aria-label={`Question ${i + 1}${done ? (right ? ', correct' : ', not quite') : ''}`} aria-current={i === current ? 'step' : undefined} onClick={() => setCurrent(i)}/>;
    })}</div>
    <span>{current === summaryStep ? 'Results' : `Question ${current + 1} of ${questions.length}`}</span>
  </div>;

  if (current === summaryStep) {
    const correct = questions.filter(q => choices[q.id] === q.correct).length;
    const message = correct === questions.length ? 'A perfect set. Try a harder level, or a Lens Review to use these concepts on real code.' : correct >= 3 ? 'Good work. Open the ones you missed to see why the other option fits better.' : 'Open each question to see why the right concept fits; the explanations are the fastest way to improve.';
    return <>
      <SlimBar title="Your results" meta={meta} onExit={onHome} help={help} leave={null} aside={progress}/>
      <main className="sheet cm-sheet"><div className="cm-column">
        <div className="summary-head"><div className="big-score"><strong>{correct}</strong><span>/ {questions.length} correct</span></div><p>{message}</p></div>
        <ScoreBar value={correct / questions.length}/>
        <ol className="summary-list">{questions.map((q, i) => {
          const fb = questionFeedback(q, choices[q.id] ?? null, reasons[q.id] ?? '');
          return <li key={q.id}><button className="summary-row row-hover" onClick={() => setCurrent(i)}>
            <span className={'result-dot2 ' + (fb.correct ? 'good' : 'warn')} aria-hidden="true">{fb.correct ? <CheckIcon/> : <X size={14} strokeWidth={2.6}/>}</span>
            <span className="summary-text"><span>{q.story}</span><small>{q.concept} · {reasonLabel[fb.reasonRating as keyof typeof reasonLabel]}</small></span>
            <span className="sr-only">{fb.correct ? 'Correct' : 'Not quite'}. Open question {i + 1}</span>
            <ChevronRight size={18} strokeWidth={1.8} aria-hidden="true"/>
          </button></li>;
        })}</ol>
        <div className="cm-actions"><button className="btn btn-outline" onClick={onHome}>Back to Practice</button><button className="btn btn-primary" onClick={onNewSet}>Start a new set</button></div>
      </div></main>
    </>;
  }

  const q = questions[current];
  const locked = checked.includes(q.id);
  const choice = choices[q.id] ?? null;
  const reason = reasons[q.id] ?? '';
  function fill(kind: 'good' | 'wrong') { const answer = demoAnswer(q, kind); saveAnswers({ choices: { ...choices, [q.id]: answer.choice }, reasons: { ...reasons, [q.id]: answer.reason } }); }
  const fb = locked ? questionFeedback(q, choice, reason) : null;
  const right = q.options.find((o: any) => o.id === q.correct);
  const chosen = q.options.find((o: any) => o.id === choice);
  const others = q.options.filter((o: any) => o.id !== q.correct && o.id !== choice);
  return <>
    <SlimBar title={topicName(q.topicId).replace(' & ', ' and ')} meta={meta} onExit={onHome} help={help} aside={progress} leave={locked ? null : undefined}/>
    <main className="sheet cm-sheet"><div className="cm-column">
      <p className="cm-story">{q.story}</p>
      {!locked ? <>
        <fieldset className="option-list"><legend className="cm-legend">Which concept fits best?</legend>
          {q.options.map((o: any) => <label key={o.id} className="card hoverable vf option-card cm-option">
            <Brackets/>
            <span className="option-key" aria-hidden="true">{o.id}</span><span className="option-text">{o.text}</span>
            <input type="radio" name={q.id} checked={choice === o.id} onChange={() => saveAnswers({ choices: { ...choices, [q.id]: o.id } })}/>
          </label>)}
        </fieldset>
        <label className="field">Why does it fit? One line.
          <input value={reason} maxLength={200} required aria-required="true" placeholder="What in the story makes this concept fit?" onChange={e => saveAnswers({ reasons: { ...reasons, [q.id]: e.target.value } })}/>
        </label>
        <DemoFill onGood={() => fill('good')} onWrong={() => fill('wrong')}/>
        <div className="cm-actions spread"><span className="muted-text">Your answer locks when you check it.</span><button className="btn btn-primary" disabled={!choice || !reason.trim()} onClick={() => check(q.id)}>Check answer</button></div>
      </> : <>
        <section className="option-list" aria-label="Your answer, checked">
          {q.options.map((o: any) => {
            const isRight = o.id === q.correct, isChosen = o.id === choice;
            return <div key={o.id} className={'card vf option-card cm-option checked' + (isRight ? ' right' : isChosen ? ' wrong' : ' faded') + (isChosen ? ' on' : '')}>
              {isChosen && <Brackets/>}
              <span className="option-key" aria-hidden="true">{isRight ? <CheckIcon/> : isChosen ? <X size={14} strokeWidth={2.6}/> : o.id}</span>
              <span className="option-text">{o.text}</span>
              {isChosen ? <span className="option-flag">Your answer</span> : isRight ? <span className="option-flag">Right answer</span> : null}
            </div>;
          })}
        </section>
        <section aria-labelledby="ai-title" className="feedback-block cm-feedback" aria-live="polite">
          <div className="score-head"><div className="ai-title"><SparkIcon/><h2 id="ai-title" className="panel-title">AI feedback</h2></div><span className={'chip ' + (fb!.correct ? 'good' : 'warn')}>{fb!.correct ? <CheckIcon/> : <X size={14} strokeWidth={2.6}/>}{fb!.correct ? 'Correct' : 'Not quite'}</span></div>
          <div><h3 className="small-title">Why {q.correct} fits</h3><p>{right.why}</p></div>
          {chosen && !fb!.correct && <div><h3 className="small-title">Why not {chosen.id}?</h3><p>{chosen.why}</p></div>}
          <div className="note-box plain"><div className="note-head"><h3 className="small-title">Your reason</h3><span className={'chip ' + (fb!.reasonRating === 'good' ? 'good' : 'warn')}>{reasonLabel[fb!.reasonRating as keyof typeof reasonLabel]}</span></div><p>{fb!.comment}</p></div>
          {others.length > 0 && <details className="more-details"><summary>Why not the other options?</summary>{others.map((o: any) => <p key={o.id}><strong>{o.id}.</strong> {o.why}</p>)}</details>}
          <p className="muted-text">{q.concept}</p>
          <AnswerFeedback target="this explanation" value={attempt.ratings[q.id]} onChange={rating => rate(q.id, rating)}/>
        </section>
        <div className="cm-actions"><button className="btn btn-outline" onClick={onHome}>Back to Practice</button><button className="btn btn-primary" onClick={next}>{checked.length === questions.length ? 'See your results' : 'Next question'}</button></div>
      </>}
    </div></main>
  </>;
}
