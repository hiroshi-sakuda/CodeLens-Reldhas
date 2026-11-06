import type { ComponentType } from 'react';
import type { Go, ScreenProps } from '../../features';
import { summarizeLensReview, summarizePractice } from '../../attempt-summary.js';
import { functionNames, isUnlocked, practiceFunctions } from '../../course.js';
import { ConceptIcon, DryRunIcon, LensIcon } from '../../icons';
import { dimensions } from '../../model.js';
import { lensReviewData, listAttempts, readTa } from '../../practice-log.js';
import { pct, ResultChip, ScoreBar, shortDate } from '../../ui';
import { sampleHistory } from './sample-history.js';
import { computeSkillMap, minItems, practiseTarget, windowDays } from './skills.js';
import './skill-map.css';
export function loadSkillMap() {
  const reviews = readTa().reviews;
  const practice = listAttempts().filter((a: any) => a.status === 'submitted').map(summarizePractice);
  const lens = lensReviewData().attempts.map((a: any) => summarizeLensReview(a, reviews));
  return computeSkillMap([...practice, ...lens, ...sampleHistory]);
}
export const scoreFor = (fn: string) => { const value = (loadSkillMap().byFunction as any)[fn]?.value; return value == null ? null : Math.round(value * 100) + '%'; };
export const functionIcons: Record<string, ComponentType<{ size?: number }>> = { 'dry-run': DryRunIcon, 'concept-match': ConceptIcon, 'lens-review': LensIcon };

/* One list of results, used on Practice (latest four) and in full on the Skill map. */
export function ResultsList({ items, go, has }: { items: any[]; go: Go; has: (id: string) => boolean }) {
  const sent = new Set(readTa().reviews.filter((r: any) => r.sentAt).map((r: any) => r.attemptId));
  const open = (s: any) => s.submissionId ? go('ta-feedback', { attemptId: s.submissionId }) : s.function === 'lens-review' ? (has('ta-feedback') ? go('ta-feedback', { attemptId: s.id }) : go('lens-review', { setup: true })) : go(s.function, { attemptId: s.id });
  return <ul className="results">{items.map(s => {
    const Icon = functionIcons[s.function];
    const body = <>
      <span className="tile sm" aria-hidden="true"><Icon size={16}/></span>
      <span className="result-text"><strong>{s.title}</strong><span>{(functionNames as any)[s.function]}, {shortDate(s.date)}{(s.taComment || sent.has(s.id)) && <span className="chip strong">TA commented</span>}</span></span>
      <ResultChip value={s.score} soft={s.function !== 'lens-review'}>{s.shown}</ResultChip>
    </>;
    return <li key={s.id}>{s.real || s.submissionId ? <button className="result-row row-hover" onClick={() => open(s)}>{body}</button> : <div className="result-row" title="Sample history">{body}</div>}</li>;
  })}</ul>;
}

export default function SkillMap({ go, has }: ScreenProps) {
  const map = loadSkillMap() as any;
  const items = [...map.recent].sort((a: any, b: any) => b.date.localeCompare(a.date));
  return <div className="skill-map">
    <div><h1 className="page-title">Skill map</h1><p className="page-lede">Based on your last {windowDays} days of practice. <span className="chip">Includes sample history</span></p></div>
    <div className="skill-grid">
      <section className="card skill-card" aria-labelledby="lens-title">
        <div><h2 id="lens-title" className="section-title-lg">By lens</h2><p className="muted-text">Every answer counts towards the lens it trains.</p></div>
        {dimensions.map((lens, i) => {
          const s = map.byLens[lens];
          const weakest = map.weakest === lens;
          const target = weakest ? practiseTarget(lens, has) : null;
          return <div className={'skill-row' + (weakest ? ' weakest' : '')} key={lens}>
            <div className="skill-row-head"><span>{lens}</span><span className={'skill-value' + (s.value != null && s.value < 0.5 ? ' low' : '')}>{pct(s.value)}</span></div>
            <ScoreBar value={s.value} delay={0.1 * i}/>
            {weakest ? <div className="skill-row-foot"><span className="weak-note">Your weakest lens, from {s.items} answers.</span>{target && (isUnlocked(target) ? <button className="btn btn-primary btn-xs" onClick={() => go(target, target === 'lens-review' ? {} : { fromSuggestion: true })}>Practise in {(functionNames as any)[target]}</button> : <span className="muted-text">Your TA is preparing this</span>)}</div>
              : <span className="muted-text">{!s.items ? 'No answers yet' : s.items < minItems ? `${s.items} ${s.items === 1 ? 'answer' : 'answers'}, too few to be sure yet` : `${s.items} answers`}</span>}
          </div>;
        })}
      </section>
      <section className="card skill-card" aria-labelledby="mode-title">
        <div><h2 id="mode-title" className="section-title-lg">By practice mode</h2><p className="muted-text">How you do in each kind of exercise.</p></div>
        {(practiceFunctions as string[]).map((fn, i) => {
          const s = map.byFunction[fn]; const Icon = functionIcons[fn];
          return <div className="mode-row" key={fn}><span className="tile" aria-hidden="true"><Icon/></span>
            <div><div className="skill-row-head"><span>{(functionNames as any)[fn]} <span className="muted-text">{s.attempts} {fn === 'concept-match' ? (s.attempts === 1 ? 'set' : 'sets') : (s.attempts === 1 ? 'exercise' : 'exercises')}</span></span><span className={'skill-value' + (s.value != null && s.value < 0.5 ? ' low' : '')}>{pct(s.value)}</span></div><ScoreBar value={s.value} delay={0.4 + 0.1 * i}/></div>
          </div>;
        })}
      </section>
    </div>
    <section aria-labelledby="hist-title" className="results-section"><h2 id="hist-title" className="section-title-lg">All results</h2><ResultsList items={items} go={go} has={has}/></section>
  </div>;
}
