import test from 'node:test';
import assert from 'node:assert/strict';
import { computeSkillMap, practiseTarget, usualSlip } from '../app/bundles/course/codelens/features/skill-map/skills.js';
import { sampleHistory } from '../app/bundles/course/codelens/features/skill-map/sample-history.js';
const now = new Date('2026-11-03');
const items = (lens, values, source = 'exam') => values.map(value => ({ lens, value, source }));
const attempt = (fn, list, score = 0, date = '2026-11-01') => ({ function: fn, items: list, score, date });
test('attempts older than 30 days do not count',()=>assert.equal(computeSkillMap([attempt('dry-run',items('Correctness',[1]),1,'2026-09-01')],now).byFunction['dry-run'].attempts,0));
test('no weakest lens until two lenses have 3 answers',()=>assert.equal(computeSkillMap([attempt('dry-run',items('Correctness',[0,0,0]))],now).weakest,null));
test('the lowest lens is the weakest',()=>{
  const map=computeSkillMap([attempt('dry-run',items('Correctness',[1,1,1])),attempt('concept-match',items('Appropriateness',[0,0,1]))],now);
  assert.equal(map.weakest,'Appropriateness');
});
test('Correctness wins a tie',()=>{
  const map=computeSkillMap([attempt('dry-run',items('Correctness',[1,1,0])),attempt('concept-match',items('Appropriateness',[1,1,0]))],now);
  assert.equal(map.weakest,'Correctness');
});
test('Lens Review averages its scores',()=>assert.equal(computeSkillMap([attempt('lens-review',[],0.5),attempt('lens-review',[],1)],now).byFunction['lens-review'].value,0.75));
test('Practise this opens the exam function, or Lens Review without one',()=>{
  const all=()=>true;
  assert.equal(practiseTarget('Correctness',all),'dry-run');
  assert.equal(practiseTarget('Appropriateness',all),'concept-match');
  assert.equal(practiseTarget('Efficiency',all),'lens-review');
  assert.equal(practiseTarget('Correctness',id=>id==='lens-review'),'lens-review');
});
test('usual slip names where the lens loses points',()=>{
  const map=computeSkillMap([attempt('dry-run',items('Correctness',[1,1])),attempt('lens-review',items('Correctness',[0],'review'))],now);
  assert.match(usualSlip(map,'Correctness'),/Lens Review/);
});
test('sample history gives the demo a weakest lens',()=>assert.ok(computeSkillMap(sampleHistory).weakest));
test('every sample Lens Review opens a concrete result with the same displayed score',async()=>{
  const { sampleLensAttempt } = await import('../app/bundles/course/codelens/features/skill-map/sample-history.js');
  const { attemptAsDraft } = await import('../app/bundles/course/codelens/review-flow.js');
  const { exercises } = await import('../app/bundles/course/codelens/model.js');
  for(const summary of sampleHistory.filter(s=>s.function==='lens-review')){
    const attempt=sampleLensAttempt(summary.id);
    assert.ok(exercises.some(e=>e.id===attempt.exercise));assert.equal(attempt.sample,true);
    assert.ok(attempt.comments.length);assert.equal(attempt.result.total,summary.score*10);
    assert.equal(Object.values(attempt.result.rubric).reduce((a,b)=>a+b,0),attempt.result.total);
    assert.equal(attemptAsDraft(attempt).savedResult.total,attempt.result.total);
  }
  assert.equal(sampleLensAttempt('missing'),null);
});
test('reopening a review without its draft preserves the saved AI evaluation',async()=>{
  const { attemptAsDraft } = await import('../app/bundles/course/codelens/review-flow.js');
  const result={source:'ai',total:8.25,summary:'Original feedback',improvements:[],rubric:{claim:2.5,evidence:2.5,reasoning:2,fix:1.25}};
  const draft=attemptAsDraft({exercise:'seats',comments:[],result});
  assert.deepEqual(draft.liveResult,result);assert.deepEqual(draft.savedResult,result);
});
test('a Lens Review attempt reopens its own submitted draft, not the latest one',async()=>{
  const { draftForAttempt, attemptAsDraft } = await import('../app/bundles/course/codelens/review-flow.js');
  const comment = id => ({ id, start: 1, end: 2, dimension: 'Efficiency', claim: 'c', reasoning: 'r', fix: 'f' });
  const drafts = {
    old: { exerciseId: 'seats', comments: [comment('a')], submitted: true },
    latest: { exerciseId: 'seats', comments: [comment('b')], submitted: true },
    open: { exerciseId: 'seats', comments: [comment('a')], submitted: false },
  };
  assert.equal(draftForAttempt({ id: 'x', reviewId: 'latest', exercise: 'seats', comments: [] }, drafts), 'latest');
  assert.equal(draftForAttempt({ id: 'y', exercise: 'seats', comments: [comment('a')] }, drafts), 'old');
  const gone = { id: 'z', exercise: 'seats', comments: [comment('c')], focus: ['Efficiency'] };
  assert.equal(draftForAttempt(gone, drafts), null);
  assert.deepEqual(attemptAsDraft(gone), { exerciseId: 'seats', focus: ['Efficiency'], randomFocus: undefined, comments: [comment('c')], noIssues: false, justification: '', submitted: true });
});

test('a lens and a practice mode break down by topic, weakest first, with points earned',()=>{
  const list=[attempt('dry-run',[{lens:'Correctness',value:1,source:'exam',topic:'Loops'},{lens:'Correctness',value:1,source:'exam',topic:'Loops'},{lens:'Correctness',value:0,source:'exam',topic:'Lists & strings'}])];
  const map=computeSkillMap(list,now);
  assert.deepEqual(map.byLens.Correctness.topics.map(t=>[t.topic,t.points,t.items]),[['Lists & strings',0,1],['Loops',2,2]]);
  assert.deepEqual(map.byFunction['dry-run'].topics.map(t=>t.topic),['Lists & strings','Loops']);
  assert.equal(map.byLens.Correctness.points,2);
});
test('the trend averages each of the last four weeks and compares the first and last with practice',()=>{
  const at=(score,days)=>({function:'dry-run',items:[],score,date:new Date(now.getTime()-days*86400000).toISOString()});
  const {weeks,change}=computeSkillMap([at(0.25,25),at(0.75,24),at(1,2)],now).trend;
  assert.deepEqual(weeks.map(w=>w.value),[0.5,null,null,1]);assert.equal(change,0.5);
  assert.equal(computeSkillMap([at(1,2)],now).trend.change,null);
});
test('the sample trend rises week by week',()=>{
  const values=computeSkillMap(sampleHistory).trend.weeks.map(w=>w.value);
  assert.ok(values.every((v,i)=>v!=null&&(i===0||v>values[i-1])));
});
test('Practise opens the topic in an exam-style exercise, or Lens Review with the lens chosen',async()=>{
  const { practiseParams } = await import('../app/bundles/course/codelens/features/skill-map/skills.js');
  const all=()=>true;
  assert.equal(practiseParams('Correctness','Loops',all).params.topicId,'loops');
  assert.deepEqual(practiseParams('Correctness','Conditions & boundaries',all),{id:'lens-review',params:{setup:true,focus:['Correctness'],topic:'Conditions & boundaries'}});
  assert.equal(practiseParams('Efficiency','Lists & membership',all).id,'lens-review');
});
