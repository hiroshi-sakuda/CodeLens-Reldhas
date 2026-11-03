import { ArrowRight, ScanLine } from 'lucide-react';
import { features, type Feature, type Go, type ScreenProps } from './features';
import { functionNames, isUnlocked, label, readCourse, topicName } from './course.js';
import { lensReviewData, listAttempts, percent } from './practice-log.js';
const lensReviewCard = { icon: ScanLine, lens: 'Random', skill: 'Judge AI-generated code without being told what to look for.',
  score: () => { const { attempts } = lensReviewData(); return percent(attempts.map((a: any) => a.result.total / 10)); } };
function Card({ id, name, card, go }: { id: string; name: string; card: NonNullable<Feature['card']>; go: Go }) {
  const open = isUnlocked(id, readCourse());
  const score = features.find(f => f.scoreFor)?.scoreFor?.(id) ?? card.score();
  return <article className="practice-card">
    <div className="practice-card-head"><card.icon size={20}/><span className="line-pill">{card.lens}</span></div>
    <h2>{name}</h2><p>{card.skill}</p>
    <dl><div><dt>Your score</dt><dd>{score || '—'}</dd></div></dl>
    {open?<button className="primary" onClick={()=>go(id)}>Start<ArrowRight size={16}/></button>:<p className="preparing">Your TA is preparing this</p>}
  </article>;
}
export default function StudentHome(props: ScreenProps) {
  const practice = features.filter(f => f.kind === 'practice');
  const unfinished = listAttempts().filter((a: any) => a.status === 'in_progress');
  return <div className="student-home">
    <div className="home-heading"><h1>What do you want to practise today?</h1>{features.filter(f => f.role === 'student' && f.kind === 'page').map(f => <button className="secondary" key={f.id} onClick={()=>props.go(f.id)}>{f.label}<ArrowRight size={16}/></button>)}</div>
    <div className="practice-cards">
      {practice.map(f => <Card key={f.id} id={f.id} name={f.label} card={f.card!} go={props.go}/>)}
      <Card id="lens-review" name="Lens Review" card={lensReviewCard} go={props.go}/>
    </div>
    <div className="home-panels">{features.filter(f => f.role === 'student' && f.HomePanel).map(f => { const Panel = f.HomePanel!; return <Panel key={f.id} {...props}/>; })}</div>
    {unfinished.length>0&&<section className="continue-list"><h2>Continue where you left off</h2>{unfinished.map((a: any)=><button className="secondary" key={a.id} onClick={()=>props.go(a.function,{attemptId:a.id})}><span>{(functionNames as Record<string,string>)[a.function]} · {label(a.difficulty)} · {topicName(a.topicId)}</span><ArrowRight size={15}/></button>)}</section>}
  </div>;
}
