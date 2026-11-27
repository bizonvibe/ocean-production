import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts} from '../theme';
import {CYAN, DEEP, Emblem, Particles} from './ChannelIntro';

/**
 * Концовка «Подпишись» канала KoKo Crabs — 4 с, в стиле заставки.
 * 0–20  глубина проступает из темноты, прорисовывается эмблема с надписью
 * 30    вспышка, «ПОДПИШИСЬ» врезается с ударной волной, по буквам блик
 * 42–105 колокольчик качается, слово пульсирует светом, подпись снизу
 * 108–120 уход в чёрное.
 * Звук — scripts/outro_sound.py → public/sfx/outro-subscribe.wav (тайминги совпадают).
 */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const p = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const rnd = (i: number) => {
	const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
};

/** Колокольчик уведомлений (линейный). */
const Bell: React.FC<{swing: number}> = ({swing}) => (
	<svg width={130} height={150} viewBox="-65 -75 130 150" style={{transform: `rotate(${swing}deg)`, transformOrigin: '50% 8%', filter: 'drop-shadow(0 0 14px rgba(127,233,255,0.7))'}}>
		<path d="M0,-62 L0,-50" stroke={CYAN} strokeWidth={8} strokeLinecap="round" />
		<path d="M-40,30 Q-40,-50 0,-50 Q40,-50 40,30 L52,44 L-52,44 Z" fill="none" stroke={CYAN} strokeWidth={8} strokeLinejoin="round" />
		<path d="M-14,56 Q0,70 14,56" fill="none" stroke={CYAN} strokeWidth={8} strokeLinecap="round" />
	</svg>
);

export const OutroSubscribe: React.FC = () => {
	const f = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();

	const emblem = spring({frame: f - 4, fps, config: {damping: 16, stiffness: 120}});
	const draw = p(f, 4, 22);
	const slam = spring({frame: f - 30, fps, config: {damping: 11, stiffness: 220, mass: 0.6}});
	const shock = p(f, 30, 48);
	const flash = f >= 30 ? Math.max(0, 1 - (f - 30) / 6) : 0;
	const sheen = interpolate(f, [40, 56], [-30, 130], clamp);
	const breathe = f > 56 ? 0.5 + 0.5 * Math.sin((f - 56) / 9) : 0;
	const bellIn = spring({frame: f - 42, fps, config: {damping: 12, stiffness: 200}});
	const swing = f >= 60 && f < 80 ? 18 * Math.sin((f - 60) * 0.9) * (1 - (f - 60) / 20) : 0;
	const sub = p(f, 48, 60);
	const shake = f >= 30 && f < 36 ? (rnd(f) - 0.5) * 22 * (1 - (f - 30) / 6) : 0;
	const push = interpolate(f, [0, 120], [1, 1.05], clamp);
	const end = p(f, 108, 120);

	return (
		<AbsoluteFill style={{backgroundColor: DEEP, overflow: 'hidden'}}>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0f3a5a 0%, #061c30 40%, #020a14 80%)'}} />
			<AbsoluteFill style={{opacity: 0.16, mixBlendMode: 'screen'}}>
				<svg width={width} height={height}>
					<defs>
						<linearGradient id="ray2" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#bdf3ff" stopOpacity="0.9" />
							<stop offset="1" stopColor="#bdf3ff" stopOpacity="0" />
						</linearGradient>
					</defs>
					{Array.from({length: 7}, (_, i) => (
						<path
							key={i}
							d={`M${width * (0.2 + i * 0.1) + Math.sin(f * 0.05 + i) * 30},-20 L${width * (0.05 + i * 0.14)},${height} L${width * (0.1 + i * 0.14)},${height} Z`}
							fill="url(#ray2)"
						/>
					))}
				</svg>
			</AbsoluteFill>
			<Particles f={f} speed={0.7} seed={40} />

			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${push}) translate(${shake}px, ${shake * 0.4}px)`}}>
				{/* Эмблема и название сверху */}
				<div style={{position: 'absolute', top: 70, display: 'flex', alignItems: 'center', gap: 26, opacity: emblem, transform: `translateY(${interpolate(emblem, [0, 1], [-30, 0])}px)`}}>
					<div style={{transform: 'scale(0.5)', margin: -90}}>
						<Emblem draw={draw} glow={0.5} />
					</div>
					<div style={{fontFamily: fonts.display, fontWeight: 700, fontSize: 56, letterSpacing: '0.14em', color: '#eafaff'}}>KOKO CRABS</div>
				</div>

				{/* Ударная волна */}
				<div
					style={{
						position: 'absolute',
						width: 300 + shock * 1700,
						height: 300 + shock * 1700,
						borderRadius: '50%',
						border: `${4 * (1 - shock) + 1}px solid rgba(127,233,255,${0.8 * (1 - shock)})`,
					}}
				/>

				{/* ПОДПИШИСЬ + колокольчик */}
				<div style={{display: 'flex', alignItems: 'center', gap: 40, transform: `translateY(20px) scale(${interpolate(slam, [0, 1], [1.5, 1])})`, opacity: Math.min(1, slam * 1.5)}}>
					<div
						style={{
							fontFamily: fonts.display,
							fontWeight: 800,
							fontSize: 140,
							letterSpacing: '0.04em',
							lineHeight: 1,
							backgroundImage: `linear-gradient(100deg, #eafaff 0%, #eafaff ${sheen - 12}%, #ffffff ${sheen}%, ${CYAN} ${sheen + 4}%, #eafaff ${sheen + 14}%, #eafaff 100%)`,
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
							filter: `drop-shadow(0 0 ${16 + 26 * breathe}px rgba(127,233,255,${0.35 + 0.35 * breathe}))`,
							whiteSpace: 'nowrap',
						}}
					>
						ПОДПИШИСЬ
					</div>
					<div style={{transform: `scale(${bellIn})`}}>
						<Bell swing={swing} />
					</div>
				</div>

				{/* Подпись */}
				<div
					style={{
						position: 'absolute',
						top: height / 2 + 150,
						display: 'flex',
						alignItems: 'center',
						gap: 22,
						opacity: sub,
						transform: `translateY(${interpolate(sub, [0, 1], [16, 0])}px)`,
						fontFamily: fonts.body,
						fontWeight: 600,
						fontSize: 36,
						letterSpacing: `${interpolate(sub, [0, 1], [0.45, 0.24])}em`,
						textTransform: 'uppercase',
						color: 'rgba(200,240,255,0.85)',
					}}
				>
					<span style={{width: 70 * sub, height: 2, background: CYAN, display: 'inline-block'}} />
					и не пропусти новые истории из глубины
					<span style={{width: 70 * sub, height: 2, background: CYAN, display: 'inline-block'}} />
				</div>
			</AbsoluteFill>

			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.75) 100%)'}} />
			<AbsoluteFill style={{backgroundColor: '#dff8ff', opacity: flash}} />
			<AbsoluteFill style={{backgroundColor: '#000', opacity: Math.max(1 - p(f, 0, 8), end)}} />
			<Audio src={staticFile('sfx/outro-subscribe.wav')} />
		</AbsoluteFill>
	);
};
