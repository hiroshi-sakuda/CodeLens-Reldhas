import { features, type ScreenProps } from './features';
import { functionNames, isUnlocked, label, readCourse, topicName } from './course.js';
import { Brackets, ConceptIcon, DryRunIcon, LensIcon, ResumeIcon } from './icons';
import { exercises } from './model.js';
import { lastDifficulty, lensReviewData, listAttempts } from './practice-log.js';
import { choosePractice } from './review-flow.js';
import { loadSkillMap, ResultsList } from './features/skill-map/SkillMap';
import { practiseTarget, usualSlip } from './features/skill-map/skills.js';
import { pct, ScoreBar } from './ui';
import './home.css';

type Card = { id: string; name: string; Icon: typeof DryRunIcon; skill: string; trains: string; score: number | null; setting: string; start: () => void; change: () => void };

// The last Lens Review choice of lenses, so Start can repeat it straight away.
function lastLensConfig() {
  const drafts = Object.values(lensReviewData().drafts as Record<string, any>);
  const last = drafts.at(-1);
  return last ? { randomFocus: !!last.randomFocus, focus: last.focus || [] } : { randomFocus: true, focus: [] };
}

export default function StudentHome({ go, has }: ScreenProps) {
  const map = loadSkillMap() as any;
  const suggested = map.weakest ? practiseTarget(map.weakest, has) : null;
  const done = (fn: string) => listAttempts(fn).some((a: any) => a.status === 'submitted');
  const startFn = (fn: string, fromSuggestion: boolean) => ({
    start: () => go(fn, { difficulty: lastDifficulty(fn), fromSuggestion }),
    change: () => go(fn, { fromSuggestion }),
  });
  const lens = lastLensConfig();
  const cards: Card[] = [
    ...features.filter(f => f.kind === 'practice' && f.card).map(f => ({
      id: f.id, name: f.label, Icon: f.id === 'dry-run' ? DryRunIcon : ConceptIcon, skill: f.card!.skill, trains: `Trains ${f.card!.lens}`,
      score: map.byFunction[f.id]?.value ?? null,
      setting: `${label(lastDifficulty(f.id))}${done(f.id) ? ', like last time.' : ' to start.'}${f.id === 'concept-match' ? ' Mixed topics.' : ''}`,
      ...startFn(f.id, suggested === f.id),
    })),
    { id: 'lens-review', name: 'Lens Review', Icon: LensIcon, skill: 'Judge AI-generated code without being told what to look for.', trains: 'Trains any lens you pick',
      score: map.byFunction['lens-review']?.value ?? null,
      setting: lens.randomFocus ? "Random lenses." : `Lenses: ${lens.focus.join(", ")}.`,
      start: () => { try { go('lens-review', { start: choosePractice('Random', lens.focus, lens.randomFocus) }); } catch { go('lens-review', { setup: true }); } },
      change: () => go('lens-review', { setup: true }) },
  ];

  // One "continue" row per kind of practice: the newest unfinished one.
  const inProgress = listAttempts().filter((a: any) => a.status === 'in_progress').reverse();
  const unfinished = [
    ...['dry-run', 'concept-match'].map(fn => inProgress.find((a: any) => a.function === fn)).filter(Boolean).map((a: any) => ({ id: a.id, name: (functionNames as any)[a.function], detail: `${label(a.difficulty)}, ${a.function === 'concept-match' ? 'mixed topics' : topicName(a.topicId).toLowerCase()}`, open: () => go(a.function, { attemptId: a.id }) })),
    ...Object.entries(lensReviewData().drafts as Record<string, any>).filter(([, d]) => !d.submitted && d.comments.length).slice(-1).map(([id, d]) => ({ id, name: 'Lens Review', detail: `${exercises.find(e => e.id === (d.exerciseId || id))?.title || 'Review'}, ${d.comments.length} ${d.comments.length === 1 ? 'annotation' : 'annotations'}`, open: () => go('lens-review', { reviewId: id }) })),
  ];
  const recent = [...map.recent].sort((a: any, b: any) => b.date.localeCompare(a.date)).slice(0, 4);
  const course = readCourse();

  return <>
    <h1 className="page-title">Practice</h1>
    {unfinished.length > 0 && <div className="continue-stack">{unfinished.map(u => <button key={u.id} className="continue-row row-hover" onClick={u.open}>
      <span className="tile sm on-sheet" aria-hidden="true"><ResumeIcon/></span>
      <span className="continue-text"><strong>Continue {u.name}</strong>, {u.detail}</span>
      <span className="continue-go">Resume</span>
    </button>)}</div>}
    <div className="practice-grid">{cards.map((c, i) => {
      const isSuggested = suggested === c.id;
      const open = isUnlocked(c.id, course);
      return <article key={c.id} className={'card hoverable vf practice-card2' + (isSuggested ? ' suggested' : '')}>
        <Brackets/>
        <div className="practice-card-top"><span className="tile" aria-hidden="true"><c.Icon/></span>{isSuggested && <span className="chip strong">Suggested for you</span>}</div>
        <div><h2>{c.name}</h2><p>{c.skill}</p></div>
        {isSuggested && <p className="slip-note">{usualSlip(map, map.weakest)}</p>}
        <div className="practice-score">
          <div><span>{c.trains}</span><strong className={c.score != null && c.score < 0.5 ? 'low' : ''}>{pct(c.score)}</strong></div>
          <ScoreBar value={c.score} delay={0.15 + 0.1 * i}/>
        </div>
        {open ? <div className="practice-start">
          <button className="btn btn-primary btn-block" onClick={c.start}>Start {c.name}</button>
          <div className="practice-setting">{c.setting}<button className="text-link" onClick={c.change}>Change</button></div>
        </div> : <p className="preparing-note">Your TA is preparing this.</p>}
      </article>;
    })}</div>
    <section aria-labelledby="recent-title" className="results-section">
      <div className="results-head"><h2 id="recent-title" className="section-title-lg">Recent results</h2>{has('skill-map') && <button className="text-link" onClick={() => go('skill-map')}>See all in Skill map</button>}</div>
      {recent.length ? <ResultsList items={recent} go={go} has={has}/> : <p className="muted-text">Your results appear here after your first exercise.</p>}
    </section>
  </>;
}
