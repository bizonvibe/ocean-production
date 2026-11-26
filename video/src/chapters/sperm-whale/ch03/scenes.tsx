import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {SvgScene, type ElStyle} from '../../../svg/SvgScene';
import {ease, mix, p, rand, revealX, revealY, wave, type TimeMap} from '../../../svg/motion';
import {DIR} from './paths';

/**
 * Глава 3 «Чудо биоакустики и тайна огромного черепа» — 13 сцен по ТЗ ocean-animations
 * (projects/sperm-whale/03_bioakustika/README.md). Времена в коде — секунды ТЗ.
 * Сцены 3, 5, 7 — один и тот же разрез головы: монтируются встык, как одна съёмка.
 */
type P = {tz: TimeMap};

const useT = (tz: TimeMap) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	return tz(f / fps);
};

const Flash: React.FC<{color: string; opacity: number}> = ({color, opacity}) => (
	<AbsoluteFill style={{backgroundColor: color, opacity, pointerEvents: 'none'}} />
);

const fade = (t: number, t0: number, t1: number): ElStyle => ({opacity: p(t, t0, t1)});
const appear = (t: number, t0: number, t1: number, dy = 0): ElStyle => {
	const pr = p(t, t0, t1, ease.outCubic);
	return {opacity: pr, transform: dy ? `translateY(${mix(dy, 0, pr)}px)` : undefined};
};
/** Пульс 1 → peak → 1 на отрезке. */
const pulse = (t: number, t0: number, t1: number, peak: number) => 1 + (peak - 1) * Math.sin(Math.PI * p(t, t0, t1));
const glow = (k: number, color: string) => (k > 0.01 ? `drop-shadow(0 0 ${18 * k}px ${color})` : undefined);

const CUTAWAY = ['00_background', '10_whale-cutaway', '20_skull', '30_spermaceti', '40_junk', '50_phonic-lips'];

// ─── Сцена 01 — Конус против блока (0–9.3) ───────────────────────
export const Scene01: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const dol = p(t, 3, 3.8, ease.outCubic);
	const sh = p(t, 3.6, 4.4, ease.outCubic);
	const zoom = p(t, 8.7, 9.3, ease.inCubic);
	return (
		<SvgScene
			dir={`${DIR}/scene-01_block-head`}
			layers={['00_background', '10_dolphin', '20_shark', '30_sperm-whale', '40_shape-guides', '90_labels']}
			camera={() => ({scale: mix(1, 1.4, zoom), origin: [1300, 760]})}
			animate={() => ({
				'sperm-whale': {
					transform: `translateX(${mix(-1400, 0, p(t, 0, 1.2, ease.outCubic))}px) scale(${pulse(t, 1.5, 2.5, 1.03)})`,
					origin: [1100, 760],
				},
				dolphin: {transform: `translateX(${mix(-900, 0, dol)}px)`},
				'label-dolphin': {opacity: dol},
				shark: {transform: `translateX(${mix(900, 0, sh)}px)`},
				'label-shark': {opacity: sh},
				'cone-dolphin': {draw: p(t, 4.6, 5.4, ease.outCubic)},
				'cone-shark': {draw: p(t, 4.8, 5.6, ease.outCubic)},
				'label-cone': fade(t, 5.2, 5.8),
				'block-whale': {draw: p(t, 6.6, 7.4, ease.outCubic), opacity: t < 7.4 ? 1 : 0.8 + wave(t, 1.2, 0.2)},
				'label-block': fade(t, 7.0, 7.6),
				'bracket-third': {transform: `scaleX(${p(t, 7.6, 8.4, ease.outCubic)})`, origin: [1325, 1020]},
			})}
		/>
	);
};

