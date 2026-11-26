/**
 * Помощники для покадровых планов из ТЗ: время в секундах от начала сцены.
 *   p(t, 15.2, 16.8, ease.outBack())  → прогресс 0…1 на отрезке с кривой
 *   mix(+1300, 0, pr)                 → значение между from и to
 *   wave(t, 1.6, 3)                   → синус: период 1.6 с, амплитуда 3
 */

export type Ease = (x: number) => number;

export const ease = {
	linear: (x: number) => x,
	inSine: (x: number) => 1 - Math.cos((x * Math.PI) / 2),
	outSine: (x: number) => Math.sin((x * Math.PI) / 2),
	inOutSine: (x: number) => -(Math.cos(Math.PI * x) - 1) / 2,
	inQuad: (x: number) => x * x,
	outQuad: (x: number) => 1 - (1 - x) * (1 - x),
	outCubic: (x: number) => 1 - Math.pow(1 - x, 3),
	inCubic: (x: number) => x * x * x,
	inOutCubic: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
	outQuart: (x: number) => 1 - Math.pow(1 - x, 4),
	outExpo: (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
	inExpo: (x: number) => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10)),
	/** Перелёт за цель и возврат; overshoot ≈ 1.70158 — стандарт, 1.1 — мягко. */
	outBack:
		(overshoot = 1.70158) =>
		(x: number) => {
			const c3 = overshoot + 1;
			return 1 + c3 * Math.pow(x - 1, 3) + overshoot * Math.pow(x - 1, 2);
		},
	/** Падение с отскоками. */
	outBounce: (x: number) => {
		const n = 7.5625;
		const d = 2.75;
		if (x < 1 / d) return n * x * x;
		if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
		if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
		return n * (x -= 2.625 / d) * x + 0.984375;
	},
	/** Пружина (затухающие колебания), damping — чем больше, тем быстрее успокаивается. */
	spring:
		(damping = 12, freq = 2.2) =>
		(x: number) =>
			x >= 1 ? 1 : 1 - Math.exp(-(damping / 2.2) * x) * Math.cos(freq * 2 * Math.PI * x),
};

/** Прогресс 0…1 на отрезке [t0, t1] с кривой (до t0 — 0, после t1 — 1). */
export const p = (t: number, t0: number, t1: number, e: Ease = ease.linear) =>
	e(Math.max(0, Math.min(1, (t - t0) / Math.max(1e-6, t1 - t0))));

export const mix = (a: number, b: number, pr: number) => a + (b - a) * pr;

/** Синусоида: период в секундах, амплитуда, фаза 0…1. */
export const wave = (t: number, period: number, amp: number, phase = 0) =>
	amp * Math.sin(2 * Math.PI * (t / period + phase));

/** Появление/исчезновение: 0 → 1 на [a0,a1], 1 → 0 на [b0,b1]. */
export const fadeInOut = (t: number, a0: number, a1: number, b0 = Infinity, b1 = Infinity, e: Ease = ease.outCubic) =>
	Math.min(p(t, a0, a1, e), 1 - p(t, b0, b1, ease.inCubic));

/** Детерминированный псевдослучай 0…1 по целому seed. */
export const rand = (seed: number) => {
	const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
};

/** clip-path: открыть слева направо долю pr — от рамки самого элемента (bbox), не холста. */
export const revealX = (pr: number) => `inset(0 ${(1 - pr) * 100}% 0 0)`;
/** clip-path: открыть сверху вниз долю pr — от рамки самого элемента. */
export const revealY = (pr: number) => `inset(0 0 ${(1 - pr) * 100}% 0)`;

/**
 * Пересчёт реального времени сцены во время ТЗ по якорям.
 * points: пары [реальная секунда от начала сцены, секунда ТЗ] по возрастанию
 * (начало сцены, якорные слова ⚓, конец сцены). Между точками — линейно, за краями — с наклоном 1.
 */
export const timeMap = (points: [number, number][]) => {
	const pts = [...points].sort((a, b) => a[0] - b[0]);
	return (t: number) => {
		if (t <= pts[0][0]) return pts[0][1] + (t - pts[0][0]);
		for (let i = 1; i < pts.length; i++) {
			const [r0, z0] = pts[i - 1];
			const [r1, z1] = pts[i];
			if (t <= r1) return z0 + ((t - r0) / Math.max(1e-6, r1 - r0)) * (z1 - z0);
		}
		const [rl, zl] = pts[pts.length - 1];
		return zl + (t - rl);
	};
};

export type TimeMap = (t: number) => number;

/** Смешение цветов #rrggbb. */
export const mixColor = (a: string, b: string, pr: number) => {
	const ca = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
	const cb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
	return `rgb(${ca.map((v, i) => Math.round(v + (cb[i] - v) * Math.max(0, Math.min(1, pr)))).join(',')})`;
};
