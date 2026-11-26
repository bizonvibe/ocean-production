import {AnimatedImage} from '../../chapter/AnimatedImage';
import type {ChapterConfig} from '../../chapter/types';
import words from '../../../public/example/voice.captions.json';

/**
 * ДЕМО-ГЛАВА на заглушках: проверка, что сборка работает.
 * Голос — шумовая заглушка (4 с «речи», 6 с паузы, 4 с «речи»), картинка — placeholder.
 * Реальные главы: src/chapters/<проект>/chNN.config.tsx по образцу этого файла.
 */
const IMG = 'example/placeholder.jpg';

export const exampleCh01: ChapterConfig = {
	id: 'Example-ch01',
	voiceover: {src: 'example/voice.mp3', durationMs: 14040},
	words,
	music: {src: 'example/ambient.mp3', boostInPauses: true},
	sfx: [{src: 'example/hit.wav', atMs: 11850, volume: 0.35}],
	accents: [{text: '11 километров', match: 'одиннадцати'}],
	shots: [
		{type: 'custom', durationInFrames: 150, component: () => <AnimatedImage src={IMG} motion="push-in" />},
		{
			type: 'footage',
			durationInFrames: 100,
			footage: {src: IMG, kind: 'image', credit: 'Автор / Pexels', zoom: [1.06, 1.12], panX: -30},
		},
		{type: 'custom', durationInFrames: 120, component: () => <AnimatedImage src={IMG} motion="reveal" />},
		{type: 'custom', durationInFrames: 141, component: () => <AnimatedImage src={IMG} motion="pan-left" />},
	],
};
