import { useState } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { features, type ScreenProps } from './features';
import { approvedItems, availableTopics, difficulties, functionNames, isUnlocked, label, readCourse, topicName } from './course.js';
import { Brackets, ConceptIcon, DryRunIcon, LensIcon, ResumeIcon } from './icons';
import { exercises, normalizeComment } from './model.js';
import { reviewTopics } from './review-flow.js';
import { lastDifficulty, lensReviewData, listAttempts, setDraftArchived } from './practice-log.js';
import { loadSkillMap, ResultsList } from './features/skill-map/SkillMap';
import { practiseParams } from './features/skill-map/skills.js';
import { pct, ScoreBar, scorePoints } from './ui';
import './home.css';

type Card = { id: string; name: string; Icon: typeof DryRunIcon; skill: string; trains: string; score: number | null; picker: { difficulty?: string; topicId: string; options: { id: string; name: string }[] }; start: () => void };

function FocusStat({ label, name, stat }: { label: string; name: string; stat: any }) {
  return <div className="focus-stat"><span className="muted-text">{label}</span>
    <div className="skill-row-head"><span>{name}</span><span className="skill-score"><span className={'skill-value' + (stat.value < 0.5 ? ' low' : '')}>{pct(stat.value)}</span><span className="muted-text">({scorePoints(stat)})</span></span></div>
    <ScoreBar value={stat.value}/>
  </div>;
}

