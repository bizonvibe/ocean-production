import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts} from '../theme';

/**
 * Заставка канала Coco Crabs — 3.2 с, мультяшная и энергичная.
 * 0–12  пузыри и волна · 6–22 краб выпрыгивает и приземляется · 24, 30 щелчки клешнями
 * 30–38 рывок камеры, краб отскакивает влево · 33–50 буквы COCO CRABS · 45–72 рыбки
 * 56–66 подпись · 78–90 краб машет · 84–96 «диафрагма» в чёрное.
 * Звук — scripts/intro_jingle.py → public/sfx/intro-jingle.wav (тайминги совпадают).
 */

const C = {
	coral: '#ff6b57',
	yellow: '#ffd23f',
	aqua: '#4dd8e6',
	navy: '#0b2a4a',
	white: '#ffffff',
	shell: '#ff5a3c',
	shellDark: '#d93a22',
};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const rnd = (i: number) => {
	const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
};

/** Краб-маскот (оригинальный рисунок). claw — угол «щелчка» клешней, wave — взмах правой клешнёй, blink 0…1. */
const Crab: React.FC<{claw: number; wave: number; blink: number}> = ({claw, wave, blink}) => (
	<svg width={520} height={420} viewBox="-260 -230 520 420" style={{overflow: 'visible'}}>
		{/* Ноги */}
		{[-1, 1].map((s) =>
			[0, 1, 2].map((k) => (
				<path
					key={`${s}${k}`}
					d={`M${s * (60 + k * 18)},${40 + k * 8} q${s * 60},${10 + k * 6} ${s * 80},${60 + k * 10}`}
					stroke={C.shellDark}
					strokeWidth={16}
					strokeLinecap="round"
					fill="none"
				/>
			)),
		)}
		{/* Левая клешня */}
		<g transform={`translate(-150,-40) rotate(${-20 - claw})`}>
			<path d="M0,40 Q-10,0 0,-10" stroke={C.shellDark} strokeWidth={18} fill="none" strokeLinecap="round" />
			<ellipse cx={-10} cy={-50} rx={46} ry={40} fill={C.shell} stroke={C.navy} strokeWidth={8} />
			<path d={`M-40,-70 L${-10},-55 L-40,${-40 + claw * 0.6}`} fill={C.navy} />
		</g>
		{/* Правая клешня (машет) */}
		<g transform={`translate(150,-40) rotate(${20 + claw + wave})`}>
			<path d="M0,40 Q10,0 0,-10" stroke={C.shellDark} strokeWidth={18} fill="none" strokeLinecap="round" />
			<ellipse cx={10} cy={-50} rx={46} ry={40} fill={C.shell} stroke={C.navy} strokeWidth={8} />
			<path d={`M40,-70 L10,-55 L40,${-40 + claw * 0.6}`} fill={C.navy} />
		</g>
		{/* Панцирь */}
		<ellipse cx={0} cy={20} rx={150} ry={95} fill={C.shell} stroke={C.navy} strokeWidth={10} />
		<ellipse cx={-50} cy={-15} rx={40} ry={18} fill="#ff9a85" opacity={0.7} />
		{/* Глаза на стебельках */}
		{[-1, 1].map((s) => (
			<g key={s}>
				<path d={`M${s * 40},-50 L${s * 50},-120`} stroke={C.shellDark} strokeWidth={14} strokeLinecap="round" />
				<circle cx={s * 50} cy={-140} r={34} fill={C.white} stroke={C.navy} strokeWidth={8} />
				<ellipse cx={s * 50 + 6} cy={-138} rx={14} ry={14 * (1 - blink) + 1} fill={C.navy} />
				<circle cx={s * 50 + 12} cy={-146} r={5 * (1 - blink)} fill={C.white} />
			</g>
		))}
		{/* Улыбка и щёки */}
		<path d="M-45,40 Q0,85 45,40" stroke={C.navy} strokeWidth={9} fill="none" strokeLinecap="round" />
		<circle cx={-85} cy={35} r={16} fill="#ff9a85" />
		<circle cx={85} cy={35} r={16} fill="#ff9a85" />
	</svg>
);