// ─── Сцена 02 — Голова как контейнер (9.3–16.4) ──────────────────
export const Scene02: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const swirl = p(t, 13.8, 14.6);
	return (
		<SvgScene
			dir={`${DIR}/scene-02_container`}
			layers={['00_background', '10_ruler', '20_sperm-whale', '30_container', '40_drag-flow', '90_labels']}
			camera={() => ({scale: mix(1, 1.05, p(t, 9.3, 16.4, ease.inOutSine)), origin: [1340, 500]})}
			animate={() => ({
				bg: fade(t, 9.3, 9.8),
				'sperm-whale': fade(t, 9.3, 9.8),
				ruler: fade(t, 9.3, 9.8),
				title: fade(t, 9.3, 9.8),
				'label-head': fade(t, 10, 10.6),
				container: {
					opacity: t < 11 ? 0 : 1,
					transform: `translateY(${mix(-700, 0, p(t, 11, 12, ease.outBounce))}px)`,
				},
				'label-container': fade(t, 12, 12.4),
				'drag-flow': {opacity: p(t, 13.4, 13.8), dash: {array: '30 20', offset: -300 * Math.max(0, t - 13.4)}},
				'drag-swirls': {opacity: 0.7 * swirl, transform: `rotate(${(360 * Math.max(0, t - 13.8)) / 1.5}deg)`, origin: [1720, 283]},
				'label-drag': fade(t, 14.4, 14.8),
			})}
		/>
	);
};

// ─── Сцена 03 — Миф о мозге (16.4–25.4) ──────────────────────────
export const Scene03: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const myth = p(t, 18.4, 19.4, ease.spring(11));
	const gone = p(t, 20.6, 21.2, ease.inCubic);
	const styles: Record<string, ElStyle> = {
		bg: fade(t, 16.4, 17),
		'whale-cutaway': fade(t, 16.4, 17),
		skull: fade(t, 16.4, 17),
		'brain-myth': {transform: `scale(${myth * mix(1, 0.6, gone)})`, origin: [1289, 399], opacity: 1 - gone},
		'label-myth': {opacity: p(t, 18.6, 19.2) * mix(1, 0.5, p(t, 20.6, 21))},
		'#label-myth line': {transform: `scaleX(${p(t, 20.6, 21, ease.outCubic)})`, origin: [1090, 128]},
		cross: {draw: p(t, 20, 20.5), opacity: 1 - gone, transform: `scale(${mix(1, 0.6, gone)})`, origin: [1260, 400]},
		'organ-spermaceti': {
			clipPath: `inset(${(1 - p(t, 21.2, 22.4, ease.inOutSine)) * 100}% 0 0 0)`,
			transform: `translateY(${p(t, 21.2, 22.6) < 1 ? wave(t, 0.5, 2) : 0}px)`,
		},
		'label-reservoir': fade(t, 21.6, 22),
		'brain-real': {transform: `scale(${pulse(t, 21.8, 22.4, 1.4)})`, origin: [730, 570], filter: glow(Math.sin(Math.PI * p(t, 21.8, 22.8)), '#ffd1dc')},
		'label-brain-real': fade(t, 21.8, 22.4),
		'label-volume': fade(t, 24.2, 24.6),
		'organ-junk': {opacity: 0.35 * p(t, 23, 25.4)},
		'phonic-lips': {opacity: 0.35 * p(t, 23, 25.4)},
	};
	for (let i = 1; i <= 10; i++) styles[`tub-${i}`] = appear(t, 22.8 + (i - 1) * 0.15, 23.2 + (i - 1) * 0.15, 30);
	return <SvgScene dir={`${DIR}/scene-03_brain-myth`} layers={[...CUTAWAY, '60_brain-myth', '70_bathtubs', '90_labels']} animate={() => styles} />;
};

