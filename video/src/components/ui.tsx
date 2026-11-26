import {lightLeak} from '@remotion/effects/light-leak';
import React, {createContext, useContext} from 'react';

/** Когда монтаж идёт наплывами (TransitionSeries), собственные затемнения сцен отключаются. */
export const SceneFadeDisabled = createContext(false);
import {
	AbsoluteFill,
	interpolate,
	Solid,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {colors, easeOutExpo, fonts} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Нейтральный «природный» фон: тёмный градиент с медленно плывущим тёплым светом (без внешних файлов). */
export const Backdrop: React.FC<{tint?: string; drift?: number}> = ({tint = colors.accent, drift = 120}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const t = frame / Math.max(1, durationInFrames);
	const x = 30 + drift * 0.2 * t;
	return (
		<AbsoluteFill
			style={{
				backgroundColor: colors.bg,
				background: `radial-gradient(ellipse at ${x}% 35%, ${tint}33 0%, rgba(0,0,0,0) 55%), radial-gradient(ellipse at ${100 - x}% 90%, ${colors.green}26 0%, rgba(0,0,0,0) 60%), ${colors.bg}`,
			}}
		/>
	);
};

/** Плёночное зерно: новый «посев» шума на каждый кадр. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.09}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
			<svg width="100%" height="100%">
				<filter id="grain">
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 97} stitchTiles="stitch" />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="100%" height="100%" filter="url(#grain)" />
			</svg>
		</AbsoluteFill>
	);
};

export const Vignette: React.FC = () => (
	<AbsoluteFill
		style={{
			pointerEvents: 'none',
			background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 85%, rgba(0,0,0,0.85) 100%)',
		}}
	/>
);

/** Появление/исчезновение сцены. */
export const SceneFade: React.FC<{children: React.ReactNode; inFrames?: number; outFrames?: number}> = ({
	children,
	inFrames = 12,
	outFrames = 12,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const disabled = useContext(SceneFadeDisabled);
	const opacity = disabled
		? 1
		: interpolate(frame, [0, inFrames, durationInFrames - outFrames, durationInFrames], [0, 1, 1, 0], clamp);
	return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

/** Кинетическая типографика: слова выезжают снизу из размытия. */
export const RevealText: React.FC<{
	text: string;
	start: number;
	end?: number;
	stagger?: number;
	style?: React.CSSProperties;
	wordStyle?: (index: number) => React.CSSProperties;
}> = ({text, start, end, stagger = 4, style, wordStyle}) => {
	const frame = useCurrentFrame();
	const words = text.split(' ');
	const out = end === undefined ? 1 : interpolate(frame, [end, end + 14], [1, 0], clamp);
	return (
		<div style={{display: 'flex', flexWrap: 'wrap', columnGap: '0.28em', opacity: out, ...style}}>
			{words.map((w, i) => {
				const p = easeOutExpo(interpolate(frame, [start + i * stagger, start + i * stagger + 26], [0, 1], clamp));
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							opacity: p,
							transform: `translateY(${(1 - p) * 0.6}em)`,
							filter: `blur(${(1 - p) * 14}px)`,
							...wordStyle?.(i),
						}}
					>
						{w}
					</span>
				);
			})}
		</div>
	);
};

const nf = (decimals: number) =>
	new Intl.NumberFormat('ru-RU', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});

/** Счётчик, который «докручивается» до значения. */
export const Counter: React.FC<{
	to: number;
	from?: number;
	start: number;
	duration?: number;
	decimals?: number;
	prefix?: string;
	suffix?: string;
	style?: React.CSSProperties;
}> = ({to, from = 0, start, duration = 45, decimals = 0, prefix = '', suffix = '', style}) => {
	const frame = useCurrentFrame();
	const p = easeOutExpo(interpolate(frame, [start, start + duration], [0, 1], clamp));
	const value = from + (to - from) * p;
	return (
		<span style={{fontVariantNumeric: 'tabular-nums', ...style}}>
			{prefix}
			{nf(decimals).format(value)}
			{suffix}
		</span>
	);
};

/** Небольшая подпись капсом с разрядкой. */
export const Overline: React.FC<{children: React.ReactNode; start: number; color?: string; style?: React.CSSProperties}> = ({
	children,
	start,
	color = colors.accent,
	style,
}) => {
	const frame = useCurrentFrame();
	const p = easeOutExpo(interpolate(frame, [start, start + 30], [0, 1], clamp));
	return (
		<div
			style={{
				fontFamily: fonts.body,
				fontWeight: 600,
				fontSize: 22,
				letterSpacing: `${0.2 + (1 - p) * 0.4}em`,
				textTransform: 'uppercase',
				color,
				opacity: p,
				display: 'flex',
				alignItems: 'center',
				gap: 18,
				...style,
			}}
		>
			<span style={{width: 56 * p, height: 2, background: color, display: 'inline-block'}} />
			{children}
		</div>
	);
};

/** Световая вспышка поверх склейки (эффект @remotion/effects). */
export const LightLeakOverlay: React.FC<{seed?: number; hueShift?: number}> = ({seed = 0, hueShift = 0}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, width, height} = useVideoConfig();
	return (
		<AbsoluteFill style={{mixBlendMode: 'screen', opacity: 0.85}}>
			<Solid
				width={width}
				height={height}
				effects={[
					lightLeak({
						seed,
						hueShift,
						progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], clamp),
					}),
				]}
			/>
		</AbsoluteFill>
	);
};

export {clamp};
