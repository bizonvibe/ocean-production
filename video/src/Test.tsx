import {Composition} from 'remotion';
import {Scene02} from './chapters/sperm-whale/ch01/Scene02';
export const TestComps: React.FC = () => (
	<Composition id="Test-s02" component={() => <Scene02 a={{bus: 2.8, hooks: 5.5}} />} durationInFrames={420} fps={30} width={1920} height={1080} />
);
