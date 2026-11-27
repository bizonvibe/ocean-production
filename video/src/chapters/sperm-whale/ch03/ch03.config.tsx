import type {ChapterConfig, SfxSpec, Word} from '../../../chapter/types';
import {musicVolumeFor} from '../../../chapter/build';
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
const CH06 = 'projects/sperm-whale/ch06/stock'; // заимствованное видео (в главе 6 не повторять)
// Трек выбран пользователем (−13.2 LUFS, 122 с): громкость ≈ −16 дБ к голосу; повтор с плавным переходом.
const MUSIC_VOL = musicVolumeFor(-13.2);
const LEAD_S = 1.0; // проявление из чёрного до первого слова

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}-]+/gu, '');
/** Начало слова (точное совпадение без регистра и знаков), мс файла озвучки. */
const wordMs = (match: string, occ = 1) => {
	const hits = W.filter((w) => norm(w.text) === norm(match));
	if (!hits[occ - 1]) throw new Error(`Глава 3: слово «${match}» (${occ}) не найдено в озвучке`);
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
	if (!quiet) throw new Error(`Глава 3: нет паузы после «${match}»`);
	return {atMs: Math.round((quiet[0] + quiet[1]) / 2), padMs};
};

const gaps = [
	gapAfter('блоком', 300),
	gapAfter('whale', 500),
	gapAfter('груз', 700), // вопрос повисает
	gapAfter('эхолокатор', 300),
	gapAfter('поймана', 600), // тишина после «buzz»
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
			src: src.startsWith('projects/') ? src : `${STOCK}/${src}`,
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
	s01: at('отличие') - 0.4,
	s02: at('это', 1) - 0.3,
	s03: at('ранние') - 0.3,
	s04: at('холодном') - 0.45,
	s05: at('самом') - 0.5,
	why: at('зачем') - 0.3,
	s06: at('обесальной') - 0.4,
	s07: at('районе') - 0.4,
	s08: at('пермоцет', 1) - 0.5,
	s09: at('мощность') - 0.3,
	s10: at('щелчок', 1) - 0.3,
	s11: at('долгое') - 0.3,
	echo: at('поэтому') - 0.3,
	s12: at('поиске') - 0.6,
	s13: at('этом', 1) - 0.5,
};
const END = LEAD_S + voiceToChapterMs(tmp, meta.durationMs) / 1000 + 1.5;

