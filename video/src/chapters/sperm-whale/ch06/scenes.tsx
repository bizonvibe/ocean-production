import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {SvgScene, type ElStyle} from '../../../svg/SvgScene';
import {ease, mix, p, revealX, wave, type TimeMap} from '../../../svg/motion';
import {DIR} from './paths';

/**
 * Глава 6 «Сверхмозг, клановая культура и морская морзянка» — 11 сцен по ТЗ ocean-animations
 * (projects/sperm-whale/06_sverkhmozg-i-klany/README.md). Времена в коде — секунды ТЗ.
 * Группы с собственным атрибутом transform (пакеты сахара) анимируются только прозрачностью.
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
const appear = (t: number, t0: number, t1: number, dy = 0, dx = 0): ElStyle => {
	const pr = p(t, t0, t1, ease.outCubic);
	return {opacity: pr, transform: `translate(${mix(dx, 0, pr)}px, ${mix(dy, 0, pr)}px)`};
};
const glow = (k: number, color: string) => (k > 0.01 ? `drop-shadow(0 0 ${18 * k}px ${color})` : undefined);
/** Точка «загорается» в момент t0: scale 0 → 1.3 → 1. */
const blip = (t: number, t0: number, origin: [number, number]): ElStyle => {
	const pr = p(t, t0, t0 + 0.25);
	return {transform: `scale(${pr < 0.5 ? mix(0, 1.3, pr * 2) : mix(1.3, 1, (pr - 0.5) * 2)})`, origin};
};

// ─── Сцена 01 — Самый большой мозг (0–13.7) ──────────────────────
export const Scene01: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const bw = p(t, 1, 3, ease.spring(10));
	const zoom = p(t, 13.1, 13.7, ease.inCubic);
	const styles: Record<string, ElStyle> = {
		bg: fade(t, 0, 0.8),
		title: fade(t, 0, 0.8),
		'brain-whale': {transform: `scale(${bw * (t > 3 ? 1 + 0.01 * (1 + Math.sin(2 * Math.PI * (t - 3))) : 1)})`, origin: [600, 470]},
		'label-whale': fade(t, 3.4, 4),
		'brain-human': {transform: `scale(${p(t, 8.6, 9.6, ease.spring(12))})`, origin: [1430, 520]},
		'label-human': fade(t, 9, 9.6),
		'label-sugar': fade(t, 11.2, 11.8),
		'#sugar-human > g:nth-of-type(1)': fade(t, 10, 10.3),
		'#sugar-human > g:nth-of-type(2)': fade(t, 10.3, 10.6),
	};
	for (let i = 1; i <= 8; i++) styles[`#sugar-whale > g:nth-of-type(${i})`] = fade(t, 6 + (i - 1) * 0.15, 6.2 + (i - 1) * 0.15);
	return (
		<SvgScene
			dir={`${DIR}/scene-01_biggest-brain`}
			layers={['00_background', '10_brain-whale', '20_brain-human', '30_sugar-whale', '40_sugar-human', '90_labels']}
			camera={() => ({scale: mix(1, 2.2, zoom), origin: [600, 470]})}
			animate={() => styles}
		/>
	);
};
export const SCENE01_SUGAR_TZ = Array.from({length: 8}, (_, i) => 6 + i * 0.15);

// ─── Сцена 02 — Веретеновидные нейроны (13.7–34.5) ───────────────
export const Scene02: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const grow = p(t, 28.6, 33.8, ease.inOutSine);
	const neuron = p(t, 17, 18.6, ease.outCubic);
	const impulse = t > 18.6 ? ((t - 18.6) % 1.5) / 1.5 : 0;
	const feel = (t0: number) => appear(t, t0, t0 + 0.6, 20);
	return (
		<SvgScene
			dir={`${DIR}/scene-02_spindle-neurons`}
			layers={['00_background', '10_network', '20_neuron', '30_feelings', '90_labels']}
			animate={() => ({
				network: {
					opacity: p(t, 13.7, 15) * (0.8 + 0.2 * Math.sin(t * 3.1) * Math.sin(t * 1.7)),
					transform: `translate(${wave(t, 6, 10)}px, ${wave(t, 8, 6)}px) scale(${mix(1, 1.15, grow)})`,
					origin: [960, 560],
					filter: grow > 0 ? `brightness(${1 + 0.4 * grow})` : undefined,
				},
				'spindle-neuron': {
					transform: `scaleX(${neuron})`,
					origin: [960, 560],
					filter: glow(t > 18.6 ? 0.5 + 0.5 * Math.sin(Math.PI * impulse) : neuron, '#ff9fe0'),
				},
				title: fade(t, 17, 17.6),
				'feel-1': feel(21),
				'feel-4': feel(22.6),
				'feel-2': feel(24),
				'feel-3': feel(25),
				'label-more': fade(t, 27.6, 28.6),
			})}
		/>
	);
};

