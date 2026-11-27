import {Composition} from 'remotion';
import {ChapterVideo} from './chapter/ChapterVideo';
import {ChannelIntro} from './intro/ChannelIntro';
import {chapterDuration, checkChapter} from './chapter/timing';
import type {ChapterConfig} from './chapter/types';
import {exampleCh01} from './chapters/_example/ch01.config';
import {spermWhaleCh01} from './chapters/sperm-whale/ch01/ch01.config';
import {spermWhaleCh02} from './chapters/sperm-whale/ch02/ch02.config';
import {spermWhaleCh03} from './chapters/sperm-whale/ch03/ch03.config';
import {spermWhaleCh04} from './chapters/sperm-whale/ch04/ch04.config';
import {spermWhaleCh05} from './chapters/sperm-whale/ch05/ch05.config';
import {spermWhaleCh06} from './chapters/sperm-whale/ch06/ch06.config';
import {spermWhaleCh07} from './chapters/sperm-whale/ch07/ch07.config';

// Все ролики: 1920×1080, 30 fps. Каждая глава регистрируется здесь (добавить конфиг в CHAPTERS).
const VIDEO = {fps: 30, width: 1920, height: 1080} as const;

const CHAPTERS: ChapterConfig[] = [exampleCh01, spermWhaleCh01, spermWhaleCh02, spermWhaleCh03, spermWhaleCh04, spermWhaleCh05, spermWhaleCh06, spermWhaleCh07];

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
		{/* Заставка канала Coco Crabs (3.2 с) */}
		<Composition id="Intro-CocoCrabs" component={ChannelIntro} durationInFrames={96} {...VIDEO} />
	</>
);
