import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {SvgScene} from '../../../svg/SvgScene';
import {ease, fadeInOut, mix, p, revealX, revealY, wave, type TimeMap} from '../../../svg/motion';
import {DIR} from './paths';

/**
 * Глава 1 «Вторжение воздуха в вечный мрак» — 9 сцен по ТЗ ocean-animations
 * (projects/sperm-whale/01_vtorzhenie-vozdukha/README.md).
 *
 * Все времена в коде — секунды ТЗ (от начала главы по ТЗ). Реальное время сцены переводится
 * во время ТЗ функцией tz (timeMap по якорным словам озвучки), поэтому якоря ⚓ попадают в слова диктора.
 */
type P = {tz: TimeMap};

const useT = (tz: TimeMap) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	return tz(f / fps);
};

/** Полноэкранная заливка поверх сцены (вспышки, затемнения). */
const Flash: React.FC<{color: string; opacity: number}> = ({color, opacity}) => (
	<AbsoluteFill style={{backgroundColor: color, opacity, pointerEvents: 'none'}} />
);

// ─── Сцена 01 — Маслянистая тьма (0–14) ───────────────────────────
export const Scene01: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const dive = p(t, 2, 12, ease.inOutSine);
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-01_oily-darkness`}
				layers={['00_background', '10_light-rays', '20_oil-surface', '30_marine-snow', '40_vignette']}
				cameraExclude={['40_vignette']}
				camera={() => ({focus: [960, 540 + 260 * dive]})}
				layerStyle={() => ({
					// Морской снег плывёт вверх медленнее камеры, поверхность — быстрее (параллакс).
					'20_oil-surface': {transform: `translate(${wave(t, 4, 20)}px, ${-160 * dive}px)`},
					'30_marine-snow': {transform: `translateY(${mix(0, -80, p(t, 0, 14))}px)`},
				})}
				animate={() => ({
					'light-rays': {opacity: mix(0.22, 0, p(t, 3, 13, ease.inSine)) / 0.22},
					'light-rays-1': {opacity: 0.82 + wave(t, 3, 0.18)},
					'light-rays-2': {opacity: 0.82 + wave(t, 3, 0.18, 0.25)},
					'light-rays-3': {opacity: 0.82 + wave(t, 3, 0.18, 0.5)},
					'light-rays-4': {opacity: 0.82 + wave(t, 3, 0.18, 0.75)},
					vignette: {opacity: mix(0.6, 1, p(t, 4, 14))},
				})}
			/>
			<Flash color="#000" opacity={Math.max(1 - p(t, 0, 1.5, ease.outCubic), p(t, 13.6, 14))} />
		</AbsoluteFill>
	);
};

// ─── Сцена 02 — Кальмар размером с автобус (14–28) ────────────────
export const Scene02: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-02_squid-vs-bus`}
				layers={['00_background', '10_ruler', '20_bus', '30_squid', '40_sucker-inset', '90_labels']}
				camera={() => ({scale: mix(1, 1.04, p(t, 24.5, 28, ease.inOutSine))})}
				animate={() => {
					const squidIn = p(t, 16.8, 17.6, ease.outCubic);
					const lbl = p(t, 16.6, 17.0, ease.outCubic);
					return {
						bg: {opacity: p(t, 14, 14.6)},
						title: {opacity: p(t, 14.3, 15, ease.outCubic), transform: `translateY(${mix(-30, 0, p(t, 14.3, 15, ease.outCubic))}px)`},
						bus: {transform: `translateX(${mix(1300, 0, p(t, 15.2, 16.8, ease.outBack(1.1)))}px)`},
						'label-bus': {opacity: lbl, transform: `translateY(${mix(10, 0, lbl)}px)`},
						squid: {opacity: squidIn, transform: `translateY(${mix(200, 0, squidIn)}px)`},
						'squid-tentacles': {transform: `scaleX(${mix(0.35, 1, p(t, 17.2, 18.6, ease.outExpo))})`, origin: [660, 735]},
						'squid-arms': {transform: `skewY(${p(t, 21, 21.5) * wave(t, 1.6, 3)}deg)`, origin: [660, 735]},
						'label-squid': {opacity: p(t, 18, 18.4)},
						ruler: {clipPath: revealX(p(t, 18.4, 19.4, ease.outCubic))},
						'inset-line': {transform: `scaleX(${p(t, 19.5, 20.0, ease.outCubic)})`, origin: [1545, 735]},
						'inset-sucker': {
							transform: `scale(${p(t, 19.5, 20.3, ease.spring(12))}) rotate(${mix(0, 20, p(t, 20.3, 24))}deg)`,
							origin: [1740, 735],
						},
						'label-inset': {opacity: p(t, 20.3, 20.6)},
						'label-note': {opacity: p(t, 22, 22.6)},
					};
				}}
			/>
			<Flash color="#000" opacity={p(t, 27.6, 28)} />
		</AbsoluteFill>
	);
};

