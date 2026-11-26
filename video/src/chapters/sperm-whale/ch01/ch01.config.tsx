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
const LEAD_S = 6; // атмосферное вступление до первого слова (ТЗ: 8 с)

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}-]+/gu, '');
/** Начало слова (точное совпадение без регистра и знаков), мс файла озвучки. */
const wordMs = (match: string, occ = 1) => {
	const hits = W.filter((w) => norm(w.text) === norm(match));
	if (!hits[occ - 1]) throw new Error(`Глава 1: слово «${match}» (${occ}) не найдено в озвучке`);
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
	if (!quiet) throw new Error(`Глава 1: нет паузы после «${match}»`);
	return {atMs: Math.round((quiet[0] + quiet[1]) / 2), padMs};
};

const gaps = [
	gapAfter('плоть', 700), // перед «В этой непроглядной тьме…»
	gapAfter('врагов', 1500), // тишина перед первым щелчком
	gapAfter('щелчок', 2600), // щелчки после «…первый щелчок.»
	gapAfter('воздухом', 2400), // выдох перед «Это кашалот.»
	gapAfter('кашалот', 1200), // титр держится
	gapAfter('дна', 1200), // «?» перед финалом
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
	s02: at('можно') - 0.4,
	squid: at('этой') - 0.35,
	s03: at('их') - 0.25,
	s04: at('пока') - 0.4,
	s05: at('потому') - 0.35,
	rise: at('он') - 0.45,
	s06: at('это') - 1.5,
	blowPhoto: at('млекопитающее') - 0.3,
	s07: at('тысячи') - 0.45,
	s08: at('зачем') - 0.3,
	under: at('сегодня') - 0.25,
	s09: at('биоинженерии') - 0.3,
};
const END = LEAD_S + voiceToChapterMs(tmp, meta.durationMs) / 1000 + 1.5;

const PLANS: (Plan & {sceneAnchors?: () => [number, number][]; C?: React.FC<{tz: TimeMap}>})[] = [
	{start: 0, C: S.Scene01, sceneAnchors: () => [[0, 0], [at('если'), 8.0], [b.s02, 14]], shot: () => null!},
	{
		start: b.s02,
		C: S.Scene02,
		sceneAnchors: () => [[b.s02, 14], [at('автобус'), 16.8], [at('крючьями'), 19.5], [b.squid, 28]],
		shot: () => null!,
		xIn: 0,
	},
	{
		start: b.squid,
		shot: stock('глубоководный-кальмар-в-луче-аппарата.mp4', 'NOAA Ocean Exploration', {startFromSeconds: 18, zoom: [1.08, 1.16], panX: 0}),
		xIn: 12,
	},
	{start: b.s03, C: S.Scene03, sceneAnchors: () => [[b.s03, 28.6], [b.s04, 39]], shot: () => null!, xIn: 12},
	{start: b.s04, C: S.Scene04, sceneAnchors: () => [[b.s04, 39.2], [at('щелчок'), 42.6], [b.s05, 47]], shot: () => null!, xIn: 0},
	{start: b.s05, C: S.Scene05, sceneAnchors: () => [[b.s05, 47.2], [b.rise, 58]], shot: () => null!, xIn: 0},
	{start: b.rise, shot: stock('кашалот-всплывает.jpg', 'NOAA Ship Mt. Mitchell / Wikimedia Commons', {zoom: [1.12, 1.02], panX: 20}), xIn: 0},
	{
		start: b.s06,
		C: S.Scene06,
		sceneAnchors: () => [[b.s06, 60.7], [at('кашалот'), 63.2], [b.blowPhoto, 68]],
		shot: () => null!,
		xIn: 10,
	},
	{
		start: b.blowPhoto,
		shot: stock('кашалот-выдох-фонтан.jpg', 'John Bortniak, NOAA Corps / Wikimedia Commons', {zoom: [1.04, 1.14], panX: -30}),
		xIn: 0,
	},
	{
		start: b.s07,
		C: S.Scene07,
		sceneAnchors: () => [[b.s07, 69.2], [at('тысячи'), 70.0], [at('плющить'), 76.8], [b.s08, 81]],
		shot: () => null!,
		xIn: 10,
	},
	{
		start: b.s08,
		C: S.Scene08,
		sceneAnchors: () => [[b.s08, 81], [at('кислород'), 82.1], [at('жуткими'), 85.0], [atEnd('дна'), 87.4], [b.under, 89]],
		shot: () => null!,
		xIn: 15,
	},
	{start: b.under, shot: stock('кашалот-под-водой.jpg', 'Stephen Tuttle, USFWS / Wikimedia Commons', {zoom: [1.02, 1.12], panX: -40}), xIn: 0},
	{start: b.s09, C: S.Scene09, sceneAnchors: () => [[b.s09, 89], [at('живая'), 96.6], [END, 100]], shot: () => null!, xIn: 10},
];

