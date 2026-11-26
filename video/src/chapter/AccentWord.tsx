import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from '../components/ui';
import {colors, easeOutExpo, fonts} from '../theme';

/**
 * Акцентное слово поверх кадра: проявляется из размытия с лёгким разлётом букв,
 * держится и мягко уходит. Без плашек — читаемость за счёт мягкой тени.
 */
export const AccentWord: React.FC<{text: string; position?: 'center' | 'lower' | 'upper'}> = ({
	text,
	position = 'center',
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const p = easeOutExpo(interpolate(frame, [0, 22], [0, 1], clamp));
	const out = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], clamp);
	const justify = position === 'center' ? 'center' : position === 'lower' ? 'flex-end' : 'flex-start';
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: justify, padding: '150px 120px'}}>
			{/* Мягкое затемнение под словом, чтобы оно читалось на любом фоне. */}
			<AbsoluteFill
				style={{
					opacity: p * out * 0.55,
					background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 60%)',
				}}
			/>
			<div
				style={{
					fontFamily: fonts.display,
					fontWeight: 600,
					fontSize: 104,
					textTransform: 'uppercase',
					letterSpacing: `${0.02 + (1 - p) * 0.12}em`,
					color: colors.text,
					opacity: p * out,
					transform: `scale(${0.94 + 0.06 * p})`,
					filter: `blur(${(1 - p) * 16}px)`,
					textShadow: '0 4px 40px rgba(0,0,0,0.65)',
					textAlign: 'center',
				}}
			>
				{text}
			</div>
		</AbsoluteFill>
	);
};
