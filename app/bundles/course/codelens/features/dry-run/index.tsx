import type { Feature } from '../../features';
import { DryRunIcon } from '../../icons';
import { listAttempts, percent } from '../../practice-log.js';
import DryRunScreen, { help } from './DryRun';
import { questions } from './questions.js';
const feature: Feature = {
  id: 'dry-run', role: 'student', kind: 'practice', order: 1, label: 'Dry Run', Screen: DryRunScreen,
  card: { icon: DryRunIcon, items: questions, lens: 'Correctness', skill: 'Trace the code by hand and predict what it prints.',
    score: () => percent(listAttempts('dry-run').filter((a: any) => a.status === 'submitted').map((a: any) => a.score)) },
  help,
};
export default feature;
