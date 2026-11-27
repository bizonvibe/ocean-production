import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts} from '../theme';

/**
 * Заставка канала KoKo Crabs — 3.2 с, кинематографичная и энергичная.
 * 0–6   импульс сонара из темноты
 * 6–38  быстрый монтаж 4 кадров (клешня · кит · биолюминесценция · пузыри) со вспышками на склейках
 * 38–44 белая вспышка, эмблема врезается с ударной волной, линии эмблемы прорисовываются
 * 44–64 надпись KOKO CRABS: разрядка сжимается, по буквам проходит блик
 * 58–72 подпись; 86–96 уход в чёрное.
 * Звук — scripts/intro_jingle.py → public/sfx/intro-jingle.wav (тайминги совпадают).
 */

const CYAN = '#7fe9ff';
const DEEP = '#020a14';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const rnd = (i: number) => {
	const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
};
const p = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

/** Частицы «морского снега», летящие на камеру. speed — сила движения. */
const Particles: React.FC<{f: number; count?: number; speed?: number; seed?: number}> = ({f, count = 70, speed = 1, seed = 0}) => {
	const {width, height} = useVideoConfig();
	return (
		<AbsoluteFill>
			{Array.from({length: count}, (_, i) => {
				const z = (rnd(i + seed) + f * 0.012 * speed) % 1; // 0 далеко → 1 близко
				const x = width / 2 + (rnd(i + 31 + seed) - 0.5) * width * (0.3 + z * 1.6);
				const y = height / 2 + (rnd(i + 57 + seed) - 0.5) * height * (0.3 + z * 1.6);
				const r = 1 + z * 4;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x,
							top: y,
							width: r * 2,
							height: r * 2 * (1 + speed * z * 2),
							borderRadius: r,
							background: `rgba(190,240,255,${0.25 + z * 0.6})`,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

/** Эмблема: линейный краб в круге. draw 0…1 — прорисовка линий. */
const Emblem: React.FC<{draw: number; glow: number}> = ({draw, glow}) => {
	const L = (d: string, w = 7, delay = 0) => (
		<path
			d={d}
			pathLength={1}
			strokeDasharray="1 1"
			strokeDashoffset={1 - Math.max(0, Math.min(1, (draw - delay) / (1 - delay)))}
			stroke={CYAN}
			strokeWidth={w}
			strokeLinecap="round"
			strokeLinejoin="round"
			fill="none"
		/>
	);
	return (
		<svg width={360} height={360} viewBox="-180 -180 360 360" style={{filter: `drop-shadow(0 0 ${8 + 22 * glow}px rgba(127,233,255,${0.5 + 0.5 * glow}))`}}>
			{L('M0,-165 A165,165 0 1,1 -0.1,-165', 5)}
			{L('M0,-150 A150,150 0 1,0 0.1,-150', 2)}
			{/* Панцирь — шестиугольник со скруглением */}
			{L('M-70,10 L-40,-30 L40,-30 L70,10 L40,50 L-40,50 Z', 8, 0.1)}
			{/* Глаза */}
			{L('M-18,-30 L-24,-58 M18,-30 L24,-58', 6, 0.25)}
			{L('M-28,-64 a5,5 0 1,0 0.1,0 M20,-64 a5,5 0 1,0 0.1,0', 8, 0.3)}
			{/* Клешни */}
			{L('M-70,0 Q-100,-20 -100,-60 M-100,-60 L-120,-95 M-100,-60 L-78,-92', 8, 0.2)}
			{L('M70,0 Q100,-20 100,-60 M100,-60 L120,-95 M100,-60 L78,-92', 8, 0.2)}
			{/* Ноги */}
			{L('M-55,35 L-100,60 L-112,95 M-45,45 L-80,80 L-86,112 M55,35 L100,60 L112,95 M45,45 L80,80 L86,112', 6, 0.35)}
		</svg>
	);
};

/** Короткие кадры монтажа (силуэты с контурным светом). */
const ShotClaw: React.FC<{t: number}> = ({t}) => (
	<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
		{/* Клешня краба крупно: ладонь и два «пальца», которые смыкаются */}
		<svg
			width={1400}
			height={1000}
			viewBox="-700 -500 1400 1000"
			style={{
				transform: `translate(${interpolate(t, [0, 1], [180, -180])}px, ${interpolate(t, [0, 1], [60, -40])}px) rotate(${interpolate(t, [0, 1], [-18, -6])}deg) scale(${interpolate(t, [0, 1], [1.15, 1.35])})`,
				filter: 'drop-shadow(0 0 18px rgba(127,233,255,0.6))',
			}}
		>
			{/* Сустав и «рука» */}
			<path d="M-700,420 Q-420,300 -230,120" stroke="#0b1a28" strokeWidth={120} strokeLinecap="round" fill="none" />
			<path d="M-700,420 Q-420,300 -230,120" stroke={CYAN} strokeWidth={4} fill="none" opacity={0.6} />
			{/* Ладонь */}
			<ellipse cx={-80} cy={0} rx={250} ry={170} fill="#0b1a28" stroke={CYAN} strokeWidth={5} />
			{/* Неподвижный палец */}
			<path d="M120,-60 Q380,-150 560,-60 Q420,-70 300,-10 Q220,20 130,30 Z" fill="#0b1a28" stroke={CYAN} strokeWidth={5} strokeLinejoin="round" />
			{/* Подвижный палец — смыкается */}
			<g transform={`rotate(${interpolate(t, [0, 0.6, 1], [26, 4, 8])} 120 60)`}>
				<path d="M120,40 Q360,150 540,90 Q400,70 290,40 Q210,20 130,10 Z" fill="#0b1a28" stroke={CYAN} strokeWidth={5} strokeLinejoin="round" />
			</g>
			{/* Бугорки панциря */}
			{Array.from({length: 7}, (_, i) => (
				<circle key={i} cx={-220 + i * 55} cy={-90 + Math.sin(i) * 25} r={9} fill="#16354d" />
			))}
		</svg>
	</AbsoluteFill>
);
const ShotWhale: React.FC<{t: number}> = ({t}) => (
	<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
		{/* Силуэт кашалота: прямоугольная голова, хвостовые лопасти */}
		<svg
			width={2600}
			height={900}
			viewBox="0 0 2600 900"
			style={{transform: `translateX(${interpolate(t, [0, 1], [1000, -1000])}px) scale(1.15)`, filter: 'drop-shadow(0 -6px 14px rgba(127,233,255,0.55))'}}
		>
			<path
				d="M200,330 Q200,250 300,245 L980,240 Q1120,245 1250,290 Q1600,380 1950,430 L2150,455 Q2280,360 2420,330 Q2340,440 2330,470 Q2350,520 2440,620 Q2280,580 2160,500 L1950,510 Q1600,560 1250,600 Q1000,630 700,620 L320,610 Q200,605 200,520 Z"
				fill="#06121d"
				stroke="rgba(127,233,255,0.75)"
				strokeWidth={3}
			/>
			<path d="M330,560 L760,575" stroke="rgba(127,233,255,0.35)" strokeWidth={3} />
			<path d="M1150,600 Q1180,700 1260,740 Q1250,660 1240,600" fill="#06121d" stroke="rgba(127,233,255,0.6)" strokeWidth={3} />
		</svg>
	</AbsoluteFill>
);
const ShotGlow: React.FC<{t: number; f: number}> = ({t, f}) => {
	const {width, height} = useVideoConfig();
	return (
		<AbsoluteFill>
			{Array.from({length: 40}, (_, i) => {
				const a = rnd(i) * Math.PI * 2;
				const d = interpolate(t, [0, 1], [40, 120 + rnd(i + 5) * 700]);
				const r = 3 + rnd(i + 9) * 12;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: width / 2 + Math.cos(a) * d - r,
							top: height / 2 + Math.sin(a) * d * 0.6 - r,
							width: r * 2,
							height: r * 2,
							borderRadius: '50%',
							background: i % 3 ? CYAN : '#b98bff',
							boxShadow: `0 0 ${r * 3}px ${i % 3 ? CYAN : '#b98bff'}`,
							opacity: 0.5 + 0.5 * Math.sin(f * 0.9 + i),
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};
const ShotBubbles: React.FC<{t: number}> = ({t}) => {
	const {width, height} = useVideoConfig();
	return (
		<AbsoluteFill style={{transform: `scale(${interpolate(t, [0, 1], [1, 1.25])})`}}>
			{Array.from({length: 60}, (_, i) => {
				const r = 4 + rnd(i + 2) * 26;
				const y = height + 50 - ((t * (1.4 + rnd(i) * 1.6) + rnd(i + 4)) % 1.6) * (height + 200);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: rnd(i + 8) * width,
							top: y,
							width: r * 2,
							height: r * 2,
							borderRadius: '50%',
							border: '2px solid rgba(200,245,255,0.8)',
							background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5), rgba(255,255,255,0) 50%)',
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

const SHOTS: [number, number][] = [
	[6, 14],
	[14, 22],
	[22, 30],
	[30, 38],
];

export const ChannelIntro: React.FC = () => {
	const f = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();

	const shotIndex = SHOTS.findIndex(([a, b]) => f >= a && f < b);
	const shotT = shotIndex >= 0 ? p(f, SHOTS[shotIndex][0], SHOTS[shotIndex][1]) : 0;
	// Вспышки на склейках и большая белая вспышка перед логотипом.
	const cutFlash = SHOTS.reduce((m, [a]) => Math.max(m, f >= a && f < a + 2 ? 0.55 * (1 - (f - a) / 2) : 0), 0);
	const bigFlash = f >= 38 ? Math.max(0, 1 - (f - 38) / 6) : 0;
	const logoPhase = f >= 38;

	const slam = spring({frame: f - 38, fps, config: {damping: 12, stiffness: 220, mass: 0.6}});
	const emblemScale = interpolate(slam, [0, 1], [1.6, 1]);
	const draw = p(f, 39, 56);
	const shock = p(f, 38, 54);
	const word = spring({frame: f - 44, fps, config: {damping: 18, stiffness: 120}});
	const sheen = interpolate(f, [52, 66], [-30, 130], clamp);
	const tag = p(f, 58, 70);
	const push = interpolate(f, [38, 96], [1, 1.06], clamp);
	const end = p(f, 86, 96);
	const sonar = p(f, 0, 8);
	const shake = f >= 38 && f < 44 ? (rnd(f) - 0.5) * 24 * (1 - (f - 38) / 6) : 0;

	return (
		<AbsoluteFill style={{backgroundColor: DEEP, overflow: 'hidden'}}>
			{/* Фон: глубина с лучами */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse at 50% ${logoPhase ? 42 : 30}%, #0f3a5a 0%, #061c30 40%, ${DEEP} 80%)`,
					transform: `translate(${shake}px, ${shake * 0.4}px)`,
				}}
			/>
			<AbsoluteFill style={{opacity: 0.18, mixBlendMode: 'screen'}}>
				<svg width={width} height={height}>
					{Array.from({length: 7}, (_, i) => (
						<path
							key={i}
							d={`M${width * (0.2 + i * 0.1) + Math.sin(f * 0.05 + i) * 30},-20 L${width * (0.05 + i * 0.14)},${height} L${width * (0.1 + i * 0.14)},${height} Z`}
							fill="url(#ray)"
						/>
					))}
					<defs>
						<linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#bdf3ff" stopOpacity="0.9" />
							<stop offset="1" stopColor="#bdf3ff" stopOpacity="0" />
						</linearGradient>
					</defs>
				</svg>
			</AbsoluteFill>

			<Particles f={f} speed={logoPhase ? 0.6 : 2.5} />

			{/* Импульс сонара из темноты */}
			{f < 10 ? (
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
					<div
						style={{
							width: 200 + sonar * 1600,
							height: 200 + sonar * 1600,
							borderRadius: '50%',
							border: `${6 - sonar * 4}px solid rgba(127,233,255,${1 - sonar})`,
							boxShadow: `0 0 40px rgba(127,233,255,${0.6 * (1 - sonar)})`,
						}}
					/>
				</AbsoluteFill>
			) : null}

			{/* Быстрый монтаж */}
			{shotIndex === 0 ? <ShotClaw t={shotT} /> : null}
			{shotIndex === 1 ? <ShotWhale t={shotT} /> : null}
			{shotIndex === 2 ? <ShotGlow t={shotT} f={f} /> : null}
			{shotIndex === 3 ? <ShotBubbles t={shotT} /> : null}

			{/* Логотип */}
			{logoPhase ? (
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${push}) translate(${shake}px, ${shake * 0.4}px)`}}>
					{/* Ударная волна */}
					<div
						style={{
							position: 'absolute',
							width: 360 + shock * 1500,
							height: 360 + shock * 1500,
							borderRadius: '50%',
							border: `${4 * (1 - shock) + 1}px solid rgba(127,233,255,${0.8 * (1 - shock)})`,
							top: height / 2 - 160 - (360 + shock * 1500) / 2,
						}}
					/>
					<div style={{transform: `translateY(-150px) scale(${emblemScale})`, opacity: Math.min(1, slam * 1.5)}}>
						<Emblem draw={draw} glow={1 - p(f, 44, 70) * 0.6} />
					</div>
					<div
						style={{
							position: 'absolute',
							top: height / 2 + 70,
							fontFamily: fonts.display,
							fontWeight: 700,
							fontSize: 120,
							letterSpacing: `${interpolate(word, [0, 1], [0.6, 0.12])}em`,
							color: '#eafaff',
							opacity: word,
							textShadow: '0 0 30px rgba(127,233,255,0.35)',
							backgroundImage: `linear-gradient(100deg, #eafaff 0%, #eafaff ${sheen - 12}%, #ffffff ${sheen}%, ${CYAN} ${sheen + 4}%, #eafaff ${sheen + 14}%, #eafaff 100%)`,
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							whiteSpace: 'nowrap',
						}}
					>
						KOKO CRABS
					</div>
					<div
						style={{
							position: 'absolute',
							top: height / 2 + 230,
							display: 'flex',
							alignItems: 'center',
							gap: 22,
							opacity: tag,
							transform: `translateY(${interpolate(tag, [0, 1], [16, 0])}px)`,
							fontFamily: fonts.body,
							fontWeight: 600,
							fontSize: 34,
							letterSpacing: `${interpolate(tag, [0, 1], [0.5, 0.28])}em`,
							textTransform: 'uppercase',
							color: 'rgba(200,240,255,0.85)',
						}}
					>
						<span style={{width: 70 * tag, height: 2, background: CYAN, display: 'inline-block'}} />
						Уникальные истории подводного мира
						<span style={{width: 70 * tag, height: 2, background: CYAN, display: 'inline-block'}} />
					</div>
				</AbsoluteFill>
			) : null}

			{/* Виньетка, вспышки, уход в чёрное */}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.75) 100%)'}} />
			<AbsoluteFill style={{backgroundColor: '#dff8ff', opacity: Math.max(cutFlash, bigFlash)}} />
			<AbsoluteFill style={{backgroundColor: '#000', opacity: Math.max(1 - p(f, 0, 3), end)}} />
			<Audio src={staticFile('sfx/intro-jingle.wav')} />
		</AbsoluteFill>
	);
};