// ─── Сцена 04 — Воск и имя (25.4–33.6) ───────────────────────────
export const Scene04: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const wax = p(t, 28, 28.8, ease.outCubic);
	const stamp = p(t, 31.2, 31.6, ease.outCubic);
	const shake = t > 31.2 && t < 31.6 ? (rand(Math.floor(t * 30)) - 0.5) * 6 : 0;
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-04_wax-name`}
				layers={['00_background', '10_bucket-liquid', '20_bucket-wax', '30_cold-arrow', '90_labels']}
				animate={() => ({
					bg: fade(t, 25.4, 26),
					title: fade(t, 25.4, 26),
					'bucket-liquid': {...appear(t, 26, 26.6, 40)},
					'label-liquid': fade(t, 26, 26.6),
					'cold-arrow': {draw: p(t, 26.8, 27.6, ease.outCubic), opacity: p(t, 26.8, 27)},
					'label-cold': fade(t, 27.2, 28),
					'bucket-wax': {opacity: wax, transform: `scale(${mix(0.9, 1, wax)})`, origin: [1490, 570]},
					'label-wax': fade(t, 28.2, 28.8),
					// Строка 1 — «печатная машинка», строка 2 — штамп.
					'#label-name text:nth-of-type(1)': {clipPath: revealX(p(t, 29.4, 30.2))},
					'#label-name text:nth-of-type(2)': {
						opacity: stamp,
						transform: `translate(${shake}px, ${shake * 0.5}px) scale(${mix(1.3, 1, stamp)})`,
						origin: [960, 930],
					},
				})}
			/>
			<Flash color="#000" opacity={p(t, 33.2, 33.6)} />
		</AbsoluteFill>
	);
};

// ─── Сцена 05 — Два уровня головы (33.6–45.3) ────────────────────
export const Scene05: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const spGlow = Math.sin(Math.PI * p(t, 36.4, 37.6));
	const jGlow = Math.sin(Math.PI * p(t, 39.8, 41));
	const styles: Record<string, ElStyle> = {
		'organ-spermaceti': {transform: `scale(${pulse(t, 36.4, 37.2, 1.04)})`, origin: [1289, 399], filter: glow(spGlow, '#f3e6b0')},
		'organ-junk': {transform: `scale(${pulse(t, 39.8, 40.6, 1.04)})`, origin: [1302, 606], filter: glow(jGlow, '#f0b35a')},
		'callout-spermaceti': {draw: p(t, 36.6, 37.2), opacity: p(t, 36.6, 37)},
		'callout-junk': {draw: p(t, 40, 40.6), opacity: p(t, 40, 40.4)},
		'callout-skull': fade(t, 43, 43.6),
		'callout-lips': fade(t, 43, 43.6),
	};
	// Перегородки-«линзы» вспыхивают по очереди слева направо.
	for (let i = 1; i <= 7; i++) {
		const t0 = 42 + (i - 1) * 0.2;
		styles[`#organ-junk path:nth-of-type(${i})`] = {strokeWidth: 2 + 4 * Math.sin(Math.PI * p(t, t0, t0 + 0.4))};
	}
	return (
		<SvgScene
			dir={`${DIR}/scene-05_two-levels`}
			layers={[...CUTAWAY, '80_callouts']}
			camera={() => ({scale: mix(1, 1.12, p(t, 34, 36, ease.inOutSine)), origin: [1250, 500]})}
			animate={() => styles}
		/>
	);
};

// ─── Сцена 06 — Эхолокация (45.3–53.8) ───────────────────────────
export const Scene06: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const arcs = t < 51.2 ? 0 : ((t - 51.2) % 1.2) / 1.2;
	const le = p(t, 51.6, 52.2, ease.outCubic);
	return (
		<SvgScene
			dir={`${DIR}/scene-06_echolocation`}
			layers={['00_background', '10_whale', '20_eye-icon', '30_sound-arcs', '90_labels']}
			animate={() => ({
				whale: fade(t, 45.3, 46.5),
				'eye-icon': {transform: `scaleY(${p(t, 47.5, 48.2, ease.outBack(1.4))})`, origin: [1300, 300], opacity: mix(1, 0.4, p(t, 49.8, 50.2))},
				'eye-cross': {draw: p(t, 49.6, 50.2), opacity: p(t, 49.6, 49.7)},
				'label-eye': fade(t, 49.8, 50.3),
				'sound-arcs': {
					opacity: t < 51.2 ? 0 : Math.sin(Math.PI * arcs),
					transform: `scale(${mix(0.6, 1.2, arcs)})`,
					origin: [1000, 560],
				},
				'label-echo': {opacity: le, letterSpacing: mix(10, 0, le)},
			})}
		/>
	);
};

// ─── Сцена 07 — Путь звука (53.8–64.0) ───────────────────────────
const CLICKS_07 = [57.0, 62.4, 63.0, 63.6];

