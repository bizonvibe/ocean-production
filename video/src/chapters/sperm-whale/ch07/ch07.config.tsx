import {buildChapter, musicVolumeFor} from '../../../chapter/build';
import type {Word} from '../../../chapter/types';
import {BASE} from './paths';
import * as S from './scenes';
import meta from './voice.json';
import words from './voice.captions.json';
import silences from './voice.silences.json';

/**
 * Глава 7 «Застывшие монолиты, оборона и экологический двигатель планеты» (сценарий «Кашалоты», 12:30–15:00).
 * 10 сцен ТЗ (сцена 9 разрезана двумя фото: дно с костями кита и черви Osedax) + 4 стока ≈ 10 %.
 */
const MUSIC = musicVolumeFor(-22.5); // «Dreams Become Real»

export const spermWhaleCh07 = buildChapter({
	id: 'SpermWhale-ch07',
	label: 'Глава 7',
	words: words as Word[],
	silences: silences as [number, number][],
	durationMs: meta.durationMs,
	base: BASE,
	leadS: 1.0,
	gaps: [
		['утонуть', 400],
		['инопланетно', 400],
		['времени', 600],
		['детенышей', 400],
		['позвоночник-косатки', 600],
		['революции', 300],
		['дик', 500],
		['промысел', 500],
		['газ', 600],
		['моллюсков', 800],
	],
	plans: ({at, END}) => {
		const b = {
			s02: at('стадокитов') - 0.4,
			orcas: at('единственный') - 0.4,
			s03: at('но', 2) - 0.35,
			s04: at('этот', 1) - 0.45,
			era: at('18-20') - 0.5,
			s05: at('пермоцетовое') - 0.5,
			s06: at('1820') - 0.6,
			s07: at('лишь', 2) - 0.35,
			s08: at('сегодня') - 0.4,
			s09a: at('после') - 0.45,
			bones: at('останки') - 0.35,
			worms: at('давая') - 0.3,
			s09b: at('сотням') - 0.5,
			s10: at('кошелоты', 3) - 0.4,
		};
		return [
			{start: 0, scene: S.Scene01, anchors: [[0, 0], [at('однополушарный'), 4.0], [b.s02, 10.8]]},
			{start: b.s02, xIn: 12, scene: S.Scene02, anchors: [[b.s02, 10.8], [at('10-15'), 13.4], [at('монолиты'), 20.6], [at('7'), 25.4], [b.orcas, 29.4]]},
			{start: b.orcas, xIn: 0, stock: {src: 'косатки-на-поверхности.jpg', credit: 'Minette Layne / Wikimedia Commons, CC BY 2.0', opts: {zoom: [1.04, 1.14], panX: -30}}},
			{start: b.s03, xIn: 10, scene: S.Scene03, anchors: [[b.s03, 32.6], [at('рискнут'), 34.6], [at('атаковать'), 38.6], [b.s04, 44.2]]},
			{
				start: b.s04,
				xIn: 10,
				scene: S.Scene04,
				anchors: [[b.s04, 44.2], [at('круговую'), 45.6], [at('маргаритка'), 46.8], [at('головами', 2), 51.0], [at('четырехметровые'), 55.6], [at('удар'), 58.6], [b.era, 62.8]],
			},
			{start: b.era, xIn: 15, stock: {src: 'китобойный-промысел-историческая-гравюра.jpg', credit: 'Wikimedia Commons, Public domain', opts: {zoom: [1.03, 1.14], panX: -30}}},
			{start: b.s05, xIn: 12, scene: S.Scene05, anchors: [[b.s05, 65.6], [at('дыма'), 66.8], [at('смазывало'), 69.4], [b.s06, 73.6]]},
			{start: b.s06, xIn: 0, scene: S.Scene06, anchors: [[b.s06, 73.6], [at('протаранил'), 77.4], [at('потопил'), 80.0], [at('моби'), 85.0], [b.s07, 88.3]]},
			{start: b.s07, xIn: 0, scene: S.Scene07, anchors: [[b.s07, 88.3], [at('1986'), 91.0], [b.s08, 95.3]]},
			{
				start: b.s08,
				xIn: 12,
				scene: S.Scene08,
				anchors: [[b.s08, 95.3], [at('питаясь'), 97.6], [at('железо'), 101.6], [at('бурный'), 104.6], [at('кислорода'), 108.4], [at('поглощает'), 113.4], [b.s09a, 117.2]],
			},
			{start: b.s09a, xIn: 0, scene: S.Scene09, anchors: [[b.s09a, 117.2], [at('whale'), 121.0], [b.bones, 124.2]]},
			{start: b.bones, xIn: 12, stock: {src: 'китовый-падеж-осьминоги.jpg', credit: 'National Marine Sanctuaries / Wikimedia Commons, CC BY 2.0', opts: {zoom: [1.03, 1.12], panX: -24}}},
			{start: b.worms, xIn: 10, stock: {src: 'osedax-frankpressi-черви-на-кости.jpg', credit: 'R. Vrijenhoek, S. Johnson, G. Rouse / BMC Biology, CC BY 2.0', opts: {zoom: [1.12, 1.02], panX: 20}}},
			{start: b.s09b, xIn: 12, scene: S.Scene09, anchors: [[b.s09b, 129.9], [at('сотням'), 130.4], [b.s10, 135.3]]},
			{start: b.s10, xIn: 15, scene: S.Scene10, anchors: [[b.s10, 135.3], [at('инопланетным'), 137.0], [at('вглядеться'), 142.0], [END, 150]]},
		];
	},
	sceneSfx: S.SCENE_SFX,
	music: {src: `${BASE}/music/Dreams Become Real.mp3`, volume: MUSIC, boostInPauses: true, boostVolume: MUSIC * 1.5},
	accents: [{text: 'Косатки', match: 'косатки', durationMs: 1800, position: 'lower'}],
});

export const CREDITS_CH07 = [
	'Orcas at the surface — Minette Layne, Wikimedia Commons, CC BY 2.0',
	'Historical whaling engraving — Wikimedia Commons, Public domain',
	'Whale fall with octopuses — National Marine Sanctuaries, Wikimedia Commons, CC BY 2.0',
	'Osedax frankpressi on bone — R. C. Vrijenhoek, S. B. Johnson, G. W. Rouse, BMC Biology, CC BY 2.0',
	'Music: «Dreams Become Real» — Kevin MacLeod (incompetech.com), CC BY 4.0',
	'Voice: Google Gemini TTS (Orus)',
];