const PLANS: (Plan & {sceneAnchors?: () => [number, number][]; C?: React.FC<{tz: TimeMap}>})[] = [
	{start: 0, shot: stock('кашалот-профиль-головы.jpg', 'Cianc / Wikimedia Commons, CC BY 2.0', {zoom: [1.02, 1.14], panX: -30})},
	{
		start: b.s01,
		C: S.Scene01,
		sceneAnchors: () => [[b.s01, 2.2], [at('дельфинов'), 3.0], [at('акул'), 3.6], [at('конус'), 4.6], [at('прямоугольным'), 6.6], [b.s02, 9.3]],
		shot: () => null!,
		xIn: 12,
	},
	{start: b.s02, C: S.Scene02, sceneAnchors: () => [[b.s02, 9.3], [at('контейнер'), 11.0], [at('сопротивление'), 13.4], [b.s03, 16.4]], shot: () => null!, xIn: 12},
	{
		start: b.s03,
		C: S.Scene03,
		sceneAnchors: () => [[b.s03, 16.4], [at('огромный', 1), 18.4], [at('однако'), 20.0], [at('резервуар'), 21.2], [at('сотними'), 22.8], [b.s04, 25.4]],
		shot: () => null!,
		xIn: 0,
	},
	{
		start: b.s04,
		C: S.Scene04,
		sceneAnchors: () => [[b.s04, 25.4], [at('холодном'), 26.8], [at('белый'), 28.0], [at('кетабои', 2), 29.4], [at('sperm'), 31.2], [b.s05, 33.6]],
		shot: () => null!,
		xIn: 0,
	},
	{
		start: b.s05,
		C: S.Scene05,
		sceneAnchors: () => [[b.s05, 33.6], [at('акустическая', 1), 34.0], [at('спермоцетовый'), 36.4], [at('джанг'), 39.8], [at('подобно', 1), 42.0], [b.why, 45.3]],
		shot: () => null!,
		xIn: 0,
	},
	{
		start: b.why,
		shot: stock(`${CH06}/группа-кашалотов-плывет-у-поверхности-съемка-с-дрона.mp4`, 'Melissa Cook / NOAA Fisheries', {startFromSeconds: 8, zoom: [1.04, 1.1], panX: 0}),
		xIn: 10,
	},
	{start: b.s06, C: S.Scene06, sceneAnchors: () => [[b.s06, 46.4], [at('бесполезны'), 49.6], [at('эхолокации', 1), 51.2], [b.s07, 53.8]], shot: () => null!, xIn: 10},
	{
		start: b.s07,
		C: S.Scene07,
		sceneAnchors: () => [[b.s07, 54.0], [at('губы'), 55.0], [at('щелчки', 1), 57.0], [at('назад'), 58.0], [at('отражается'), 59.4], [at('устремляется'), 60.6], [b.s08, 64]],
		shot: () => null!,
		xIn: 0,
	},
	{
		start: b.s08,
		C: S.Scene08,
		sceneAnchors: () => [[b.s08, 64.0], [at('лупа'), 65.6], [at('одну'), 67.4], [at('усиливает'), 69.4], [at('луч', 2), 70.4], [b.s09, 72.5]],
		shot: () => null!,
		xIn: 10,
	},
	{
		start: b.s09,
		C: S.Scene09,
		sceneAnchors: () => [
			[b.s09, 72.5],
			[at('230', 1), 73.2],
			[at('каждые'), 75.0],
			[at('разговор'), 78.4],
			[at('газонакосилка'), 79.6],
			[at('взлетающий'), 80.8],
			[at('брабанная'), 82.6],
			[b.s10, 85.6],
		],
		shot: () => null!,
		xIn: 0,
	},
	{start: b.s10, C: S.Scene10, sceneAnchors: () => [[b.s10, 85.6], [at('водолажи'), 88.8], [b.s11, 93.8]], shot: () => null!, xIn: 0},
	{
		start: b.s11,
		C: S.Scene11,
		sceneAnchors: () => [[b.s11, 92.6], [at('пулемет'), 94.6], [at('исследования'), 98.0], [b.echo, 106.8]],
		shot: () => null!,
		xIn: 12,
	},
	{
		start: b.echo,
		shot: stock('кашалот-эхолокация-щелчки-и-жужжание-спектрограмма.mp4', 'NOAA Fisheries', {startFromSeconds: 0.5, zoom: [1.36, 1.42], panX: 0, origin: 'center 42%'}),
		xIn: 0,
	},
	{
		start: b.s12,
		C: S.Scene12,
		sceneAnchors: () => [[b.s12, 108.9], [at('один', 2), 110.8], [at('обнаружена'), 115.0], [at('обрывается'), 119.6], [b.s13, 123.6]],
		shot: () => null!,
		xIn: 0,
	},
	{
		start: b.s13,
		C: S.Scene13,
		sceneAnchors: () => [[b.s13, 123.6], [at('повреждённой'), 124.2], [at('всасывая'), 125.6], [at('крупного'), 127.8], [END, 130]],
		shot: () => null!,
		xIn: 0,
	},
];

const ends = PLANS.map((p, i) => (i + 1 < PLANS.length ? PLANS[i + 1].start : END));
const transitions = PLANS.slice(1).map((p) => p.xIn ?? 10);

const shots: SceneSpec[] = PLANS.map((p, i) => {
	const x = transitions[i] ?? 0; // переход в следующий план съедает x кадров у этого
	const dur = ends[i] - p.start + x / 30;
	return p.C ? anim(p.C, p.sceneAnchors!)(dur, p.start) : p.shot(dur);
});

// ─── Звуки: акценты ТЗ (время ТЗ → время главы через якоря сцен) ──
const sfx: SfxSpec[] = [
	// Настоящие щелчки кашалота из записи NOAA — под стоковым планом со спектрограммой.
	{src: `${STOCK}/кашалот-эхолокация-щелчки-и-жужжание-спектрограмма.mp4`, atMs: Math.round(b.echo * 1000), startFromSeconds: 0.5, durationSeconds: b.s12 - b.echo, volume: 0.7},
];
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

export const spermWhaleCh03: ChapterConfig = {
	id: 'SpermWhale-ch03',
	voiceover: voice,
	words: W,
	leadInFrames: Math.round(LEAD_S * 30),
	tailFrames: 45,
	shots,
	transitions,
	music: {
		src: `${BASE}/music/Exploring The Crystal Caves - Asher Fulero.mp3`,
		volume: MUSIC_VOL,
		boostInPauses: true,
		boostVolume: MUSIC_VOL * 1.5,
		durationSeconds: 122.1,
		crossfadeSeconds: 5,
	},
	sfx,
	accents: [{text: '230 децибел', match: '230', occurrence: 2, durationMs: 2000, position: 'upper'}],
};

/** Источники для описания ролика. */
export const CREDITS_CH03 = [
	'Sperm whale head profile — Cianc, Wikimedia Commons, CC BY 2.0',
	'Sperm whale group, drone footage — Melissa Cook / NOAA Fisheries SEFSC, Public domain (Permit #27867)',
	'Sperm whale clicks and buzz, spectrogram — M. Bowers, L. Dias, G. Rappucci, L. Hodge / NOAA Fisheries, Public domain (Permit #27867)',
	'Music: «Exploring The Crystal Caves» — Asher Fulero',
	'Voice: Google Gemini TTS (Orus)',
];