export const Scene07: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const lipsGlow = Math.sin(Math.PI * p(t, 55, 56));
	const lastClick = [...CLICKS_07].reverse().find((c) => t >= c) ?? -10;
	const squash = t - lastClick < 0.15 ? Math.sin((Math.PI * (t - lastClick)) / 0.15) : 0;
	const flash = Math.max(0, 1 - (t - lastClick) / 0.35);
	const beam = p(t, 61.6, 62.4, ease.outExpo);
	const beamFlicker = t < 62.4 ? 1 : 0.8 + 0.2 * Math.max(0, 1 - (t - lastClick) / 0.3);
	return (
		<SvgScene
			dir={`${DIR}/scene-07_sound-path`}
			layers={[...CUTAWAY, '60_sound-path', '70_beam', '80_steps']}
			animate={() => ({
				'phonic-lips': {
					transform: `scale(${pulse(t, 55, 56, 1.6)}, ${pulse(t, 55, 56, 1.6) * (1 - 0.6 * squash)})`,
					origin: [1567, 315],
					filter: glow(Math.max(lipsGlow, flash), '#ff5a6e'),
				},
				'step-1': fade(t, 57, 57.4),
				'path-back': {draw: p(t, 58, 59.4, ease.inOutSine)},
				'path-reflect': {draw: p(t, 59.4, 60.2, ease.inOutSine)},
				'#frontal-sac path': {strokeWidth: 3 + 5 * Math.sin(Math.PI * p(t, 59.4, 60.4))},
				'step-2': fade(t, 59.6, 60),
				'path-forward': {draw: p(t, 60.6, 61.6, ease.inOutSine)},
				'organ-junk': {filter: glow(Math.sin(Math.PI * p(t, 60.6, 62)), '#f0b35a')},
				'sound-beam': {transform: `scaleX(${beam})`, origin: [1640, 602], opacity: (t < 61.6 ? 0 : 1) * beamFlicker},
				'step-3': fade(t, 61.8, 62.2),
			})}
		>
			{/* Белая вспышка щелчка у звуковых губ. */}
			<div
				style={{
					position: 'absolute',
					left: 1567 - 60,
					top: 315 - 60,
					width: 120,
					height: 120,
					borderRadius: '50%',
					background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)',
					opacity: flash,
					transform: `scale(${mix(0.1, 1, 1 - flash)})`,
				}}
			/>
		</SvgScene>
	);
};
export const SCENE07_CLICKS_TZ = CLICKS_07;

// ─── Сцена 08 — Лупа и акустическая линза (64.0–72.5) ────────────
export const Scene08: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const lens = p(t, 65.6, 66.2, ease.spring(12));
	const fp = p(t, 67.4, 68, ease.outCubic);
	return (
		<SvgScene
			dir={`${DIR}/scene-08_lens-analogy`}
			layers={['00_background', '10_divider', '20_magnifier', '30_whale-lens', '90_labels']}
			animate={() => ({
				bg: fade(t, 64, 64.6),
				title: fade(t, 64, 64.6),
				divider: {transform: `scaleY(${p(t, 64, 64.6, ease.outCubic)})`, origin: [960, 540]},
				sun: {transform: `scale(${lens}) rotate(${mix(0, 30, p(t, 65.6, 72.5))}deg)`, origin: [140, 600]},
				magnifier: {transform: `scale(${lens})`, origin: [470, 680]},
				'light-rays-in': {draw: p(t, 66.2, 67.4, ease.inOutSine)},
				'focus-point': {
					transform: `scale(${fp < 0.5 ? mix(0, 1.4, fp * 2) : mix(1.4, 1, (fp - 0.5) * 2)})`,
					origin: [760, 600],
					opacity: t < 68 ? 1 : 0.8 + wave(t, 0.4, 0.2),
				},
				'label-left': fade(t, 67.4, 68),
				'mini-whale': fade(t, 68.4, 69),
				'mini-junk': {opacity: p(t, 68.4, 69), transform: `scale(${pulse(t, 69.4, 70, 1.15) * pulse(t, 70, 70.6, 1.15)})`, origin: [1478, 610]},
				'label-right': fade(t, 68.4, 69),
				'mini-beam': {transform: `scaleX(${p(t, 70.4, 71.6, ease.outExpo)})`, origin: [1550, 610]},
			})}
		/>
	);
};

