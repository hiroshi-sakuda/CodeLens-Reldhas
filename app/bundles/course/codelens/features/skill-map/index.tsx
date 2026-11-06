import type { Feature } from '../../features';
import { SkillMapIcon } from '../../icons';
import SkillMap, { scoreFor } from './SkillMap';
// The suggestion now lives on the Practice card it points to, so there is no separate home panel.
const feature: Feature = { id: 'skill-map', role: 'student', kind: 'page', order: 10, label: 'Skill map', navIcon: SkillMapIcon, Screen: SkillMap, scoreFor };
export default feature;