// ─── Сцена 03 — Властелины тьмы (28–39) ──────────────────────────
export const Scene03: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	// Фонарик: два мигания при включении, потом мягкая пульсация.
	const blink = t < 28.5 ? 0 : t < 28.75 ? 1 : t < 28.95 ? 0.15 : t < 29.2 ? 1 : t < 29.4 ? 0.3 : p(t, 29.4, 30);
	const squidFar = t < 33 ? mix(0, 0.35, p(t, 31, 33)) : mix(0.35, 0.25, p(t, 33, 39));
	return (
		<SvgScene
			dir={`${DIR}/scene-03_rulers-of-darkness`}
			layers={['00_background', '10_squid-far', '20_anglerfish', '30_viperfish', '40_bioluminescence', '50_vignette']}
			cameraExclude={['50_vignette']}
			camera={() => ({scale: mix(1, 1.03, p(t, 36.5, 39, ease.inOutSine))})}
			animate={() => ({
				bg: {opacity: p(t, 28, 29)},
				'bio-dots': {opacity: p(t, 28, 29) * (0.65 + wave(t, 2.3, 0.2) + wave(t, 0.9, 0.12, 0.3))},
				'anglerfish-lure': {
					opacity: blink,
					transform: `scale(${1 + 0.075 * (1 + Math.sin((2 * Math.PI * (t - 30)) / 1.2)) * p(t, 30, 30.3)})`,
					origin: [556, 424],
				},
				anglerfish: {
					transform: `translate(${mix(0, -60, p(t, 29, 39, ease.inOutSine))}px, ${mix(0, -20, p(t, 29, 39, ease.inOutSine))}px)`,
				},
				viperfish: {
					transform: `translateX(${mix(300, -500, p(t, 30, 39))}px) rotate(${wave(t, 2.2, 2)}deg)`,
					origin: [1410, 810],
				},
				'squid-far': {opacity: squidFar, transform: `translateX(${mix(0, -200, p(t, 31, 39))}px)`},
			})}
		/>
	);
};

// ─── Сцена 04 — Первый щелчок (39–47) ─────────────────────────────
const SRC: [number, number] = [-200, 540];
const EYES: [number, number][] = [
	[1398, 361],
	[1644, 641],
	[1164, 821],
	[1776, 251],
	[992, 471],
];
const RINGS = [42.6, 44, 45, 46];

