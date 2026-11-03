import { Play } from 'lucide-react';
import type { Feature } from '../../features';
import { listAttempts, percent } from '../../practice-log.js';
import DryRunScreen from './DryRun';
const feature: Feature = {
  id: 'dry-run', role: 'student', kind: 'practice', order: 1, label: 'Dry Run', Screen: DryRunScreen,
  card: { icon: Play, lens: 'Correctness', skill: 'Trace the code by hand and predict what it prints.',
    score: () => percent(listAttempts('dry-run').filter((a: any) => a.status === 'submitted').map((a: any) => a.score)) },
  help: { title: 'How Dry Run works', steps: ['Read the code and trace it by hand.', 'Type exactly what you think it prints. A trace table is optional.', 'Submit. Your answer locks and the code really runs.', 'Compare your answer with the real output and read the feedback.'] },
};
export default feature;
