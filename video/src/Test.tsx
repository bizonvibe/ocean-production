import {Composition, Sequence} from 'remotion';
import * as S from './chapters/sperm-whale/ch01/scenes';

// Черновая проверка сцен главы 1 по таймингам ТЗ (без озвучки).
const SC: [React.FC<{tz: (t: number) => number}>, number, number][] = [
	[S.Scene01, 0, 14], [S.Scene02, 14, 28], [S.Scene03, 28, 39], [S.Scene04, 39, 47], [S.Scene05, 47, 58],
	[S.Scene06, 58, 68], [S.Scene07, 68, 81], [S.Scene08, 81, 89], [S.Scene09, 89, 100],
];
const All: React.FC = () => (
	<>
		{SC.map(([C, a, b], i) => (
			<Sequence key={i} from={a * 30} durationInFrames={(b - a) * 30}>
				<C tz={(t) => t + a} />
			</Sequence>
		))}
	</>
);
export const TestComps: React.FC = () => (
	<Composition id="Test-tz" component={All} durationInFrames={3000} fps={30} width={1920} height={1080} />
);
