import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {SvgScene, type ElStyle} from '../../../svg/SvgScene';
import {ease, mix, mixColor, p, rand, revealX, revealY, wave, type TimeMap} from '../../../svg/motion';
import {DIR} from './paths';

/**
 * Глава 4 «Инженерия бешеных глубин» — 11 сцен по ТЗ ocean-animations
 * (projects/sperm-whale/04_inzheneriya-glubin/README.md). Времена в коде — секунды ТЗ.
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
const pop = (t: number, t0: number, t1: number, origin: [number, number]): ElStyle => ({
	transform: `scale(${p(t, t0, t1, ease.spring(12))})`,
	origin,
});
const pulse = (t: number, t0: number, t1: number, peak: number) => 1 + (peak - 1) * Math.sin(Math.PI * p(t, t0, t1));
const glow = (k: number, color: string) => (k > 0.01 ? `drop-shadow(0 0 ${18 * k}px ${color})` : undefined);
const shakeAt = (t: number, t0: number, dur: number, amp: number) =>
	t > t0 && t < t0 + dur ? (rand(Math.floor(t * 30)) - 0.5) * 2 * amp * (1 - (t - t0) / dur) : 0;

// ─── Сцена 01 — Погружение и давление (0–13.4) ───────────────────
export const Scene01: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const dive = p(t, 0, 8, ease.inOutSine);
	const g = p(t, 0.4, 1, ease.outCubic);
	const alarm = t > 9.6 ? 0.5 + 0.5 * Math.sin(2 * Math.PI * (t - 9.6)) : 0;
	const zoom = p(t, 12.8, 13.4, ease.inCubic);
	return (
		<SvgScene
			dir={`${DIR}/scene-01_dive-pressure`}
			layers={['00_background', '10_depth-scale', '20_dive-zone', '30_whale', '40_marker-1800', '50_gauge', '90_labels']}
			camera={() => ({scale: mix(1, 2.2, zoom), origin: [1640, 330]})}
			animate={() => ({
				bg: fade(t, 0, 0.6),
				'depth-scale': fade(t, 0, 0.6),
				title: fade(t, 0, 0.6),
				whale: {transform: `translateY(${mix(-700, 0, dive)}px) rotate(${wave(t, 2.5, 2)}deg)`, origin: [750, 700]},
				'gauge-needle': {transform: `rotate(${mix(-180, 0, dive) + (t > 9 ? wave(t, 0.15, 2) * (1 - p(t, 9.6, 10.6)) : 0)}deg)`, origin: [1640, 330]},
				'dive-zone': {opacity: p(t, 2, 2.8), transform: `scaleY(${p(t, 2, 2.8, ease.outCubic)})`, origin: [950, 550]},
				gauge: {opacity: g, transform: `scale(${mix(0.8, 1, g)})`, origin: [1640, 330]},
				'#gauge circle': {stroke: mixColor('#c7d3dc', '#ff5a4f', alarm)},
				'marker-1800': {clipPath: revealX(p(t, 7.6, 8.2, ease.outCubic))},
				'gauge-value': {opacity: p(t, 9, 9.3)},
				'#gauge-value text:nth-of-type(1)': {text: `${Math.round(180 * p(t, 9, 9.6, ease.outCubic))} атм`},
			})}
		/>
	);
};

// ─── Сцена 02 — Носорог на дюйме (13.4–20.5) ─────────────────────
export const Scene02: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const fall = p(t, 16.8, 17.5, ease.inQuad);
	const land = p(t, 17.5, 17.8);
	const finger = t < 17.8 ? 0 : t < 18.05 ? mix(0, 14, p(t, 17.8, 18.05)) : mix(14, 6, p(t, 18.05, 18.3));
	return (
		<SvgScene
			dir={`${DIR}/scene-02_rhino-inch`}
			layers={['00_background', '10_hand', '20_square-inch', '30_rhino', '40_pressure-arrows', '90_labels']}
			animate={() => ({
				bg: fade(t, 13.4, 14),
				title: fade(t, 13.4, 14),
				hand: {transform: `translateY(${mix(300, 0, p(t, 13.4, 14, ease.outCubic)) + finger}px)`},
				'square-inch': {...pop(t, 14.6, 15.2, [950, 590]), filter: glow(Math.sin(Math.PI * p(t, 14.6, 15.6)), '#ffb547')},
				'label-inch': fade(t, 14.8, 15.2),
				rhino: {
					opacity: t < 16.8 ? 0 : 1,
					transform: `translateY(${mix(-800, 0, fall) + finger}px) scaleY(${t < 17.5 ? 1 : mix(0.9, 1, land)})`,
					origin: [910, 540],
				},
				'label-rhino': fade(t, 17.8, 18.4),
				'pressure-arrows': {opacity: p(t, 18.4, 18.8), transform: `translateY(${t > 18.4 ? 10 + 10 * Math.sin((2 * Math.PI * (t - 18.4)) / 0.6) : 0}px)`},
			})}
		/>
	);
};

// ─── Сцена 03 — Подлодку сплющило (20.5–27.5) ────────────────────
export const Scene03: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const squeeze = p(t, 21.2, 23, ease.inCubic);
	const crush = p(t, 24.2, 25, ease.inExpo);
	const sh = shakeAt(t, 24.8, 0.5, 8);
	return (
		<AbsoluteFill style={{transform: `translate(${sh}px, ${sh * 0.6}px)`}}>
			<SvgScene
				dir={`${DIR}/scene-03_sub-crushed`}
				layers={['00_background', '10_submarine', '20_cracks', '30_pressure-arrows', '90_labels']}
				animate={() => ({
					submarine: {
						opacity: p(t, 20.5, 21),
						transform: `translateY(${mix(-120, 0, p(t, 20.5, 21.2, ease.outCubic))}px) scale(${mix(1, 1.08, crush)}, ${mix(1, 0.35, crush)})`,
						origin: [960, 560],
					},
					'label-sub': fade(t, 20.5, 21.2),
					'pressure-arrows': {transform: `scaleY(${mix(1, 0.8, squeeze)})`, origin: [1000, 560], opacity: p(t, 21.2, 21.5)},
					cracks: {draw: p(t, 23, 23.3), opacity: (t < 23 ? 0 : 1) * (1 - p(t, 24.2, 24.6)), filter: glow(Math.sin(Math.PI * p(t, 23, 23.6)), '#ffffff')},
					'label-depth': fade(t, 25, 25.6),
				})}
			/>
			<Flash color="#ffffff" opacity={p(t, 27.1, 27.5, ease.inCubic)} />
		</AbsoluteFill>
	);
};

// ─── Сцена 04 — Отдых и дыхало слева (27.5–40.5) ─────────────────
const BLOWS = [31.0, 32.6];
export const Scene04: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	let blow = 0;
	for (const b0 of BLOWS) blow = Math.max(blow, Math.sin(Math.PI * p(t, b0, b0 + 1.2)));
	const big = p(t, 36.8, 38.4, ease.outQuart);
	const bigOpacity = t < 36.8 ? 0 : mix(1, 0.3, p(t, 38.4, 39.4));
	const fillDeg = 360 * p(t, 30.4, 33.6);
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-04_blowhole-top`}
				layers={['00_background', '10_whale-top', '20_axis', '30_blow', '40_timer', '90_labels']}
				animate={() => ({
					'whale-top': {opacity: p(t, 27.5, 28.5), transform: `rotate(${wave(t, 4, 1)}deg)`, origin: [900, 560]},
					'label-view': fade(t, 27.5, 28.5),
					ripples: {transform: `translateX(${wave(t, 5, 20)}px)`, opacity: 0.275 + wave(t, 3, 0.075)},
					timer: pop(t, 29.6, 30.4, [300, 200]),
					// Сектор таймера «отсчитывает» (вместо conic clip — поворот маски-сектора).
					'timer-fill': {clipPath: `polygon(50% 50%, 50% -50%, ${fillDeg > 180 ? '150% -50%, 150% 150%, -50% 150%' : '150% -50%'}, ${50 + 100 * Math.sin((fillDeg * Math.PI) / 180)}% ${50 - 100 * Math.cos((fillDeg * Math.PI) / 180)}%)`},
					'label-rest': fade(t, 30.6, 31),
					'axis-line': {draw: p(t, 34.6, 35.4, ease.outCubic)},
					'label-blowhole': {opacity: p(t, 34.8, 35.4), filter: glow(Math.sin(Math.PI * p(t, 34.8, 35.8)), '#ffb547')},
					blow: {
						opacity: Math.max(blow, bigOpacity),
						transform: `scale(${Math.max(mix(0.1, 0.6, blow), t >= 36.8 ? mix(0.1, 1, big) : 0)})`,
						origin: [1530, 482],
					},
					'label-blow': fade(t, 37.4, 38),
				})}
			/>
			<Flash color="#ffffff" opacity={1 - p(t, 27.5, 28)} />
		</AbsoluteFill>
	);
};
export const SCENE04_BLOWS_TZ = [...BLOWS, 36.8];

// ─── Сцена 05 — Fluking up (40.5–45.9) ───────────────────────────
export const Scene05: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const up = p(t, 40.5, 42.5, ease.outCubic);
	const down = p(t, 44.6, 45.9, ease.inCubic);
	const lf = p(t, 43.4, 44, ease.outCubic);
	const styles: Record<string, ElStyle> = {
		fluke: {transform: `translateY(${mix(520, 0, up) + mix(0, 180, down)}px)`},
		splash: {opacity: t < 40.8 ? 0 : mix(0.8, 0.3, p(t, 40.8, 42.5)), transform: `scale(${mix(0.5, 1.2, p(t, 40.8, 42.5, ease.outCubic))})`, origin: [960, 712]},
		'label-fluking': {opacity: lf, letterSpacing: mix(12, 0, lf)},
	};
	for (let i = 1; i <= 6; i++) {
		const ph = ((t - 42 - i * 0.13) % 0.8) / 0.8;
		styles[`#drips > line:nth-of-type(${i})`] = {
			opacity: t < 42 ? 0 : 1 - ph,
			transform: `translateY(${120 * ph + mix(520, 0, up) + mix(0, 180, down)}px)`,
		};
	}
	return <SvgScene dir={`${DIR}/scene-05_fluking-up`} layers={['00_background', '10_fluke', '20_drips', '30_splash', '90_labels']} animate={() => styles} />;
};

// ─── Сцена 06 — Хвост как отпечаток пальца (45.9–50.4) ───────────
const NICKS: [number, number][] = [
	[470, 437],
	[810, 437],
	[320, 480],
	[978, 470],
];
export const Scene06: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const styles: Record<string, ElStyle> = {
		bg: fade(t, 45.9, 46.4),
		'fluke-id': fade(t, 45.9, 46.4),
		title: fade(t, 45.9, 46.4),
		'label-fluke': fade(t, 46.6, 47.2),
		equals: {transform: `scale(${p(t, 47.6, 48, ease.outBack(1.5))})`, origin: [1180, 536]},
		'label-fp': fade(t, 48.2, 48.8),
	};
	NICKS.forEach((o, i) => {
		styles[`#nick-markers > circle:nth-of-type(${i + 1})`] = {transform: `scale(${p(t, 46.4 + i * 0.2, 46.7 + i * 0.2, ease.outBack(2))})`, origin: o};
	});
	for (let i = 1; i <= 8; i++) {
		styles[`#fingerprint ellipse:nth-of-type(${i})`] = {draw: p(t, 48 + (i - 1) * 0.05, 48.5 + (i - 1) * 0.05, ease.outCubic)};
	}
	return (
		<SvgScene
			dir={`${DIR}/scene-06_fluke-fingerprint`}
			layers={['00_background', '10_fluke', '20_nicks', '30_fingerprint', '40_equals', '90_labels']}
			animate={() => styles}
		/>
	);
};

// ─── Сцена 07 — Кессонная болезнь = газировка (50.4–65.1) ────────
export const Scene07: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const styles: Record<string, ElStyle> = {
		bg: fade(t, 50.4, 51),
		title: fade(t, 50.4, 51),
		'vessel-deep': {opacity: p(t, 53, 53.6)},
		'label-deep': fade(t, 53.2, 53.8),
		'ascent-arrow': {draw: p(t, 58.6, 59.4, ease.outCubic)},
		'vessel-ascent': {opacity: p(t, 59.2, 59.6)},
		'label-ascent': fade(t, 59.4, 60),
		'label-block': {opacity: p(t, 61.4, 61.6) * (t < 62.2 ? (Math.sin(t * 30) > 0 ? 1 : 0.4) : 1)},
		'soda-closed': appear(t, 55, 56, 40),
		'soda-arrow': {draw: p(t, 59.4, 60, ease.outCubic)},
		'soda-open': {opacity: p(t, 59.4, 59.8)},
	};
	// Пузыри азота растут по очереди.
	for (let i = 1; i <= 12; i++) {
		styles[`#vessel-ascent ellipse:nth-of-type(${i})`] = {opacity: p(t, 59.4 + (i - 1) * 0.15, 59.6 + (i - 1) * 0.15)};
	}
	// Азот «входит» в кровь и течёт.
	for (let i = 1; i <= 12; i++) {
		styles[`#vessel-deep ellipse:nth-of-type(${i})`] = {
			transform: `translate(${t > 54 ? (((t - 54 + i * 0.11) % 1.5) / 1.5) * 40 : 0}px, ${mix(-40, 0, p(t, 53, 54, ease.outCubic))}px)`,
		};
	}
	return (
		<SvgScene
			dir={`${DIR}/scene-07_decompression`}
			layers={['00_background', '10_vessel-deep', '20_vessel-ascent', '30_arrow', '40_soda', '90_labels']}
			animate={() => styles}
		/>
	);
};

// ─── Сцена 08 — Складные лёгкие (65.1–85.7) ──────────────────────
export const Scene08: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const breathe = t < 68 ? 1 + 0.025 * (1 + Math.sin((2 * Math.PI * (t - 65.1)) / 2)) : 1;
	const exhale = mix(1, 0.85, p(t, 68, 69, ease.inOutSine));
	const squeeze = p(t, 74, 77, ease.inOutCubic);
	return (
		<SvgScene
			dir={`${DIR}/scene-08_lung-collapse`}
			layers={['00_background', '10_ribcage-surface', '20_ribcage-deep', '30_squeeze', '90_labels']}
			animate={() => ({
				bg: fade(t, 65.1, 65.8),
				title: fade(t, 65.1, 65.8),
				'chest-surface': fade(t, 65.1, 65.8),
				'label-surface': fade(t, 65.1, 65.8),
				'chest-surface-lungs': {transform: `scale(${breathe * exhale})`, origin: [520, 580]},
				'label-cartilage': {opacity: p(t, 70, 70.6), filter: glow(Math.sin(Math.PI * p(t, 70, 71.4)), '#7fe3ff')},
				'chest-deep': {opacity: p(t, 73, 74), transform: `scaleX(${mix(1.15, 1, squeeze)})`, origin: [1400, 580]},
				'label-deep': fade(t, 73, 74),
				'squeeze-arrows': {opacity: p(t, 74, 74.4), transform: `scaleX(${t > 74 ? 1 - 0.05 * (1 + Math.sin((2 * Math.PI * (t - 74)) / 1)) : 1})`, origin: [1400, 580]},
				'chest-deep-lungs': {transform: `scaleX(${mix(2, 1, p(t, 77, 78, ease.inOutCubic))})`, origin: [1400, 580]},
				'no-nitrogen': pop(t, 80, 80.8, [1400, 960]),
				'label-flat': fade(t, 81.6, 82.4),
			})}
		/>
	);
};

// ─── Сцена 09 — Кислородные аккумуляторы (85.7–108.1) ────────────
export const Scene09: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const charge = t > 103 ? 1 + 0.02 * (1 + Math.sin((2 * Math.PI * (t - 103)) / 0.8)) : 1;
	const chargeGlow = t > 103 ? 0.6 + 0.4 * Math.sin((2 * Math.PI * (t - 103)) / 0.8) : 0;
	const lungsBlink = t > 90 && t < 91.2 ? (Math.sin(t * 25) > 0 ? 1 : 0.4) : 1;
	return (
		<SvgScene
			dir={`${DIR}/scene-09_oxygen-batteries`}
			layers={['00_background', '10_muscle-swatches', '20_batteries', '30_breath-bars', '90_labels']}
			animate={() => ({
				bg: fade(t, 85.7, 86.3),
				title: fade(t, 85.7, 86.3),
				'label-breath': fade(t, 85.7, 86.3),
				'#bar-human > rect': {transform: `scaleX(${p(t, 86.4, 87, ease.outCubic)})`, origin: [220, 780]},
				'#bar-human > text': fade(t, 86.6, 87),
				'#bar-whale > rect': {transform: `scaleX(${p(t, 87, 89.4, ease.outCubic)})`, origin: [220, 860]},
				'#bar-whale > text': {opacity: p(t, 87, 87.3), text: `кашалот: до ${Math.round(90 * p(t, 87, 89.4, ease.outCubic))} мин`},
				'battery-lungs': {opacity: p(t, 90, 90.4) * lungsBlink},
				'battery-muscle': {opacity: p(t, 91.4, 91.8), transform: `scale(${charge})`, origin: [1612, 358], filter: glow(chargeGlow, '#5fe38a')},
				'battery-blood': {opacity: p(t, 91.4, 91.8), transform: `scale(${charge})`, origin: [1612, 598], filter: glow(chargeGlow, '#5fe38a')},
				'battery-muscle-fill': {transform: `scaleX(${p(t, 91.6, 93, ease.outCubic)})`, origin: [1464, 330]},
				'battery-blood-fill': {transform: `scaleX(${p(t, 91.6, 93, ease.outCubic)})`, origin: [1464, 570]},
				'muscle-human': appear(t, 94, 95, 30),
				'muscle-whale': appear(t, 96, 97, 30),
				'#muscle-whale > rect': {fill: mixColor('#b5323c', '#2a0b10', p(t, 98, 99.6, ease.inOutSine))},
			})}
		/>
	);
};

// ─── Сцена 10 — Восковой балласт: погружение (108.1–130.4) ───────
const WARM = '#f3d36b';
const COLD = '#cfe8f5';
export const Scene10: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const sink = p(t, 122, 129.7, ease.inQuad);
	const whaleT = `translateY(${260 * sink}px) rotate(${12 * sink}deg)`;
	const styles: Record<string, ElStyle> = {
		bg: fade(t, 108.1, 108.8),
		title: fade(t, 108.1, 108.8),
		whale: {opacity: p(t, 108.1, 108.8), transform: whaleT, origin: [1000, 470]},
		'organ-spermaceti': {transform: whaleT, origin: [1000, 470]},
		'#organ-spermaceti rect': {fill: mixColor(WARM, COLD, p(t, 115, 119, ease.inOutSine))},
		'thermo-level': {transform: `scaleY(${t < 110 ? mix(1, 3.2, p(t, 108.8, 110)) : mix(3.2, 1, p(t, 115, 119, ease.inOutSine))})`, origin: [1760, 620]},
		'cold-water': {opacity: p(t, 114, 114.6), dash: {array: '26 14', offset: -120 * Math.max(0, t - 114)}},
		'label-cool': fade(t, 114.4, 115),
		'label-solid': fade(t, 120, 120.6),
		'sink-arrow': {draw: p(t, 124, 124.8, ease.outCubic), opacity: t < 124 ? 0 : t > 124.8 ? 0.7 + wave(t, 0.8, 0.3) : 1},
		'label-sink': fade(t, 124.2, 124.8),
	};
	for (let i = 1; i <= 9; i++) {
		styles[`#organ-spermaceti path:nth-of-type(${i})`] = {opacity: 0.9 * p(t, 118 + (i - 1) * 0.15, 118.3 + (i - 1) * 0.15)};
	}
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-10_ballast-sink`}
				layers={['00_background', '10_whale', '20_spermaceti', '30_cold-water', '40_thermometer', '50_sink-arrow', '90_labels']}
				animate={() => styles}
			/>
			<Flash color="#000" opacity={p(t, 130, 130.4)} />
		</AbsoluteFill>
	);
};

// ─── Сцена 11 — Тёплая кровь: всплытие (130.4–140) ───────────────
export const Scene11: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const rise = p(t, 135.4, 139.3, ease.outCubic);
	const whaleT = `translateY(${200 * (1 - rise)}px)`;
	const melt = p(t, 133.6, 135.4, ease.inOutSine);
	const bob = p(t, 136.4, 137.2, ease.outCubic);
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-11_float-up`}
				layers={['00_background', '10_whale', '20_spermaceti', '30_warm-blood', '40_thermometer', '50_float', '90_labels']}
				animate={() => ({
					bg: fade(t, 130.4, 131),
					whale: {opacity: p(t, 130.4, 131), transform: whaleT},
					'organ-spermaceti': {transform: `${whaleT} skewX(${melt > 0 && melt < 1 ? wave(t, 0.6, 2) : 0}deg)`, origin: [1084, 350]},
					'#organ-spermaceti rect': {fill: mixColor(COLD, WARM, melt)},
					'#organ-spermaceti path': {opacity: 1 - melt},
					'warm-blood': {opacity: p(t, 131.4, 132), dash: {array: '26 14', offset: -150 * Math.max(0, t - 131.4)}},
					'label-warm': fade(t, 131.6, 132.2),
					'thermo-level': {transform: `scaleY(${mix(0.3, 1, p(t, 132, 135, ease.inOutSine))})`, origin: [1760, 620]},
					'float-bob': {opacity: bob, transform: `translateY(${mix(40, 0, bob) + (t > 137.2 ? wave(t, 1.6, 8) : 0)}px)`},
					'label-light': fade(t, 136.6, 137.2),
					'rise-arrow': {clipPath: `inset(${(1 - p(t, 137, 137.8, ease.outCubic)) * 100}% 0 0 0)`},
					'label-rise': fade(t, 137.2, 137.8),
				})}
			/>
			<Flash color="#000" opacity={p(t, 139.4, 140)} />
		</AbsoluteFill>
	);
};

/** Звуковые акценты сцен (секунды ТЗ). */
export const SCENE_SFX: {tz: number; src: string; volume: number}[] = [
	{tz: 0.5, src: 'sfx/drone.wav', volume: 0.45},
	{tz: 9.6, src: 'sfx/creak.wav', volume: 0.3},
	{tz: 17.8, src: 'sfx/thud.wav', volume: 0.55},
	{tz: 22.0, src: 'sfx/creak.wav', volume: 0.35},
	{tz: 24.6, src: 'sfx/crunch.wav', volume: 0.5},
	...SCENE04_BLOWS_TZ.map((tz, i) => ({tz, src: 'sfx/blow.wav', volume: i < 2 ? 0.3 : 0.55})),
	{tz: 41.0, src: 'sfx/hiss.wav', volume: 0.25},
	{tz: 46.4, src: 'sfx/tick.wav', volume: 0.35},
	{tz: 48.0, src: 'sfx/tick.wav', volume: 0.35},
	{tz: 59.4, src: 'sfx/hiss.wav', volume: 0.4},
	{tz: 80.0, src: 'sfx/tick.wav', volume: 0.4},
	{tz: 91.6, src: 'sfx/beep.wav', volume: 0.25},
	{tz: 118.0, src: 'sfx/crunch.wav', volume: 0.2},
	{tz: 122.0, src: 'sfx/drone.wav', volume: 0.4},
	{tz: 131.4, src: 'sfx/gulp.wav', volume: 0.2},
	{tz: 135.4, src: 'sfx/whoosh.wav', volume: 0.25},
];
