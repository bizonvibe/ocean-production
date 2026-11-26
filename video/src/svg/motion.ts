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
	/** Перелёт за цель и возврат; overshoot ≈ 1.70158 — стандарт, 1.1 — мягко. */
	outBack:
		(overshoot = 1.70158) =>
		(x: number) => {
			const c3 = overshoot + 1;
			return 1 + c3 * Math.pow(x - 1, 3) + overshoot * Math.pow(x - 1, 2);
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

/** clip-path: открыть слева направо долю pr (в координатах холста). */
export const revealX = (pr: number) => `inset(0 ${(1 - pr) * 100}% 0 0)`;
/** clip-path: открыть сверху вниз долю pr. */
export const revealY = (pr: number) => `inset(0 0 ${(1 - pr) * 100}% 0)`;