// ─── Сцена 09 — Шкала децибел (72.5–85.6) ────────────────────────
const bar = (t: number, id: string, t0: number, t1: number, oy: number, e = ease.outCubic): Record<string, ElStyle> => {
	const pr = p(t, t0, t1, e);
	return {
		[`#${id} > rect`]: {transform: `scaleX(${pr})`, origin: [520, oy]},
		[`#${id} > text:nth-of-type(1)`]: {opacity: p(t, t0, t0 + 0.3)},
		[`#${id} > text:nth-of-type(2)`]: {opacity: p(t, t1 - 0.3, t1)},
	};
};

export const Scene09: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const jet = t > 80.8 && t < 81.8 ? wave(t, 0.08, 2) : 0;
	const styles: Record<string, ElStyle> = {
		bg: fade(t, 72.5, 73),
		title: fade(t, 72.5, 73),
		axis: {clipPath: revealX(p(t, 72.5, 73.2, ease.outCubic))},
		...bar(t, 'bar-whale', 73.2, 74.6, 700, ease.outExpo),
		...bar(t, 'bar-talk', 78.4, 79, 300),
		...bar(t, 'bar-mower', 79.6, 80.2, 400),
		...bar(t, 'bar-jet', 80.8, 81.6, 500),
		'bar-jet': {transform: `translate(${jet}px, ${jet * 0.5}px)`},
		'line-eardrum': {clipPath: revealY(p(t, 82.6, 83.2, ease.outCubic)), filter: glow(Math.sin(Math.PI * p(t, 82.8, 83.6)), '#ff3b30')},
		'marker-air-equiv': fade(t, 84, 84.6),
		'#log-note > text': fade(t, 76, 76.6),
	};
	// Число 0 → 230 на столбике кашалота.
	styles['#bar-whale > text:nth-of-type(2)'] = {
		opacity: p(t, 73.2, 73.4),
		text: `${Math.round(230 * p(t, 73.2, 74.6, ease.outExpo))} дБ`,
	};
	for (let i = 1; i <= 4; i++) {
		const t0 = 75 + (i - 1) * 0.3;
		styles[`#log-note > rect:nth-of-type(${i})`] = {transform: `scaleY(${p(t, t0, t0 + 0.4, ease.outBack(1.3))})`, origin: [80 + 70 * i, 1040]};
	}
	return <SvgScene dir={`${DIR}/scene-09_decibels`} layers={['00_background', '10_axis', '20_bars', '30_markers', '40_log-note', '90_labels']} animate={() => styles} />;
};

// ─── Сцена 10 — Водолаз чувствует щелчок (85.6–93.8) ─────────────
const WAVES_10 = [86.6, 87.6, 88.6, 89.6, 90.6, 91.6, 92.6];

