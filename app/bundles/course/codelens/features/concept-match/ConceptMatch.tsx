import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from 'lucide-react';
import AnswerFeedback from '../../AnswerFeedback';
import DifficultySetup, { type Difficulty } from '../../DifficultySetup';
import type { ScreenProps } from '../../features';
import { eligibleItems, label, pickItems, readCourse, topicName } from '../../course.js';
import { createAttempt, getAttempt, lastDifficulty, listAttempts, updateAttempt } from '../../practice-log.js';
import { questionFeedback, setFeedback } from './feedback.js';
import { questions as library } from './questions.js';
import './concept-match.css';
const levels = { easy: 'Clear story; wrong options are clearly unsuitable.', medium: 'Two plausible options to choose between.', hard: 'Several plausible options that differ in one requirement.' };
const reasonLabel = { good: 'Good reason', partly: 'Could say more', missing: 'No reason given' };
const summaryStep = -1;
const setSize = 5;
export default function ConceptMatchScreen({ params, go }: ScreenProps) {
  const [attemptId, setAttemptId] = useState<string | null>(params.attemptId || null);
  const [again, setAgain] = useState<Difficulty | undefined>();
  const [error, setError] = useState('');
  function start(difficulty: Difficulty) {
    const done = listAttempts('concept-match').flatMap((a: any) => a.exerciseIds);
    const picked = pickItems(eligibleItems(library, difficulty, readCourse().publishedTopics), setSize, done);
    if (!picked.length) { setError('Your TA is preparing this: no topics are published yet.'); return; }
    setAttemptId(createAttempt({ function: 'concept-match', title: `Set of ${picked.length} questions`, difficulty, topicId: null, exerciseIds: picked.map((q: any) => q.id), answers: { choices: {}, reasons: {}, checked: [] }, fromSuggestion: !!params.fromSuggestion }).id);
  }
  if (error) return <section className="review-setup difficulty-setup"><h1>Concept Match</h1><p>{error}</p><button className="secondary" onClick={()=>go('home')}>Back to practice</button></section>;
  if (!attemptId) return <DifficultySetup title="Concept Match" what="a set of questions" minutes="2–3 min per question" levels={levels} autoStart={again || (params.fromSuggestion ? lastDifficulty('concept-match') : undefined)} onStart={start} onBack={()=>go('home')}/>;
  return <QuestionSet key={attemptId} attemptId={attemptId} onHome={()=>go('home')} onNewSet={()=>{setAgain(getAttempt(attemptId).difficulty);setAttemptId(null);}}/>;
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
  const steps = <div className="review-focus-summary set-progress"><span>Criteria</span><strong>Appropriateness</strong>
    <span className="set-dots" aria-label="Questions in this set">{current===summaryStep?'Results':`Question ${current+1} of ${questions.length}`}
      {questions.map((q,i)=>{const done=checked.includes(q.id);const right=done&&choices[q.id]===q.correct;return <button key={q.id} disabled={!done&&i!==current} className={(done?(right?'right':'wrong'):'')+(i===current?' at':'')} aria-label={`Question ${i+1}${done?(right?', correct':', not quite'):''}`} aria-current={i===current?'step':undefined} onClick={()=>setCurrent(i)}/>;})}
      {attempt.status==='submitted'&&current!==summaryStep&&<button className="results-link" onClick={()=>setCurrent(summaryStep)}>Results</button>}
    </span></div>;
  const toolbar = <div className="workspace-toolbar"><div className="exercise-select"><strong>{current===summaryStep?'Your results':topicName(questions[current].topicId)}</strong></div><div className="exercise-meta"><span>Concept Match</span><span className="difficulty-tag">{label(attempt.difficulty)}</span></div></div>;
  if (current === summaryStep) {
    const correct = questions.filter(q => choices[q.id] === q.correct).length;
    const message = correct === questions.length ? 'A perfect set. Try a harder level, or a Lens Review to use these concepts on real code.' : correct >= 3 ? 'Good work. Open the ones you missed to see why the other option fits better.' : 'Open each question to see why the right concept fits; the explanations are the fastest way to improve.';
    return <>{toolbar}{steps}
      <section className="set-summary"><div className="compact-score"><strong>{correct}</strong><span>/ {questions.length} correct</span></div><p>{message}</p>
        <ol>{questions.map((q,i)=>{const fb=questionFeedback(q,choices[q.id]??null,reasons[q.id]??'');return <li key={q.id}><button onClick={()=>setCurrent(i)}><span className={'result-dot '+(fb.correct?'right':'wrong')}>{fb.correct?<Check size={14}/>:<X size={14}/>}</span><span className="set-summary-text"><span>{q.story}</span><small>{q.concept} · {reasonLabel[fb.reasonRating as keyof typeof reasonLabel]}</small></span><ArrowRight size={15}/></button></li>;})}</ol>
      </section>
      <div className="submission-bar"><div className="completed-actions"><button className="secondary" onClick={onHome}><ArrowLeft size={16}/>Back to practice</button><button className="primary" onClick={onNewSet}>New set<ArrowRight size={17}/></button></div></div>
    </>;
  }
  const q = questions[current];
  const locked = checked.includes(q.id);
  const choice = choices[q.id] ?? null;
  const reason = reasons[q.id] ?? '';
  const fb = locked ? questionFeedback(q, choice, reason) : null;
  const right = q.options.find((o: any) => o.id === q.correct);
  const chosen = q.options.find((o: any) => o.id === choice);
  const others = q.options.filter((o: any) => o.id !== q.correct && o.id !== choice);
  return <>{toolbar}{steps}
    <div className="workspace concept-workspace">
      <section className="editor-panel concept-question" aria-label={`Question ${current+1}`}>
        <p className="concept-story">{q.story}</p>
        <fieldset><legend>Choose one concept</legend>
          {q.options.map((o: any)=><label key={o.id} className={'concept-option '+(!locked?(choice===o.id?'chosen':''):o.id===q.correct?'right':o.id===choice?'wrong':'faded')}>
            <input type="radio" className="sr-only" name={q.id} checked={choice===o.id} disabled={locked} onChange={()=>saveAnswers({choices:{...choices,[q.id]:o.id}})}/>
            <span className="option-id">{locked&&o.id===q.correct?<Check size={14}/>:locked&&o.id===choice?<X size={14}/>:o.id}</span><span>{o.text}</span>
          </label>)}
        </fieldset>
        <label className="concept-reason">Why? <span className="muted">(one line)</span><input value={reason} maxLength={200} readOnly={locked} placeholder="What in the story makes this concept fit?" onChange={e=>saveAnswers({reasons:{...reasons,[q.id]:e.target.value}})}/></label>
      </section>
      <aside className="review-panel">
        {fb?<div className="feedback-content" aria-live="polite">
          <div className="feedback-score-row"><div className="ai-heading"><h2><Sparkles size={18} aria-hidden="true"/>AI feedback</h2><span className="simulated-label">Simulated</span></div><span className={'result-mark '+(fb.correct?'good':'bad')}>{fb.correct?<Check size={15}/>:<X size={15}/>}{fb.correct?'Correct':'Not quite'}</span></div>
          <section className="answer-section first"><h3>Why {q.correct} fits</h3><p className="clean-answer">{right.why}</p></section>
          {chosen&&!fb.correct&&<section className="answer-section"><h3>Why not {chosen.id}?</h3><p className="clean-answer">{chosen.why}</p></section>}
          {others.length>0&&<details className="scoring-details"><summary>Why not the other options?</summary>{others.map((o: any)=><p key={o.id}><strong>{o.id}.</strong> {o.why}</p>)}</details>}
          <div className="answer-fix reason-comment"><strong>Your reason · {reasonLabel[fb.reasonRating as keyof typeof reasonLabel]}</strong><p>{fb.comment}</p></div>
          <p className="related-concept"><span>Related concept</span> {q.concept}</p>
          <AnswerFeedback target="this explanation" value={attempt.ratings[q.id]} onChange={rating=>rate(q.id,rating)}/>
        </div>:<div className="brief-content"><h3>How this works</h3><ol className="review-steps"><li>Read the story.</li><li>Pick the concept that fits it best.</li><li>Say why in one line.</li></ol><p className="muted concept-note">Several options may work. Look for the one that fits what the story asks for. Your answer locks when you check it.</p></div>}
      </aside>
    </div>
    <div className="submission-bar">{locked?<div className="completed-actions"><button className="secondary" onClick={onHome}><ArrowLeft size={16}/>Back to practice</button><button className="primary" onClick={next}>{checked.length===questions.length?'See your results':'Next question'}<ArrowRight size={17}/></button></div>:<><button className="secondary" onClick={onHome}><ArrowLeft size={16}/>Save and leave</button><button className="primary" disabled={!choice} onClick={()=>check(q.id)}>Check answer<ArrowRight size={17}/></button></>}</div>
  </>;
}
