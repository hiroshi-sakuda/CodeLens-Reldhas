import { useState, type ComponentType } from 'react';
import type { Go, ScreenProps } from '../../features';
import { summarizeLensReview, summarizePractice } from '../../attempt-summary.js';
import { functionNames, isUnlocked, practiceFunctions } from '../../course.js';
import { ConceptIcon, DryRunIcon, LensIcon } from '../../icons';
import { dimensions } from '../../model.js';
import { lensReviewData, listAttempts, readTa } from '../../practice-log.js';
import { pct, ResultChip, ScoreBar, scorePoints, shortDate } from '../../ui';
import { sampleHistory } from './sample-history.js';
import { computeSkillMap, minItems, practiseParams, usualSlip, windowDays } from './skills.js';
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
  const open = (s: any) => s.submissionId ? go('ta-feedback', { attemptId: s.submissionId }) : s.function === 'lens-review' ? (s.real && has('ta-feedback') ? go('ta-feedback', { attemptId: s.id }) : go('lens-review', { attemptId: s.id })) : go(s.function, { attemptId: s.id });
  return <ul className="results">{items.map(s => {
    const Icon = functionIcons[s.function];
    const body = <>
      <span className="tile sm" aria-hidden="true"><Icon size={16}/></span>
      <span className="result-text"><strong>{s.title}</strong><span>{(functionNames as any)[s.function]}, {shortDate(s.date)}{(s.taComment || sent.has(s.id)) && <span className="chip strong">TA commented</span>}</span></span>
      <ResultChip value={s.score} soft={s.function !== 'lens-review'}>{s.shown}</ResultChip>
    </>;
    return <li key={s.id}>{s.real || s.submissionId || s.function === 'lens-review' ? <button className="result-row row-hover" onClick={() => open(s)}>{body}</button> : <div className="result-row" title="Sample history">{body}</div>}</li>;
  })}</ul>;
}

