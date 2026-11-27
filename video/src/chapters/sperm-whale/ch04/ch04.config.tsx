import {buildChapter, musicVolumeFor} from '../../../chapter/build';
import type {Word} from '../../../chapter/types';
import {BASE} from './paths';
import * as S from './scenes';
import meta from './voice.json';
import words from './voice.captions.json';
import silences from './voice.silences.json';

/**
 * Глава 4 «Инженерия бешеных глубин» (сценарий «Кашалоты», 05:40–08:00).
 * 10 сцен ТЗ (сцена 5 «Fluking up» — фото-сцена, вместо неё настоящая фотография хвоста) + 5 стоков ≈ 14 %.
 * Слова — в том виде, как их распознал WhisperX. Озвучка замедлена на 9 % и с паузами после фраз:
 * в исходной (voice.orig.wav) модель читала почти без пауз, заметно быстрее остальных глав.
 */
// Трек выбран пользователем (−14.1 LUFS, 159.6 с — на 3.6 с короче главы, играет один раз без повтора).
const MUSIC = musicVolumeFor(-14.1);

export const spermWhaleCh04 = buildChapter({
	id: 'SpermWhale-ch04',
	label: 'Глава 4',
	words: words as Word[],
	silences: silences as [number, number][],
	durationMs: meta.durationMs,
	base: BASE,
	leadS: 1.0,
	// Озвучка замедлена (atempo 0.91), паузы после каждой фразы — темп как в остальных главах (~115–120 слов/мин).
	gaps: [
		['метров', 450, 1],
		['атмосфер', 450],
		['насорок', 450],
		['лепешку', 500],
		['млекопитающее', 900],
		['легкие', 450, 1],
		['углом', 450],
		['хвост', 450],
		['пальцев', 500],
		['декомпрессия', 450],
		['крови', 450, 1],
		['ткани', 500],
		['кардинально', 450],
		['выдох', 450],
		['хрящами', 450],
		['легкие', 450, 2],
		['крови', 450, 2],
		['болезни', 600],
		['легкими', 500],
		['крови', 450, 3],
		['цвет', 450],
		['кислорода', 500],
		['плавучести', 450],
		['жир', 450],
		['плотнее', 450],
	],
	plans: ({at, END}) => {
		const b = {
			s02: at('это', 1) - 0.35,
			s03: at('подводная') - 0.35,
			drone: at('выживает') - 0.6,
			rest: at('перед', 1) - 0.35,
			s04: at('его', 1) - 0.35,
			fluke: at('затем') - 0.35,
			s06: at('зазубрены') - 0.35,
			s07: at('при', 1) - 0.35,
			dive: at('кошалот', 1) - 0.35,
			s08: at('перед', 2) - 0.35,
			s09: at('но', 1) - 0.35,
			s10: at('кроме') - 0.35,
			tail: at('кошелот', 2) - 0.35,
			s11: at('окончании') - 0.5,
		};
		return [
			{start: 0, scene: S.Scene01, anchors: [[0, 0], [at('1000'), 2.0], [at('1800'), 7.6], [at('180'), 9.0], [b.s02, 13.4]]},
			{start: b.s02, xIn: 10, scene: S.Scene02, anchors: [[b.s02, 13.4], [at('квадратный'), 14.6], [at('насорок'), 16.8], [b.s03, 20.5]]},
			{start: b.s03, xIn: 0, scene: S.Scene03, anchors: [[b.s03, 20.5], [at('сплющена'), 24.2], [b.drone, 27.5]]},
			{
				start: b.drone,
				xIn: 0,
				stock: {src: 'три-кашалота-начинают-глубокое-погружение-съемка-с-дрона.mp4', credit: 'Melissa Cook / NOAA Fisheries', opts: {startFromSeconds: 4, zoom: [1.04, 1.1], panX: 0}},
			},
			{start: b.rest, xIn: 12, stock: {src: 'кашалот-начало-погружения-фаза-1.jpg', credit: 'David Csepp, NOAA / Wikimedia Commons', opts: {zoom: [1.02, 1.12], panX: -30}}},
			{start: b.s04, xIn: 12, scene: S.Scene04, anchors: [[b.s04, 33.4], [at('смещено'), 34.6], [at('вперед'), 36.8], [b.fluke, 40.5]]},
			{start: b.fluke, xIn: 12, stock: {src: 'кашалот-хвост-над-водой.jpg', credit: 'Whale Watch Kaikoura / Wikimedia Commons, CC BY 4.0', opts: {zoom: [1.12, 1.02], panX: 20}}},
			{start: b.s06, xIn: 0, scene: S.Scene06, anchors: [[b.s06, 45.9], [at('шрамы', 1), 46.4], [at('отпечатки'), 48.0], [b.s07, 50.4]]},
			{
				start: b.s07,
				xIn: 0,
				scene: S.Scene07,
				anchors: [[b.s07, 50.4], [at('азот', 1), 53.0], [at('быстром'), 58.6], [at('закипает'), 59.4], [at('закупывая'), 61.4], [b.dive, 65.1]],
			},
			{start: b.dive, xIn: 0, stock: {src: 'кашалот-начало-погружения-фаза-2.jpg', credit: 'David Csepp, NOAA / Wikimedia Commons', opts: {zoom: [1.03, 1.12], panX: -30}}},
			{
				start: b.s08,
				xIn: 10,
				scene: S.Scene08,
				anchors: [[b.s08, 67.2], [at('выдох'), 68.0], [at('хрящами'), 70.0], [at('сжимает'), 74.0], [at('сплющевая'), 77.0], [at('нет', 1), 80.0], [b.s09, 85.7]],
			},
			{
				start: b.s09,
				xIn: 10,
				scene: S.Scene09,
				anchors: [[b.s09, 85.7], [at('90'), 87.0], [at('мышцах', 1), 91.6], [at('черный'), 98.0], [at('аккумуляторы'), 103.0], [b.s10, 108.1]],
			},
			{
				start: b.s10,
				xIn: 0,
				scene: S.Scene10,
				anchors: [[b.s10, 108.1], [at('теплый'), 110.0], [at('холодную'), 114.0], [at('кристаллизуется'), 118.0], [at('балласт'), 122.0], [b.tail, 125.4]],
			},
			{start: b.tail, xIn: 10, stock: {src: 'кашалот-погружение-хвост.jpg', credit: 'Francesca Grossi / Wikimedia Commons, CC BY 4.0', opts: {zoom: [1.03, 1.14], panX: 0}}},
			{start: b.s11, xIn: 12, scene: S.Scene11, anchors: [[b.s11, 130.4], [at('теплой'), 131.4], [at('тает'), 133.6], [at('всплывает'), 135.4], [END, 140]]},
		];
	},
	sceneSfx: S.SCENE_SFX,
	extraSfx: ({at}) => [{src: 'sfx/blow.wav', atMs: Math.round((at('перед', 1) + 1.2) * 1000), volume: 0.35}],
	music: {src: `${BASE}/music/Ether Oar - The Whole Other.mp3`, volume: MUSIC, boostInPauses: true, boostVolume: MUSIC * 1.5, once: true},
	accents: [{text: 'Fluking up', match: 'флюкинг-ап', durationMs: 2000, position: 'lower'}],
});

export const CREDITS_CH04 = [
	'Three sperm whales begin a deep dive, drone footage — Melissa Cook / NOAA Fisheries SEFSC, Public domain',
	'Sperm whale dive sequence — David Csepp, NOAA/NMFS/AKFSC/ABL, Wikimedia Commons, Public domain',
	'Sperm whale fluke — Whale Watch Kaikoura / Destination Kaikōura, Wikimedia Commons, CC BY 4.0',
	'The breathtaking dive of the sperm whale — Francesca Grossi, Wikimedia Commons, CC BY 4.0',
	'Music: «The Whole Other» — Ether Oar',
	'Voice: Google Gemini TTS (Orus)',
];
