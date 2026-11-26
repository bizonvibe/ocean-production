import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {SvgScene, type ElStyle} from '../../../svg/SvgScene';
import {ease, mix, p, rand, revealX, wave, type TimeMap} from '../../../svg/motion';
import {DIR} from './paths';

/**
 * Глава 2 «Рацион хищника против мирных гигантов» — 9 сцен по ТЗ ocean-animations
 * (projects/sperm-whale/02_ratsion-khishchnika/README.md). Времена в коде — секунды ТЗ.
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

const appear = (t: number, t0: number, t1: number, dy = 0): ElStyle => {
	const pr = p(t, t0, t1, ease.outCubic);
	return {opacity: pr, transform: dy ? `translateY(${mix(dy, 0, pr)}px)` : undefined};
};

// ─── Сцена 01 — Мирные гиганты (0–15) ─────────────────────────────
export const Scene01: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const bwX = mix(0, -260, p(t, 0, 15));
	const hbX = mix(0, 300, p(t, 0, 15));
	const hbY = wave(t, 5, 10);
	const lbl = (a: number) => {
		const pr = p(t, a, a + 0.4, ease.outCubic) * (1 - p(t, 6, 6.4));
		return {opacity: pr, dy: mix(10, 0, p(t, a, a + 0.4, ease.outCubic))};
	};
	const lb = lbl(1.6);
	const lh = lbl(2.4);
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-01_gentle-giants`}
				layers={['00_background', '10_light-rays', '20_plankton-cloud', '30_blue-whale', '40_humpback', '50_plankton-front', '90_labels']}
				camera={() => ({scale: mix(1.06, 1, p(t, 0, 15, ease.outSine))})}
				animate={() => ({
					'blue-whale': {transform: `translateX(${bwX}px) skewY(${wave(t, 4, 1)}deg)`, origin: [1160, 355]},
					humpback: {transform: `translate(${hbX}px, ${hbY}px)`},
					'plankton-cloud': {transform: `translateX(${mix(0, -60, p(t, 0, 15))}px)`, opacity: 0.6 + wave(t, 3.5, 0.1)},
					'plankton-front': {transform: `translateX(${mix(0, -180, p(t, 0, 15))}px)`},
					'light-rays': {opacity: (0.25 + wave(t, 3, 0.05)) / 0.25},
					'label-blue-whale': {opacity: lb.opacity, transform: `translate(${bwX}px, ${lb.dy}px)`},
					'label-humpback': {opacity: lh.opacity, transform: `translate(${hbX}px, ${hbY + lh.dy}px)`},
				})}
			/>
			<Flash color="#000" opacity={1 - p(t, 0, 1)} />
		</AbsoluteFill>
	);
};

// ─── Сцена 02 — Китовый ус = кератин (15–30) ──────────────────────
const popIn = (t: number, t0: number, origin: [number, number]): ElStyle => ({
	transform: `scale(${p(t, t0, t0 + 0.5, ease.spring(12))})`,
	origin,
});

export const Scene02: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const titleIn = p(t, 15, 15.6, ease.outCubic);
	const accent = Math.sin(Math.PI * p(t, 17.6, 18));
	const baleen = p(t, 19.2, 21, ease.outCubic);
	const keratin = p(t, 27, 27.6, ease.outCubic);
	return (
		<SvgScene
			dir={`${DIR}/scene-02_baleen-keratin`}
			layers={['00_background', '10_whale-head', '20_lower-jaw', '30_baleen', '40_keratin-formula', '90_labels']}
			// Медленный наезд (не в ТЗ): сцена длинная, кадр не должен застывать.
			camera={() => ({scale: mix(1, 1.07, p(t, 15, 30, ease.inOutSine)), origin: [900, 520]})}
			animate={() => ({
				bg: {opacity: p(t, 15, 15.6)},
				'whale-head': {opacity: p(t, 15, 15.6)},
				'lower-jaw': {opacity: p(t, 15, 15.6), transform: `rotate(${mix(-6, 0, p(t, 16, 17.2, ease.outCubic))}deg)`, origin: [126, 510]},
				title: {opacity: titleIn, transform: `translateY(${mix(-20, 0, titleIn)}px) scale(${1 + 0.06 * accent})`, origin: [960, 74]},
				// Пластины «вырастают» с нёба волной слева направо.
				baleen: {transform: `scaleY(${baleen})`, origin: [600, 445], clipPath: revealX(Math.min(1, baleen * 1.3))},
				'label-baleen': {opacity: p(t, 21, 21.6), clipPath: `inset(0 0 ${(1 - p(t, 21, 21.6, ease.outCubic)) * 100}% 0)`},
				'icon-baleen': popIn(t, 23, [1352, 430]),
				'eq-1': {opacity: p(t, 24.6, 25)},
				'icon-nail': popIn(t, 25, [1590, 440]),
				'eq-2': {opacity: p(t, 26, 26.3)},
				'icon-hair': {
					transform: `scale(${p(t, 26.3, 26.8, ease.spring(12))}) skewX(${p(t, 26.8, 27.2) * wave(t, 1.8, 4)}deg)`,
					origin: [1830, 440],
				},
				'label-keratin': {opacity: keratin, transform: `scale(${mix(0.9, 1, keratin)})`, origin: [1595, 631]},
			})}
		/>
	);
};

// ─── Сцена 03 — Гигантское сито (30–46) ───────────────────────────
export const Scene03: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const sec = Math.floor(t);
	// Рой «роится»: каждую секунду новый случайный сдвиг, плавно.
	const jx = mix((rand(sec) - 0.5) * 20, (rand(sec + 1) - 0.5) * 20, ease.inOutSine(t - sec));
	const jy = mix((rand(sec + 50) - 0.5) * 20, (rand(sec + 51) - 0.5) * 20, ease.inOutSine(t - sec));
	const suck = p(t, 33.4, 35.2, ease.inCubic);
	const swell = p(t, 33.6, 35.2, ease.outBack(1.3));
	const squeeze = p(t, 38.8, 41, ease.inOutCubic);
	const pouchY = mix(mix(0.15, 1, swell), 0.35, squeeze);
	const blink = p(t, 30.6, 31.2);
	const keep = p(t, 41.9, 43.5, ease.outCubic);
	const step = (t0: number) => appear(t, t0, t0 + 0.4, 20);
	return (
		<SvgScene
			dir={`${DIR}/scene-03_filter-sieve`}
			layers={['00_background', '10_krill-swarm', '20_whale', '30_throat-pouch', '40_arrows', '50_steps', '60_pool-inset', '90_labels']}
			animate={() => ({
				bg: {opacity: p(t, 30, 30.6)},
				whale: {opacity: p(t, 30, 30.6)},
				title: {opacity: p(t, 30, 30.6)},
				'krill-swarm': {
					opacity: p(t, 30, 30.6) * (1 - suck),
					transform: `translate(${jx + mix(0, -40, p(t, 30, 33.4)) + mix(0, -250, suck)}px, ${jy}px) scale(${mix(1, 0.6, suck)})`,
					origin: [900, 470],
				},
				'baleen-strip': {opacity: blink < 1 ? (Math.sin(blink * Math.PI * 4) > 0 ? 1 : 0.3) : 1},
				'step-1': step(33),
				'arrows-in': {draw: p(t, 33.4, 34.4, ease.outCubic), opacity: t < 34.4 ? 1 : 0.7 + wave(t, 0.8, 0.3)},
				'throat-pouch': {transform: `scaleY(${pouchY})`, origin: [560, 450]},
				'pouch-krill': {
					opacity: p(t, 34.4, 35.2),
					transform: `translateY(${-30 * keep}px) scale(${mix(1, 0.8, keep)})`,
					origin: [600, 560],
					filter: keep > 0 ? `drop-shadow(0 0 ${12 * keep}px #ffb547)` : undefined,
				},
				'pool-inset': {opacity: p(t, 35.2, 36), transform: `scale(${mix(0.8, 1, p(t, 35.2, 36, ease.outCubic))})`, origin: [1650, 235]},
				'krill-note': {opacity: p(t, 36, 36.4)},
				'step-2': step(38),
				'arrow-tongue': {draw: p(t, 38.4, 40.4, ease.inOutSine)},
				'arrows-out': {draw: p(t, 39, 40.2, ease.outCubic), opacity: 1 - p(t, 40.4, 41)},
				'step-3': step(41.5),
			})}
		/>
	);
};

// ─── Сцена 04 — Весы: кит против 13 автобусов (46–63) ─────────────
const BUS_T = Array.from({length: 13}, (_, i) => 47.5 + i * 0.577);

export const Scene04: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const styles: Record<string, ElStyle> = {
		bg: {opacity: p(t, 46, 46.6)},
		fulcrum: {opacity: p(t, 46, 46.6)},
	};
	let n = 0;
	let level = 0;
	BUS_T.forEach((t0, i) => {
		const fall = p(t, t0, t0 + 0.4, ease.inQuad);
		const landed = t >= t0 + 0.4;
		if (landed) n = i + 1;
		const bounce = landed ? -6 * Math.sin(Math.PI * p(t, t0 + 0.4, t0 + 0.55)) : 0;
		styles[`bus-${i + 1}`] = {opacity: t < t0 ? 0 : 1, transform: `translateY(${mix(-500, 0, fall) + bounce}px)`};
		level += p(t, t0 + 0.4, t0 + 0.7, ease.spring(14));
	});
	const sway = p(t, 57.6, 58.2) * wave(t, 2, 0.6);
	styles['balance-beam'] = {opacity: p(t, 46, 46.6), transform: `rotate(${-9 + (9 * level) / 13 + sway}deg)`, origin: [960, 642]};
	const last = n > 0 ? BUS_T[n - 1] + 0.4 : 0;
	styles.counter = {
		opacity: n > 0 ? 1 : 0,
		text: String(Math.max(1, n)),
		transform: `scale(${n > 0 ? mix(1.2, 1, p(t, last, last + 0.25, ease.outCubic)) : 1})`,
		origin: [1780, 567],
	};
	const ww = p(t, 46.6, 47.2, ease.outCubic);
	styles['label-whale-weight'] = {opacity: ww, transform: `scale(${mix(0.8, 1, ww)})`, origin: [600, 391]};
	styles['label-bus-weight'] = {opacity: p(t, 55, 55.6)};
	styles.title = appear(t, 55.6, 56, -20);
	styles['label-safety'] = {opacity: p(t, 57, 57.6)};
	return <SvgScene dir={`${DIR}/scene-04_weight-balance`} layers={['00_background', '10_fulcrum', '20_balance-beam', '90_labels']} animate={() => styles} />;
};

/** Моменты приземления автобусов (секунды ТЗ) — для звука «бум». */
export const BUS_LAND_TZ = BUS_T.map((t0) => t0 + 0.4);

