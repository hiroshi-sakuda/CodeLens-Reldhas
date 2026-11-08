import test from 'node:test';
import assert from 'node:assert/strict';
import { assess, exercises, normalizeComment } from '../app/bundles/course/codelens/model.js';
const good = {lenses:['Efficiency'],start:6,end:9,text:'The nested loop scans every booked seat. Every request scans the list, taking O(r*b) time instead of a constant time membership lookup.',fix:'Build a set before the loop.'};
test('empty review earns no credit',()=>assert.equal(assess(exercises[0],[]).total,0));
test('supported review receives four rubric credits',()=>assert.equal(assess(exercises[0],[good]).total,10));
test('unrelated evidence loses evidence credit',()=>assert.equal(assess(exercises[0],[{...good,start:12,end:13}]).rubric.lines,0));
test('duplicate claims cannot inflate score',()=>assert.equal(assess(exercises[0],[good,good]).total,10));
test('wrong focus does not receive claim credit',()=>assert.equal(assess(exercises[0],[{...good,lenses:['Correctness']}]).total,0));
test('several lenses: each wrong extra lens lowers the issue credit',()=>{
  assert.equal(assess(exercises[0],[{...good,lenses:['Efficiency','Correctness']}]).rubric.issue,1.25);
  assert.ok(assess(exercises[0],[{...good,lenses:['Correctness','Appropriateness','Efficiency','Maintainability']}]).total<10);
});
test('one lens that is right for two issues on the same lines keeps full credit',()=>{
  const discount=exercises.find(e=>e.id==='discount');
  const both={lenses:['Correctness'],start:1,end:5,text:'A total of exactly 100 misses the boundary, and a negative total is accepted without validation.',fix:'Use >= and raise ValueError when total < 0.'};
  assert.equal(assess(discount,[both]).total,10);
});
test('naming the issue without saying why loses only the explanation credit',()=>{
  const r=assess(exercises[0],[{...good,text:'The nested loop scans the list.'}]);
  assert.equal(r.rubric.explanation,0);assert.equal(r.total,7.5);
});
test('older annotations with a separate claim and reasoning are graded the same way',()=>{
  const old={dimension:'Efficiency',start:6,end:9,claim:'The nested loop scans every booked seat.',reasoning:'Every request scans the list, taking O(r*b) time instead of a constant time membership lookup.',fix:'Build a set before the loop.'};
  assert.deepEqual(normalizeComment(old).lenses,['Efficiency']);
  assert.equal(assess(exercises[0],[old]).total,10);
});
test('finding only one of two issues cannot earn full marks',()=>assert.equal(assess(exercises[1],[{...good,lenses:['Correctness'],start:3,end:3,text:'The 100 boundary is excluded, so a basket of exactly 100 dollars gets no discount at all.',fix:'Use >= for inclusive comparison'}]).total,5));
import { choosePractice, eligibleExercises, submissionError } from '../app/bundles/course/codelens/review-flow.js';
test('focus selection excludes questions with issues outside chosen areas',()=>{
  assert.deepEqual(eligibleExercises('Random',['Efficiency']).filter(e=>e.findings.length).map(e=>e.id),['seats']);
});
test('empty focus cannot start a chosen-focus review',()=>assert.throws(()=>choosePractice('Random',[],false)));
test('random chooses and freezes focus containing all planted issue types',()=>{
  const config=choosePractice('Conditions & boundaries',[],true,()=>0);
  assert.equal(config.topic,'Conditions & boundaries');
  assert.ok(config.focus.includes('Correctness'));
  assert.deepEqual(JSON.parse(JSON.stringify(config)),config);
});
test('no issues requires a nonblank justification',()=>{
  assert.ok(submissionError({comments:[],submitted:false,noIssues:true,justification:'  '}));
  assert.equal(submissionError({comments:[],submitted:false,noIssues:true,justification:'Checked every requirement.'}),'');
});
test('no issues and annotations are mutually exclusive',()=>assert.ok(submissionError({comments:[good],submitted:false,noIssues:true,justification:'Checked.'})));
test('submitted and unfinished reviews cannot be submitted',()=>{
  assert.ok(submissionError({comments:[good],submitted:true}));
  assert.ok(submissionError({comments:[good],submitted:false},true));
});
test('clean code earns full credit only with an explicit justified conclusion',()=>{
  const clean=exercises.find(e=>e.id==='seats-clean');
  assert.equal(assess(clean,[],{noIssues:true,justification:'Membership uses a set and the comprehension preserves request order.'}).total,10);
  assert.equal(assess(clean,[],{noIssues:true,justification:'  '}).total,0);
  assert.equal(assess(clean,[]).total,0);
  assert.equal(assess(clean,[good],{noIssues:true,justification:'Checked.'}).total,0);
});
test('incorrect no-issues conclusion earns zero',()=>assert.equal(assess(exercises[0],[],{noIssues:true,justification:'Looks fine.'}).total,0));
test('clean review result stays finite and does not invent rubric scores',()=>{
  for(const exercise of exercises.filter(e=>!e.findings.length)) {
    const result=assess(exercise,[],{noIssues:true,justification:'Checked requirements.'});
    assert.equal(result.total,10);
    assert.deepEqual(result.rubric,{});
    assert.ok(Number.isFinite(result.total));
  }
});
test('sample bank covers all four focus areas and two issue-free scenarios',()=>{
  assert.deepEqual([...new Set(exercises.flatMap(e=>e.findings.map(f=>f.dimension)))].sort(),['Appropriateness','Correctness','Efficiency','Maintainability']);
  assert.equal(exercises.filter(e=>!e.findings.length).length,2);
  assert.equal(new Set(exercises.map(e=>e.id)).size,exercises.length);
  for(const e of exercises) for(const f of e.findings) assert.ok(f.start>=1&&f.end>=f.start&&f.end<=e.code.length);
});
test('every topic and focus can start a matching review',()=>{
  for(const topic of new Set(exercises.map(e=>e.topic))) {
    for(const area of ['Appropriateness','Correctness','Efficiency','Maintainability']) {
      const config=choosePractice(topic,[area],false,()=>0.5);
      const exercise=exercises.find(e=>e.id===config.exerciseId);
      assert.equal(exercise.topic,topic);
      assert.ok(exercise.findings.every(f=>f.dimension===area));
    }
  }
});
test('random focus always contains the planted issue types across the bank',()=>{
  for(let i=0;i<exercises.length;i++) {
    const config=choosePractice('Random',[],true,()=>i/exercises.length);
    const exercise=exercises.find(e=>e.id===config.exerciseId);
    assert.ok(config.focus.length>0);
    assert.ok(exercise.findings.every(f=>config.focus.includes(f.dimension)));
  }
});

