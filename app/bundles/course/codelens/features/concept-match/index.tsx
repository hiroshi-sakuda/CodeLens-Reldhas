import type { Feature } from '../../features';
import { ConceptIcon } from '../../icons';
import { listAttempts, percent } from '../../practice-log.js';
import ConceptMatchScreen, { help } from './ConceptMatch';
import { questions } from './questions.js';
const feature: Feature = {
  id: 'concept-match', role: 'student', kind: 'practice', order: 2, label: 'Concept Match', Screen: ConceptMatchScreen,
  card: { icon: ConceptIcon, items: questions, lens: 'Appropriateness', skill: 'Read a real-world story and choose the concept that fits it.',
    score: () => percent(listAttempts('concept-match').filter((a: any) => a.status === 'submitted').map((a: any) => a.score)) },
  help,
};
export default feature;