function Score({ s }: { s: any }) {
  return <span className="skill-score"><span className={'skill-value' + (s.value != null && s.value < 0.5 ? ' low' : '')}>{pct(s.value)}</span>{s.items > 0 && <span className="muted-text">({scorePoints(s)})</span>}</span>;
}
function TopicBreakdown({ topics, open = false }: { topics: any[]; open?: boolean }) {
  if (!topics.length) return null;
  return <details className="topic-detail" open={open}><summary>By topic <span className="muted-text">({topics.length})</span></summary>
    <div className="topic-list">{topics.map(t => <div className="skill-row" key={t.topic}><div className="skill-row-head"><span>{t.topic}</span><Score s={t}/></div><ScoreBar value={t.value}/></div>)}</div>
  </details>;
}
// One line: the average score of each of the last four weeks.
function Trend({ trend }: { trend: any }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 480, H = 170, left = 36, right = 22, top = 24, bottom = 28;
  const inset = 30; // Keeps the first value label clear of the axis labels.
  const x = (i: number) => left + inset + i * (W - left - right - 2 * inset) / (trend.weeks.length - 1);
  const y = (v: number) => top + (1 - v) * (H - top - bottom);
  const points = trend.weeks.map((w: any, i: number) => ({ ...w, i })).filter((w: any) => w.value != null);
  const path = points.map((p: any, n: number) => (n ? 'L' : 'M') + x(p.i) + ' ' + y(p.value)).join(' ');
  // From the rounded percentages shown, so the sum on screen adds up.
  const change = trend.change == null ? null : Math.round(trend.last.value * 100) - Math.round(trend.first.value * 100);
  return <section className="card skill-card" aria-labelledby="trend-title">
    <div><h2 id="trend-title" className="section-title-lg">Improvement trend</h2><p className="muted-text">Your average score each week, over the last four weeks.</p></div>
    <div className="trend">
      <svg className="trend-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Average score by week. Values are in the table that follows." onMouseLeave={() => setHover(null)}>
        {[0, 0.5, 1].map(v => <g key={v}><line className="trend-grid" x1={left} x2={W - right} y1={y(v)} y2={y(v)}/><text className="trend-axis" x={left - 8} y={y(v) + 4} textAnchor="end">{v * 100}%</text></g>)}
        {trend.weeks.map((w: any, i: number) => <text className="trend-axis" key={w.label} x={x(i)} y={H - 8} textAnchor="middle">{w.label}</text>)}
        <path className="trend-line" d={path}/>
        {points.map((p: any, n: number) => <g key={p.label} onMouseEnter={() => setHover(p.i)}>
          <circle className="trend-hit" cx={x(p.i)} cy={y(p.value)} r={20}/>
          <circle className="trend-dot" cx={x(p.i)} cy={y(p.value)} r={4}/>
          {(n === 0 || n === points.length - 1 || hover === p.i) && <text className="trend-value" x={x(p.i)} y={y(p.value) - 11} textAnchor="middle">{pct(p.value)}</text>}
        </g>)}
      </svg>
      <div className="trend-side">{change == null ? <p className="muted-text">Practise in at least two different weeks to see a trend.</p> : <><strong>{change > 0 ? '+' : ''}{change} points</strong><span className="muted-text">from {pct(trend.first.value)} in {trend.first.label} to {pct(trend.last.value)} in {trend.last.label}</span></>}</div>
    </div>
    <table className="sr-only"><caption>Average score by week</caption><tbody>{trend.weeks.map((w: any) => <tr key={w.label}><th scope="row">{w.label}</th><td>{w.value == null ? 'No practice' : pct(w.value)}</td></tr>)}</tbody></table>
  </section>;
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
          const weakTopic = s.topics[0];
          const target = weakest ? practiseParams(lens, weakTopic?.topic, has) : null;
          return <div className={'skill-row' + (weakest ? ' weakest' : '')} key={lens}>
            <div className="skill-row-head"><span>{lens}</span><Score s={s}/></div>
            <ScoreBar value={s.value} delay={0.1 * i}/>
            {weakest ? <div className="skill-row-foot"><span className="weak-note">Your weakest lens. {usualSlip(map, lens)}</span>{target && (isUnlocked(target.id) ? <button className="btn btn-primary btn-xs" onClick={() => go(target.id, target.params)}>Practise {weakTopic?.topic || lens}</button> : <span className="muted-text">Your TA is preparing this</span>)}</div>
              : (!s.items || s.items < minItems) && <span className="muted-text">{!s.items ? 'No answers yet' : 'Too few answers to be sure yet'}</span>}
            <TopicBreakdown topics={s.topics} open={weakest}/>
          </div>;
        })}
      </section>
      <section className="card skill-card" aria-labelledby="mode-title">
        <div><h2 id="mode-title" className="section-title-lg">By practice mode</h2><p className="muted-text">How you do in each kind of exercise.</p></div>
        {(practiceFunctions as string[]).map((fn, i) => {
          const s = map.byFunction[fn]; const Icon = functionIcons[fn];
          return <div className="mode-row" key={fn}><span className="tile" aria-hidden="true"><Icon/></span>
            <div><div className="skill-row-head"><span>{(functionNames as any)[fn]} <span className="muted-text">{s.attempts} {fn === 'concept-match' ? (s.attempts === 1 ? 'set' : 'sets') : (s.attempts === 1 ? 'exercise' : 'exercises')}</span></span><Score s={s}/></div><ScoreBar value={s.value} delay={0.4 + 0.1 * i}/><TopicBreakdown topics={s.topics}/></div>
          </div>;
        })}
      </section>
    </div>
    <p className="muted-text skill-key">The brackets show points earned out of answers counted. Right lines with the wrong lens count as 0.5, a half-credit Dry Run counts as 0, and each Lens Review counts as one answer in By practice mode.</p>
    <Trend trend={map.trend}/>
    <section aria-labelledby="hist-title" className="results-section"><h2 id="hist-title" className="section-title-lg">All results</h2><ResultsList items={items} go={go} has={has}/></section>
  </div>;
}
