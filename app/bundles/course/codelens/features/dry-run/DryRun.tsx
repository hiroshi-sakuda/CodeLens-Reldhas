import { useEffect, useState } from 'react';
import AnswerFeedback from '../../AnswerFeedback';
import { SlimBar } from '../../bars';
import DifficultySetup, { type Difficulty } from '../../DifficultySetup';
import type { ScreenProps } from '../../features';
import { approvedItems, eligibleItems, pickItems, readCourse, topicName } from '../../course.js';
import { SparkIcon, TerminalIcon } from '../../icons';
import { createAttempt, getAttempt, listAttempts, updateAttempt } from '../../practice-log.js';
import DemoFill from '../../DemoFill';
import { CodeCard, PanelFooter, ResultChip, WorkArea } from '../../ui';
import { displayOutput, dryRunFeedback, dryRunScore } from './feedback.js';
import { questions } from './questions.js';
import { runProgram } from './run-python.js';
import { TraceInput, TraceResult } from './TraceTable';
import './dry-run.css';
export const help = { title: 'How Dry Run works', steps: ['Read the code and trace it by hand.', 'Type exactly what you think it prints. A trace table is optional.', 'Submit. Your answer locks and the code really runs.', 'Compare your answer with the real output and read the feedback.'] };
const levels = { easy: 'Short code, one loop or condition, few iterations.', medium: 'More branches or iterations, values that change less obviously.', hard: 'Nested loops or several functions, with traps like off-by-one.' };
export default function DryRunScreen({ params, go }: ScreenProps) {
  const [attemptId, setAttemptId] = useState<string | null>(params.attemptId || null);
  const [again, setAgain] = useState<Difficulty | undefined>();
  const [error, setError] = useState('');
  function start(difficulty: Difficulty) {
    const done = listAttempts('dry-run').flatMap((a: any) => a.exerciseIds);
    const [question] = pickItems(eligibleItems(approvedItems('dry-run', questions), difficulty, readCourse().publishedTopics), 1, done);
    if (!question) { setError('Your TA is preparing this: nothing is approved and published at this difficulty yet.'); return; }
    setAttemptId(createAttempt({ function: 'dry-run', title: question.title, difficulty, topicId: question.topicId, exerciseIds: [question.id], fromSuggestion: !!params.fromSuggestion }).id);
  }
  if (error) return <><SlimBar title="Dry Run" onExit={() => go('home')} leave={null}/><section className="sheet center-sheet"><p>{error}</p><button className="btn btn-outline" onClick={() => go('home')}>Back to Practice</button></section></>;
  if (!attemptId) return <DifficultySetup title="Dry Run" what="a problem" levels={levels} help={help} autoStart={again || params.difficulty} onStart={start} onBack={() => go('home')}/>;
  return <Exercise key={attemptId} attemptId={attemptId} onHome={() => go('home')} onNext={() => { setAgain(getAttempt(attemptId).difficulty); setAttemptId(null); }}/>;
}
function Exercise({ attemptId, onHome, onNext }: { attemptId: string; onHome: () => void; onNext: () => void }) {
  const [attempt, setAttempt] = useState<any>(() => getAttempt(attemptId));
  const question = questions.find(q => q.id === attempt.exerciseIds[0])!;
  const columns: string[] | undefined = (question as any).traceColumns;
  const [prediction, setPrediction] = useState<string>(attempt.answers.prediction || '');
  const [trace, setTrace] = useState<string[][]>(attempt.answers.trace?.length ? attempt.answers.trace : columns ? [0, 1].map(() => columns.map(() => '')) : []);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const submitted = attempt.status === 'submitted';
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
  const file = question.id.replace(/-/g, '_') + '.py';
  const meta = `Dry Run, ${topicName(question.topicId).replace(' & ', ' and ').toLowerCase()}, ${question.difficulty}${feedback ? ', submitted' : ''}`;
  const verdict = feedback ? (feedback.correct ? 'Correct' : attempt.score ? 'Not quite, half credit' : 'Not quite') : '';

  if (!feedback) return <>
    <SlimBar title={question.title} meta={meta} onExit={onHome} help={help}/>
    <WorkArea>
      <section className="sheet work-main" aria-label="Code to trace">
        <p className="work-prompt">{question.prompt === 'Trace the code. What does it print?' ? 'Trace the code by hand. What does it print?' : question.prompt}</p>
        <CodeCard file={file} code={question.code}/>
      </section>
      <aside className="sheet work-side" aria-label="Your answer">
        <div className="work-side-body">
          <label className="field big-label">Predicted output<small>Type exactly what is printed, one line per print.</small>
            <textarea className="mono" rows={Math.max(4, question.code.split('print(').length)} value={prediction} readOnly={running} spellCheck={false} autoCapitalize="off" onChange={e => setPrediction(e.target.value)}/>
          </label>
          {columns && <section aria-labelledby="trace-title" className="trace-box2">
            <div className="row-between"><h2 id="trace-title" className="panel-title">Trace table</h2><span className="muted-text">Optional</span></div>
            <p className="muted-text">Write the values after each step, one row per step or loop iteration. Leave a cell empty if it doesn't exist yet.</p>
            <TraceInput columns={columns} rows={trace} locked={running} onChange={setTrace}/>
          </section>}
          {running && <p className="muted-text" role="status">Running the code… The first run downloads Python.</p>}
          {error && <p className="error-text" role="alert">{error}</p>}
          <DemoFill onGood={async () => { const run = await runProgram(question.code); setPrediction(displayOutput(run.output, run.error)); }} onWrong={() => setPrediction(question.commonMistakes[0].output)}/>
        </div>
        <PanelFooter note="The code runs after you submit.">
          <button className="btn btn-primary" disabled={!prediction.trim() || running} onClick={submit}>{running ? 'Running…' : 'Submit and run'}</button>
        </PanelFooter>
      </aside>
    </WorkArea>
  </>;

  return <>
    <SlimBar title={question.title} meta={meta} onExit={onHome} help={help} leave={null} aside={<ResultChip value={attempt.score} soft>{verdict}</ResultChip>}/>
    <WorkArea>
      <section className="sheet work-main" aria-label="Code you traced">
        <p className="work-prompt">Trace the code by hand. What does it print?</p>
        <CodeCard file={file} code={question.code} note={<span/>}/>
        <div className="output-compare">
          <div className={'output-box ' + (feedback.correct ? 'good' : 'warn')}><span>You predicted</span><pre>{attempt.answers.prediction || ' '}</pre></div>
          <div className="output-box good"><span><TerminalIcon/>It printed, when the code ran</span><pre>{feedback.actualOutput || ' '}</pre></div>
        </div>
      </section>
      <aside className="sheet work-side" aria-label="Your feedback">
        <div className="work-side-body">
          <div className="score-head"><div className="big-score"><strong>{attempt.score === 0.5 ? '0.5' : attempt.score}</strong><span>/ 1</span></div><span className="muted-text">Trains Correctness</span></div>
          <section aria-labelledby="ai-title" className="feedback-block">
            <div className="ai-title"><SparkIcon/><h2 id="ai-title" className="panel-title">AI feedback</h2><span className="chip">Simulated</span></div>
            <p>The code ran for real. {feedback.correct ? 'Your prediction matches what it printed.' : 'Compare your prediction with what it printed.'}</p>
            {feedback.mistake && <article className="note-box warn"><span className="chip warn">A common slip</span><p><strong>{feedback.mistake}</strong></p></article>}
            {!feedback.correct && feedback.trace?.mostlyRight && <p className="soft-box">Your trace table was mostly right, so you get half the credit for this one.</p>}
          </section>
          {feedback.trace && <section aria-labelledby="your-trace" className="feedback-block"><h3 id="your-trace" className="small-title">Your trace table</h3><TraceResult trace={feedback.trace}/></section>}
          <section aria-labelledby="correct-title" className="feedback-block"><h3 id="correct-title" className="small-title">{feedback.correct ? 'The trace' : 'The correct trace'}</h3><p>{feedback.explanation}</p></section>
          <p className="tip-box"><strong>Tip</strong><span>{feedback.tip}</span><span className="muted-text">{feedback.concept}</span></p>
          <AnswerFeedback target="AI feedback" value={attempt.ratings.main} onChange={rate}/>
        </div>
        <PanelFooter>
          <button className="btn btn-outline" onClick={onHome}>Back to Practice</button>
          <button className="btn btn-primary" onClick={onNext}>Next question</button>
        </PanelFooter>
      </aside>
    </WorkArea>
  </>;
}
