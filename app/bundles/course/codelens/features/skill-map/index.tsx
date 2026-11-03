import type { Feature, ScreenProps } from '../../features';
import SkillMap, { scoreFor, Suggestion } from './SkillMap';
const feature: Feature = {
  id: 'skill-map', role: 'student', kind: 'page', order: 10, label: 'Skill Map', Screen: SkillMap, scoreFor,
  HomePanel: (props: ScreenProps) => <Suggestion {...props} heading="Suggested for you"/>,
};
export default feature;