const ends = PLANS.map((p, i) => (i + 1 < PLANS.length ? PLANS[i + 1].start : END));
const transitions = PLANS.slice(1).map((p) => p.xIn ?? 10);

const shots: SceneSpec[] = PLANS.map((p, i) => {
	const x = transitions[i] ?? 0; // переход в следующий план съедает x кадров у этого
	const dur = ends[i] - p.start + x / 30;
	return p.C ? anim(p.C, p.sceneAnchors!)(dur, p.start) : p.shot(dur);
});

// ─── Звуки: акценты ТЗ (время ТЗ → время главы через якоря сцен) + свои подложки ──
const sfx: SfxSpec[] = [
	{src: 'sfx/drone.wav', atMs: 0, volume: 0.35},
	{src: 'sfx/drone.wav', atMs: Math.round(b.s03 * 1000), volume: 0.35},
	{src: 'sfx/clicks.wav', atMs: Math.round((b.s05 + 1.5) * 1000), volume: 0.12},
];
for (const e of S.SCENE_SFX) {
	const plan = PLANS.find((p) => p.sceneAnchors && (() => {
		const a = p.sceneAnchors!();
		return e.tz >= a[0][1] && e.tz < a[a.length - 1][1];
	})());
	if (!plan) continue;
	const inv = timeMap(plan.sceneAnchors!().map(([c, z]) => [z, c]));
	sfx.push({src: e.src, atMs: Math.round(inv(e.tz) * 1000), volume: e.volume});
}

export const spermWhaleCh01: ChapterConfig = {
	id: 'SpermWhale-ch01',
	voiceover: voice,
	words: W,
	leadInFrames: LEAD_S * 30,
	tailFrames: 45,
	shots,
	transitions,
	// Трек −21.6 LUFS, голос −16 LUFS: 0.3 ≈ −16 дБ к голосу; во вступлении 0.45 ≈ −12 дБ.
	music: {src: `${BASE}/music/Echoes of Time v2.mp3`, volume: 0.3, boostInPauses: true, boostVolume: 0.45},
	sfx,
	accents: [{text: 'Дышит воздухом', match: 'дышит', durationMs: 2200, position: 'lower'}],
};

/** Источники для описания ролика (полные лицензии — в LICENSES.txt и «Подбор и лицензия.txt»). */
export const CREDITS_CH01 = [
	'Squid at Congress Seamount — NOAA Ocean Exploration, Public domain',
	'Sperm whale surfacing — Personnel of NOAA Ship MT. MITCHELL, Wikimedia Commons, Public domain',
	'Sperm whale blowing — Commander John Bortniak, NOAA Corps, Wikimedia Commons, Public domain',
	'Sperm whale swimming — Stephen Tuttle, U.S. Fish and Wildlife Service, Wikimedia Commons, Public domain',
	'Music: «Echoes of Time v2» — Kevin MacLeod (incompetech.com), CC BY 4.0',
	'Voice: Google Gemini TTS (Orus)',
];