export const Scene10: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const last = [...WAVES_10].reverse().find((w) => t >= w) ?? -10;
	const wv = p(t, last, last + 0.9);
	const hit = t - (last + 0.5);
	const tremble = hit > 0 && hit < 0.4 ? Math.sin(hit * 60) * 6 * (1 - hit / 0.4) : 0;
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-10_diver-vibration`}
				layers={['00_background', '10_whale', '20_waves', '30_diver', '90_labels']}
				animate={() => ({
					'click-waves': {opacity: last < 0 ? 0 : 1 - wv, transform: `scale(${mix(0.5, 1.3, wv)})`, origin: [900, 520]},
					diver: {transform: `translate(${tremble}px, ${tremble * 0.4}px)`},
					'vibration-lines': {opacity: p(t, 88.8, 89.6), transform: `translateY(${p(t, 88.8, 89.2) * wave(t, 0.12, 4)}px)`},
					'label-diver': fade(t, 89.6, 90.2),
				})}
			/>
			<Flash color="#000" opacity={1 - p(t, 85.6, 86.2)} />
		</AbsoluteFill>
	);
};
export const SCENE10_CLICKS_TZ = WAVES_10;

// ─── Сцена 11 — Звук проходит сквозь кальмара (93.8–108.7) ───────
export const Scene11: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const card = p(t, 93.8, 94.6, ease.outCubic);
	const shake = t > 94 && t < 95 ? wave(t, 0.1, 4) * (1 - p(t, 94, 95)) : 0;
	const styles: Record<string, ElStyle> = {
		'myth-card': {opacity: card * mix(1, 0.5, p(t, 98.2, 98.6)), transform: `translateX(${shake}px) scale(${mix(0.8, 1, card)})`, origin: [960, 130]},
		'myth-cross': {draw: p(t, 98, 98.4), opacity: p(t, 98, 98.05)},
		'label-squid': fade(t, 100, 100.6),
		'label-fish': fade(t, 101.4, 101.8),
		'label-verdict': {opacity: p(t, 105.8, 106.6, ease.outCubic), transform: `scale(${mix(0.9, 1, p(t, 105.8, 106.6, ease.outCubic))})`, origin: [960, 1026]},
		fish: {transform: `scale(${1 + 0.08 * Math.sin(2 * Math.PI * 2 * Math.max(0, t - 101)) * (t > 101 && t < 103 ? 1 : 0)})`, origin: [1108, 816]},
	};
	let dip = 0;
	for (let i = 1; i <= 4; i++) {
		const t0 = 98.6 + (i - 1) * 0.5;
		styles[`wave-${i}`] = {transform: `translateX(${mix(0, 1500, p(t, t0, t0 + 4))}px)`, opacity: t < t0 ? 0 : 1 - p(t, t0 + 3.6, t0 + 4)};
		dip = Math.max(dip, Math.sin(Math.PI * p(t, t0 + 1.9, t0 + 2.5)));
	}
	styles.squid = {opacity: p(t, 95, 96) * (1 - 0.3 * dip)};
	return <SvgScene dir={`${DIR}/scene-11_through-squid`} layers={['00_background', '10_myth', '20_waves', '30_squid', '40_fish', '90_labels']} animate={() => styles} />;
};

// ─── Сцена 12 — Щелчки → «buzz» → тишина (108.7–123.6) ───────────
const SEARCH_X = [200, 320, 440, 560, 680];
const BUZZ_X = Array.from({length: 63}, (_, i) => 860 + 9 * i);
/** Положение «головки» (x холста) во времени ТЗ. */
const headX = (t: number) =>
	t < 115 ? mix(140, 800, p(t, 109.2, 115)) : t < 119 ? mix(800, 1440, p(t, 115, 119)) : mix(1440, 1800, p(t, 119, 122));
/** Когда головка проходит x (секунды ТЗ). */
const headAt = (x: number) =>
	x <= 800 ? 109.2 + ((x - 140) / 660) * 5.8 : x <= 1440 ? 115 + ((x - 800) / 640) * 4 : 119 + ((x - 1440) / 360) * 3;
export const SCENE12_SEARCH_TZ = SEARCH_X.map(headAt);

export const Scene12: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const styles: Record<string, ElStyle> = {
		bg: fade(t, 108.7, 109.2),
		title: fade(t, 108.7, 109.2),
		baseline: fade(t, 108.7, 109.2),
		playhead: {transform: `translateX(${headX(t) - 140}px)`, opacity: p(t, 109, 109.3) * (1 - p(t, 122, 122.5))},
		'label-search': fade(t, 109.6, 110.2),
		'label-buzz': fade(t, 115, 115.6),
		'catch-marker': {opacity: p(t, 119.6, 119.8), clipPath: revealY(p(t, 119.6, 120.2, ease.outCubic))},
		'#catch-marker circle': {transform: `scale(${p(t, 119.8, 120.4, ease.outBack(1.5))})`, origin: [1620, 620]},
		'#catch-marker text': {transform: `scale(${p(t, 119.9, 120.4, ease.outBack(1.5))})`, origin: [1620, 620]},
		'label-catch': fade(t, 120, 120.4),
		'clicks-buzz': {filter: t > 115 && t < 119.6 ? glow(1, '#ffb547') : undefined},
	};
	SEARCH_X.forEach((x, i) => {
		const t0 = headAt(x);
		styles[`#clicks-search > line:nth-of-type(${i + 1})`] = {transform: `scaleY(${p(t, t0, t0 + 0.15, ease.outBack(2))})`, origin: [x, 620]};
	});
	BUZZ_X.forEach((x, i) => {
		const t0 = headAt(x);
		styles[`#clicks-buzz > line:nth-of-type(${i + 1})`] = {transform: `scaleY(${p(t, t0, t0 + 0.08)})`, origin: [x, 620]};
	});
	return (
		<SvgScene
			dir={`${DIR}/scene-12_click-buzz`}
			layers={['00_background', '10_baseline', '20_clicks-search', '30_clicks-buzz', '40_catch', '90_labels']}
			animate={() => styles}
		/>
	);
};

