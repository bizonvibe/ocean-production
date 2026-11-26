import type {ChapterConfig, SfxSpec, Word} from '../../../chapter/types';
import {voiceToChapterMs} from '../../../chapter/timing';
import {timeMap, type TimeMap} from '../../../svg/motion';
import type {FootageSource, SceneSpec} from '../../../templates/types';
import {BASE, STOCK} from './paths';
import * as S from './scenes';
import meta from './voice.json';
import words from './voice.captions.json';
import silences from './voice.silences.json';

/**
 * Глава 1 «Вторжение воздуха в вечный мрак» (сценарий «Кашалоты», 00:00–01:40).
 *
 * Всё строится от таймингов слов озвучки (voice.captions.json из ветки voice):
 * границы планов, якоря анимаций ⚓, драматические паузы, звуки и акцент.
 * Анимации — 9 сцен по ТЗ ocean-animations; стоки ≈ 17 % — 4 плана из ocean-stocks-video.
 */
const W: Word[] = words;
const LEAD_S = 1.5; // проявление из чёрного до первого слова

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}-]+/gu, '');
/** Начало слова (точное совпадение без регистра и знаков), мс файла озвучки. */
const wordMs = (match: string, occ = 1) => {
	const hits = W.filter((w) => norm(w.text) === norm(match));
	if (!hits[occ - 1]) throw new Error(`Глава 2: слово «${match}» (${occ}) не найдено в озвучке`);
	return hits[occ - 1].startMs;
};
const wordEndMs = (match: string, occ = 1) => {
	const s = wordMs(match, occ);
	return W.find((w) => w.startMs === s)!.endMs;
};

const SIL = silences as [number, number][];
/**
 * Пауза после фразы: разрез ставится в середину настоящей тишины в аудио сразу после слова
 * (тайминги WhisperX неточны на границах, поэтому по ним не режем).
 */
const gapAfter = (match: string, padMs: number, occ = 1) => {
	const s = wordMs(match, occ);
	const quiet = SIL.find(([a]) => a >= s);
	if (!quiet) throw new Error(`Глава 2: нет паузы после «${match}»`);
	return {atMs: Math.round((quiet[0] + quiet[1]) / 2), padMs};
};

const gaps = [
	gapAfter('справедливо', 500),
	gapAfter('волосы', 600),
	gapAfter('криля', 800), // криль собирается у уса
	gapAfter('кит', 700), // наезд в голову кашалота
	gapAfter('стейка', 500),
	gapAfter('раны', 800), // затемнение перед финалом
];

const voice = {src: `${BASE}/voice.wav`, durationMs: meta.durationMs, gaps, silences: SIL};
const tmp: ChapterConfig = {id: 'x', voiceover: voice, shots: [], leadInFrames: LEAD_S * 30};

/** Время слова на шкале главы, секунды. */
const at = (match: string, occ = 1) => LEAD_S + voiceToChapterMs(tmp, wordMs(match, occ)) / 1000;
const atEnd = (match: string, occ = 1) => LEAD_S + voiceToChapterMs(tmp, wordEndMs(match, occ)) / 1000;

type Plan = {
	start: number; // секунда главы, с которой план виден
	shot: (dur: number) => SceneSpec;
	/** Для сцен ТЗ: якоря [секунда главы, секунда ТЗ]; первая — начало сцены, последняя — конец. */
	anchors?: [number, number][];
	/** Переход в этот план из предыдущего, кадры (0 — склейка). */
	xIn?: number;
};

const stock = (src: string, credit: string, extra: Partial<FootageSource> = {}) =>
	(dur: number): SceneSpec => ({
		type: 'footage',
		durationInFrames: Math.round(dur * 30),
		footage: {
			src: `${STOCK}/${src}`,
			kind: src.endsWith('.mp4') ? 'video' : 'image',
			credit,
			dim: 0.08,
			zoom: [1.03, 1.12],
			panX: -24,
			...extra,
		},
	});

const anim = (C: React.FC<{tz: TimeMap}>, anchors: () => [number, number][]) => (dur: number, startS: number) => {
	const tz = timeMap(anchors().map(([chapterS, tzS]) => [chapterS - startS, tzS]));
	return {type: 'custom', durationInFrames: Math.round(dur * 30), component: () => <C tz={tz} />} as SceneSpec;
};

// ─── Раскадровка ────────────────────────────────────────────────
const b = {
	blue: at('дрихующих') - 0.3,
	humpback: at('кровавых') - 0.2,
	s02: at('синий') - 0.3,
	baleen: at('эти') - 0.3,
	s03: at('синикит') - 0.3,
	s04: at('вся') - 0.3,
	bubble: at('ему') - 0.3,
	s05: at('кошелот', 1) - 0.4,
	jaw: at('забудьте') - 0.3,
	s06: at('вооружен') - 0.35,
	s07: at('каждый') - 0.3,
	s08: at('кошелот', 3) - 0.3,
	s09: at('чтобы', 2) - 0.3,
};
const END = LEAD_S + voiceToChapterMs(tmp, meta.durationMs) / 1000 + 1.5;

