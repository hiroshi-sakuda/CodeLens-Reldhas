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
