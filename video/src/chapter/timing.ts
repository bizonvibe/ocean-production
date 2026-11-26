import type {Accent, ChapterConfig, MusicSpec, Word} from './types';

export const FPS = 30;
export const msToFrames = (ms: number) => Math.round((ms / 1000) * FPS);

export const leadIn = (c: ChapterConfig) => c.leadInFrames ?? 15;
export const xfade = (c: ChapterConfig) => c.crossfadeFrames ?? 10;

/** Длина главы в кадрах: пауза + озвучка + хвост. */
export const chapterDuration = (c: ChapterConfig) =>
	leadIn(c) + msToFrames(c.voiceover.durationMs) + (c.tailFrames ?? 45);

/**
 * Длительности планов, подогнанные под длину главы (с учётом наплывов).
 * Последний план растягивается или укорачивается, чтобы ролик кончался вместе с хвостом.
 */
export const fittedShotDurations = (c: ChapterConfig): number[] => {
	const x = xfade(c);
	const d = c.shots.map((s) => s.durationInFrames);
	const used = d.reduce((a, b) => a + b, 0) - x * (d.length - 1);
	const diff = chapterDuration(c) - used;
	d[d.length - 1] = Math.max(x + 1, d[d.length - 1] + diff);
	return d;
};

/** Доля стоков (type 'footage') в длительности главы, 0–1. */
export const stockShare = (c: ChapterConfig) => {
	const d = fittedShotDurations(c);
	const total = d.reduce((a, b) => a + b, 0);
	const stock = c.shots.reduce((a, s, i) => a + (s.type === 'footage' ? d[i] : 0), 0);
	return total ? stock / total : 0;
};

/** Проверки при регистрации главы: пишутся в лог рендера/студии. */
export const checkChapter = (c: ChapterConfig) => {
	const share = stockShare(c);
	if (share < 0.15 || share > 0.25) {
		console.warn(`[${c.id}] стоки занимают ${(share * 100).toFixed(0)} % — цель 20 % (анимации 80 %).`);
	}
	const d = c.shots.map((s) => s.durationInFrames);
	const planned = d.reduce((a, b) => a + b, 0) - xfade(c) * (d.length - 1);
	const delta = chapterDuration(c) - planned;
	if (Math.abs(delta) > FPS * 2) {
		console.warn(`[${c.id}] план короче/длиннее озвучки на ${(delta / FPS).toFixed(1)} с — последний план подогнан.`);
	}
	if ((c.accents?.length ?? 0) > 3) {
		console.warn(`[${c.id}] акцентных слов ${c.accents!.length} — их должно быть немного (0–3).`);
	}
};

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}-]+/gu, '');

/** Время акцента от начала озвучки, мс. */
export const accentTimeMs = (a: Accent, words: Word[] = []): number | null => {
	if (a.match) {
		const target = norm(a.match);
		let n = 0;
		for (const w of words) {
			if (norm(w.text).startsWith(target) && ++n === (a.occurrence ?? 1)) return w.startMs;
		}
		return a.atMs ?? null;
	}
	return a.atMs ?? null;
};

/** Паузы диктора длиннее minPauseMs (мс от начала озвучки), включая тишину после последнего слова. */
export const voicePauses = (words: Word[], minPauseMs: number, voiceEndMs: number) => {
	const out: [number, number][] = [];
	for (let i = 0; i < words.length; i++) {
		const end = words[i].endMs;
		const next = i + 1 < words.length ? words[i + 1].startMs : voiceEndMs;
		if (next - end >= minPauseMs) out.push([end, next]);
	}
	return out;
};

/**
 * Громкость музыки на кадре главы: всегда тише диктора, плавный вход и выход,
 * при boostInPauses — подъём в длинных паузах диктора.
 */
export const musicVolume = (c: ChapterConfig, m: MusicSpec) => {
	const base = m.volume ?? 0.14;
	const boost = m.boostVolume ?? 0.3;
	const total = chapterDuration(c);
	const offset = leadIn(c);
	const pauses = m.boostInPauses
		? voicePauses(c.words ?? [], m.minPauseMs ?? 5000, c.voiceover.durationMs).map(
				([s, e]) => [offset + msToFrames(s), offset + msToFrames(e)] as const,
			)
		: [];
	const RISE = 24; // подъём ~0.8 с после начала паузы
	const FALL = 15; // спуск ~0.5 с, заканчивается до следующего слова
	const DELAY = 9; // не дёргаем музыку сразу после слова
	return (f: number) => {
		let v = base;
		for (const [s, e] of pauses) {
			const a = s + DELAY;
			const b = e - FALL;
			if (f <= a || f >= e || b <= a) continue;
			const up = Math.min(1, (f - a) / RISE);
			const down = f > b ? Math.max(0, (e - f) / FALL) : 1;
			v = base + (boost - base) * Math.min(up, down);
		}
		const fadeIn = Math.min(1, f / 20);
		const fadeOut = Math.min(1, Math.max(0, (total - f) / 40));
		return v * fadeIn * fadeOut;
	};
};
