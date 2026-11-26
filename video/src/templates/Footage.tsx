import {AbsoluteFill, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from '../components/ui';
import {fonts} from '../theme';
import type {FootageSource} from './types';

const resolveSrc = (src: string) => (/^https?:\/\//.test(src) ? src : staticFile(src));

/**
 * Стоковый футаж или картинка на весь кадр: медленный наезд, лёгкая панорама,
 * затемнение под текст и подпись источника в правом нижнем углу.
 */
export const FootageLayer: React.FC<{footage: FootageSource; showCredit?: boolean}> = ({footage, showCredit = true}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();
	const [z0, z1] = footage.zoom ?? [1.04, 1.14];
	const scale = interpolate(frame, [0, durationInFrames], [z0, z1], clamp);
	const x = interpolate(frame, [0, durationInFrames], [0, footage.panX ?? -30], clamp);
	const style: React.CSSProperties = {
		width: '100%',
		height: '100%',
		objectFit: footage.fit ?? 'cover',
		transform: `scale(${scale}) translateX(${x}px)`,
		transformOrigin: footage.origin ?? 'center',
		// Единый «грейд» канала: чуть холоднее тени, плотнее контраст.
		filter: 'contrast(1.08) saturate(0.95)',
	};
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			{footage.kind === 'video' ? (
				<OffthreadVideo
					src={resolveSrc(footage.src)}
					muted
					playbackRate={footage.playbackRate ?? 1}
					trimBefore={Math.round((footage.startFromSeconds ?? 0) * fps)}
					style={style}
				/>
			) : (
				<Img src={resolveSrc(footage.src)} style={style} />
			)}
			<AbsoluteFill style={{backgroundColor: `rgba(5,6,10,${footage.dim ?? 0.12})`}} />
			<AbsoluteFill
				style={{background: 'linear-gradient(0deg, rgba(5,6,10,0.55) 0%, rgba(5,6,10,0) 22%)'}}
			/>
			{showCredit ? <CreditTag text={footage.credit} /> : null}
			{footage.label ? <LabelTag text={footage.label} /> : null}
		</AbsoluteFill>
	);
};

/** Маленькая подпись источника. Для CC BY обязательна. */
export const CreditTag: React.FC<{text: string}> = ({text}) => (
	<div
		style={{
			position: 'absolute',
			right: 48,
			bottom: 36,
			fontFamily: fonts.body,
			fontSize: 18,
			letterSpacing: '0.04em',
			color: 'rgba(244,239,230,0.55)',
		}}
	>
		{text}
	</div>
);

/** Пометка «Реконструкция / Иллюстрация» для кадров, которые не являются реальной съёмкой. */
export const LabelTag: React.FC<{text: string}> = ({text}) => (
	<div
		style={{
			position: 'absolute',
			right: 48,
			top: 40,
			padding: '8px 16px',
			border: '1px solid rgba(244,239,230,0.35)',
			borderRadius: 6,
			fontFamily: fonts.body,
			fontWeight: 600,
			fontSize: 17,
			letterSpacing: '0.16em',
			textTransform: 'uppercase',
			color: 'rgba(244,239,230,0.75)',
			background: 'rgba(5,6,10,0.35)',
		}}
	>
		{text}
	</div>
);