export default function StudentHome({ go, has }: ScreenProps) {
  const [, refresh] = useState(0);
  const [deleted, setDeleted] = useState<{ kind: string; id: string } | null>(null);
  const [draftError, setDraftError] = useState('');
  const [expanded, setExpanded] = useState('');
  // What the student set on the cards. The level starts from last time and the topic from Any topic. Lens Review has no levels.
  const [picks, setPicks] = useState<Record<string, { difficulty?: string; topicId?: string }>>({});
  const setPick = (id: string, change: { difficulty?: string; topicId?: string }) => setPicks(p => ({ ...p, [id]: { ...p[id], ...change } }));
  function removeDraft(kind: string, id: string) {
    if (!setDraftArchived(kind, id, true)) { setDraftError('This draft could not be deleted. Please try again.'); return; }
    setDeleted({ kind, id }); setDraftError(''); refresh(n => n + 1);
  }
  function undoDelete() {
    if (!deleted || !setDraftArchived(deleted.kind, deleted.id, false)) { setDraftError('Could not restore the draft.'); return; }
    setDeleted(null); setDraftError(''); refresh(n => n + 1);
  }
  const map = loadSkillMap() as any;
  const course = readCourse();
  const weakLens = map.weakest ? map.byLens[map.weakest] : null;
  const weakTopic = weakLens?.topics[0];
  const focus = map.weakest ? practiseParams(map.weakest, weakTopic?.topic, has) : null;
  const suggested = focus?.id ?? null;
  const lensTopic = picks['lens-review']?.topicId || '';
  const cards: Card[] = [
    ...features.filter(f => f.kind === 'practice' && f.card).map(f => {
      const difficulty = picks[f.id]?.difficulty || lastDifficulty(f.id);
      const topics = availableTopics(approvedItems(f.id, f.card!.items || [], course), difficulty, course.publishedTopics) as string[];
      // A topic with nothing at the newly chosen level goes back to Any topic.
      const topicId = topics.includes(picks[f.id]?.topicId || '') ? picks[f.id]!.topicId! : '';
      return {
      id: f.id, name: f.label, Icon: f.id === 'dry-run' ? DryRunIcon : ConceptIcon, skill: f.card!.skill, trains: `Trains ${f.card!.lens}`,
      score: map.byFunction[f.id]?.value ?? null,
      picker: { difficulty, topicId, options: topics.map(id => ({ id, name: topicName(id) })) },
      start: () => go(f.id, { difficulty, ...(topicId ? { topicId } : {}), fromSuggestion: suggested === f.id }),
    }; }),
    { id: 'lens-review', name: 'Lens Review', Icon: LensIcon, skill: 'Judge AI-generated code without being told what to look for.', trains: 'Trains any lens you pick',
      score: map.byFunction['lens-review']?.value ?? null,
      picker: { topicId: lensTopic, options: (reviewTopics() as string[]).map(t => ({ id: t, name: t })) },
      start: () => go('lens-review', { setup: true, ...(lensTopic ? { topic: lensTopic } : {}) }) },
  ];

  // One row per kind of practice, the newest, so this list can't keep growing.
  const unfinished = [
    ...['dry-run', 'concept-match'].map(fn => listAttempts().filter((a: any) => a.status === 'in_progress' && a.function === fn).at(-1)).filter(Boolean).map((a: any) => ({ id: a.id, kind: 'practice', name: (functionNames as any)[a.function], detail: `${label(a.difficulty)}, ${topicName(a.topicId).toLowerCase()}`, info: a.title || 'Practice in progress', criteria: `Started ${new Date(a.createdAt).toLocaleDateString()}`, notes: [] as string[], open: () => go(a.function, { attemptId: a.id }) })),
    ...Object.entries(lensReviewData().drafts as Record<string, any>).filter(([, d]) => !d.submitted && !d.archived && (d.comments.length || d.noIssues)).slice(-1).map(([id, d]) => {
      const exercise = exercises.find(e => e.id === (d.exerciseId || id));
      return { id, kind: 'lens', name: 'Lens Review', detail: `${exercise?.title || 'Review'}, ${d.noIssues ? 'no issues found' : `${d.comments.length} ${d.comments.length === 1 ? 'annotation' : 'annotations'}`}`, info: exercise?.brief || 'Review in progress', criteria: d.randomFocus ? 'Random lenses, revealed after you submit.' : `Lenses: ${(d.focus || []).join(', ')}.`,
        notes: d.noIssues ? [d.justification || 'Justification not written yet.'] : d.comments.map(normalizeComment).map((c: any) => `Lines ${c.start}–${c.end}: ${c.text}`), open: () => go('lens-review', { reviewId: id }) };
    }),
  ];
  const recent = [...map.recent].sort((a: any, b: any) => b.date.localeCompare(a.date)).slice(0, 4);

  return <>
    <h1 className="page-title">Practice</h1>
    {focus && <section className="focus-card" aria-labelledby="focus-title">
      <div className="focus-head"><h2 id="focus-title" className="section-title-lg">Recommended for you</h2>{has('skill-map') && <button className="text-link" onClick={() => go('skill-map')}>See Skill map</button>}</div>
      <div className="focus-body">
        <FocusStat label="Your weakest lens" name={map.weakest} stat={weakLens}/>
        {weakTopic && <FocusStat label="Start with this topic" name={weakTopic.topic} stat={weakTopic}/>}
        {isUnlocked(focus.id, course) && <button className="btn btn-primary" onClick={() => go(focus.id, focus.params)}>Practise {weakTopic?.topic || map.weakest}</button>}
      </div>
    </section>}
    <div className="practice-grid">{cards.map((c, i) => {
      const isSuggested = suggested === c.id;
      const open = isUnlocked(c.id, course);
      return <article key={c.id} className={'card hoverable vf practice-card2' + (isSuggested ? ' suggested' : '')}>
        <Brackets/>
        <div className="practice-card-top"><span className="tile" aria-hidden="true"><c.Icon/></span>{isSuggested && <span className="chip strong">Suggested for you</span>}</div>
        <div><h2>{c.name}</h2><p>{c.skill}</p></div>
        <div className="practice-score">
          <div><span>{c.trains}</span><strong className={c.score != null && c.score < 0.5 ? 'low' : ''}>{pct(c.score)}</strong></div>
          <ScoreBar value={c.score} delay={0.15 + 0.1 * i}/>
        </div>
        {open ? <div className="practice-start">
          <div className="practice-picks">
            {c.picker.difficulty && <label className="field">Level<select value={c.picker.difficulty} onChange={e => setPick(c.id, { difficulty: e.target.value })}>{(difficulties as string[]).map(d => <option key={d} value={d}>{label(d)}</option>)}</select></label>}
            <label className="field">Topic<select value={c.picker.topicId} onChange={e => setPick(c.id, { topicId: e.target.value })}><option value="">Any topic</option>{c.picker.options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
          </div>
          <button className="btn btn-primary btn-block" onClick={c.start}>Start {c.name}</button>
        </div> : <p className="preparing-note">Your TA is preparing this.</p>}
      </article>;
    })}</div>
    {(unfinished.length > 0 || deleted) && <section aria-labelledby="continue-title" className="results-section"><h2 id="continue-title" className="section-title-lg">Continue where you left off</h2><div className="continue-stack">
      {deleted && <div className="draft-undo" role="status">Draft deleted.<button className="text-link" onClick={undoDelete}>Undo</button></div>}
      {draftError && <p className="error-text" role="alert">{draftError}</p>}
      {unfinished.map(u => { const key = u.kind + u.id; const isOpen = expanded === key; return <article key={key} className="continue-card">
        <div className="continue-head">
          <button className="continue-row row-hover" onClick={u.open}>
            <span className="tile sm on-sheet" aria-hidden="true"><ResumeIcon/></span>
            <span className="continue-text"><strong>Continue {u.name}</strong>, {u.detail}</span>
            <span className="continue-go">Resume</span>
          </button>
          <button className="icon-btn continue-toggle" aria-expanded={isOpen} aria-label={'Show what is saved in ' + u.name} onClick={() => setExpanded(isOpen ? '' : key)}><ChevronDown size={17} strokeWidth={1.8}/></button>
          <button className="icon-btn" aria-label={'Delete ' + u.name + ' draft, ' + u.detail} onClick={() => removeDraft(u.kind, u.id)}><Trash2 size={15} strokeWidth={1.8}/></button>
        </div>
        {isOpen && <div className="continue-more panel-in"><p>{u.info}</p><p className="muted-text">{u.criteria}</p>{u.notes.length > 0 && <ul>{u.notes.map((n: string, i: number) => <li key={i}>{n}</li>)}</ul>}</div>}
      </article>; })}
    </div></section>}
    <section aria-labelledby="recent-title" className="results-section">
      <div className="results-head"><h2 id="recent-title" className="section-title-lg">Recent results</h2>{has('skill-map') && <button className="text-link" onClick={() => go('skill-map')}>See all in Skill map</button>}</div>
      {recent.length ? <ResultsList items={recent} go={go} has={has}/> : <p className="muted-text">Your results appear here after your first exercise.</p>}
    </section>
  </>;
}
