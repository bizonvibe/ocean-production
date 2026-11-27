import {AbsoluteFill} from 'remotion';
import {fonts} from '../theme';
import {CYAN, DEEP, Emblem} from './ChannelIntro';

/**
 * Шапка YouTube-канала KoKo Crabs — 2560×1440 (стиль заставки).
 * Всё важное — в безопасной зоне 1546×423 по центру (видна на всех устройствах);
 * глубина, лучи, частицы и силуэт кашалота — по краям (видны на ТВ).
 */
const W = 2560;
const H = 1440;
const SAFE_W = 1546;
const SAFE_H = 423;
const rnd = (i: number) => {
	const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
};

export const ChannelBanner: React.FC<{showSafe?: boolean}> = ({showSafe}) => (
	<AbsoluteFill style={{backgroundColor: DEEP, overflow: 'hidden'}}>
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #14507a 0%, #0a2c48 30%, #041426 60%, #020a14 85%)'}} />
		{/* Лучи света сверху */}
		<svg width={W} height={H} style={{position: 'absolute', opacity: 0.22, mixBlendMode: 'screen'}}>
			<defs>
				<linearGradient id="br" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#bdf3ff" stopOpacity="0.95" />
					<stop offset="1" stopColor="#bdf3ff" stopOpacity="0" />
				</linearGradient>
			</defs>
			{Array.from({length: 9}, (_, i) => (
				<path key={i} d={`M${W * (0.12 + i * 0.095)},-20 L${W * (0.02 + i * 0.12)},${H} L${W * (0.07 + i * 0.12)},${H} Z`} fill="url(#br)" />
			))}
		</svg>
		{/* Силуэт кашалота в глубине (левая часть) */}
		<svg width={2600} height={900} viewBox="0 0 2600 900" style={{position: 'absolute', left: -700, top: 820, opacity: 0.85, filter: 'drop-shadow(0 -6px 16px rgba(127,233,255,0.45))'}}>
			<path
				d="M200,330 Q200,250 300,245 L980,240 Q1120,245 1250,290 Q1600,380 1950,430 L2150,455 Q2280,360 2420,330 Q2340,440 2330,470 Q2350,520 2440,620 Q2280,580 2160,500 L1950,510 Q1600,560 1250,600 Q1000,630 700,620 L320,610 Q200,605 200,520 Z"
				fill="#051322"
				stroke="rgba(127,233,255,0.6)"
				strokeWidth={3}
			/>
		</svg>
		{/* Частицы «морского снега» и пузыри */}
		{Array.from({length: 160}, (_, i) => {
			const r = 1.5 + rnd(i + 3) * 5;
			const bubble = i % 9 === 0;
			return (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: rnd(i) * W,
						top: rnd(i + 50) * H,
						width: (bubble ? r * 3 : r) * 2,
						height: (bubble ? r * 3 : r) * 2,
						borderRadius: '50%',
						background: bubble ? 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5), rgba(255,255,255,0) 55%)' : `rgba(190,240,255,${0.2 + rnd(i + 9) * 0.5})`,
						border: bubble ? '2px solid rgba(200,245,255,0.6)' : undefined,
					}}
				/>
			);
		})}
		{/* Безопасная зона: эмблема + название + подпись */}
		<div
			style={{
				position: 'absolute',
				left: (W - SAFE_W) / 2,
				top: (H - SAFE_H) / 2,
				width: SAFE_W,
				height: SAFE_H,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 40,
				outline: showSafe ? '3px dashed #ff5a4f' : undefined,
			}}
		>
			<div style={{transform: 'scale(0.78)', margin: -40}}>
				<Emblem draw={1} glow={0.7} />
			</div>
			<div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
				<div
					style={{
						fontFamily: fonts.display,
						fontWeight: 700,
						fontSize: 118,
						lineHeight: 1,
						letterSpacing: '0.1em',
						color: '#eafaff',
						textShadow: '0 0 40px rgba(127,233,255,0.45)',
						whiteSpace: 'nowrap',
					}}
				>
					KOKO CRABS
				</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 22, fontFamily: fonts.body, fontWeight: 600, fontSize: 33, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(200,240,255,0.9)'}}>
					<span style={{width: 80, height: 2, background: CYAN, display: 'inline-block'}} />
					Уникальные истории подводного мира
				</div>
			</div>
		</div>
	</AbsoluteFill>
);