// ─── Сцена 03 — Одиночки и семьи (34.5–49.7) ─────────────────────
export const Scene03: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const g = p(t, 34.5, 35.4, ease.outCubic);
	const males = p(t, 37.4, 38.6, ease.outCubic);
	const mig = Math.sin(Math.PI * p(t, 40.6, 42.6));
	const swim = p(t, 46.4, 49.7, ease.inOutSine);
	const zoom = p(t, 49.1, 49.7, ease.inCubic);
	const styles: Record<string, ElStyle> = {
		globe: {opacity: g, transform: `scale(${mix(0.9, 1, g)})`, origin: [760, 560]},
		'male-north': {opacity: males, transform: `translate(${mix(-300, 0, males)}px, ${120 * mig}px)`},
		'male-south': {opacity: males, transform: `translate(${mix(300, 0, males)}px, ${-120 * mig}px)`},
		'label-males': fade(t, 38, 38.6),
		migration: {draw: p(t, 40.6, 42, ease.outCubic), opacity: p(t, 40.6, 40.8)},
		'label-mating': fade(t, 41.2, 42),
		'label-females': fade(t, 45.4, 46.4),
		family: {transform: `translateX(${40 * swim}px) translateY(${p(t, 46.4, 47) * wave(t, 2.4, 4)}px)`},
	};
	for (let i = 1; i <= 4; i++) styles[`female-${i}`] = fade(t, 44.6 + (i - 1) * 0.2, 45 + (i - 1) * 0.2);
	styles.calf = fade(t, 45.6, 46.2);
	return (
		<SvgScene
			dir={`${DIR}/scene-03_social-map`}
			layers={['00_background', '10_globe', '20_males', '30_family', '40_migration', '90_labels']}
			camera={() => ({scale: mix(1, 2.5, zoom), origin: [760, 560]})}
			animate={() => styles}
		/>
	);
};

// ─── Сцена 04 — Детский сад и «няньки» (49.7–65.9) ───────────────
export const Scene04: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const dive = p(t, 57, 61, ease.inOutSine);
	const close = p(t, 61, 63, ease.inOutSine);
	const ring = p(t, 55.4, 56.2, ease.outCubic);
	return (
		<SvgScene
			dir={`${DIR}/scene-04_babysitters`}
			layers={['00_background', '10_nanny', '20_calf', '30_mother', '40_dive-path', '50_guard-ring', '90_labels']}
			animate={() => ({
				nanny: {opacity: p(t, 49.7, 50.4), transform: `translateX(${60 * close}px) translateY(${wave(t, 3, 4)}px)`},
				grandma: {opacity: p(t, 49.7, 50.4), transform: `translateX(${-60 * close}px) translateY(${wave(t, 3, 4, 0.5)}px)`},
				calf: {opacity: p(t, 49.7, 50.4), transform: `translateY(${40 * Math.sin(Math.PI * p(t, 50.4, 51.9))}px)`},
				'label-calf': fade(t, 50.6, 51.2),
				// Мама стартует у малыша горизонтально и уходит в глубину по пути.
				mother: {transform: `translate(${mix(-412, 0, dive)}px, ${mix(-608, 0, dive)}px) rotate(${mix(-55, 0, dive)}deg)`, origin: [1292, 938]},
				'dive-path': {draw: dive},
				timer: {transform: `scale(${p(t, 58.6, 59.4, ease.spring(12))})`, origin: [1600, 560]},
				'label-mother': fade(t, 58.8, 59.4),
				'guard-ring': {draw: ring, opacity: t > 56.2 ? 0.75 + wave(t, 1.6, 0.25) : 1},
				'label-nannies': fade(t, 55.6, 56.2),
			})}
		/>
	);
};