export const Scene04: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const styles: Record<string, import('../../../svg/SvgScene').ElStyle> = {};
	RINGS.forEach((r0, i) => {
		const pr = p(t, r0, r0 + 1.4, ease.outCubic);
		styles[`sonar-ring-${i + 1}`] = {
			transform: `scale(${mix(0.2, 1.6, pr)})`,
			opacity: t < r0 ? 0 : 1 - pr,
			origin: SRC,
		};
	});
	EYES.forEach(([x, y], i) => {
		const dist = Math.hypot(x - SRC[0], y - SRC[1]);
		const hit = 42.6 + dist / 1500;
		const flare = p(t, hit, hit + 0.35, ease.outCubic);
		const hide = p(t, 44.5 + i * 0.4, 45.5 + i * 0.4, ease.inCubic);
		const nx = (x - SRC[0]) / dist;
		const ny = (y - SRC[1]) / dist;
		styles[`eyes-${i + 1}`] = {
			opacity: mix(0.25, 1, flare) * (1 - hide),
			transform: `translate(${nx * 40 * hide}px, ${ny * 40 * hide}px) scale(${mix(1, 1.3, flare)})`,
			origin: [x, y],
		};
	});
	const lp = p(t, 42.6, 43.4);
	styles['label-click'] = {
		opacity: lp <= 0 ? 0 : lp < 0.3 ? lp / 0.3 : 1 - p(lp, 0.6, 1),
		transform: `scale(${lp < 0.4 ? mix(0.6, 1.1, lp / 0.4) : mix(1.1, 1, p(lp, 0.4, 0.7))})`,
		origin: [250, 540],
	};
	styles.bg = {opacity: 1};
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-04_first-click`}
				layers={['00_background', '10_creature-eyes', '20_sonar-waves', '90_labels']}
				animate={() => styles}
			/>
			{/* Волна последнего щелчка «вытирает» кадр в чёрное. */}
			<Flash color="#000" opacity={p(t, 46.4, 47, ease.inCubic)} />
		</AbsoluteFill>
	);
};

// ─── Сцена 05 — Силуэт из бездны (47–58) ──────────────────────────
export const Scene05: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const rise = p(t, 47, 58, ease.inOutSine);
	const show = p(t, 47, 49, ease.outCubic);
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-05_silhouette-rises`}
				layers={['00_background', '10_light-rays', '20_marine-snow', '30_whale', '40_vignette']}
				animate={() => ({
					whale: {
						opacity: show,
						filter: `brightness(${show})`,
						transform: `translate(${mix(-250, 150, rise)}px, ${mix(350, -200, rise)}px) rotate(${wave(t, 2.5, 1.5)}deg)`,
						origin: [1000, 560],
					},
					'marine-snow': {transform: `translateY(${mix(0, 300, p(t, 47, 58))}px)`},
					'light-rays': {opacity: mix(0.16, 0.35, p(t, 52, 55, ease.inOutSine)) / 0.16},
					vignette: {opacity: mix(0.8, 0.4, p(t, 53, 58))},
				})}
			/>
			<Flash color="#000" opacity={1 - p(t, 47, 47.6)} />
			<Flash color="#eaf6ff" opacity={p(t, 57.7, 58, ease.inCubic)} />
		</AbsoluteFill>
	);
};