// ─── Сцена 05 — Усатый vs зубатый (63–70) ─────────────────────────
export const Scene05: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const back = mix(1, 0.45, p(t, 64.2, 64.8));
	const lb = p(t, 63.6, 64);
	const tooth = p(t, 66.8, 67.6);
	const zoom = p(t, 69.2, 70, ease.inCubic);
	return (
		<SvgScene
			dir={`${DIR}/scene-05_baleen-vs-toothed`}
			layers={['00_background', '10_ruler', '20_blue-whale', '30_sperm-whale', '40_icons', '90_labels']}
			camera={() => ({scale: mix(1, 3, zoom), origin: [1000, 720]})}
			animate={() => ({
				bg: {opacity: p(t, 63, 63.5)},
				title: {opacity: p(t, 63, 63.5)},
				ruler: {transform: `scaleX(${p(t, 63, 63.5, ease.outCubic)})`, origin: [220, 930]},
				'blue-whale': {transform: `translateX(${mix(-1600, 0, p(t, 63, 64.2, ease.outCubic))}px)`, opacity: back},
				'label-blue': {opacity: lb * back},
				'icon-baleen': {opacity: lb * back},
				'label-icon-baleen': {opacity: lb},
				'sperm-whale': {transform: `translateX(${mix(-1100, 0, p(t, 64.8, 66, ease.outBack(1.3)))}px)`},
				'label-sperm': {opacity: p(t, 66, 66.4)},
				'icon-tooth': {
					transform: `scale(${tooth < 0.6 ? mix(0, 1.2, tooth / 0.6) : mix(1.2, 1, (tooth - 0.6) / 0.4)}) rotate(${mix(-10, 0, tooth)}deg)`,
					origin: [1775, 725],
				},
				'label-icon-tooth': {opacity: p(t, 67.2, 67.6)},
			})}
		/>
	);
};