// ─── Сцена 05 — Коды как Морзе (65.9–73.7) ───────────────────────
const CODA_TZ = [67.0, 67.6, 68.2, 68.45, 68.7];
const CODA_X = [420, 620, 900, 1000, 1100];
const MORSE_TZ = Array.from({length: 9}, (_, i) => 69.6 + i * 0.22);
export const Scene05: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const styles: Record<string, ElStyle> = {
		bg: fade(t, 65.9, 66.4),
		title: fade(t, 65.9, 66.4),
		'label-coda': fade(t, 71.8, 72.4),
		'#coda > text': fade(t, 68.8, 69.3),
		'#morse > text:nth-of-type(1)': fade(t, 69.6, 70),
		'#morse > text:nth-of-type(2)': fade(t, 71.4, 71.8),
	};
	CODA_TZ.forEach((t0, i) => (styles[`#coda > circle:nth-of-type(${i + 1})`] = blip(t, t0, [CODA_X[i], 640])));
	// SOS: три точки, три тире, три точки — дети группы 2…10 по порядку.
	MORSE_TZ.forEach((t0, i) => {
		const pr = p(t, t0, t0 + 0.15, ease.outBack(2));
		styles[`#morse > :nth-child(${i + 2})`] = {transform: `scale(${pr})`, origin: [420 + i * 120, 380]};
	});
	return <SvgScene dir={`${DIR}/scene-05_codas-morse`} layers={['00_background', '10_morse', '20_coda', '90_labels']} animate={() => styles} />;
};

// ─── Сцена 06 — Диалекты (73.7–91.4) ─────────────────────────────
const PACIFIC_TZ = [75.8, 76.1, 76.4, 76.7, 77.0];
const CARIB_TZ = [78.0, 78.4, 78.8, 79.0, 79.2];
export const Scene06: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const enter = p(t, 85, 86, ease.outCubic);
	const lesson = t > 86 ? ((t - 86) % 0.8) / 0.8 : 0;
	const styles: Record<string, ElStyle> = {
		bg: fade(t, 73.7, 74.3),
		title: fade(t, 73.7, 74.3),
		'#dialect-pacific > rect': {draw: p(t, 75.6, 76.2)},
		'#dialect-pacific > text': fade(t, 75.6, 76.2),
		'#dialect-caribbean > rect': {draw: p(t, 77.8, 78.4)},
		'#dialect-caribbean > text': fade(t, 77.8, 78.4),
		'label-culture': fade(t, 81, 82),
		teacher: {opacity: enter, transform: `translateX(${mix(-300, 0, enter)}px)`},
		student: {opacity: enter, transform: `translateX(${mix(-300, 0, enter)}px)`, filter: glow(t > 86 ? Math.max(0, Math.sin(Math.PI * (lesson * 2 - 1))) : 0, '#7fe3ff')},
		'teach-waves': {opacity: t > 86 ? 1 - lesson : 0, transform: `scale(${mix(0.5, 1.2, lesson)})`, origin: [800, 840]},
		'label-teaching': fade(t, 87, 87.6),
	};
	PACIFIC_TZ.forEach((t0, i) => (styles[`#dialect-pacific > circle:nth-of-type(${i + 1})`] = blip(t, t0, [660 + i * 240, 300])));
	CARIB_TZ.forEach((t0, i) => (styles[`#dialect-caribbean > circle:nth-of-type(${i + 1})`] = blip(t, t0, [660 + i * 240, 520])));
	return (
		<SvgScene dir={`${DIR}/scene-06_dialects`} layers={['00_background', '10_pacific', '20_caribbean', '30_teaching', '90_labels']} animate={() => styles} />
	);
};

