import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from '../components/ui';
import {easeInOutCubic, easeOutExpo} from '../theme';

export type ImageMotion = 'push-in' | 'pull-out' | 'pan-left' | 'pan-right' | 'rise' | 'reveal';

/**
 * Базовый кирпич анимации по картинке из репозитория анимаций:
 * движение камеры по кадру (наезд, отъезд, панорама, подъём) или проявление шторкой.
 * Сложные анимации из ТЗ собираются из нескольких таких слоёв + своих элементов
 * в папке главы (src/chapters/<проект>/chNN/).
 */
export const AnimatedImage: React.FC<{
	src: string;
	motion?: ImageMotion;
	/** Сила движения: 1 — стандарт, 0.5 — спокойнее, 2 — энергичнее. */
	strength?: number;
	fit?: 'cover' | 'contain';
	style?: React.CSSProperties;
}> = ({src, motion = 'push-in', strength = 1, fit = 'cover', style}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const t = easeInOutCubic(interpolate(frame, [0, durationInFrames], [0, 1], clamp));
	const k = strength;
	let transform = '';
	let clipPath: string | undefined;
	switch (motion) {
		case 'push-in':
			transform = `scale(${1.02 + 0.12 * k * t})`;
			break;
		case 'pull-out':
			transform = `scale(${1.02 + 0.12 * k * (1 - t)})`;
			break;
		case 'pan-left':
			transform = `scale(${1.1 + 0.04 * k}) translateX(${(3 - 6 * t) * k}%)`;
			break;
		case 'pan-right':
			transform = `scale(${1.1 + 0.04 * k}) translateX(${(-3 + 6 * t) * k}%)`;
			break;
		case 'rise':
			transform = `scale(${1.1 + 0.04 * k}) translateY(${(3 - 6 * t) * k}%)`;
			break;
		case 'reveal': {
			const r = easeOutExpo(interpolate(frame, [0, 30], [0, 1], clamp));
			clipPath = `inset(0 ${(1 - r) * 100}% 0 0)`;
			transform = `scale(${1.04 + 0.06 * t})`;
			break;
		}
	}
	return (
		<AbsoluteFill style={{overflow: 'hidden', clipPath}}>
			<Img
				src={/^https?:\/\//.test(src) ? src : staticFile(src)}
				style={{width: '100%', height: '100%', objectFit: fit, transform, ...style}}
			/>
		</AbsoluteFill>
	);
};