const PLANS: (Plan & {sceneAnchors?: () => [number, number][]; C?: React.FC<{tz: TimeMap}>})[] = [
	{start: 0, C: S.Scene01, sceneAnchors: () => [[0, 0], [at('синего'), 1.6], [at('горбача'), 2.4], [b.blue, 15]], shot: () => null!},
	{start: b.blue, shot: stock('синий-кит.jpg', 'NOAA Fisheries / Wikimedia Commons', {zoom: [1.04, 1.12], panX: -40}), xIn: 18},
	{start: b.humpback, shot: stock('горбач-кормление.jpg', 'Laura White, USGS / Wikimedia Commons', {zoom: [1.12, 1.03], panX: 30}), xIn: 12},
	{
		start: b.s02,
		C: S.Scene02,
		sceneAnchors: () => [[b.s02, 15], [at('зубов'), 17.6], [at('свисают'), 19.2], [at('киротина'), 23.0], [at('ногти'), 25.0], [at('волосы'), 26.3], [b.baleen, 30]],
		shot: () => null!,
		xIn: 12,
	},
	{start: b.baleen, shot: stock('китовый-ус.jpg', 'NOAA Fisheries / Wikimedia Commons', {zoom: [1.03, 1.14], panX: -30}), xIn: 0},
	{
		start: b.s03,
		C: S.Scene03,
		sceneAnchors: () => [[b.s03, 31.8], [at('заглатывает'), 33.4], [at('языком'), 38.4], [at('задерживая'), 41.9], [b.s04, 46]],
		shot: () => null!,
		xIn: 10,
	},
	{start: b.s04, C: S.Scene04, sceneAnchors: () => [[b.s04, 46], [at('автобусов'), 49.5], [at('напасть'), 57.0], [b.bubble, 58.8]], shot: () => null!, xIn: 12},
	{
		start: b.bubble,
		shot: stock('горбач-кормление-пузырьковой-сетью.jpg', 'Christin Khan, NOAA / NEFSC / Wikimedia Commons', {zoom: [1.02, 1.12], panX: -30}),
		xIn: 0,
	},
	{start: b.s05, C: S.Scene05, sceneAnchors: () => [[b.s05, 63.6], [at('кошелот', 1), 64.8], [at('зубатый'), 66.8], [b.jaw, 70]], shot: () => null!, xIn: 10},
	{start: b.jaw, shot: stock('кашалот-нижняя-челюсть-зубы.jpg', 'Soupaloignon95 / Wikimedia Commons, CC0', {zoom: [1.1, 1.02], panX: 30}), xIn: 0},
	{start: b.s06, C: S.Scene06, sceneAnchors: () => [[b.s06, 72.2], [at('вооружен'), 72.6], [at('нижней'), 74.2], [b.s07, 77]], shot: () => null!, xIn: 8},
	{start: b.s07, C: S.Scene07, sceneAnchors: () => [[b.s07, 77.6], [at('зуб'), 78.3], [at('ножом'), 80.6], [b.s08, 85]], shot: () => null!, xIn: 0},
	{
		start: b.s08,
		C: S.Scene08,
		sceneAnchors: () => [[b.s08, 86.2], [at('крупнейший'), 87.9], [at('посет'), 90.5], [b.s09, 99]],
		shot: () => null!,
		xIn: 10,
	},
	{start: b.s09, C: S.Scene09, sceneAnchors: () => [[b.s09, 99], [at('тьме'), 102], [at('арсенал'), 105.5], [END, 110]], shot: () => null!, xIn: 0},
];

const ends = PLANS.map((p, i) => (i + 1 < PLANS.length ? PLANS[i + 1].start : END));
const transitions = PLANS.slice(1).map((p) => p.xIn ?? 10);

const shots: SceneSpec[] = PLANS.map((p, i) => {
	const x = transitions[i] ?? 0; // переход в следующий план съедает x кадров у этого
	const dur = ends[i] - p.start + x / 30;
	return p.C ? anim(p.C, p.sceneAnchors!)(dur, p.start) : p.shot(dur);
});

// ─── Звуки: акценты ТЗ (время ТЗ → время главы через якоря сцен) ──
const sfx: SfxSpec[] = [];
for (const e of S.SCENE_SFX) {
	const plan = PLANS.find(
		(p) =>
			p.sceneAnchors &&
			(() => {
				const a = p.sceneAnchors!();
				return e.tz >= a[0][1] && e.tz < a[a.length - 1][1];
			})(),
	);
	if (!plan) continue;
	const inv = timeMap(plan.sceneAnchors!().map(([c, z]) => [z, c]));
	sfx.push({src: e.src, atMs: Math.round(inv(e.tz) * 1000), volume: e.volume});
}

export const spermWhaleCh02: ChapterConfig = {
	id: 'SpermWhale-ch02',
	voiceover: voice,
	words: W,
	leadInFrames: Math.round(LEAD_S * 30),
	tailFrames: 45,
	shots,
	transitions,
	// Трек −23.8 LUFS, голос −16 LUFS: 0.38 ≈ −16 дБ к голосу.
	music: {src: `${BASE}/music/Floating Cities.mp3`, volume: 0.38, boostInPauses: true, boostVolume: 0.55},
	sfx,
	accents: [{text: 'Биологическое сито', match: 'биологическое', durationMs: 2000, position: 'lower'}],
};

/** Источники для описания ролика. */
export const CREDITS_CH02 = [
	'Blue whale — NOAA Fisheries, Wikimedia Commons, Public domain',
	'Humpback whale and shearwaters feeding — Laura (Laney) White, USGS WERC, Wikimedia Commons, Public domain',
	'Baleen — NOAA Fisheries Service, Wikimedia Commons, Public domain',
	'Humpback whale bubble net feeding — Christin Khan / NOAA / NEFSC, Wikimedia Commons, Public domain',
	'Sperm whale lower jaw — Soupaloignon95, Wikimedia Commons, CC0',
	'Music: «Floating Cities» — Kevin MacLeod (incompetech.com), CC BY 4.0',
	'Voice: Google Gemini TTS (Orus)',
];
