import test from 'node:test';
import assert from 'node:assert/strict';
import { assess, dimensions, exercises } from '../app/bundles/course/codelens/model.js';
import { commentFeedback, overallFeedback } from '../app/bundles/course/codelens/lens-feedback.js';
import { goodReview, wrongReview } from '../app/bundles/course/codelens/lens-demo.js';
import { dryRunFeedback, dryRunPoints } from '../app/bundles/course/codelens/features/dry-run/feedback.js';
import { demoAnswer, questionFeedback } from '../app/bundles/course/codelens/features/concept-match/feedback.js';
import { questions as conceptQuestions } from '../app/bundles/course/codelens/features/concept-match/questions.js';
import { questions as dryQuestions } from '../app/bundles/course/codelens/features/dry-run/questions.js';
const seats = exercises.find(e => e.id === 'seats');
const good = { id: 'c', dimension: 'Efficiency', start: 6, end: 9, claim: 'The nested loop scans every booked seat.', reasoning: 'Every request scans the list, taking O(r*b) time.', fix: 'Build a set before the loop.' };
const conclude = (exercise, review) => assess(exercise, review.comments, { noIssues: review.noIssues, justification: review.justification });

test('a found issue praises claim, lines, reasoning and fix',()=>{
  const f=commentFeedback(seats,good);
  assert.equal(f.result,'found');assert.equal(f.good.length,4);assert.equal(f.improve.length,0);
  assert.ok(f.good[0].includes('nested loop scans'));
});
test('a weak fix and short reasoning become improvements, phrased as questions',()=>{
  const f=commentFeedback(seats,{...good,reasoning:'Slow.',fix:'Change it.'});
  assert.equal(f.improve.length,2);assert.ok(f.improve.every(p=>p.endsWith('?')||p.endsWith('.')));
});
test('wrong lines, wrong lens and unnamed issues are told apart',()=>{
  assert.equal(commentFeedback(seats,{...good,start:1,end:1}).result,'found');
  assert.equal(commentFeedback(seats,{...good,dimension:'Correctness'}).result,'wrong-lens');
  assert.equal(commentFeedback(seats,{...good,claim:'Odd style here'}).result,'unclear');
  assert.equal(commentFeedback(seats,{...good,dimension:'Correctness',claim:'x',start:12,end:13}).result,'not-an-issue');
});
test('overall feedback reports missed issues and the no-issues conclusion',()=>{
  assert.ok(overallFeedback(seats,0).improve[0].startsWith('You missed 1 issue'));
  const clean=exercises.find(e=>!e.findings.length);
  assert.equal(overallFeedback(clean,0,{noIssues:true,justification:'Checked it.'}).good.length,1);
  assert.equal(overallFeedback(seats,0,{noIssues:true,justification:'x'}).improve.length,1);
});
test('the good demo review scores 10 on every Lens Review exercise',()=>{
  for(const e of exercises) assert.equal(conclude(e,goodReview(e)).total,10,e.id);
});
test('the wrong demo review scores low on every Lens Review exercise',()=>{
  for(const e of exercises) assert.ok(conclude(e,wrongReview(e,dimensions)).total<=2.5,e.id);
});
test('Dry Run points name right lines and the first wrong line',()=>{
  const fb={correct:false,actualOutput:'1\n2\n3',trace:undefined};
  const p=dryRunPoints('1\n5\n3',fb);
  assert.equal(p.good[0],'2 of 3 lines are right.');
  assert.ok(p.improve[0].startsWith('Line 2: you wrote “5”'));
  assert.ok(dryRunPoints('1\n2',fb).improve[0].startsWith('Line 3 is missing'));
});
test('a correct Dry Run has no improvement about the output',()=>{
  const fb=dryRunFeedback(dryQuestions[0],'12','12');
  assert.deepEqual(dryRunPoints('12',fb),{good:['Your prediction matches the real output exactly.'],improve:[]});
});
test('Dry Run demo wrong answer is a known mistake on every question',()=>{
  for(const q of dryQuestions) assert.ok(q.commonMistakes.length>0,q.id);
});
test('Concept Match demo answers give a good and a wrong result on every question',()=>{
  for(const q of conceptQuestions){
    const g=demoAnswer(q,'good');const fg=questionFeedback(q,g.choice,g.reason);
    assert.ok(fg.correct&&fg.reasonRating==='good'&&fg.improve.length===0,q.id);
    const w=demoAnswer(q,'wrong');const fw=questionFeedback(q,w.choice,w.reason);
    assert.ok(!fw.correct&&fw.improve.length===2,q.id);
  }
});
