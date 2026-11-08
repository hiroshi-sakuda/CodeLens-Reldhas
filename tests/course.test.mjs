import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultCourse, eligibleItems, isUnlocked, pickItems } from '../app/bundles/course/codelens/course.js';
const items = [{id:'a',difficulty:'easy',topicId:'loops'},{id:'b',difficulty:'easy',topicId:'lists-strings'},{id:'c',difficulty:'hard',topicId:'loops'}];
test('only published topics at this difficulty are eligible',()=>assert.deepEqual(eligibleItems(items,'easy',['loops']).map(i=>i.id),['a']));
test('exercises not done yet come first',()=>assert.equal(pickItems(items.slice(0,2),1,['a'])[0].id,'b'));
test('repeats are allowed once everything is done',()=>assert.equal(pickItems(items.slice(0,2),2,['a','b']).length,2));
test('nothing is gated before a TA uses Content Studio',()=>assert.ok(isUnlocked('dry-run',defaultCourse())));
test('a function needs the required number of approved examples',()=>{
  assert.equal(isUnlocked('dry-run',{...defaultCourse(),approved:{'dry-run':2}}),false);
  assert.ok(isUnlocked('dry-run',{...defaultCourse(),examplesRequired:2,approved:{'dry-run':2}}));
});

test('only topics with something at this level can be chosen',async()=>{
  const { availableTopics } = await import('../app/bundles/course/codelens/course.js');
  const items=[{difficulty:'easy',topicId:'loops'},{difficulty:'hard',topicId:'lists-strings'}];
  assert.deepEqual(availableTopics(items,'easy',['loops','lists-strings']),['loops']);
  assert.deepEqual(availableTopics(items,'hard',['loops']),[]);
});
test('Lens Review offers topics with an issue to find, and only the lenses that topic has',async()=>{
  const { lensesWithIssues, reviewTopics } = await import('../app/bundles/course/codelens/review-flow.js');
  const bank=[{topic:'A',findings:[{dimension:'Efficiency'}]},{topic:'A',findings:[]},{topic:'B',findings:[{dimension:'Correctness'}]},{topic:'C',findings:[]}];
  assert.deepEqual(reviewTopics(bank),['A','B']);
  assert.deepEqual(lensesWithIssues('A',bank),['Efficiency']);
  assert.deepEqual(lensesWithIssues('C',bank),[]);
  assert.deepEqual(lensesWithIssues('',bank),['Correctness','Efficiency']);
});
test('every lens offered for a topic can lead to a real issue in the sample exercises',async()=>{
  const { lensesWithIssues, reviewTopics, eligibleExercises } = await import('../app/bundles/course/codelens/review-flow.js');
  const { exercises } = await import('../app/bundles/course/codelens/model.js');
  for(const topic of reviewTopics(exercises)) for(const lens of lensesWithIssues(topic,exercises))
    assert.ok(eligibleExercises(topic,[lens],exercises).some(e=>e.findings.length),topic+' / '+lens);
});
