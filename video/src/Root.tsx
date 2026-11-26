import {Composition} from 'remotion';
import {ChapterVideo} from './chapter/ChapterVideo';
import {chapterDuration, checkChapter} from './chapter/timing';
import type {ChapterConfig} from './chapter/types';
import {exampleCh01} from './chapters/_example/ch01.config';
import {spermWhaleCh01} from './chapters/sperm-whale/ch01/ch01.config';
import {spermWhaleCh02} from './chapters/sperm-whale/ch02/ch02.config';
import {spermWhaleCh03} from './chapters/sperm-whale/ch03/ch03.config';

// Все ролики: 1920×1080, 30 fps. Каждая глава регистрируется здесь (добавить конфиг в CHAPTERS).
const VIDEO = {fps: 30, width: 1920, height: 1080} as const;

const CHAPTERS: ChapterConfig[] = [exampleCh01, spermWhaleCh01, spermWhaleCh02, spermWhaleCh03];

export const RemotionRoot: React.FC = () => (
	<>
		{CHAPTERS.map((c) => {
			checkChapter(c);
			return (
				<Composition
					key={c.id}
					id={c.id}
					component={() => <ChapterVideo config={c} />}
					durationInFrames={chapterDuration(c)}
					{...VIDEO}
				/>
			);
		})}
	</>
);