// ─── Сцена 06 — Нижняя челюсть (70–77) ────────────────────────────
export const Scene06: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const open = p(t, 72.6, 73.5, ease.outBack(1.6));
	const close = p(t, 76, 77, ease.inCubic);
	const jaw = mix(-20, 0, open) + mix(0, -20, close);
	const shake = t > 76.95 && t < 77.15 ? (rand(Math.floor(t * 30)) - 0.5) * 12 : 0;
	const glint = Math.sin(Math.PI * p(t, 74.2, 74.8));
	return (
		<AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
			<SvgScene
				dir={`${DIR}/scene-06_lower-jaw`}
				layers={['00_background', '10_head', '20_lower-jaw', '90_labels']}
				camera={() => ({scale: mix(1, 1.08, p(t, 70, 77)), origin: [1000, 600]})}
				animate={() => ({
					bg: {opacity: p(t, 70, 70.6)},
					head: {opacity: p(t, 70, 70.6)},
					'lower-jaw': {
						opacity: p(t, 70, 70.6),
						transform: `rotate(${jaw}deg)`,
						origin: [520, 650],
						filter: glint > 0 ? `brightness(${1 + 0.35 * glint})` : undefined,
					},
					title: appear(t, 73.4, 73.9, -20),
					'label-teeth': {opacity: p(t, 74.2, 74.6)},
					'label-sockets': {opacity: p(t, 74.8, 75.2)},
				})}
			/>
		</AbsoluteFill>
	);
};