import { nextPractice } from '../app/bundles/course/codelens/review-flow.js';
test('next exercise preserves explicit criteria and does not repeat the current sample',()=>{
  for(const exercise of exercises) {
    const focus=exercise.findings.length?[...new Set(exercise.findings.map(f=>f.dimension))]:['Efficiency'];
    const next=nextPractice(exercise.id,focus,false,()=>0);
    assert.notEqual(next.exerciseId,exercise.id);
    assert.deepEqual(next.focus,focus);
    assert.equal(next.randomFocus,false);
  }
});
test('next random exercise keeps random mode',()=>{
  const next=nextPractice('seats',['Efficiency'],true,()=>0);
  assert.notEqual(next.exerciseId,'seats');
  assert.equal(next.randomFocus,true);
  assert.ok(next.focus.length>0);
});

test('a realistic review of each Appropriateness and Maintainability exercise earns full marks',()=>{
  const reviews={
    'seats-appropriateness-bisect':['Sorting the list and using binary search is more machinery than this question needs here.','Use a set and not in.'],
    'seats-appropriateness-exceptions':['The code catches a KeyError to detect a free seat, which is a normal outcome here.','Check not in a set.'],
    'seats-maintainability-flag':['The as_text flag makes this one function do two things and return different types.','Split formatting into its own function.'],
    'seats-maintainability-comments':['The comments are misleading because they say booked seats are returned, sorted by row.','Rewrite them to be accurate.'],
    'discount-appropriateness-classes':['A class hierarchy is far too much structure when there is only a single pricing rule.','Use a plain function.'],
    'discount-appropriateness-dict':['A dictionary keyed on True and False is the wrong tool for a choice between two prices.','Use a conditional.'],
    'discount-maintainability-nesting':['The nested branches make the reader keep the outer condition in mind to reach the error.','Use a guard clause.'],
    'discount-maintainability-boolean':['Multiplying by a comparison is a clever trick that makes the discount rule slow to understand.','Write an explicit branch.'],
  };
  for(const [id,[text,fix]] of Object.entries(reviews)) {
    const e=exercises.find(x=>x.id===id);
    assert.equal(e.findings.length,1,id);
    const f=e.findings[0];
    assert.equal(assess(e,[{start:f.start,end:f.end,lenses:[f.dimension],text,fix}]).total,10,id);
  }
});
