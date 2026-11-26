import {buildChapter, musicVolumeFor} from '../../../chapter/build';
import type {Word} from '../../../chapter/types';
import {BASE} from './paths';
import * as S from './scenes';
import meta from './voice.json';
import words from './voice.captions.json';
import silences from './voice.silences.json';

/**
 * Глава 6 «Сверхмозг, клановая культура и морская морзянка» (сценарий «Кашалоты», 10:15–12:30).
 * 11 сцен ТЗ + 3 стока ≈ 8 % (остальные файлы папки — CC BY-SA «без переработки»).
 * После «…называют их кодами» — пауза с настоящей записью код кашалотов (NOAA).
 */
const MUSIC = musicVolumeFor(-22.7); // «Atlantean Twilight»
const CODAS = 'кашалот-коды-общения-щелчки-и-спектрограмма.mp4';

export const spermWhaleCh06 = buildChapter({
	id: 'SpermWhale-ch06',
	label: 'Глава 6',
	words: words as Word[],
	silences: silences as [number, number][],
	durationMs: meta.durationMs,
	base: BASE,
	leadS: 1.0,
	gaps: [
		['килограммов', 400, 2],
		['раньше', 400],
		['общины', 300],
		['малыша', 400],
		['кодами', 2800], // слушаем настоящие коды
		['клана', 400],
		['языка', 400],
		['жизнь', 300],
	],
	plans: ({at, END}) => {
		const b = {
			s02: at('мозг', 3) - 0.4,
			drone: at('социальное') - 0.4,
			s03: at('взрослые') - 0.35,
			s04: at('поскольку') - 0.4,
			photo: at('кошелоты', 1) - 0.35,
			s05: at('напоминающими') - 0.35,
			codas: at('ученые', 2) - 0.35 - 2.9, // вставленная пауза 2.8 с после «кодами»
			s06: at('ученые', 2) - 0.35,
			s07: at('проект') - 0.35,
			s08: at('детеныш', 2) - 0.35,
			s09: at('он', 2) - 0.35,
			s10: at('молодые') - 0.35,
			s11: at('возраст') - 0.35,
		};
		return [
			{start: 0, scene: S.Scene01, anchors: [[0, 0], [at('самый'), 1.0], [at('8'), 6.0], [at('мозг', 2), 8.6], [b.s02, 13.7]]},
			{
				start: b.s02,
				xIn: 10,
				scene: S.Scene02,
				anchors: [
					[b.s02, 13.7],
					[at('веретиновидных'), 17.0],
					[at('эмоции'), 21.0],
					[at('социальные'), 22.6],
					[at('эмпатию'), 24.0],
					[at('привязанность'), 25.0],
					[at('больше'), 27.6],
					[b.drone, 34.5],
				],
			},
			{
				start: b.drone,
				xIn: 15,
				stock: {src: 'группа-кашалотов-плывет-у-поверхности-съемка-с-дрона.mp4', credit: 'Melissa Cook / NOAA Fisheries', opts: {startFromSeconds: 40, zoom: [1.04, 1.1], panX: 0}},
			},
			{start: b.s03, xIn: 12, scene: S.Scene03, anchors: [[b.s03, 36.4], [at('кочевники'), 37.4], [at('приплывают'), 40.6], [at('самки', 1), 44.6], [b.s04, 49.7]]},
			{
				start: b.s04,
				xIn: 10,
				scene: S.Scene04,
				anchors: [[b.s04, 49.7], [at('погружаться'), 50.4], [at('нянек'), 55.4], [at('мать'), 57.0], [at('охраняют'), 61.0], [b.photo, 65.9]],
			},
			{start: b.photo, xIn: 10, stock: {src: 'кашалоты-общаются-у-поверхности.jpg', credit: 'Will Falcon / Wikimedia Commons, CC BY 4.0', opts: {zoom: [1.03, 1.14], panX: -30}}},
			{start: b.s05, xIn: 0, scene: S.Scene05, anchors: [[b.s05, 66.8], [at('азбуку'), 69.6], [at('кодами'), 71.8], [b.codas, 73.7]]},
			{start: b.codas, xIn: 0, stock: {src: CODAS, credit: 'NOAA Fisheries', opts: {startFromSeconds: 0.5, zoom: [1.36, 1.42], panX: 0, origin: 'center 42%'}}},
			{
				start: b.s06,
				xIn: 0,
				scene: S.Scene06,
				anchors: [[b.s06, 73.7], [at('тихого'), 75.6], [at('карибского'), 77.8], [at('диалекты'), 81.0], [at('старшие'), 85.0], [b.s07, 91.4]],
			},
			{start: b.s07, xIn: 10, scene: S.Scene07, anchors: [[b.s07, 91.4], [at('машинные'), 93.6], [at('расшифровки'), 95.6], [b.s08, 98.6]]},
			{start: b.s08, xIn: 0, scene: S.Scene08, anchors: [[b.s08, 98.6], [at('хвостом'), 99.4], [at('4'), 104.4], [at('тонны'), 107.6], [b.s09, 109.8]]},
			{start: b.s09, xIn: 12, scene: S.Scene09, anchors: [[b.s09, 109.8], [at('высокой'), 111.8], [b.s10, 115.6]]},
			{start: b.s10, xIn: 0, scene: S.Scene10, anchors: [[b.s10, 115.6], [at('покидают'), 116.6], [at('остаются', 2), 120.6], [b.s11, 124.3]]},
			{start: b.s11, xIn: 12, scene: S.Scene11, anchors: [[b.s11, 124.3], [at('70'), 125.4], [at('слоям'), 128.4], [at('кольцам'), 131.4], [END, 135]]},
		];
	},
	sceneSfx: S.SCENE_SFX,
	extraSfx: ({at}) => {
		const start = at('ученые', 2) - 0.35 - 2.9;
		return [{src: `${BASE}/stock/${CODAS}`, atMs: Math.round(start * 1000), startFromSeconds: 0.5, durationSeconds: at('ученые', 2) - 0.35 - start, volume: 0.8}];
	},
	music: {src: `${BASE}/music/Atlantean Twilight.mp3`, volume: MUSIC, boostInPauses: false},
	accents: [{text: '8 килограммов', match: '8', durationMs: 2000, position: 'upper'}],
});

export const CREDITS_CH06 = [
	'Sperm whale group, drone footage — Melissa Cook / NOAA Fisheries SEFSC, Public domain',
	'Sperm whales communicating at the surface — Will Falcon (Vitaly Sokol), Wikimedia Commons, CC BY 4.0',
	'Sperm whale codas, clicks and spectrogram — M. Bowers, L. Dias, G. Rappucci, L. Hodge / NOAA Fisheries, Public domain (Permit #27867)',
	'Music: «Atlantean Twilight» — Kevin MacLeod (incompetech.com), CC BY 4.0',
	'Voice: Google Gemini TTS (Orus)',
];
