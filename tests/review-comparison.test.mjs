import test from 'node:test';
import assert from 'node:assert/strict';
import { feedbackForAttempt } from '../app/bundles/course/codelens/review-comparison.js';

test('only sent TA feedback for this exact attempt appears in the comparison',()=>{
  const feedback=feedbackForAttempt('mine',[
    {attemptId:'other',sentAt:'2026-11-01',comment:'Unrelated',adjustedScore:10},
    {attemptId:'mine',sentAt:null,comment:'Not sent',adjustedScore:1},
    {attemptId:'mine',sentAt:'2026-11-02',comment:'First comment',adjustedScore:8,editedSummary:'Updated assessment'},
    {attemptId:'mine',sentAt:'2026-11-03',comment:'Second comment',adjustedScore:0}
  ]);
  assert.equal(feedback.available,true);assert.equal(feedback.adjustedScore,0);
  assert.equal(feedback.editedSummary,'Updated assessment');assert.deepEqual(feedback.comments,['First comment','Second comment']);
  assert.equal(feedbackForAttempt('absent',[]).available,false);
  assert.equal(feedbackForAttempt('mine',[{attemptId:'mine',comment:'Draft'}]).available,false);
});
test('sample TA comments are labeled and sent feedback takes precedence',()=>{
  const samples=[{id:'sample',taComment:'Example TA advice'}];
  const example=feedbackForAttempt('sample',[],samples);
  assert.equal(example.sample,true);assert.deepEqual(example.comments,['Example TA advice']);
  const sent=feedbackForAttempt('sample',[{attemptId:'sample',sentAt:'2026-11-03',comment:'Sent advice'}],samples);
  assert.equal(sent.sample,false);assert.deepEqual(sent.comments,['Sent advice']);
});