// ─── Сцена 07 — Project CETI (91.4–98.6) ─────────────────────────
export const Scene07: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const ti = p(t, 91.4, 92.2, ease.outCubic);
	const net = t > 93.6 ? ((t - 93.6) % 0.5) / 0.5 : 0;
	return (
		<SvgScene
			dir={`${DIR}/scene-07_project-ceti`}
			layers={['00_background', '10_waveform', '20_network', '30_output', '90_labels']}
			animate={() => ({
				title: {opacity: ti, letterSpacing: mix(20, 0, ti)},
				subtitle: fade(t, 91.6, 92.2),
				waveform: {draw: p(t, 92.2, 93.4, ease.inOutSine)},
				'label-input': fade(t, 92.4, 93),
				'neural-net': {opacity: p(t, 93.4, 93.8), clipPath: t < 93.6 ? undefined : revealX(Math.min(1, 0.2 + net)), filter: glow(t > 93.6 ? 0.6 : 0, '#7a5cff')},
				'label-ml': fade(t, 93.8, 94.4),
				output: {transform: `scale(${p(t, 95.6, 96.4, ease.outBack(1.4))})`, origin: [1650, 540]},
				'label-output': {opacity: p(t, 95.8, 96.4) * (t > 96.4 ? (Math.sin(t * 6) > 0 ? 1 : 0.3) : 1)},
			})}
		/>
	);
};
export const SCENE07_BEEPS_TZ = [93.6, 94.1, 94.6, 95.1, 95.6];

// ─── Сцена 08 — Новорождённый (98.6–109.8) ───────────────────────
export const Scene08: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const slide = p(t, 99.4, 100.9, ease.inOutCubic);
	const turn = p(t, 100.9, 102.4, ease.inOutCubic);
	const rise = p(t, 102.4, 103, ease.inCubic);
	const calf = p(t, 104.4, 105.4, ease.outCubic);
	const car = p(t, 105.4, 106.4, ease.outCubic);
	return (
		<SvgScene
			dir={`${DIR}/scene-08_newborn`}
			layers={['00_background', '10_mother', '20_calf-birth', '30_calf-compare', '40_car', '50_ruler', '90_labels']}
			animate={() => ({
				bg: fade(t, 98.6, 99.4),
				mother: fade(t, 98.6, 99.4),
				'calf-birth': {
					opacity: p(t, 99.4, 99.8) * (1 - rise),
					transform: `translate(${mix(60, -80, slide)}px, ${-180 * rise}px) rotate(${mix(180, 0, turn)}deg)`,
					origin: [435, 470],
				},
				'label-tail-first': fade(t, 99.8, 100.6),
				calf: {opacity: calf, transform: `translateX(${mix(-600, 0, calf)}px)`},
				'label-calf': {opacity: p(t, 104.8, 105.4), transform: `scale(${1 + 0.1 * Math.sin(Math.PI * p(t, 107.6, 108.4))})`, origin: [540, 947]},
				car: {opacity: car, transform: `translateX(${mix(700, 0, car)}px)`},
				ruler: {clipPath: revealX(p(t, 105.4, 106.4, ease.outCubic))},
				'label-car': fade(t, 105.8, 106.4),
			})}
		/>
	);
};

// ─── Сцена 09 — Молоко-«паста» (109.8–115.6) ─────────────────────
export const Scene09: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	return (
		<SvgScene
			dir={`${DIR}/scene-09_milk-fat`}
			layers={['00_background', '10_glass-cow', '20_glass-whale', '90_labels']}
			animate={() => ({
				bg: fade(t, 109.8, 110.4),
				title: fade(t, 109.8, 110.4),
				'glass-cow': fade(t, 109.8, 110.4),
				'glass-whale': fade(t, 109.8, 110.4),
				'#glass-cow > path:nth-of-type(2)': {transform: `scaleY(${p(t, 110.6, 111.6, ease.outCubic)})`, origin: [630, 720]},
				'#glass-whale > path:nth-of-type(2)': {transform: `scaleY(${p(t, 111.8, 113.4, ease.outCubic)})`, origin: [1290, 720]},
				'label-ratio': fade(t, 113.6, 114.2),
			})}
		/>
	);
};

