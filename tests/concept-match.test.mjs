import test from 'node:test';
import assert from 'node:assert/strict';
import { hasAny, questionFeedback, setFeedback } from '../app/bundles/course/codelens/features/concept-match/feedback.js';
import { questions } from '../app/bundles/course/codelens/features/concept-match/questions.js';
const q = questions[0];
const wrong = q.options.find(o => o.id !== q.correct).id;
test('library has 10 questions per difficulty, each with options A to D',()=>{
  assert.equal(questions.length,30);
  for (const level of ['easy','medium','hard']) assert.equal(questions.filter(x=>x.difficulty===level).length,10);
  assert.ok(questions.every(x=>x.options.map(o=>o.id).join('')==='ABCD'&&x.options.some(o=>o.id===x.correct)));
});
test('signal words match at the start of a word',()=>{
  assert.ok(hasAny('It overwrites the list',['overwrit']));
  assert.equal(hasAny('A strong belief',['elif']),false);
});
test('a reason with a signal word is good and quoted',()=>{
  const reason=`Because of ${q.reasonSignals[0]}.`;
  const f=questionFeedback(q,q.correct,reason);
  assert.equal(f.reasonRating,'good');assert.ok(f.correct);assert.ok(f.comment.includes(q.reasonSignals[0]));
});
test('a good reason on the wrong option asks a question',()=>{
  const f=questionFeedback(q,wrong,`Because of ${q.reasonSignals[0]}`);
  assert.equal(f.correct,false);assert.ok(f.comment.endsWith('?'));
});
test('a reason without a signal word is partly',()=>assert.equal(questionFeedback(q,q.correct,'zzz qqq').reasonRating,'partly'));
test('a blank reason is missing',()=>assert.equal(questionFeedback(q,q.correct,'  ').reasonRating,'missing'));
test('set score counts correct options',()=>{
  const set=questions.slice(0,5);
  const f=setFeedback(set,{[set[0].id]:set[0].correct,[set[1].id]:set[1].correct},{});
  assert.equal(f.correctCount,2);assert.equal(f.questions.length,5);
});
