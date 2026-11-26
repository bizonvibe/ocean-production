import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {SvgScene, type ElStyle} from '../../../svg/SvgScene';
import {ease, mix, p, rand, revealX, revealY, wave, type TimeMap} from '../../../svg/motion';
import {DIR} from './paths';

/**
 * Глава 7 «Застывшие монолиты, оборона и экологический двигатель планеты» — 10 сцен по ТЗ ocean-animations
 * (projects/sperm-whale/07_monolity-i-ekologiya/README.md). Времена в коде — секунды ТЗ.
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
	return {opacity: pr, transform: `translateY(${mix(dy, 0, pr)}px)`};
};
const glow = (k: number, color: string) => (k > 0.01 ? `drop-shadow(0 0 ${18 * k}px ${color})` : undefined);
const jitter = (t: number, amp: number, seed = 0) => (rand(Math.floor(t * 15) + seed) - 0.5) * 2 * amp;

// ─── Сцена 01 — Как спят киты? (0–10.8) ──────────────────────────
export const Scene01: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const brain = p(t, 4, 5, ease.outBack(1.3));
	const z = t > 5 ? ((t - 5) % 1.6) / 1.6 : 0;
	return (
		<SvgScene
			dir={`${DIR}/scene-01_how-they-sleep`}
			layers={['00_background', '10_whale', '20_brain', '30_zzz', '90_labels']}
			animate={() => ({
				bg: fade(t, 0, 1),
				whale: {opacity: p(t, 0, 1), transform: `translateX(${mix(0, 40, p(t, 0, 10.8))}px)`},
				question: appear(t, 0.6, 1.4, 20),
				'brain-left': {transform: `scale(${brain})`, origin: [1420, 360]},
				'brain-right': {transform: `scale(${brain})`, origin: [1420, 360]},
				'brain-right-glow': {transform: `scale(${brain})`, origin: [1420, 360], opacity: t > 5 ? 0.6 + 0.4 * Math.sin(t * 3) : brain},
				'label-brain': fade(t, 5, 5.6),
				zzz: {opacity: t < 5 ? 0 : 1 - z, transform: `translateY(${-60 * z}px)`},
			})}
		/>
	);
};

// ─── Сцена 02 — Вертикальные «монолиты» (10.8–29.4) ──────────────
export const Scene02: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const styles: Record<string, ElStyle> = {
		'depth-marker': {clipPath: revealY(p(t, 13.4, 14.4, ease.outCubic))},
		'building-ghost': {opacity: 0.55 * p(t, 15, 16), transform: `translateY(${mix(40, 0, p(t, 15, 16, ease.outCubic))}px)`},
		'label-building': fade(t, 15.4, 16),
		'label-monoliths': fade(t, 20.6, 21.6),
		bg: {filter: t > 20.6 ? `brightness(${1 + 0.06 * Math.sin(t * 2.3)})` : undefined},
		pie: {transform: `scale(${p(t, 25.4, 26, ease.outBack(1.4))})`, origin: [1680, 380]},
		'pie-slice': {opacity: p(t, 26, 26.8), filter: glow(Math.sin(Math.PI * p(t, 26, 27.4)), '#ffd76a')},
		'label-pie': fade(t, 26, 26.8),
	};
	for (let i = 1; i <= 4; i++) {
		const t0 = 10.8 + (i - 1) * 0.3;
		const sink = p(t, t0, t0 + 2.6, ease.outCubic);
		styles[`sleeper-${i}`] = {
			opacity: p(t, t0, t0 + 0.6),
			transform: `translateY(${mix(-300, 0, sink)}px) rotate(${t > 14 ? wave(t, 6, 1, i * 0.25) : 0}deg)`,
			origin: [236 + (i - 1) * 200, 950],
		};
	}
	return (
		<SvgScene
			dir={`${DIR}/scene-02_vertical-sleep`}
			layers={['00_background', '10_sleepers', '20_depth-marker', '30_building', '40_pie', '90_labels']}
			animate={() => styles}
		/>
	);
};

// ─── Сцена 03 — Косатки (29.4–44.2) ──────────────────────────────
export const Scene03: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const enter = p(t, 30.4, 32.4, ease.outCubic);
	const turn = p(t, 34.6, 36, ease.inOutSine);
	const attack = p(t, 38.6, 41, ease.inOutSine);
	return (
		<SvgScene
			dir={`${DIR}/scene-03_orca-threat`}
			layers={['00_background', '10_male', '20_family', '30_orcas', '40_no-attack', '90_labels']}
			animate={() => ({
				bg: fade(t, 29.4, 30),
				male: {opacity: p(t, 29.4, 30), transform: `translateY(${wave(t, 4, 5)}px)`},
				'female-1': fade(t, 29.4, 30),
				'female-2': fade(t, 29.4, 30),
				calf: fade(t, 29.4, 30),
				'orca-pod': {
					transform: `translate(${mix(0, -500, enter) + mix(0, -300, attack)}px, ${80 * turn + mix(0, 350, attack)}px) rotate(${10 * turn * (1 - attack)}deg)`,
					origin: [1830, 400],
				},
				'label-orcas': fade(t, 31, 31.8),
				'no-attack': {draw: turn, opacity: p(t, 34.6, 34.8)},
				'label-male': fade(t, 35, 35.8),
				'label-target': {opacity: p(t, 39.4, 39.6) * (t < 40.6 ? (Math.sin(t * 25) > 0 ? 1 : 0.4) : 1)},
			})}
		/>
	);
};

// ─── Сцена 04 — «Маргаритка» (44.2–62.8) ─────────────────────────
export const Scene04: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const tailHit = Math.sin(Math.PI * p(t, 58.6, 59));
	const tc = p(t, 55.6, 56.6, ease.outCubic);
	const styles: Record<string, ElStyle> = {
		bg: fade(t, 44.2, 44.8),
		calf: {opacity: p(t, 44.2, 44.8), filter: glow(Math.sin(Math.PI * p(t, 51, 52.6)), '#ffd76a')},
		'label-view': fade(t, 44.2, 44.8),
		title: fade(t, 46.8, 47.6),
		'orcas-circling': {transform: `rotate(${mix(0, 120, p(t, 44.2, 62.8))}deg)`, origin: [760, 560]},
		'orca-1': {transform: `translate(${150 * Math.sin(Math.PI * p(t, 58.8, 59.6))}px, ${60 * Math.sin(Math.PI * p(t, 58.8, 59.6))}px)`},
		'label-heads': fade(t, 51, 51.6),
		'label-tails': fade(t, 54.6, 55.2),
		'tail-compare': {opacity: tc, transform: `scale(${mix(0.8, 1, tc)})`, origin: [1610, 830]},
		'label-tail-size': fade(t, 55.8, 56.6),
	};
	for (let i = 1; i <= 7; i++) {
		const a = ((i - 1) / 7) * 2 * Math.PI;
		const dist = 200 + rand(i * 3) * 200;
		const pr = p(t, 45.6 + (i - 1) * 0.15, 48.1 + (i - 1) * 0.15, ease.inOutCubic);
		const extra = i === 2 ? 15 * tailHit : 0;
		styles[`female-${i}`] = {
			transform: `translate(${Math.cos(a) * dist * (1 - pr)}px, ${Math.sin(a) * dist * (1 - pr)}px) rotate(${(rand(i * 5) - 0.5) * 60 * (1 - pr) + extra}deg)`,
			origin: [760, 560],
		};
	}
	return (
		<SvgScene
			dir={`${DIR}/scene-04_marguerite`}
			layers={['00_background', '10_petals', '20_calf', '30_orcas', '40_tail-compare', '90_labels']}
			animate={() => styles}
		/>
	);
};

// ─── Сцена 05 — Эпоха китобоев (62.8–73.6) ───────────────────────
export const Scene05: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const flame = p(t, 66.8, 67.6, ease.outCubic);
	const gears = t > 69.4 ? (t - 69.4) / 3 : 0;
	return (
		<SvgScene
			dir={`${DIR}/scene-05_whaling-era`}
			layers={['00_background', '10_ship', '20_sea', '30_lamp', '40_gears', '90_labels']}
			animate={() => ({
				bg: fade(t, 62.8, 63.6),
				title: fade(t, 62.8, 63.6),
				ship: {opacity: p(t, 62.8, 63.6), transform: `rotate(${wave(t, 3, 2)}deg)`, origin: [530, 700]},
				sea: {opacity: p(t, 62.8, 63.6), transform: `translateX(${wave(t, 3, 20)}px)`},
				lamp: {opacity: flame, filter: glow(flame * (0.7 + 0.3 * Math.sin(t * 9)), '#ffcf6b')},
				'label-lamp': fade(t, 67, 67.6),
				'gear-1': {opacity: p(t, 69.4, 69.8), transform: `rotate(${360 * gears}deg)`, origin: [1640, 560]},
				'gear-2': {opacity: p(t, 69.4, 69.8), transform: `rotate(${-360 * gears}deg)`, origin: [1760, 720]},
				'label-gears': fade(t, 69.8, 70.2),
			})}
		/>
	);
};

// ─── Сцена 06 — «Эссекс» и «Моби Дик» (73.6–88.3) ────────────────
export const Scene06: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const run = p(t, 74.4, 76.4, ease.inQuad);
	const hit1 = p(t, 77.4, 77.6, ease.inQuad);
	const back = p(t, 77.8, 79, ease.outCubic);
	const hit2 = p(t, 79.4, 79.6, ease.inQuad);
	const whaleX = t < 77.4 ? mix(-700, -150, run) : t < 77.8 ? mix(-150, 0, hit1) : t < 79.4 ? mix(0, -200, back) : mix(-200, 0, hit2);
	const impact = Math.max(Math.sin(Math.PI * p(t, 77.5, 77.9)), Math.sin(Math.PI * p(t, 79.5, 79.9)));
	const sink = p(t, 80, 83, ease.inCubic);
	const tilt = t < 77.6 ? 0 : t < 80 ? 4 : mix(4, 14, sink);
	const book = p(t, 85, 86, ease.outBack(1.4));
	const sh = t > 79.5 && t < 80 ? jitter(t, 6) : 0;
	return (
		<AbsoluteFill style={{transform: `translate(${sh}px, ${sh * 0.6}px)`}}>
			<SvgScene
				dir={`${DIR}/scene-06_essex`}
				layers={['00_background', '10_ship', '20_whale', '30_impact', '40_sea', '50_book', '90_labels']}
				animate={() => ({
					bg: fade(t, 73.6, 74.4),
					title: fade(t, 73.6, 74.4),
					sea: {opacity: p(t, 73.6, 74.4), transform: `translateX(${wave(t, 3, 15)}px)`},
					essex: {
						opacity: p(t, 73.6, 74.4),
						transform: `translateY(${260 * sink}px) rotate(${tilt}deg)`,
						origin: [1400, 660],
						clipPath: sink > 0 ? `inset(0 0 ${Math.min(100, (260 * sink) / 5.75)}% 0)` : undefined,
					},
					'whale-ram': {opacity: p(t, 74.4, 74.8), transform: `translateX(${whaleX}px)`},
					impact: {transform: `scale(${impact})`, origin: [960, 650], opacity: impact},
					'label-ram': fade(t, 80.6, 81.2),
					'label-size': fade(t, 80.8, 81.4),
					book: {opacity: p(t, 85, 85.3), transform: `translateY(${mix(300, 0, book)}px) rotate(${mix(-8, 0, book)}deg)`, origin: [198, 820]},
					'label-book': fade(t, 85.6, 86.2),
				})}
			/>
		</AbsoluteFill>
	);
};

// ─── Сцена 07 — 1986: стоп промыслу (88.3–95.3) ──────────────────
export const Scene07: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const stamp = p(t, 91, 91.5, ease.outCubic);
	return (
		<SvgScene
			dir={`${DIR}/scene-07_moratorium`}
			layers={['00_background', '10_timeline', '20_whaling-band', '30_marker-1820', '40_marker-1986', '50_whale', '90_labels']}
			animate={() => ({
				timeline: {clipPath: revealX(p(t, 88.3, 88.8, ease.outCubic))},
				'whaling-band': {transform: `scaleX(${p(t, 88.8, 90.6, ease.inOutSine)})`, origin: [200, 560]},
				'marker-1820': fade(t, 89.6, 90.2),
				'marker-1986': {opacity: stamp, transform: `scale(${mix(2, 1, stamp)})`, origin: [1538, 330]},
				'label-iwc': fade(t, 91.8, 92.4),
				whale: {transform: `translateX(${mix(0, 400, p(t, 92.4, 95.3, ease.inOutSine))}px)`},
			})}
		/>
	);
};

// ─── Сцена 08 — Китовый «насос» (95.3–117.2) ─────────────────────
export const Scene08: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const up = p(t, 99.6, 101.6, ease.inOutSine);
	const nut = p(t, 101.6, 103.4, ease.outCubic);
	const styles: Record<string, ElStyle> = {
		bg: fade(t, 95.3, 96),
		'whale-deep': {opacity: p(t, 95.6, 96.4) * (1 - up)},
		prey: {opacity: 1 - p(t, 97.6, 99.6), transform: `translateX(${-200 * p(t, 97.6, 99.6, ease.inCubic)}px)`},
		'label-feed': fade(t, 97.8, 98.4),
		'whale-surface': {opacity: up},
		nutrients: {opacity: nut, transform: `scale(${mix(0.4, 1.1, nut)})`, origin: [589, 304]},
		'label-fertilizer': fade(t, 102, 102.6),
		phytoplankton: {clipPath: revealX(p(t, 104.6, 107.1, ease.inOutSine)), opacity: 0.85 + 0.15 * Math.sin(t * 2)},
		'label-bloom': fade(t, 105.4, 106),
		'breath-icon': {transform: `scale(${p(t, 110.4, 111.2, ease.outBack(1.4))})`, origin: [1720, 740], filter: glow(t > 111.2 ? 0.5 + 0.5 * Math.sin(t * 4) : 0, '#7fd08a')},
		'label-oxygen': fade(t, 111, 112),
	};
	// Стрелки цикла: левая — при подъёме, правая — на CO₂ (прорисовка всей группы по этапам).
	styles['cycle-arrows'] = {clipPath: `inset(0 ${t < 113.4 ? 50 + 50 * (1 - up) : 50 * (1 - p(t, 113.4, 115.4))}% 0 0)`};
	for (let i = 1; i <= 3; i++) {
		const t0 = 108.4 + (i - 1) * 0.3;
		const pr = p(t, t0, t0 + 0.6, ease.outCubic);
		styles[`o2-${i}`] = {opacity: pr, transform: `translateY(${mix(60, 0, pr) - (t > t0 + 0.6 ? 6 * Math.sin(t * 2 + i) : 0)}px)`};
	}
	for (let i = 1; i <= 2; i++) {
		const pr = p(t, 113.4 + (i - 1) * 0.3, 114.6 + (i - 1) * 0.3);
		styles[`co2-${i}`] = {opacity: t < 113.4 ? 0 : 1 - p(t, 115.4, 116.4), transform: `translateY(${60 * pr}px)`};
	}
	return (
		<SvgScene
			dir={`${DIR}/scene-08_whale-pump`}
			layers={['00_background', '10_whale-deep', '20_whale-surface', '30_nutrients', '40_phytoplankton', '50_gases', '60_cycle', '70_breath', '90_labels']}
			animate={() => styles}
		/>
	);
};

// ─── Сцена 09 — Whale fall (117.2–135.3) ─────────────────────────
export const Scene09: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const sink = p(t, 117.2, 122, ease.inOutSine);
	const decay = p(t, 122, 124, ease.inOutSine);
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-09_whale-fall`}
				layers={['00_background', '10_seabed', '20_carcass', '30_skeleton', '40_osedax', '50_life', '90_labels']}
				animate={() => ({
					carcass: {opacity: 1 - decay, transform: `translateY(${420 * sink}px) rotate(${mix(8, 14, sink)}deg)`, origin: [1006, 367]},
					title: fade(t, 121, 121.8),
					skeleton: {opacity: decay},
					'label-decades': fade(t, 124.4, 125.2),
					osedax: {clipPath: revealY(p(t, 127.4, 129.6)), opacity: p(t, 127.4, 127.8), transform: `skewX(${p(t, 128, 128.6) * wave(t, 2, 6)}deg)`, origin: [920, 820]},
					'label-osedax': fade(t, 127.8, 128.6),
					'bacteria-mats': {opacity: 0.5 * p(t, 130.4, 132)},
					crabs: {opacity: p(t, 130.4, 131), transform: `translateX(${wave(t, 4, 40)}px)`},
					'label-species': fade(t, 130.8, 131.6),
				})}
			/>
			<Flash color="#000" opacity={1 - p(t, 117.2, 117.8)} />
		</AbsoluteFill>
	);
};

// ─── Сцена 10 — Финал (135.3–150) ────────────────────────────────
export const Scene10: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const down = p(t, 135.3, 141.3, ease.inOutSine);
	const son = t > 142 ? ((t - 142) % 1.2) / 1.2 : 0;
	const l2 = p(t, 145.4, 146.4, ease.outCubic);
	const planet = p(t, 137, 138, ease.outCubic);
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-10_finale`}
				layers={['00_background', '10_stars', '20_planet', '30_surface', '40_whale', '50_sonar', '90_labels']}
				camera={() => ({focus: [960, mix(120, 540, down)]})}
				animate={() => ({
					stars: {opacity: 0.7 + 0.3 * Math.sin(t * 1.7) * Math.sin(t * 2.9)},
					planet: {opacity: mix(0.6, 1, planet), transform: `scale(${mix(0.8, 1, planet)})`, origin: [1560, 170], filter: glow(planet, '#cfe3ff')},
					'final-line-1': fade(t, 138, 139),
					whale: {transform: `translateX(${mix(0, 120, p(t, 141.3, 150))}px)`},
					'sonar-glow': {opacity: t > 142 ? 1 - son : 0, transform: `scale(${mix(0.6, 1.2, son)})`, origin: [1480, 700]},
					'final-line-2': {opacity: l2, letterSpacing: mix(10, 0, l2)},
				})}
			/>
			<Flash color="#000" opacity={p(t, 148.6, 150)} />
		</AbsoluteFill>
	);
};

/** Звуковые акценты сцен (секунды ТЗ). */
export const SCENE_SFX: {tz: number; src: string; volume: number}[] = [
	{tz: 0.5, src: 'sfx/drone.wav', volume: 0.3},
	{tz: 12.0, src: 'sfx/drone.wav', volume: 0.35},
	{tz: 30.4, src: 'sfx/whistle.wav', volume: 0.4},
	{tz: 38.8, src: 'sfx/whistle.wav', volume: 0.35},
	{tz: 46.0, src: 'sfx/whoosh.wav', volume: 0.2},
	{tz: 58.8, src: 'sfx/thud.wav', volume: 0.55},
	{tz: 63.0, src: 'sfx/creak.wav', volume: 0.25},
	{tz: 77.4, src: 'sfx/crunch.wav', volume: 0.45},
	{tz: 79.4, src: 'sfx/crunch.wav', volume: 0.5},
	{tz: 91.0, src: 'sfx/thud.wav', volume: 0.45},
	{tz: 98.0, src: 'sfx/gulp.wav', volume: 0.2},
	{tz: 108.4, src: 'sfx/tick.wav', volume: 0.25},
	{tz: 117.4, src: 'sfx/drone.wav', volume: 0.4},
	...[142, 143.2, 144.4, 145.6, 146.8].map((tz) => ({tz, src: 'sfx/click.wav', volume: 0.2})),
	{tz: 149.5, src: 'sfx/click.wav', volume: 0.5},
];