// ─── Сцена 10 — Уйти или остаться (115.6–124.3) ──────────────────
export const Scene10: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const leave = p(t, 116.6, 119.6, ease.inOutSine);
	const stay = p(t, 120.6, 121.6, ease.outCubic);
	return (
		<SvgScene
			dir={`${DIR}/scene-10_leaving-home`}
			layers={['00_background', '10_clan', '20_young-female', '30_young-male', '40_leave-path', '90_labels']}
			animate={() => ({
				bg: fade(t, 115.6, 116.2),
				clan: {opacity: p(t, 115.6, 116.2), transform: `translateY(${wave(t, 3, 4)}px)`},
				'clan-ring': {opacity: p(t, 115.6, 116.2), filter: glow(stay, '#ffb547')},
				'young-female': {opacity: p(t, 115.6, 116.2), transform: `translateY(${-20 * stay + wave(t, 3, 4)}px)`},
				'young-male': {transform: `translate(${mix(-560, 0, leave)}px, ${mix(100, 0, leave)}px)`},
				'leave-path': {draw: leave},
				'label-male': fade(t, 118.6, 119.2),
				'label-female': fade(t, 120.8, 121.6),
			})}
		/>
	);
};

// ─── Сцена 11 — Кольца в зубе (124.3–135) ────────────────────────
export const Scene11: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const cut = p(t, 127.6, 128.4, ease.inOutSine);
	const styles: Record<string, ElStyle> = {
		bg: fade(t, 124.3, 125),
		title: fade(t, 124.3, 125),
		tooth: {opacity: p(t, 124.3, 125), filter: cut > 0 && cut < 1 ? `brightness(${1 + 0.6 * Math.sin(Math.PI * cut)})` : undefined},
		'label-age': fade(t, 125.4, 125.8),
		'#label-age text': {text: `кашалоты живут ${Math.round(70 * p(t, 125.4, 126.8, ease.outCubic))} лет и больше`},
		'#tooth-section > ellipse:nth-of-type(1)': fade(t, 128.2, 128.6),
		'label-tooth': fade(t, 128.6, 129.2),
		equals: {transform: `scale(${p(t, 131, 131.4, ease.outBack(1.6))})`, origin: [960, 616]},
		'#tree-section > circle:nth-of-type(1)': fade(t, 131.4, 131.8),
		'label-tree': fade(t, 132, 132.6),
	};
	for (let i = 2; i <= 15; i++) {
		const t0 = 128.4 + (i - 2) * 0.12;
		styles[`#tooth-section > ellipse:nth-of-type(${i})`] = {transform: `scale(${p(t, t0, t0 + 0.3, ease.outCubic)})`, origin: [560, 660]};
	}
	for (let i = 2; i <= 17; i++) {
		const t0 = 131.4 + (i - 2) * 0.09;
		styles[`#tree-section > circle:nth-of-type(${i})`] = {transform: `scale(${p(t, t0, t0 + 0.3, ease.outCubic)})`, origin: [1360, 620]};
	}
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-11_tooth-rings`}
				layers={['00_background', '10_tooth', '20_tooth-section', '30_tree-section', '40_equals', '90_labels']}
				animate={() => styles}
			/>
			<Flash color="#000" opacity={p(t, 134.4, 135)} />
		</AbsoluteFill>
	);
};

/** Звуковые акценты сцен (секунды ТЗ). */
export const SCENE_SFX: {tz: number; src: string; volume: number}[] = [
	...SCENE01_SUGAR_TZ.map((tz) => ({tz, src: 'sfx/tick.wav', volume: 0.25})),
	{tz: 17.0, src: 'sfx/beep.wav', volume: 0.2},
	{tz: 51.0, src: 'sfx/clicks.wav', volume: 0.15},
	{tz: 57.0, src: 'sfx/whoosh.wav', volume: 0.2},
	...CODA_TZ.map((tz) => ({tz, src: 'sfx/click.wav', volume: 0.55})),
	...MORSE_TZ.map((tz) => ({tz, src: 'sfx/beep.wav', volume: 0.3})),
	...PACIFIC_TZ.map((tz) => ({tz, src: 'sfx/click.wav', volume: 0.4})),
	...CARIB_TZ.map((tz) => ({tz, src: 'sfx/click.wav', volume: 0.4})),
	...SCENE07_BEEPS_TZ.map((tz) => ({tz, src: 'sfx/tick.wav', volume: 0.25})),
	{tz: 104.4, src: 'sfx/whoosh.wav', volume: 0.25},
	{tz: 105.4, src: 'sfx/whoosh.wav', volume: 0.25},
	{tz: 131.0, src: 'sfx/tick.wav', volume: 0.3},
];