// ─── Сцена 06 — Выдох и титр (58–68) ──────────────────────────────
export const Scene06: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const up = p(t, 58, 61, ease.outCubic);
	const blowIn = p(t, 61, 62.6, ease.outQuart);
	const blowOut = p(t, 62.6, 66, ease.outCubic);
	const ti = p(t, 63.2, 63.8, ease.outCubic);
	const sub = p(t, 63.8, 64.4, ease.outCubic);
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-06_surface-blow`}
				layers={['00_background', '10_sea-far', '20_whale', '30_blow', '40_waves-front', '90_labels']}
				camera={() => ({scale: mix(1, 1.08, p(t, 58, 68, ease.inOutSine)), origin: [960, 620]})}
				animate={() => ({
					whale: {transform: `translateY(${mix(60, 0, up)}px)`},
					'whale-underwater': {transform: `translateY(${mix(60, 0, up)}px)`},
					'sea-far': {transform: `translate(${wave(t, 3, 30)}px, ${wave(t, 3, 6, 0.25)}px)`},
					'waves-front': {transform: `translate(${wave(t, 3, 30, 0.5)}px, ${wave(t, 3, 6, 0.75)}px)`},
					blow: {
						opacity: t < 61 ? 0 : 1 - blowOut,
						transform: `translate(${60 * blowOut}px, ${-40 * blowOut}px) scale(${mix(0.1, 1, blowIn) * mix(1, 1.2, blowOut)})`,
						origin: [1404, 598],
					},
					title: {opacity: ti, letterSpacing: mix(40, 12, ti), transform: `scale(${mix(1.1, 1, ti)})`, origin: [960, 155]},
					subtitle: {opacity: sub, transform: `translateY(${mix(10, 0, sub)}px)`},
				})}
			/>
		</AbsoluteFill>
	);
};

// ─── Сцена 07 — Куда ныряет кашалот (68–81) ───────────────────────
export const Scene07: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	// Камера: крупно у поверхности → вниз вдоль шкалы на «тысячи метров» → отъезд на весь кадр.
	const down = p(t, 70, 73, ease.inOutCubic);
	const out = p(t, 73, 76, ease.inOutCubic);
	const focus: [number, number] = [mix(700, 960, out), mix(mix(200, 950, down), 540, out)];
	const scale = mix(2.2, 1, out);
	const line = (t0: number) => ({clipPath: revealX(p(t, t0, t0 + 0.8, ease.outCubic))});
	const burj = (i: number) => {
		const pr = p(t, 70 + i * 0.8, 71.4 + i * 0.8, ease.outCubic);
		return {opacity: pr, transform: `translateY(${mix(-331, 0, pr)}px)`};
	};
	const sub = p(t, 76.8, 77.6, ease.outCubic);
	return (
		<SvgScene
			dir={`${DIR}/scene-07_depth-chart`}
			layers={['00_background', '10_depth-scale', '20_burj-khalifa', '30_markers', '40_light-zones', '90_labels']}
			camera={() => ({scale, focus})}
			animate={() => ({
				bg: {opacity: p(t, 68, 68.6)},
				title: {opacity: p(t, 68, 68.6)},
				'marker-diver-40': line(68.6),
				'marker-diver-record': line(69.4),
				'burj-1': burj(0),
				'burj-2': burj(1),
				'burj-3': burj(2),
				'depth-scale': {clipPath: revealY(mix(0.06, 1, p(t, 70, 73, ease.inOutCubic)))},
				'zone-sun': {opacity: p(t, 71.5, 72.2)},
				'zone-twilight': {opacity: p(t, 72.1, 72.8)},
				'zone-dark': {opacity: p(t, 72.8, 73.5)},
				'marker-whale': line(73),
				'marker-whale-icon': {transform: `translateX(${mix(-80, 0, p(t, 73, 74, ease.outBack(1.2)))}px)`},
				'label-burj': {opacity: p(t, 74, 74.5)},
				'label-record': {opacity: p(t, 74, 74.5)},
				'marker-sub-250': {clipPath: revealX(p(t, 76.8, 77.2, ease.outCubic))},
				'#marker-sub-250 > g': {
					transform: `scale(${mix(1, 1.15, sub)}, ${mix(1, 0.4, sub)})`,
					origin: [1120, 250],
				},
			})}
		>
			{/* Красная вспышка у отметки подлодки на «плющить сталь». */}
			<div
				style={{
					position: 'absolute',
					left: 1120 - 260,
					top: 250 - 160,
					width: 520,
					height: 320,
					borderRadius: '50%',
					background: 'radial-gradient(ellipse, rgba(255,80,60,0.9) 0%, rgba(255,80,60,0) 70%)',
					opacity: 0.6 * Math.sin(Math.PI * p(t, 76.9, 77.6)),
				}}
			/>
		</SvgScene>
	);
};

// ─── Сцена 08 — Зачем? (81–89) ───────────────────────────────────
export const Scene08: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const q = p(t, 86.5, 87.3, ease.spring(10));
	const zoom = p(t, 88.6, 89, ease.inCubic);
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-08_why-question`}
				layers={['00_background', '10_whale-surface', '20_dive-path', '30_squid-shadow', '90_labels']}
				camera={() => ({scale: mix(1, 7, zoom), origin: [1560, 480]})}
				animate={() => ({
					bg: {opacity: p(t, 81, 81.5)},
					whale: {opacity: p(t, 81, 81.5), transform: `rotate(${mix(0, 35, p(t, 83, 85.5, ease.inOutSine))}deg)`, origin: [460, 214]},
					'air-icon': {transform: `scale(${p(t, 82, 82.8, ease.spring(12))})`, origin: [668, 110]},
					'label-air': {opacity: p(t, 82.3, 82.8)},
					'dive-path': {clipPath: revealY(p(t, 83, 85.5, ease.inOutSine))},
					'dive-arrow': {opacity: p(t, 85.3, 85.6)},
					'squid-shadow': {opacity: p(t, 85, 86)},
					'squid-eye': {
						transform: `scale(${p(t, 85, 85.8, ease.outBack(1.4)) * (1 + 0.05 * (1 + Math.sin(2 * Math.PI * (t - 85.8))) * p(t, 85.8, 86))})`,
						origin: [1170, 970],
					},
					'label-dark': {opacity: p(t, 86, 86.4)},
					'question-mark': {
						opacity: p(t, 86.5, 86.7),
						transform: `scale(${mix(0.5, 1, q)}) rotate(${mix(-10, 0, q) + p(t, 87.3, 87.6) * wave(t, 1.5, 3)}deg)`,
						origin: [1560, 500],
					},
				})}
			/>
			<Flash color="#0b2a44" opacity={p(t, 88.8, 89)} />
		</AbsoluteFill>
	);
};

