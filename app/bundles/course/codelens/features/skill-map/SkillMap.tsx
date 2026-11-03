import { ArrowRight, Sparkles } from 'lucide-react';
import type { ScreenProps } from '../../features';
import { summarizeLensReview, summarizePractice } from '../../attempt-summary.js';
import { functionNames, isUnlocked, practiceFunctions } from '../../course.js';
import { dimensions } from '../../model.js';
import { lensReviewData, listAttempts, readTa } from '../../practice-log.js';
import { sampleHistory } from './sample-history.js';
import { computeSkillMap, minItems, practiseTarget, usualSlip, windowDays } from './skills.js';
import './skill-map.css';
export function loadSkillMap() {
  const reviews = readTa().reviews;
  const practice = listAttempts().filter((a: any) => a.status === 'submitted').map(summarizePractice);
  const lens = lensReviewData().attempts.map((a: any) => summarizeLensReview(a, reviews));
  return computeSkillMap([...practice, ...lens, ...sampleHistory]);
}
export const scoreFor = (fn: string) => { const value = (loadSkillMap().byFunction as any)[fn]?.value; return value == null ? null : Math.round(value * 100) + '%'; };
const pct = (value: number | null) => value == null ? '—' : Math.round(value * 100) + '%';
function Row({ name, value, note, weakest }: { name: string; value: number | null; note: string; weakest?: boolean }) {
  return <div className="rubric skill-row"><div><span>{name}{weakest&&<em>Weakest</em>}</span><strong>{pct(value)}</strong></div><div className="track"><span style={{width:(value||0)*100+'%'}}/></div><p>{note}</p></div>;
}
export function Suggestion({ go, has, heading }: ScreenProps & { heading: string }) {
  const map = loadSkillMap();
  const lens = map.weakest;
  if (!lens) return <section className="next-practice suggestion"><div><h2>{heading}</h2><p>Suggestions unlock as you practise: at least {minItems} answers in two lenses.</p></div></section>;
  const target = practiseTarget(lens, has);
  return <section className="next-practice suggestion"><div><h2>{heading}</h2><p><strong>Your weakest area is {lens} ({pct((map.byLens as any)[lens].value)}).</strong> {usualSlip(map, lens)}</p></div>{isUnlocked(target)?<button className="primary" onClick={()=>go(target, target==='lens-review'?{}:{fromSuggestion:true})}>Practise this<ArrowRight size={16}/></button>:<p className="preparing">Your TA is preparing this</p>}</section>;
}
export default function SkillMap(props: ScreenProps) {
  const map = loadSkillMap();
  const sent = new Set(readTa().reviews.filter((r: any) => r.sentAt).map((r: any) => r.attemptId));
  const items = [...map.recent].sort((a: any, b: any) => b.date.localeCompare(a.date)).slice(0, 8) as any[];
  return <div className="skill-map">
    <h1 className="progress-heading">Skill Map</h1>
    <p className="skill-intro">Based on your last {windowDays} days of practice. <span className="simulated-label">Includes sample history</span></p>
    <Suggestion {...props} heading="Where to practise next"/>
    <div className="skill-grid">
      <section className="progress-card"><h2>By lens</h2><p className="muted">Each answer counts towards the lens it trains.</p>
        {dimensions.map(lens=>{const s=(map.byLens as any)[lens];return <Row key={lens} name={lens} value={s.value} weakest={map.weakest===lens} note={s.items?`${s.items} ${s.items===1?'answer':'answers'}`:'Practised in Lens Review'}/>;})}
      </section>
      <section className="progress-card"><h2>By function</h2><p className="muted">How you do in each kind of practice.</p>
        {(practiceFunctions as string[]).map(fn=>{const s=(map.byFunction as any)[fn];return <Row key={fn} name={(functionNames as any)[fn]} value={s.value} note={`${s.attempts} ${fn==='concept-match'?(s.attempts===1?'set':'sets'):(s.attempts===1?'exercise':'exercises')}`}/>;})}
      </section>
    </div>
    <section className="progress-card"><h2>Recent feedback</h2>
      {items.map(s=><details className="history-item" key={s.id}><summary><Sparkles size={18}/><span><strong>{s.title}</strong><small>{(functionNames as any)[s.function]} · {new Date(s.date).toLocaleDateString()}{(s.taComment||sent.has(s.id))&&<em className="ta-chip">TA feedback</em>}</small></span><b>{s.shown}</b></summary>
        {s.note&&<div className="history-comment"><strong>AI feedback</strong><p>{s.note}</p></div>}
        {s.taComment&&<div className="history-comment"><strong>Your TA</strong><p>{s.taComment}</p></div>}
        {s.real&&<button className="text-button" onClick={()=>s.function==='lens-review'?(sent.has(s.id)&&props.has('ta-feedback')?props.go('ta-feedback',{attemptId:s.id}):props.go('lens-review')):props.go(s.function,{attemptId:s.id})}>Open<ArrowRight size={15}/></button>}
      </details>)}
    </section>
  </div>;
}
