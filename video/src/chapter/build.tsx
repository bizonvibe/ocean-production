import {timeMap, type TimeMap} from '../svg/motion';
import type {FootageSource, SceneSpec} from '../templates/types';
import {voiceToChapterMs} from './timing';
import type {Accent, ChapterConfig, MusicSpec, SfxSpec, Word} from './types';

/**
 * Сборка конфига главы от таймингов озвучки — общая логика для всех глав.
 *
 * Глава описывается раскадровкой: список планов с моментом начала (секунды главы).
 * План — либо сток (`stock(...)`), либо сцена ТЗ с якорями [секунда главы, секунда ТЗ].
 * Длительности, переходы, пересчёт времени сцен и звуковые акценты ТЗ считаются здесь.
 */

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}-]+/gu, '');

export type SceneComp = React.FC<{tz: TimeMap}>;

export type PlanSpec =
	| {start: number; xIn?: number; stock: {src: string; credit: string; opts?: Partial<FootageSource>}}
	| {start: number; xIn?: number; scene: SceneComp; anchors: [number, number][]};

export type ChapterInput = {
	id: string;
	/** Название для сообщений об ошибках. */
	label: string;
	words: Word[];
	silences: [number, number][];
	durationMs: number;
	/** Папка главы в public/ (voice.wav, music/, stock/). */
	base: string;
	leadS: number;
	/** Паузы после фраз: [слово, мс, номер вхождения]. */
	gaps: [string, number, number?][];
	/** Раскадровка: получает at() — время слова на шкале главы. */
	plans: (h: Helpers) => PlanSpec[];
	sceneSfx?: {tz: number; src: string; volume: number}[];
	extraSfx?: (h: Helpers) => SfxSpec[];
	music: MusicSpec;
	accents?: Accent[];
};

export type Helpers = {
	/** Начало слова на шкале главы, секунды. Слово — как его распознал WhisperX, точное совпадение. */
	at: (word: string, occ?: number) => number;
	/** Конец слова на шкале главы, секунды. */
	atEnd: (word: string, occ?: number) => number;
	/** Конец главы (секунды): озвучка + 1.5 с. */
	END: number;
};

export const buildChapter = (c: ChapterInput): ChapterConfig => {
	const hit = (match: string, occ = 1) => {
		const hits = c.words.filter((w) => norm(w.text) === norm(match));
		if (!hits[occ - 1]) throw new Error(`${c.label}: слово «${match}» (${occ}) не найдено в озвучке`);
		return hits[occ - 1];
	};
	const gaps = c.gaps.map(([word, padMs, occ]) => {
		const s = hit(word, occ ?? 1).startMs;
		// Тишина должна начаться до следующего слова (+200 мс допуска на неточность WhisperX),
		// иначе пауза уехала бы в середину следующей фразы.
		const next = c.words.find((w) => w.startMs > s);
		const quiet = c.silences.find(([a]) => a >= s && (!next || a < next.startMs + 200));
		if (!quiet) throw new Error(`${c.label}: нет тишины сразу после «${word}» — уберите эту паузу`);
		return {atMs: Math.round((quiet[0] + quiet[1]) / 2), padMs};
	});
	const voice = {src: `${c.base}/voice.wav`, durationMs: c.durationMs, gaps, silences: c.silences};
	const tmp: ChapterConfig = {id: 'x', voiceover: voice, shots: []};
	const h: Helpers = {
		at: (w, o = 1) => c.leadS + voiceToChapterMs(tmp, hit(w, o).startMs) / 1000,
		atEnd: (w, o = 1) => c.leadS + voiceToChapterMs(tmp, hit(w, o).endMs) / 1000,
		END: c.leadS + voiceToChapterMs(tmp, c.durationMs) / 1000 + 1.5,
	};
	const plans = c.plans(h);
	const ends = plans.map((p, i) => (i + 1 < plans.length ? plans[i + 1].start : h.END));
	const transitions = plans.slice(1).map((p) => p.xIn ?? 10);

	const shots: SceneSpec[] = plans.map((p, i) => {
		const dur = ends[i] - p.start + (transitions[i] ?? 0) / 30;
		const frames = Math.round(dur * 30);
		if ('stock' in p) {
			const src = p.stock.src.startsWith('projects/') ? p.stock.src : `${c.base}/stock/${p.stock.src}`;
			return {
				type: 'footage',
				durationInFrames: frames,
				footage: {
					src,
					kind: /\.(mp4|webm|mov)$/i.test(src) ? 'video' : 'image',
					credit: p.stock.credit,
					dim: 0.08,
					zoom: [1.03, 1.12],
					panX: -24,
					...p.stock.opts,
				},
			};
		}
		const tz = timeMap(p.anchors.map(([chapterS, tzS]) => [chapterS - p.start, tzS]));
		const C = p.scene;
		return {type: 'custom', durationInFrames: frames, component: () => <C tz={tz} />};
	});

	// Звуковые акценты ТЗ: время ТЗ → время главы через якоря той сцены, в чей отрезок ТЗ попадает момент.
	const sfx: SfxSpec[] = c.extraSfx ? c.extraSfx(h) : [];
	for (const e of c.sceneSfx ?? []) {
		const plan = plans.find((p) => 'anchors' in p && e.tz >= p.anchors[0][1] && e.tz < p.anchors[p.anchors.length - 1][1]);
		if (!plan || !('anchors' in plan)) continue;
		const inv = timeMap(plan.anchors.map(([ch, z]) => [z, ch]));
		sfx.push({src: e.src, atMs: Math.round(inv(e.tz) * 1000), volume: e.volume});
	}

	return {
		id: c.id,
		voiceover: voice,
		words: c.words,
		leadInFrames: Math.round(c.leadS * 30),
		tailFrames: 45,
		shots,
		transitions,
		music: c.music,
		sfx,
		accents: c.accents,
	};
};

/** Громкость музыки ≈ −16 дБ к голосу (−16 LUFS) по измеренной громкости трека, LUFS. */
export const musicVolumeFor = (trackLufs: number) => Math.min(1, Math.pow(10, (-32 - trackLufs) / 20));