// ─── Сцена 07 — Зуб ≈ нож (77–85) ─────────────────────────────────
export const Scene07: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const drop = p(t, 78.3, 79.1, ease.outBounce);
	const heavy = 6 * Math.sin(Math.PI * p(t, 82.6, 83.4));
	const shine = Math.sin(Math.PI * p(t, 80.9, 81.6));
	return (
		<SvgScene
			dir={`${DIR}/scene-07_tooth-vs-knife`}
			layers={['00_background', '10_ruler', '20_knife', '30_tooth', '40_weight', '90_labels']}
			animate={() => ({
				bg: {opacity: p(t, 77, 77.5)},
				title: {opacity: p(t, 77, 77.5)},
				ruler: {transform: `scaleX(${p(t, 77.3, 78.1, ease.outCubic)})`, origin: [420, 760]},
				tooth: {
					opacity: t < 78.3 ? 0 : 1,
					transform: `translateY(${mix(-500, 0, drop) + heavy}px) rotate(${mix(-40, 0, p(t, 78.3, 79.1, ease.outCubic))}deg)`,
					origin: [820, 590],
				},
				'label-tooth': {opacity: p(t, 79.1, 79.5)},
				knife: {
					transform: `translateX(${mix(1400, 0, p(t, 80.6, 81.4, ease.outCubic))}px)`,
					filter: shine > 0 ? `brightness(${1 + 0.5 * shine})` : undefined,
				},
				'label-knife': {opacity: p(t, 81.4, 81.8)},
				'weight-row': appear(t, 82, 82.6, 20),
			})}
		/>
	);
};

