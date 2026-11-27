import {buildChapter, musicVolumeFor} from '../../../chapter/build';
import type {Word} from '../../../chapter/types';
import {BASE} from './paths';
import * as S from './scenes';
import meta from './voice.json';
import words from './voice.captions.json';
import silences from './voice.silences.json';

/**
 * Глава 5 «Титаны бездны: битвы с кальмарами и секрет амбры» (сценарий «Кашалоты», 08:00–10:15).
 * 12 сцен ТЗ; стоки ≈ 7 %: пригодны только 3 файла (остальные — CC BY-SA «без переработки» или GIF 358×242).
 * Слова — в том виде, как их распознал WhisperX.
 */
// Трек выбран пользователем: трейлерная музыка с перепадом громкости 21 LU — для подложки под голос
// сделана копия со сжатым диапазоном (компрессор + loudnorm, 6.7 LU, −14.9 LUFS); 144 с — играет один раз.
const MUSIC = musicVolumeFor(-14.9);

export const spermWhaleCh05 = buildChapter({
	id: 'SpermWhale-ch05',
	label: 'Глава 5',
	words: words as Word[],
	silences: silences as [number, number][],
	durationMs: meta.durationMs,
	base: BASE,
	leadS: 1.0,
	gaps: [
		['кракине', 400],
		['краями', 300],
		['секунды', 400],
		['плоти', 300],
		['вверх', 500],
		['байкой', 500],
		['амбра', 600],
	],
	plans: ({at, END}) => {
		const b = {
			s02: at('наука') - 0.35,
			s03: at('головы') - 0.45,
			battleArt: at('глубинах') - 0.45,
			s04: at('гигантский') - 0.35,
			s05: at('но', 1) - 0.35,
			s06: at('антарктических') - 0.45,
			s07: at('шрамы') - 0.35,
			s08: at('может', 1) - 0.35,
			s09: at('однако') - 0.35,
			s10: at('но', 2) - 0.35,
			s11: at('если') - 0.45,
			amber1: at('под') - 0.35,
			s12a: at('амбра', 2) - 0.3,
			amber2: at('небольшой') - 0.35,
			s12b: at('может', 3) - 0.3,
		};
		return [
			{start: 0, scene: S.Scene01, anchors: [[0, 0], [at('кракине'), 2.4], [b.s02, 4.8]]},
			{start: b.s02, xIn: 12, scene: S.Scene02, anchors: [[b.s02, 4.8], [at('тысячи'), 8.2], [at('человеческую'), 11.2], [b.s03, 14.5]]},
			{start: b.s03, xIn: 0, scene: S.Scene03, anchors: [[b.s03, 14.5], [at('круглыми'), 15.6], [at('зубчатыми'), 17.8], [b.battleArt, 20.7]]},
			{
				start: b.battleArt,
				xIn: 0,
				stock: {src: 'кашалот-и-гигантский-кальмар-историческая-иллюстрация.jpg', credit: 'A. Twidle, 1912 / Wikimedia Commons', opts: {zoom: [1.04, 1.16], panX: -30}},
			},
			{start: b.s04, xIn: 10, scene: S.Scene04, anchors: [[b.s04, 22.4], [at('12'), 24.4], [at('захвате'), 26.8], [at('въедается'), 28.4], [b.s05, 31.3]]},
			{start: b.s05, xIn: 0, scene: S.Scene05, anchors: [[b.s05, 31.3], [at('50', 1), 32.4], [at('рывком'), 39.0], [b.s06, 43.4]]},
			{
				start: b.s06,
				xIn: 0,
				scene: S.Scene06,
				anchors: [[b.s06, 43.4], [at('колоссальный'), 44.4], [at('500'), 48.4], [at('вращающимися'), 51.0], [b.s07, 56.3]],
			},
			{start: b.s07, xIn: 0, scene: S.Scene07, anchors: [[b.s07, 56.3], [at('крючей'), 57.0], [at('берут'), 61.8], [b.s08, 65.2]]},
			{
				start: b.s08,
				xIn: 0,
				scene: S.Scene08,
				anchors: [[b.s08, 65.2], [at('анатомически'), 68.0], [at('бартли'), 72.6], [at('байкой'), 79.6], [b.s09, 82.2]],
			},
			{
				start: b.s09,
				xIn: 0,
				scene: S.Scene09,
				anchors: [[b.s09, 82.2], [at('раздавливающие'), 84.6], [at('отсутствие'), 86.2], [at('ферменты'), 87.8], [b.s10, 90.1]],
			},
			{
				start: b.s10,
				xIn: 0,
				scene: S.Scene10,
				anchors: [[b.s10, 90.1], [at('питаются'), 90.8], [at('хитиновые'), 93.4], [at('срыгивает'), 99.6], [b.s11, 103]],
			},
			{
				start: b.s11,
				xIn: 0,
				scene: S.Scene11,
				anchors: [[b.s11, 103], [at('повредить'), 104.4], [at('послойно'), 107.6], [at('дрейфует'), 113.0], [at('амбра', 1), 116.0], [b.amber1, 117.5]],
			},
			{start: b.amber1, xIn: 15, stock: {src: 'амбра-образец-находка.jpg', credit: 'Peter Kaminski / Wikimedia Commons, CC BY 2.0', opts: {zoom: [1.12, 1.02], panX: 30}}},
			{start: b.s12a, xIn: 10, scene: S.Scene12, anchors: [[b.s12a, 118.0], [at('окисляется'), 118.8], [at('парфюмеры'), 124.6], [b.amber2, 127.6]]},
			{start: b.amber2, xIn: 10, stock: {src: 'амбра-образец.jpg', credit: 'Wmpearl / Wikimedia Commons, CC0', opts: {zoom: [1.03, 1.12], panX: -30}}},
			{start: b.s12b, xIn: 10, scene: S.Scene12, anchors: [[b.s12b, 129.3], [at('сотни'), 129.8], [END, 135]]},
		];
	},
	sceneSfx: S.SCENE_SFX,
	music: {
		src: `${BASE}/music/Impending Doom Film Trailer - Doug Maxwell (сжатый диапазон).mp3`,
		volume: MUSIC,
		boostInPauses: true,
		boostVolume: MUSIC * 1.5,
		once: true,
	},
	accents: [{text: 'Жёсткие схватки', match: 'жесткие', durationMs: 2000, position: 'lower'}],
});

export const CREDITS_CH05 = [
	'Sperm whale and giant squid, illustration — A. Twidle (1912), Wikimedia Commons, Public domain',
	'Ambergris — Peter Kaminski, Wikimedia Commons, CC BY 2.0',
	'Ambergris, Skagway Museum — Wmpearl, Wikimedia Commons, CC0',
	'Music: «Impending Doom Film Trailer» — Doug Maxwell / Media Right Productions',
	'Voice: Google Gemini TTS (Orus)',
];
