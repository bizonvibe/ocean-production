import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {SvgScene, type ElStyle} from '../../../svg/SvgScene';
import {ease, mix, p, rand, wave, type TimeMap} from '../../../svg/motion';
import {DIR} from './paths';

/**
 * Глава 5 «Титаны бездны: битвы с кальмарами и секрет амбры» — 12 сцен по ТЗ ocean-animations
 * (projects/sperm-whale/05_titany-bezdny/README.md). Времена в коде — секунды ТЗ.
 * Внимание: у групп с собственным атрибутом transform (значки сетки) CSS-трансформ не задаётся — только прозрачность.
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
const pop = (t: number, t0: number, t1: number, origin: [number, number]): ElStyle => ({
	transform: `scale(${p(t, t0, t1, ease.spring(12))})`,
	origin,
});
const glow = (k: number, color: string) => (k > 0.01 ? `drop-shadow(0 0 ${18 * k}px ${color})` : undefined);
const jitter = (t: number, amp: number, seed = 0) => (rand(Math.floor(t * 12) + seed) - 0.5) * 2 * amp;

// ─── Сцена 01 — Миф о Кракене (0–4.8) ────────────────────────────
export const Scene01: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const ti = p(t, 2.2, 2.8, ease.outCubic);
	const styles: Record<string, ElStyle> = {
		bg: fade(t, 0, 0.6),
		sea: {opacity: p(t, 0, 0.6), transform: `translateX(${wave(t, 3, 30)}px)`},
		ship: {opacity: p(t, 0, 0.6), transform: `rotate(${-8 + wave(t, 2, 3)}deg)`, origin: [960, 720]},
		title: {opacity: ti, letterSpacing: mix(40, 14, ti)},
		subtitle: fade(t, 3, 3.4),
	};
	for (let i = 1; i <= 4; i++) styles[`tentacle-${i}`] = {draw: p(t, 0.8 + (i - 1) * 0.2, 2 + (i - 1) * 0.2, ease.outCubic)};
	return <SvgScene dir={`${DIR}/scene-01_kraken-myth`} layers={['00_background', '10_sea', '20_ship', '30_tentacles', '90_labels']} animate={() => styles} />;
};

// ─── Сцена 02 — Доказательство в желудках (4.8–14.5) ─────────────
export const Scene02: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const st = p(t, 5.6, 6.2, ease.outCubic);
	const styles: Record<string, ElStyle> = {
		bg: fade(t, 4.8, 5.4),
		title: fade(t, 4.8, 5.4),
		stomach: {opacity: st, transform: `scale(${mix(0.8, 1, st)})`, origin: [440, 620]},
		'label-pile': fade(t, 9.6, 10),
		hand: {transform: `translateY(${mix(400, 0, p(t, 11.2, 11.8, ease.outCubic))}px)`, opacity: p(t, 11.2, 11.4)},
		'label-hand': fade(t, 11.4, 11.8),
		'beak-big': pop(t, 11.6, 12.4, [1600, 560]),
		'label-beak': fade(t, 12, 12.4),
	};
	// 70 клювов сыплются в желудок.
	for (let i = 1; i <= 70; i++) {
		const t0 = 8.2 + (i - 1) * 0.022;
		const fall = p(t, t0, t0 + 0.35, ease.inQuad);
		styles[`#beak-pile > g:nth-of-type(${i})`] = {opacity: t < t0 ? 0 : 1, transform: `translateY(${mix(-300, 0, fall)}px)`};
	}
	return <SvgScene dir={`${DIR}/scene-02_beaks-proof`} layers={['00_background', '10_stomach', '20_hand', '30_beak-big', '90_labels']} animate={() => styles} />;
};

// ─── Сцена 03 — Круглые шрамы (14.5–20.7) ────────────────────────
export const Scene03: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const styles: Record<string, ElStyle> = {
		'whale-head': {transform: `translateX(${mix(200, 0, p(t, 14.5, 15.2, ease.outCubic))}px)`},
		'sucker-scars': {transform: `translateX(${mix(200, 0, p(t, 14.5, 15.2, ease.outCubic))}px)`},
		'inset-line': {draw: p(t, 17.8, 18.3)},
		'inset-sucker': {transform: `scale(${p(t, 17.8, 18.6, ease.spring(12))}) rotate(${mix(0, 20, p(t, 18.6, 20.7))}deg)`, origin: [1730, 180]},
		'label-inset': fade(t, 18.2, 18.6),
		'label-scars': fade(t, 18.4, 19),
	};
	for (let i = 1; i <= 34; i++) {
		const t0 = 15.6 + rand(i * 7) * 1.5;
		styles[`#sucker-scars > circle:nth-of-type(${i})`] = {opacity: 0.85 * p(t, t0, t0 + 0.4)};
	}
	return <SvgScene dir={`${DIR}/scene-03_sucker-scars`} layers={['00_background', '10_whale-head', '20_scars', '30_inset', '90_labels']} animate={() => styles} />;
};

// ─── Сцена 04 — Схватка (20.7–31.3) ──────────────────────────────
export const Scene04: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const show = p(t, 20.7, 22) * (t < 22 ? 0.6 + 0.4 * (rand(Math.floor(t * 15)) > 0.4 ? 1 : 0) : 1);
	const squeeze = t > 28.4 ? 1 - 0.04 * (1 + Math.sin((2 * Math.PI * (t - 28.4)) / 0.8)) : 1;
	const twitch = t > 28.4 ? wave(t, 0.7, 3) : 0;
	return (
		<AbsoluteFill style={{transform: `translate(${jitter(t, 8)}px, ${jitter(t, 8, 99)}px)`}}>
			<SvgScene
				dir={`${DIR}/scene-04_battle`}
				layers={['00_background', '10_marine-snow', '20_whale', '30_squid', '40_arms-wrap', '50_vignette', '90_labels']}
				animate={() => ({
					whale: {opacity: show, transform: `rotate(${twitch}deg)`, origin: [800, 560]},
					squid: {opacity: show},
					'squid-arms': {transform: `scaleY(${squeeze})`, origin: [1100, 520]},
					'arms-wrap': {draw: p(t, 26.8, 28, ease.inOutSine), transform: `scaleY(${squeeze})`, origin: [1100, 520]},
					'label-12m': fade(t, 24.4, 25.4),
					'marine-snow': {transform: `translate(${mix(0, -80, p(t, 20.7, 31.3))}px, ${mix(0, -40, p(t, 20.7, 31.3))}px)`},
				})}
			/>
		</AbsoluteFill>
	);
};

// ─── Сцена 05 — Кто тяжелее (31.3–43.4) ──────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n).replace(/ /g, ' ');
export const Scene05: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const lunge = Math.sin(Math.PI * p(t, 39, 40));
	const styles: Record<string, ElStyle> = {
		bg: fade(t, 31.3, 31.8),
		title: fade(t, 31.3, 31.8),
		whale: {opacity: p(t, 31.3, 31.8), transform: `translateX(${40 * lunge}px) scale(${1 + 0.05 * lunge})`, origin: [440, 577]},
		'label-whale': fade(t, 32.4, 32.8),
		'#label-whale text:nth-of-type(2)': {text: `до ${fmt(Math.round((50000 * p(t, 32.6, 33.6, ease.outCubic)) / 100) * 100)} кг`},
		'label-squid': fade(t, 37, 37.6),
		'squid-grid': {transform: `translateY(${t > 39.6 && t < 40.6 ? jitter(t, 6) : 0}px)`},
	};
	for (let i = 1; i <= 180; i++) {
		const t0 = 34 + (i - 1) * 0.016;
		styles[`#squid-grid > g:nth-of-type(${i})`] = {opacity: p(t, t0, t0 + 0.12)};
	}
	return <SvgScene dir={`${DIR}/scene-05_mass-compare`} layers={['00_background', '10_whale', '20_squid-grid', '90_labels']} animate={() => styles} />;
};

// ─── Сцена 06 — Колоссальный кальмар (43.4–56.3) ─────────────────
const HOOKS: [number, number][] = [
	[1460, 300],
	[1540, 340],
	[1480, 390],
];
export const Scene06: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const slide = p(t, 44.4, 46, ease.outCubic);
	const drop = p(t, 48.4, 49.4, ease.outBounce);
	const styles: Record<string, ElStyle> = {
		bg: fade(t, 43.4, 44.2),
		'antarctic-ice': {opacity: p(t, 43.4, 44.2) * (0.85 + wave(t, 2.3, 0.15))},
		colossal: {opacity: slide, transform: `translateX(${mix(-600, 0, slide)}px) scaleY(${1 + 0.02 * (1 + Math.sin(Math.PI * (t - 46)))})`, origin: [380, 520]},
		'label-colossal': fade(t, 45, 46),
		'piano-card': {opacity: t < 48.4 ? 0 : 1, transform: `translateY(${mix(-500, 0, drop)}px)`},
		piano: {opacity: t < 48.4 ? 0 : 1, transform: `translateY(${mix(-500, 0, drop)}px)`},
		'label-piano': fade(t, 49.2, 49.6),
		'hook-inset': {transform: `scale(${p(t, 51, 51.8, ease.outBack(1.4))})`, origin: [1520, 350]},
		'label-hooks': fade(t, 52.4, 53),
	};
	HOOKS.forEach((o, i) => {
		styles[`hook-${i + 1}`] = {transform: `rotate(${t > 51.8 ? ((t - 51.8) / 1.4) * 360 * (i % 2 ? -1 : 1) : 0}deg)`, origin: o};
	});
	return (
		<SvgScene
			dir={`${DIR}/scene-06_colossal-squid`}
			layers={['00_background', '10_ice', '20_squid', '30_hook-inset', '40_piano', '90_labels']}
			animate={() => styles}
		/>
	);
};

// ─── Сцена 07 — Шрамы годами (56.3–65.2) ─────────────────────────
export const Scene07: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const win = p(t, 61.8, 63, ease.outBack(1.2));
	const lw = p(t, 62.4, 63, ease.outCubic);
	const styles: Record<string, ElStyle> = {
		'whale-head': {opacity: p(t, 56.3, 57), transform: `translateX(${80 * win}px) scale(${1 + 0.05 * win})`, origin: [960, 600]},
		'sucker-scars': {opacity: p(t, 56.3, 57), transform: `translateX(${80 * win}px) scale(${1 + 0.05 * win})`, origin: [960, 600]},
		'hook-scars': {opacity: mix(1, 0.5, p(t, 59.4, 61)) * (t > 59.4 && t < 61 ? 0.85 + 0.15 * Math.sin(t * 20) : 1), transform: `translateX(${80 * win}px) scale(${1 + 0.05 * win})`, origin: [960, 600]},
		'label-years': fade(t, 58.8, 59.4),
		'label-winner': {opacity: lw, transform: `scale(${mix(0.9, 1, lw)})`, origin: [960, 944]},
	};
	for (let i = 1; i <= 8; i++) styles[`#hook-scars > path:nth-of-type(${i})`] = {draw: p(t, 57 + (i - 1) * 0.2, 57.25 + (i - 1) * 0.2)};
	return <SvgScene dir={`${DIR}/scene-07_hook-scars`} layers={['00_background', '10_whale-head', '20_hook-scars', '30_round-scars', '90_labels']} animate={() => styles} />;
};

// ─── Сцена 08 — Может ли проглотить человека? (65.2–82.2) ────────
export const Scene08: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const clip = p(t, 72.6, 74, ease.outCubic);
	const stamp = p(t, 79.6, 80.2, ease.outCubic);
	const sh = t > 79.8 && t < 80.3 ? jitter(t, 4) : 0;
	return (
		<AbsoluteFill style={{transform: `translate(${sh}px, ${sh}px)`}}>
			<SvgScene
				dir={`${DIR}/scene-08_swallow-human`}
				layers={['00_background', '10_whale', '20_throat', '30_human', '40_myth-clipping', '90_labels']}
				animate={() => ({
					bg: fade(t, 65.2, 66),
					whale: fade(t, 65.2, 66),
					human: fade(t, 65.2, 66),
					'label-human': fade(t, 65.2, 66),
					throat: {draw: p(t, 68, 70, ease.inOutSine), filter: glow(Math.sin(Math.PI * p(t, 68, 71)), '#ffb547')},
					'stomach-mark': fade(t, 69.4, 70),
					'label-throat': fade(t, 70, 70.6),
					clipping: {opacity: t < 72.6 ? 0 : 1, transform: `translateY(${mix(-500, 0, clip)}px) rotate(${mix(12, 4, clip)}deg)`, origin: [1530, 300]},
					'stamp-myth': {opacity: stamp, transform: `scale(${mix(2, 1, stamp)})`, origin: [1530, 250]},
				})}
			/>
		</AbsoluteFill>
	);
};

// ─── Сцена 09 — Внутри не выжить (82.2–90.1) ─────────────────────
export const Scene09: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const styles: Record<string, ElStyle> = {
		bg: fade(t, 82.2, 82.8),
		title: fade(t, 82.2, 82.8),
		stomach: {opacity: p(t, 82.2, 82.8), transform: `scale(${1 + 0.01 * (1 + Math.sin((2 * Math.PI * t) / 1.2))})`, origin: [960, 540]},
		'icon-muscles': {opacity: p(t, 84.6, 85), transform: `scaleX(${t > 84.6 ? 1 - 0.08 * (1 + Math.sin((2 * Math.PI * (t - 84.6)) / 0.8)) : 1})`, origin: [495, 560]},
		'label-muscles': fade(t, 84.8, 85.4),
		'icon-no-oxygen': pop(t, 86.2, 86.8, [960, 560]),
		'label-no-oxygen': fade(t, 86.4, 86.8),
		'label-enzymes': fade(t, 88, 88.6),
	};
	for (let i = 1; i <= 4; i++) {
		const t0 = 87.8 + (i - 1) * 0.2;
		const pr = p(t, t0, t0 + 0.4, ease.outCubic);
		styles[`#icon-enzymes > path:nth-of-type(${i})`] = {opacity: pr, transform: `translateY(${mix(-40, 0, pr)}px)`};
	}
	return (
		<SvgScene
			dir={`${DIR}/scene-09_stomach-dangers`}
			layers={['00_background', '10_stomach', '20_icon-muscles', '30_icon-no-oxygen', '40_icon-enzymes', '90_labels']}
			animate={() => styles}
		/>
	);
};

// ─── Сцена 10 — Клювы не перевариваются (90.1–103) ───────────────
export const Scene10: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const suck = p(t, 90.8, 92.6, ease.inCubic);
	const zoom = p(t, 102.4, 103, ease.inCubic);
	return (
		<SvgScene
			dir={`${DIR}/scene-10_beaks-indigestible`}
			layers={['00_background', '10_whale', '20_stomach', '30_beaks', '40_paths', '50_squid-icon', '90_labels']}
			camera={() => ({scale: mix(1, 3, zoom), origin: [500, 620]})}
			animate={() => ({
				bg: fade(t, 90.1, 90.8),
				whale: fade(t, 90.1, 90.8),
				stomach: fade(t, 90.1, 90.8),
				'squid-food': {opacity: 1 - suck, transform: `translateX(${-420 * suck}px) scale(${mix(1, 0.3, suck)})`, origin: [1655, 250]},
				'label-diet': fade(t, 91, 91.6),
				'beaks-in-stomach': {opacity: p(t, 93.4, 94.2), transform: `rotate(${p(t, 94, 94.5) * wave(t, 2, 3)}deg)`, origin: [896, 553]},
				title: fade(t, 93.4, 94),
				'path-vomit': {opacity: p(t, 99.6, 99.9), dash: {array: '18 12', offset: -60 * Math.max(0, t - 99.6)}},
				'label-vomit': fade(t, 99.8, 100.4),
				'path-gut': {draw: p(t, 101.6, 102.4), stroke: t > 102 && Math.sin(t * 30) > 0 ? '#ff3b30' : undefined},
				'label-gut': fade(t, 101.8, 102.4),
			})}
		/>
	);
};

// ─── Сцена 11 — Как рождается амбра (103–117.5) ──────────────────
export const Scene11: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const scratch = Math.sin(Math.PI * p(t, 104.4, 106));
	const la = p(t, 116, 116.8, ease.outCubic);
	const styles: Record<string, ElStyle> = {
		intestine: {opacity: p(t, 103, 103.6), transform: `scaleY(${1 + 0.02 * (1 + Math.sin((2 * Math.PI * (t - 103)) / 1.4))})`, origin: [710, 540], filter: glow(scratch, '#ff3b30')},
		beak: {opacity: p(t, 103, 103.6), transform: `rotate(${15 * scratch}deg)`, origin: [720, 540]},
		'label-protect': fade(t, 108, 108.6),
		'sea-surface': {opacity: p(t, 112.6, 112.8), transform: `translateX(${mix(620, 0, p(t, 112.6, 113.4, ease.outCubic))}px)`},
		'ambergris-floating': {opacity: p(t, 113, 113.4), transform: `translateY(${wave(t, 2, 12)}px) rotate(${wave(t, 2, 4, 0.25)}deg)`, origin: [1610, 300]},
		'label-ambergris': {opacity: la, letterSpacing: mix(30, 8, la)},
	};
	for (let i = 1; i <= 5; i++) {
		const t0 = 107.6 + (i - 1) * 0.8;
		const pr = p(t, t0, t0 + 0.7, ease.outCubic);
		styles[`wax-layer-${i}`] = {opacity: pr, transform: `scale(${mix(0.6, 1, pr)})`, origin: [710, 540]};
	}
	return (
		<SvgScene
			dir={`${DIR}/scene-11_ambergris-forming`}
			layers={['00_background', '10_intestine', '20_beak', '30_wax-layers', '40_sea-surface', '50_lump', '90_labels']}
			animate={() => styles}
		/>
	);
};

// ─── Сцена 12 — Сокровище с пляжа (117.5–135) ────────────────────
export const Scene12: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const car = p(t, 129.8, 131, ease.outCubic);
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-12_ambergris-value`}
				layers={['00_background', '10_foam', '20_lump-dark', '30_lump-light', '40_perfume', '50_car', '90_labels']}
				animate={() => ({
					foam: {transform: `translate(${wave(t, 3, 20)}px, ${wave(t, 3, 10, 0.25)}px)`},
					'lump-light': {opacity: p(t, 118.6, 123, ease.inOutSine)},
					'label-aging': fade(t, 119.4, 120),
					perfume: {...pop(t, 124.6, 126, [1020, 800]), filter: glow(t > 125.5 ? 0.5 + 0.5 * Math.sin(t * 4) : 0, '#fff3c4')},
					'label-perfume': fade(t, 125, 125.6),
					car: {opacity: car, transform: `translateX(${mix(600, 0, car)}px)`},
					'label-price': fade(t, 130.4, 131),
				})}
			/>
			<Flash color="#000" opacity={p(t, 133, 135)} />
		</AbsoluteFill>
	);
};

/** Звуковые акценты сцен (секунды ТЗ). */
export const SCENE_SFX: {tz: number; src: string; volume: number}[] = [
	{tz: 0.3, src: 'sfx/creak.wav', volume: 0.3},
	{tz: 1.0, src: 'sfx/drone.wav', volume: 0.35},
	{tz: 8.2, src: 'sfx/clicks.wav', volume: 0.18},
	{tz: 11.8, src: 'sfx/tick.wav', volume: 0.35},
	{tz: 17.8, src: 'sfx/tick.wav', volume: 0.35},
	{tz: 20.8, src: 'sfx/drone.wav', volume: 0.5},
	{tz: 26.8, src: 'sfx/slap.wav', volume: 0.35},
	{tz: 28.6, src: 'sfx/thud.wav', volume: 0.35},
	{tz: 39.2, src: 'sfx/clack.wav', volume: 0.5},
	{tz: 48.9, src: 'sfx/thud.wav', volume: 0.35},
	{tz: 51.8, src: 'sfx/crunch.wav', volume: 0.3},
	{tz: 61.8, src: 'sfx/whoosh.wav', volume: 0.3},
	{tz: 72.6, src: 'sfx/swish.wav', volume: 0.35},
	{tz: 79.6, src: 'sfx/thud.wav', volume: 0.55},
	{tz: 86.2, src: 'sfx/tick.wav', volume: 0.35},
	{tz: 91.0, src: 'sfx/gulp.wav', volume: 0.35},
	{tz: 104.4, src: 'sfx/creak.wav', volume: 0.25},
	{tz: 113.0, src: 'sfx/hiss.wav', volume: 0.2},
	{tz: 125.0, src: 'sfx/ding.wav', volume: 0.25},
	{tz: 130.6, src: 'sfx/ding.wav', volume: 0.35},
];
