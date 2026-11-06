import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Lock, Plus, Sparkles, X } from 'lucide-react';
import AnswerFeedback from '../../AnswerFeedback';
import CodeBlock from '../../CodeBlock';
import DifficultySetup, { type Difficulty } from '../../DifficultySetup';
import type { ScreenProps } from '../../features';
import { eligibleItems, label, pickItems, readCourse, topicName } from '../../course.js';
import { createAttempt, getAttempt, lastDifficulty, listAttempts, updateAttempt } from '../../practice-log.js';
import DemoFill from '../../DemoFill';
import FeedbackPoints from '../../FeedbackPoints';
import { displayOutput, dryRunFeedback, dryRunPoints, dryRunScore } from './feedback.js';
import { questions } from './questions.js';
import { runProgram } from './run-python.js';
import { TraceInput, TraceResult } from './TraceTable';
import './dry-run.css';
const levels = { easy: 'Short code, one loop or condition, few iterations.', medium: 'More branches or iterations, values that change less obviously.', hard: 'Nested loops or several functions, with traps like off-by-one.' };
export default function DryRunScreen({ params, go }: ScreenProps) {
  const [attemptId, setAttemptId] = useState<string | null>(params.attemptId || null);
  const [again, setAgain] = useState<Difficulty | undefined>();
  const [error, setError] = useState('');
  function start(difficulty: Difficulty) {
    const done = listAttempts('dry-run').flatMap((a: any) => a.exerciseIds);
    const [question] = pickItems(eligibleItems(questions, difficulty, readCourse().publishedTopics), 1, done);
    if (!question) { setError('Your TA is preparing this: no topics are published yet.'); return; }
    setAttemptId(createAttempt({ function: 'dry-run', title: question.title, difficulty, topicId: question.topicId, exerciseIds: [question.id], fromSuggestion: !!params.fromSuggestion }).id);
  }
  if (error) return <section className="review-setup difficulty-setup"><h1>Dry Run</h1><p>{error}</p><button className="secondary" onClick={()=>go('home')}>Back to practice</button></section>;
  if (!attemptId) return <DifficultySetup title="Dry Run" what="a problem" levels={levels} autoStart={again || (params.fromSuggestion ? lastDifficulty('dry-run') : undefined)} onStart={start} onBack={()=>go('home')}/>;
  return <Exercise key={attemptId} attemptId={attemptId} onHome={()=>go('home')} onNext={()=>{setAgain(getAttempt(attemptId).difficulty);setAttemptId(null);}}/>;
}
function Exercise({ attemptId, onHome, onNext }: { attemptId: string; onHome: () => void; onNext: () => void }) {
  const [attempt, setAttempt] = useState<any>(() => getAttempt(attemptId));
  const question = questions.find(q => q.id === attempt.exerciseIds[0])!;
  const [prediction, setPrediction] = useState<string>(attempt.answers.prediction || '');
  const [trace, setTrace] = useState<string[][]>(attempt.answers.trace || []);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const submitted = attempt.status === 'submitted';
  const columns: string[] | undefined = (question as any).traceColumns;
  useEffect(() => { if (!submitted) updateAttempt(attemptId, { answers: { prediction, trace } }); }, [prediction, trace]);
  async function submit() {
    setRunning(true); setError('');
    try {
      const traced = columns && trace.some(row => row.some(cell => cell.trim())) ? columns : undefined;
      const run = await runProgram(question.code, traced);
      const feedback = dryRunFeedback(question, prediction, displayOutput(run.output, run.error), traced ? { student: trace, expected: run.trace } : undefined);
      setAttempt(updateAttempt(attemptId, { status: 'submitted', submittedAt: new Date().toISOString(), answers: { prediction, trace }, feedback, score: dryRunScore(feedback) }));
    } catch (e) { setError((e as Error).message); }
    setRunning(false);
  }
  const rate = (rating: any) => setAttempt(updateAttempt(attemptId, { ratings: { ...attempt.ratings, main: rating } }));
  const feedback = attempt.feedback;
  const locked = submitted || running;
  return <>
    <div className="workspace-toolbar"><div className="exercise-select"><strong>{topicName(question.topicId)}</strong></div><div className="exercise-meta"><span>Python</span><span className="difficulty-tag">{label(question.difficulty)}</span></div></div>
    <div className="review-focus-summary"><span>Criteria</span><strong>Correctness</strong></div>
    <section className="exercise-brief" aria-labelledby="dry-run-title"><div><h1 id="dry-run-title">{question.title}</h1><p>{question.prompt}</p></div><div><h3>How this works</h3><ul className="requirements"><li><Check size={15}/><span>Trace the code by hand.</span></li><li><Lock size={15}/><span>The code only runs after you submit.</span></li></ul></div></section>
    <div className="workspace">
      <section className="editor-panel"><CodeBlock file={question.id.replace(/-/g,'_')+'.py'} code={question.code}/></section>
      <aside className="review-panel">
        {!feedback?<div className="annotation-form dry-run-answer">
          <h3>Your answer</h3>
          <label>Predicted output<textarea className="code-input" rows={Math.max(3,question.code.split('print(').length-1)} value={prediction} readOnly={locked} spellCheck={false} autoCapitalize="off" placeholder="Type exactly what is printed, one line per print" onChange={e=>setPrediction(e.target.value)}/></label>
          {columns&&(trace.length===0?<button type="button" className="text-button" disabled={locked} onClick={()=>setTrace([0,1,2].map(()=>columns.map(()=>'')))}><Plus size={14}/>Add a trace table (optional)</button>:<div className="trace-box"><h3>Trace table <span className="muted">(optional)</span></h3><p className="muted">Write the values after each step, one row per step or loop iteration. Leave a cell empty if it doesn't exist yet.</p><TraceInput columns={columns} rows={trace} locked={locked} onChange={setTrace}/></div>)}
          {running&&<p className="muted" role="status">Running the code… The first run downloads Python.</p>}
          {error&&<p className="validation-error" role="alert">{error}</p>}
        </div>:<div className="feedback-content" aria-live="polite">
          <div className="feedback-score-row"><div className="ai-heading"><h2><Sparkles size={18} aria-hidden="true"/>AI feedback</h2><span className="simulated-label">Simulated</span></div><span className={'result-mark '+(feedback.correct?'good':'bad')}>{feedback.correct?<Check size={15}/>:<X size={15}/>}{feedback.correct?'Correct':'Not quite'}</span></div>
          <p className="feedback-summary">The code ran for real. {feedback.correct?'Your trace matches its output.':'Compare your prediction with what it printed.'}</p>
          <div className="output-pair"><div><h4>Your prediction</h4><pre className="answer-code">{attempt.answers.prediction||' '}</pre></div><div><h4>Actual output</h4><pre className="answer-code">{feedback.actualOutput||' '}</pre></div></div>
          <FeedbackPoints {...dryRunPoints(attempt.answers.prediction||'',feedback)}/>
          {!feedback.correct&&feedback.trace?.mostlyRight&&<p className="clean-answer">Your trace table was mostly right, so you get half the credit for this one.</p>}
          {feedback.mistake&&<section className="answer-section"><h3>Where your trace went wrong</h3><p className="clean-answer">{feedback.mistake}</p></section>}
          {feedback.trace&&<section className="answer-section"><h3>Your trace table</h3><TraceResult trace={feedback.trace}/></section>}
          <section className="answer-section"><h3>{feedback.correct?'The trace':'The correct trace'}</h3><p className="clean-answer">{feedback.explanation}</p></section>
          <div className="answer-fix"><strong>Tip</strong><p>{feedback.tip}</p></div>
          <p className="related-concept"><span>Related concept</span> {feedback.concept}</p>
          <AnswerFeedback target="AI feedback" value={attempt.ratings.main} onChange={rate}/>
        </div>}
      </aside>
    </div>
    {!submitted&&<DemoFill onGood={async()=>{const run=await runProgram(question.code);setPrediction(displayOutput(run.output,run.error));}} onWrong={()=>setPrediction(question.commonMistakes[0].output)}/>}
    <div className="submission-bar">{submitted?<div className="completed-actions"><button className="secondary" onClick={onHome}><ArrowLeft size={16}/>Back to practice</button><button className="primary" onClick={onNext}>Next question<ArrowRight size={17}/></button></div>:<><button className="secondary" onClick={onHome}><ArrowLeft size={16}/>Save and leave</button><button className="primary" disabled={!prediction.trim()||running} onClick={submit}>{running?'Running…':'Submit and run'}<ArrowRight size={17}/></button></>}</div>
  </>;
}