// ─── Сцена 09 — Живая подводная лодка (89–100) ────────────────────
const ORGANS = ['junk', 'spermaceti', 'lungs', 'muscles'] as const;

export const Scene09: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const float = `translateY(${p(t, 97.4, 98.4) * wave(t, 3, 8)}px)`;
	const styles: Record<string, import('../../../svg/SvgScene').ElStyle> = {
		bg: {opacity: p(t, 89, 89.6)},
		submarine: {
			clipPath: revealX(p(t, 89.4, 91, ease.inOutSine)),
			opacity: mix(1, 0.25, p(t, 91, 92.6)),
		},
		'whale-outline': {draw: p(t, 91, 92.6, ease.inOutSine), transform: float},
		title: {opacity: p(t, 96.6, 97.4, ease.outCubic), transform: `scale(${mix(0.9, 1, p(t, 96.6, 97.4, ease.outCubic))})`, origin: [960, 83]},
	};
	ORGANS.forEach((o, i) => {
		const t0 = 92.6 + i * 0.8;
		const pulse = Math.sin(Math.PI * p(t, t0 + 0.3, t0 + 0.9));
		styles[`organ-${o}`] = {opacity: p(t, t0, t0 + 0.4), filter: `brightness(${1 + 0.6 * pulse})`, transform: float};
		styles[`callout-${o}`] = {draw: p(t, t0, t0 + 0.6, ease.outCubic), opacity: p(t, t0, t0 + 0.2)};
	});
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-09_living-submarine`}
				layers={['00_background', '10_submarine', '20_whale-outline', '30_organs', '40_callouts', '90_labels']}
				animate={() => styles}
			/>
			<Flash color="#0b2a44" opacity={1 - p(t, 89, 89.4)} />
		</AbsoluteFill>
	);
};

/** Звуковые акценты сцен (секунды ТЗ) — переводятся в реальное время в конфиге главы. */
export const SCENE_SFX: {tz: number; src: string; volume: number}[] = [
	{tz: 6.0, src: 'sfx/click.wav', volume: 0.12},
	{tz: 8.5, src: 'sfx/click.wav', volume: 0.12},
	{tz: 11.0, src: 'sfx/click.wav', volume: 0.14},
	{tz: 15.5, src: 'sfx/whoosh.wav', volume: 0.35},
	{tz: 17.6, src: 'sfx/slap.wav', volume: 0.3},
	{tz: 42.6, src: 'sfx/click.wav', volume: 0.7},
	{tz: 44.0, src: 'sfx/click.wav', volume: 0.45},
	{tz: 45.0, src: 'sfx/click.wav', volume: 0.45},
	{tz: 46.0, src: 'sfx/click.wav', volume: 0.45},
	{tz: 61.0, src: 'sfx/blow.wav', volume: 0.6},
	{tz: 63.2, src: 'sfx/hit.wav', volume: 0.35},
	{tz: 77.0, src: 'sfx/crunch.wav', volume: 0.4},
	{tz: 92.6, src: 'sfx/beep.wav', volume: 0.25},
	{tz: 93.4, src: 'sfx/beep.wav', volume: 0.25},
	{tz: 94.2, src: 'sfx/beep.wav', volume: 0.25},
	{tz: 95.0, src: 'sfx/beep.wav', volume: 0.25},
];