// ─── Сцена 08 — Крупнейший зубатый хищник (85–99) ─────────────────
export const Scene08: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const dim = mix(1, 0.5, p(t, 92, 97));
	const sw = p(t, 87.9, 89.2, ease.outBack(1.2));
	const lunge = 30 * Math.sin(Math.PI * p(t, 90.5, 92));
	const human = p(t, 85.5, 86.3, ease.spring(12));
	const shark = p(t, 86.3, 87.1, ease.outCubic);
	const orca = p(t, 87.1, 87.9, ease.outCubic);
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-08_predator-sizes`}
				layers={['00_background', '10_ruler', '20_sperm-whale', '30_orca', '40_shark', '50_human', '90_labels']}
				// Пока диктор говорит о добыче — медленный наезд на кашалота (не в ТЗ: кадр не должен застывать).
				camera={() => ({scale: mix(1, 1.35, p(t, 92, 99, ease.inOutSine)), origin: [820, 330]})}
				animate={() => ({
					bg: {opacity: p(t, 85, 85.5)},
					ruler: {clipPath: revealX(p(t, 85, 85.8, ease.outCubic))},
					human: {transform: `scale(${human})`, origin: [1580, 820], opacity: dim},
					'label-human': {opacity: Math.min(1, human) * dim},
					shark: {transform: `translateX(${mix(900, 0, shark)}px)`, opacity: dim},
					'label-shark': {opacity: shark * dim},
					orca: {transform: `translateX(${mix(-900, 0, orca)}px)`, opacity: dim},
					'label-orca': {opacity: orca * dim},
					'sperm-whale': {
						opacity: t < 87.9 ? 0 : 1,
						transform: `translate(${lunge}px, ${mix(-400, 0, sw) + p(t, 92, 92.5) * wave(t, 3, 6)}px) scale(${mix(1.1, 1, sw)})`,
						origin: [800, 300],
					},
					'label-sperm': {opacity: p(t, 89.2, 89.7)},
					title: {opacity: p(t, 89.2, 89.7)},
				})}
			/>
			<Flash color="#000" opacity={p(t, 98.4, 99)} />
		</AbsoluteFill>
	);
};

// ─── Сцена 09 — Арсенал во тьме (99–110) ──────────────────────────
/** Фаза ускоряющихся щелчков 103–106 с: интервал 0.6 → 0.2 с. */
const clickPhase = (t: number) => {
	const s = Math.max(0, Math.min(3, t - 103));
	const k = 0.4 / 3;
	return -Math.log((0.6 - k * s) / 0.6) / k;
};
/** Моменты щелчков сцены 9 (секунды ТЗ) — для звука. */
export const SCENE09_CLICKS_TZ: number[] = (() => {
	const out = [102.0];
	for (let t = 103, last = -1; t < 106; t += 0.01) {
		const n = Math.floor(clickPhase(t));
		if (n !== last) {
			out.push(Math.round(t * 100) / 100);
			last = n;
		}
	}
	return out;
})();

export const Scene09: React.FC<P> = ({tz}) => {
	const t = useT(tz);
	const beamIn = p(t, 102, 102.6, ease.outCubic);
	const flick = t >= 103 && t <= 106 ? 1 - 0.4 * (clickPhase(t) % 1) : 1;
	const beamOpacity = t < 102.3 ? beamIn : t < 103 ? mix(1, 0.6, p(t, 102.3, 102.6)) : t <= 106 ? 0.6 + 0.4 * (1 - (clickPhase(t) % 1)) : 0.7;
	const ti = p(t, 105.5, 106.3, ease.outCubic);
	return (
		<AbsoluteFill>
			<SvgScene
				dir={`${DIR}/scene-09_arsenal-dark`}
				layers={['00_background', '10_marine-snow', '20_sonar-beam', '30_squid', '40_whale', '50_vignette', '90_labels']}
				animate={() => ({
					whale: {opacity: p(t, 99, 100.5), transform: `translate(${mix(0, 80, p(t, 99, 110))}px, ${mix(0, 40, p(t, 99, 110))}px)`},
					'marine-snow': {transform: `translate(${mix(0, -120, p(t, 99, 110))}px, ${mix(0, -60, p(t, 99, 110))}px)`},
					'sonar-beam': {opacity: beamOpacity, transform: `scaleX(${mix(0.2, 1, beamIn)})`, origin: [990, 470]},
					squid: {opacity: p(t, 102.4, 103.2) * (t > 103.2 ? flick : 1)},
					'squid-arms': {transform: `skewY(${p(t, 103, 103.3) * wave(t, 0.5, 4)}deg)`, origin: [1880, 690]},
					title: {opacity: ti, letterSpacing: mix(20, 4, ti)},
				})}
			/>
			<Flash color="#000" opacity={p(t, 109, 110)} />
		</AbsoluteFill>
	);
};

/** Звуковые акценты сцен (секунды ТЗ). */
export const SCENE_SFX: {tz: number; src: string; volume: number}[] = [
	{tz: 1.0, src: 'sfx/whalesong.wav', volume: 0.35},
	{tz: 23.0, src: 'sfx/tick.wav', volume: 0.4},
	{tz: 25.0, src: 'sfx/tick.wav', volume: 0.4},
	{tz: 26.3, src: 'sfx/tick.wav', volume: 0.4},
	{tz: 33.6, src: 'sfx/gulp.wav', volume: 0.45},
	{tz: 39.0, src: 'sfx/hiss.wav', volume: 0.35},
	...BUS_LAND_TZ.map((tz) => ({tz, src: 'sfx/thud.wav', volume: 0.22})),
	{tz: 55.0, src: 'sfx/ding.wav', volume: 0.35},
	{tz: 64.8, src: 'sfx/whoosh.wav', volume: 0.3},
	{tz: 72.6, src: 'sfx/creak.wav', volume: 0.4},
	{tz: 77.0, src: 'sfx/clack.wav', volume: 0.5},
	{tz: 79.1, src: 'sfx/clack.wav', volume: 0.3},
	{tz: 80.8, src: 'sfx/swish.wav', volume: 0.4},
	{tz: 87.9, src: 'sfx/whoosh.wav', volume: 0.3},
	...SCENE09_CLICKS_TZ.map((tz, i) => ({tz, src: 'sfx/click.wav', volume: i === 0 ? 0.55 : 0.32})),
];
