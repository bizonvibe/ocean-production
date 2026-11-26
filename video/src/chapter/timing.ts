import type {Accent, ChapterConfig, MusicSpec, Word} from './types';

export const FPS = 30;
export const msToFrames = (ms: number) => Math.round((ms / 1000) * FPS);

export const leadIn = (c: ChapterConfig) => c.leadInFrames ?? 15;
export const xfade = (c: ChapterConfig) => c.crossfadeFrames ?? 10;
/** Переход перед планом i+1 (кадры): индивидуальный или общий. */
export const transitionAt = (c: ChapterConfig, i: number) => c.transitions?.[i] ?? xfade(c);

const gaps = (c: ChapterConfig) => [...(c.voiceover.gaps ?? [])].sort((a, b) => a.atMs - b.atMs);

/** Время озвучки (мс от начала файла) → время от начала голоса в главе (мс), с учётом вставленных пауз. */
export const voiceToChapterMs = (c: ChapterConfig, ms: number) =>
	ms + gaps(c).reduce((s, g) => s + (g.atMs <= ms ? g.padMs : 0), 0);

/** Длина голосовой дорожки в главе с паузами, мс. */
export const voiceSpanMs = (c: ChapterConfig) => voiceToChapterMs(c, c.voiceover.durationMs);

/** Куски озвучки для раздельного воспроизведения: [начало в файле, конец в файле, сдвиг в главе] (мс). */
export const voicePieces = (c: ChapterConfig): [number, number, number][] => {
	const cuts = gaps(c);
	const out: [number, number, number][] = [];
	let from = 0;
	let shift = 0;
	for (const g of cuts) {
		out.push([from, g.atMs, from + shift]);
		shift += g.padMs;
		from = g.atMs;
	}
	out.push([from, c.voiceover.durationMs, from + shift]);
	return out;
};

/** Слова в координатах главы (мс от начала голоса, с паузами). */
export const chapterWords = (c: ChapterConfig): Word[] =>
	(c.words ?? []).map((w) => ({...w, startMs: voiceToChapterMs(c, w.startMs), endMs: voiceToChapterMs(c, w.endMs)}));

/** Длина главы в кадрах: пауза + озвучка (с паузами) + хвост. */
export const chapterDuration = (c: ChapterConfig) => leadIn(c) + msToFrames(voiceSpanMs(c)) + (c.tailFrames ?? 45);

/**
 * Длительности планов, подогнанные под длину главы (с учётом переходов).
 * Последний план растягивается или укорачивается, чтобы ролик кончался вместе с хвостом.
 */
export const fittedShotDurations = (c: ChapterConfig): number[] => {
	const d = c.shots.map((s) => s.durationInFrames);
	const overlaps = d.slice(1).reduce((a, _, i) => a + transitionAt(c, i), 0);
	const used = d.reduce((a, b) => a + b, 0) - overlaps;
	const diff = chapterDuration(c) - used;
	d[d.length - 1] = Math.max(transitionAt(c, d.length - 2) + 1, d[d.length - 1] + diff);
	return d;
};

/** Кадр начала каждого плана на шкале главы. */
export const shotStarts = (c: ChapterConfig) => {
	const d = fittedShotDurations(c);
	const s: number[] = [];
	let acc = 0;
	d.forEach((len, i) => {
		s.push(acc);
		acc += len - (i < d.length - 1 ? transitionAt(c, i) : 0);
	});
	return s;
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
	const planned = d.reduce((a, b) => a + b, 0) - d.slice(1).reduce((a, _, i) => a + transitionAt(c, i), 0);
	const delta = chapterDuration(c) - planned;
	if (Math.abs(delta) > FPS * 2) {
		console.warn(`[${c.id}] план короче/длиннее озвучки на ${(delta / FPS).toFixed(1)} с — последний план подогнан.`);
	}
	// Разрез озвучки (вставка паузы) обязан попадать в тишину, иначе слышен обрыв/повтор звука.
	const sil = c.voiceover.silences;
	for (const g of c.voiceover.gaps ?? []) {
		if (sil && !sil.some(([a, b]) => g.atMs >= a + 30 && g.atMs <= b - 30)) {
			console.warn(`[${c.id}] разрез озвучки на ${g.atMs} мс не попадает в тишину — будет слышен обрыв.`);
		}
	}
	if ((c.accents?.length ?? 0) > 3) {
		console.warn(`[${c.id}] акцентных слов ${c.accents!.length} — их должно быть немного (0–3).`);
	}
};

const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}-]+/gu, '');

/** Найти слово озвучки (по началу слова, без регистра): время начала в мс озвучки или null. */
export const findWordMs = (words: Word[], match: string, occurrence = 1): number | null => {
	const target = norm(match);
	let n = 0;
	for (const w of words) if (norm(w.text).startsWith(target) && ++n === occurrence) return w.startMs;
	return null;
};

/** Время акцента от начала озвучки (мс в файле озвучки). */
export const accentTimeMs = (a: Accent, words: Word[] = []): number | null =>
	a.match ? (findWordMs(words, a.match, a.occurrence ?? 1) ?? a.atMs ?? null) : (a.atMs ?? null);

/** Паузы диктора длиннее minPauseMs: [начало, конец] в мс от начала голоса в главе. */
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
 * при boostInPauses — подъём в длинных паузах диктора (включая вставленные паузы).
 */
export const musicVolume = (c: ChapterConfig, m: MusicSpec) => {
	const base = m.volume ?? 0.14;
	const boost = m.boostVolume ?? 0.3;
	const total = chapterDuration(c);
	const offset = leadIn(c);
	const words = chapterWords(c);
	const pauses = m.boostInPauses
		? [
				// Вступление до первого слова — тоже пауза диктора.
				...(words.length ? [[-msToFrames(0) - offset * (1000 / FPS), words[0].startMs] as [number, number]] : []),
				...voicePauses(words, m.minPauseMs ?? 5000, voiceSpanMs(c)),
			]
				.filter(([s, e]) => e - s >= (m.minPauseMs ?? 5000))
				.map(([s, e]) => [offset + msToFrames(s), offset + msToFrames(e)] as const)
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