// ─── Сцена 13 — Можно и без зубов (123.6–130) ────────────────────
export const Scene13: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const pull = p(t, 125.8, 127.4, ease.inCubic);
	const rival = p(t, 127.8, 128.6, ease.outCubic);
	const bite = Math.sin(Math.PI * p(t, 128.6, 129.3)) + Math.sin(Math.PI * p(t, 129.3, 130));
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-13_suction-feeding`}
				layers={['00_background', '10_whale', '20_squid-medium', '30_suction', '40_big-rival', '90_labels']}
				animate={() => ({
					bg: fade(t, 123.6, 124.2),
					whale: fade(t, 123.6, 124.2),
					'squid-medium': {
						opacity: p(t, 123.6, 124.2) * (1 - pull),
						transform: `translateX(${mix(0, -500, pull)}px) scale(${mix(1, 0.4, pull)})`,
						origin: [1500, 470],
					},
					'label-jaw': {opacity: p(t, 124.2, 124.4) * (t < 124.8 ? (Math.sin(t * 40) > 0 ? 1 : 0.3) : 1)},
					'suction-arrows': {
						opacity: p(t, 125.6, 125.9) * (1 - p(t, 127.4, 127.8)) * (0.75 + wave(t, 0.5, 0.25)),
						dash: {array: '24 16', offset: 200 * Math.max(0, t - 125.6)},
					},
					'label-suction': fade(t, 126, 126.4),
					'big-rival': {opacity: rival, transform: `scale(${mix(0.8, 1, rival)})`, origin: [1550, 840]},
					'label-rival': {opacity: rival},
					'rival-tooth': {transform: `rotate(${-15 + 15 * bite}deg)`, origin: [1360, 790]},
				})}
			/>
			<Flash color="#000" opacity={p(t, 129.4, 130)} />
		</AbsoluteFill>
	);
};

/** Звуковые акценты сцен (секунды ТЗ). */
export const SCENE_SFX: {tz: number; src: string; volume: number}[] = [
	{tz: 11.6, src: 'sfx/thud.wav', volume: 0.3},
	{tz: 13.4, src: 'sfx/hiss.wav', volume: 0.22},
	{tz: 21.2, src: 'sfx/gulp.wav', volume: 0.35},
	{tz: 29.4, src: 'sfx/hiss.wav', volume: 0.12},
	{tz: 31.2, src: 'sfx/thud.wav', volume: 0.4},
	{tz: 51.2, src: 'sfx/clicks.wav', volume: 0.35},
	...CLICKS_07.map((tz, i) => ({tz, src: 'sfx/click.wav', volume: i === 0 ? 0.6 : 0.4})),
	{tz: 61.6, src: 'sfx/hit.wav', volume: 0.35},
	{tz: 82.6, src: 'sfx/ring.wav', volume: 0.5},
	...WAVES_10.map((tz) => ({tz, src: 'sfx/click.wav', volume: 0.55})),
	...SCENE12_SEARCH_TZ.map((tz) => ({tz, src: 'sfx/click.wav', volume: 0.4})),
	{tz: 115, src: 'sfx/buzz.wav', volume: 0.5},
	{tz: 125.8, src: 'sfx/gulp.wav', volume: 0.4},
	{tz: 128.9, src: 'sfx/clack.wav', volume: 0.35},
	{tz: 129.6, src: 'sfx/clack.wav', volume: 0.3},
];
