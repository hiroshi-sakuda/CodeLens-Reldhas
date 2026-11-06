import test from 'node:test';
import assert from 'node:assert/strict';
import { assess, dimensions, exercises } from '../app/bundles/course/codelens/model.js';
import { commentFeedback } from '../app/bundles/course/codelens/lens-feedback.js';
import { goodReview, wrongReview } from '../app/bundles/course/codelens/lens-demo.js';
import { demoAnswer, questionFeedback } from '../app/bundles/course/codelens/features/concept-match/feedback.js';
import { questions as conceptQuestions } from '../app/bundles/course/codelens/features/concept-match/questions.js';
import { questions as dryQuestions } from '../app/bundles/course/codelens/features/dry-run/questions.js';
const seats = exercises.find(e => e.id === 'seats');
const good = { id: 'c', dimension: 'Efficiency', start: 6, end: 9, claim: 'The nested loop scans every booked seat.', reasoning: 'Every request scans the list, taking O(r*b) time.', fix: 'Build a set before the loop.' };
const conclude = (exercise, review) => assess(exercise, review.comments, { noIssues: review.noIssues, justification: review.justification });

test('a found issue gets one point each on claim, lines, reasoning and fix',()=>{
  const f=commentFeedback(seats,good);
  assert.equal(f.result,'found');assert.equal(f.points.length,4);
  assert.ok(f.points[0].includes('nested loop scans'));
});
test('a weak fix and short reasoning are asked about as questions',()=>{
  const f=commentFeedback(seats,{...good,reasoning:'Slow.',fix:'Change it.'});
  assert.ok(f.points[2].endsWith('?')||f.points[2].endsWith('.'));
  assert.ok(f.points[3].startsWith('How would you change'));
});
test('wrong lines, wrong lens, unnamed issues and non-issues are told apart',()=>{
  assert.equal(commentFeedback(seats,{...good,start:1,end:1}).result,'found');
  assert.equal(commentFeedback(seats,{...good,dimension:'Correctness'}).result,'wrong-lens');
  assert.equal(commentFeedback(seats,{...good,claim:'Odd style here'}).result,'unclear');
  assert.equal(commentFeedback(seats,{...good,dimension:'Correctness',claim:'x',start:12,end:13}).result,'not-an-issue');
});
test('the good demo review scores 10 on every Lens Review exercise',()=>{
  for(const e of exercises) assert.equal(conclude(e,goodReview(e)).total,10,e.id);
});
test('the wrong demo review scores low on every Lens Review exercise',()=>{
  for(const e of exercises) assert.ok(conclude(e,wrongReview(e,dimensions)).total<=2.5,e.id);
});
test('Dry Run demo wrong answer is a known mistake on every question',()=>{
  for(const q of dryQuestions) assert.ok(q.commonMistakes.length>0,q.id);
});
test('Concept Match demo answers give a good and a wrong result on every question',()=>{
  for(const q of conceptQuestions){
    const g=demoAnswer(q,'good');const fg=questionFeedback(q,g.choice,g.reason);
    assert.ok(fg.correct&&fg.reasonRating==='good',q.id);
    const w=demoAnswer(q,'wrong');const fw=questionFeedback(q,w.choice,w.reason);
    assert.ok(!fw.correct&&fw.reasonRating==='partly',q.id);
  }
});