const Fish: React.FC<{color: string; flip?: boolean}> = ({color, flip}) => (
	<svg width={160} height={90} viewBox="0 0 160 90" style={{transform: flip ? 'scaleX(-1)' : undefined}}>
		<path d="M20,45 Q70,0 120,45 Q70,90 20,45 Z" fill={color} stroke={C.navy} strokeWidth={6} />
		<path d="M120,45 L155,20 L150,45 L155,70 Z" fill={color} stroke={C.navy} strokeWidth={6} strokeLinejoin="round" />
		<circle cx={45} cy={40} r={7} fill={C.navy} />
	</svg>
);

const LETTERS = 'COCO'.split('');
const LETTERS2 = 'CRABS'.split('');
const COLORS = [C.coral, C.yellow, C.aqua, C.white];

export const ChannelIntro: React.FC = () => {
	const f = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();

	// Краб: прыжок, приземление со «сплющиванием», рывок влево.
	const jump = spring({frame: f - 6, fps, config: {damping: 9, stiffness: 120, mass: 0.6}});
	const land = f >= 20 ? Math.sin(Math.min(1, (f - 20) / 6) * Math.PI) : 0;
	const whip = spring({frame: f - 30, fps, config: {damping: 14, stiffness: 160}});
	const crabX = interpolate(whip, [0, 1], [0, -560]);
	const crabY = interpolate(jump, [0, 1], [700, 40]) + interpolate(whip, [0, 1], [0, 150]);
	const crabS = interpolate(whip, [0, 1], [1.15, 0.72]);
	const claw = (f >= 24 && f < 28 ? 25 : 0) + (f >= 30 && f < 34 ? 25 : 0);
	const waveClaw = f >= 76 ? 25 * Math.sin((f - 76) * 0.8) : 0;
	const blink = f >= 44 && f <= 48 ? Math.sin(((f - 44) / 4) * Math.PI) : 0;
	const whipBlur = f >= 30 && f <= 38 ? 14 * Math.sin(((f - 30) / 8) * Math.PI) : 0;

	// Встряска кадра при приземлении.
	const shake = f >= 20 && f < 26 ? (rnd(f) - 0.5) * 30 * (1 - (f - 20) / 6) : 0;
	// Фон: бирюза → глубина после рывка.
	const deep = interpolate(f, [30, 38], [0, 1], clamp);
	// Диафрагма в конце: круг вокруг краба сжимается.
	const iris = interpolate(f, [84, 95], [1, 0], clamp);
	const irisR = iris * Math.hypot(width, height);
	const irisCx = width / 2 + crabX;
	const irisCy = height / 2 + crabY;

	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			<AbsoluteFill
				style={{
					clipPath: `circle(${irisR}px at ${irisCx}px ${irisCy}px)`,
					transform: `translate(${shake}px, ${shake * 0.5}px)`,
				}}
			>
				{/* Фон */}
				<AbsoluteFill
					style={{
						background: `radial-gradient(circle at 50% ${interpolate(deep, [0, 1], [70, 40])}%, ${deep < 0.5 ? '#5ee6f0' : '#2aa7d8'} 0%, ${deep < 0.5 ? '#1aa3c8' : '#0d5c9a'} 45%, ${deep < 0.5 ? '#0b6fa8' : '#06264a'} 100%)`,
					}}
				/>
				{/* Вращающиеся лучи за логотипом */}
				<AbsoluteFill style={{opacity: deep * 0.35, transform: `rotate(${f * 1.5}deg) scale(2)`}}>
					<svg width={width} height={height} viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}>
						{Array.from({length: 12}, (_, i) => (
							<path key={i} d="M0,0 L-60,-1200 L60,-1200 Z" fill={C.white} transform={`rotate(${i * 30})`} opacity={0.5} />
						))}
					</svg>
				</AbsoluteFill>
				{/* Волна-«шторка» в начале: бирюзовая заливка с волнистым краем уезжает вверх */}
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width,
						height: height * 1.3,
						transform: `translateY(${interpolate(f, [0, 12], [0, -height * 1.35], clamp)}px)`,
					}}
				>
					<svg width={width} height={height * 1.3} viewBox="0 0 100 130" preserveAspectRatio="none">
						<path d="M0,0 H100 V100 Q87.5,92 75,100 T50,100 T25,100 T0,100 Z" fill={C.aqua} />
						<path d="M0,100 Q12.5,108 25,100 T50,100 T75,100 T100,100 V104 Q87.5,112 75,104 T50,104 T25,104 T0,104 Z" fill={C.white} opacity={0.6} />
					</svg>
				</div>
				{/* Пузыри */}
				{Array.from({length: 46}, (_, i) => {
					const start = rnd(i) * (i < 30 ? 10 : 80);
					const life = 18 + rnd(i + 3) * 20;
					const pr = (f - start) / life;
					if (pr < 0 || pr > 1) return null;
					const r = 8 + rnd(i + 7) * (i < 30 ? 40 : 18);
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: rnd(i + 11) * width,
								top: height + 60 - pr * (height + 200),
								width: r * 2,
								height: r * 2,
								borderRadius: '50%',
								border: `${Math.max(3, r * 0.15)}px solid rgba(255,255,255,0.85)`,
								background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.05) 40%)',
								transform: `translateX(${Math.sin(pr * 6 + i) * 20}px)`,
							}}
						/>
					);
				})}
				{/* Рыбки */}
				<div style={{position: 'absolute', top: 210, left: interpolate(f, [45, 62], [-200, width + 200], clamp)}}>
					<Fish color={C.yellow} flip />
				</div>
				<div style={{position: 'absolute', top: 820, left: interpolate(f, [55, 74], [width + 200, -200], clamp)}}>
					<Fish color={C.coral} />
				</div>
				{/* Логотип */}
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingLeft: 380}}>
					<div style={{display: 'flex', gap: 6}}>
						{LETTERS.map((ch, i) => {
							const s = spring({frame: f - 33 - i * 2, fps, config: {damping: 8, stiffness: 180, mass: 0.5}});
							return (
								<span key={i} style={letterStyle(COLORS[i % 4], interpolate(s, [0, 1], [-600, 0]), interpolate(s, [0, 1], [-30, (i % 2 ? 6 : -6)]))}>
									{ch}
								</span>
							);
						})}
					</div>
					<div style={{display: 'flex', gap: 6, marginTop: -30}}>
						{LETTERS2.map((ch, i) => {
							const s = spring({frame: f - 39 - i * 2, fps, config: {damping: 8, stiffness: 180, mass: 0.5}});
							return (
								<span key={i} style={letterStyle(COLORS[(i + 1) % 4], interpolate(s, [0, 1], [600, 0]), interpolate(s, [0, 1], [30, (i % 2 ? -5 : 5)]))}>
									{ch}
								</span>
							);
						})}
					</div>
					{(() => {
						const s = spring({frame: f - 56, fps, config: {damping: 10, stiffness: 200}});
						return (
							<div
								style={{
									marginTop: 26,
									padding: '14px 34px',
									borderRadius: 999,
									background: C.navy,
									border: `5px solid ${C.yellow}`,
									color: C.white,
									fontFamily: fonts.body,
									fontWeight: 800,
									fontSize: 40,
									transform: `scale(${s})`,
									whiteSpace: 'nowrap',
								}}
							>
								Удивительные истории подводного мира
							</div>
						);
					})()}
				</AbsoluteFill>
				{/* Краб */}
				<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
					<div
						style={{
							transform: `translate(${crabX}px, ${crabY}px) scale(${crabS * (1 + 0.18 * land)}, ${crabS * (1 - 0.22 * land)})`,
							transformOrigin: '50% 90%',
							filter: whipBlur ? `blur(${whipBlur}px)` : undefined,
						}}
					>
						<Crab claw={claw} wave={waveClaw} blink={blink} />
					</div>
				</AbsoluteFill>
			</AbsoluteFill>
			<Audio src={staticFile('sfx/intro-jingle.wav')} />
		</AbsoluteFill>
	);
};

const letterStyle = (color: string, y: number, rot: number): React.CSSProperties => ({
	display: 'inline-block',
	fontFamily: fonts.display,
	fontWeight: 800,
	fontSize: 190,
	lineHeight: 1,
	color,
	transform: `translateY(${y}px) rotate(${rot}deg)`,
	WebkitTextStroke: `10px ${C.navy}`,
	paintOrder: 'stroke fill',
	textShadow: `0 12px 0 ${C.navy}`,
});
