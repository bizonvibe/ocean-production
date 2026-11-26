import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop, Counter, Overline, RevealText, SceneFade, clamp} from '../components/ui';
import {colors, easeOutExpo, fonts} from '../theme';
import {FootageLayer} from './Footage';
import type {
	BarsSceneSpec,
	EndCardSceneSpec,
	FootageSceneSpec,
	FootageSource,
	StatSceneSpec,
	StatsSceneSpec,
	TitleSceneSpec,
} from './types';

const accentText: React.CSSProperties = {
	background: `linear-gradient(180deg, #fbe3a6 0%, ${colors.accent} 45%, ${colors.hot} 100%)`,
	WebkitBackgroundClip: 'text',
	color: 'transparent',
};

const Background: React.FC<{footage?: FootageSource}> = ({footage}) =>
	footage ? <FootageLayer footage={footage} /> : <Backdrop />;

// ─── Титульная сцена ───────────────────────────────────────────────
export const TitleScene: React.FC<{spec: TitleSceneSpec}> = ({spec}) => (
	<SceneFade inFrames={16}>
		<Background footage={spec.background} />
		<AbsoluteFill style={{justifyContent: 'center', padding: '0 160px'}}>
			{spec.overline ? <Overline start={10}>{spec.overline}</Overline> : null}
			<div style={{marginTop: 32}}>
				{spec.lines.map((line, i) => (
					<RevealText
						key={i}
						text={line.text}
						start={(spec.durationInFrames <= 150 ? 6 : 24) + i * (spec.durationInFrames <= 150 ? 10 : 16)}
						end={spec.durationInFrames - 26}
						style={{
							fontFamily: fonts.display,
							fontWeight: line.weight ?? (i === 0 ? 300 : 700),
							fontSize: 88,
							lineHeight: 1.12,
							color: colors.text,
						}}
						wordStyle={() => (line.accent ? accentText : {})}
					/>
				))}
			</div>
			{spec.subtitle ? (
				<RevealText
					text={spec.subtitle}
					start={spec.durationInFrames <= 150 ? 6 + spec.lines.length * 10 + 8 : 24 + spec.lines.length * 16 + 20}
					end={spec.durationInFrames - 26}
					stagger={3}
					style={{marginTop: 36, fontFamily: fonts.body, fontSize: 34, color: colors.muted}}
				/>
			) : null}
		</AbsoluteFill>
	</SceneFade>
);

// ─── Футаж с нижней подписью ───────────────────────────────────────
export const FootageScene: React.FC<{spec: FootageSceneSpec}> = ({spec}) => (
	<SceneFade>
		<FootageLayer footage={spec.footage} />
		<AbsoluteFill style={{justifyContent: 'flex-end', padding: '0 120px 110px'}}>
			{spec.overline ? <Overline start={14}>{spec.overline}</Overline> : null}
			{spec.caption ? (
				<RevealText
					text={spec.caption}
					start={22}
					end={spec.durationInFrames - 22}
					stagger={3}
					style={{
						marginTop: 18,
						maxWidth: 1300,
						fontFamily: fonts.display,
						fontWeight: 500,
						fontSize: 50,
						lineHeight: 1.18,
						color: colors.text,
						textShadow: '0 2px 30px rgba(0,0,0,0.6)',
					}}
				/>
			) : null}
		</AbsoluteFill>
	</SceneFade>
);

// ─── Карточки с цифрами ────────────────────────────────────────────
/** Кадр появления i-й цифры внутри сцены (используется и для звуков «удара»). */
export const statRevealFrame = (spec: StatsSceneSpec, i: number) => {
	const first = 45;
	const gap = Math.min(110, Math.floor((spec.durationInFrames - first - 90) / Math.max(1, spec.stats.length - 1)));
	return first + i * gap;
};

export const StatsScene: React.FC<{spec: StatsSceneSpec}> = ({spec}) => {
	const frame = useCurrentFrame();
	return (
		<SceneFade>
			<Background footage={spec.background ? {dim: 0.6, ...spec.background} : undefined} />
			<AbsoluteFill
				style={{background: 'linear-gradient(90deg, rgba(5,6,10,0.92) 0%, rgba(5,6,10,0.6) 50%, rgba(5,6,10,0) 75%)'}}
			/>
			<AbsoluteFill style={{padding: '110px 120px', gap: 44}}>
				<div>
					{spec.overline ? (
						<Overline start={6} color={colors.hot}>
							{spec.overline}
						</Overline>
					) : null}
					<RevealText
						text={spec.title}
						start={14}
						stagger={3}
						style={{fontFamily: fonts.display, fontWeight: 500, fontSize: 46, lineHeight: 1.15, color: colors.text, marginTop: 20, width: 950}}
					/>
				</div>
				{spec.stats.map((s, i) => {
					const start = statRevealFrame(spec, i);
					const next = i < spec.stats.length - 1 ? statRevealFrame(spec, i + 1) : undefined;
					const p = easeOutExpo(interpolate(frame, [start, start + 30], [0, 1], clamp));
					const dim = next === undefined ? 1 : interpolate(frame, [next, next + 20], [1, 0.4], clamp);
					return (
						<div
							key={i}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 36,
								opacity: p * dim,
								transform: `translateX(${(1 - p) * -60}px)`,
								filter: `blur(${(1 - p) * 10}px)`,
							}}
						>
							<div style={{minWidth: 360, whiteSpace: 'nowrap', fontFamily: fonts.display, fontWeight: 700, fontSize: 96, lineHeight: 1, ...accentText}}>
								<Counter to={s.value} start={start} duration={50} decimals={s.decimals} prefix={s.prefix} suffix={s.suffix} />
							</div>
							<div
								style={{
									width: 460,
									fontFamily: fonts.body,
									fontSize: 28,
									lineHeight: 1.35,
									color: colors.text,
									borderLeft: `2px solid ${colors.line}`,
									paddingLeft: 28,
								}}
							>
								{s.caption}
							</div>
						</div>
					);
				})}
			</AbsoluteFill>
		</SceneFade>
	);
};

// ─── Одна цифра на план ────────────────────────────────────────────
export const STAT_REVEAL_FRAME = 8;

export const StatScene: React.FC<{spec: StatSceneSpec}> = ({spec}) => {
	const frame = useCurrentFrame();
	const center = spec.align === 'center';
	const p = easeOutExpo(interpolate(frame, [STAT_REVEAL_FRAME, STAT_REVEAL_FRAME + 26], [0, 1], clamp));
	const s = spec.stat;
	return (
		<SceneFade>
			<Background footage={spec.background ? {dim: 0.5, ...spec.background} : undefined} />
			<AbsoluteFill
				style={{
					background: center
						? 'radial-gradient(ellipse at center, rgba(5,6,10,0.75) 0%, rgba(5,6,10,0.2) 70%)'
						: 'linear-gradient(90deg, rgba(5,6,10,0.9) 0%, rgba(5,6,10,0.55) 45%, rgba(5,6,10,0) 75%)',
				}}
			/>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: center ? 'center' : 'flex-start',
					textAlign: center ? 'center' : 'left',
					padding: '0 120px',
				}}
			>
				{spec.overline ? (
					<Overline start={2} color={colors.hot} style={center ? {justifyContent: 'center'} : undefined}>
						{spec.overline}
					</Overline>
				) : null}
				<div
					style={{
						marginTop: 18,
						fontFamily: fonts.display,
						fontWeight: 700,
						fontSize: 190,
						lineHeight: 1,
						opacity: p,
						transform: `translateY(${(1 - p) * 30}px) scale(${1.3 - 0.3 * p})`, // «садится» из крупного
						filter: `blur(${(1 - p) * 12}px) drop-shadow(0 0 30px rgba(226,102,43,0.45))`,
						...accentText,
					}}
				>
					<Counter
						to={s.value}
						start={STAT_REVEAL_FRAME}
						duration={40}
						decimals={s.decimals}
						prefix={s.prefix}
						suffix={s.suffix}
					/>
				</div>
				<RevealText
					text={s.caption}
					start={STAT_REVEAL_FRAME + 14}
					stagger={2}
					style={{
						marginTop: 22,
						maxWidth: 900,
						justifyContent: center ? 'center' : 'flex-start',
						fontFamily: fonts.body,
						fontWeight: 600,
						fontSize: 36,
						lineHeight: 1.3,
						color: colors.text,
						textShadow: '0 2px 24px rgba(0,0,0,0.7)',
					}}
				/>
			</AbsoluteFill>
		</SceneFade>
	);
};

// ─── Сравнительные полосы ──────────────────────────────────────────
const toneGradient = (tone: BarsSceneSpec['rows'][number]['tone']) =>
	tone === 'hot'
		? `linear-gradient(90deg, #f7d27e, ${colors.accent} 45%, ${colors.hot})`
		: tone === 'cold'
			? `linear-gradient(90deg, #b9ddd0, ${colors.cool})`
			: `linear-gradient(90deg, #d9d4cc, ${colors.neutral})`;

export const BarsScene: React.FC<{spec: BarsSceneSpec}> = ({spec}) => {
	const frame = useCurrentFrame();
	// Короткий план (≤ 5 с) — ускоренные тайминги, чтобы всё успело появиться.
	const fast = spec.durationInFrames <= 150;
	const rowStart = (i: number) => (fast ? 10 + i * 8 : 60 + i * 22);
	const grow = fast ? 30 : 50;
	const hiAt = rowStart(spec.rows.length - 1) + grow;
	const highlight = interpolate(frame, [hiAt, hiAt + 25], [0, 1], clamp);
	return (
		<SceneFade>
			<Background footage={spec.background ? {dim: 0.75, ...spec.background} : undefined} />
			<AbsoluteFill style={{padding: '90px 120px'}}>
				{spec.overline ? <Overline start={fast ? 0 : 4}>{spec.overline}</Overline> : null}
				<RevealText
					text={spec.title}
					start={fast ? 2 : 10}
					stagger={3}
					style={{fontFamily: fonts.display, fontWeight: 500, fontSize: 52, color: colors.text, marginTop: 22}}
				/>
			</AbsoluteFill>
			<div style={{position: 'absolute', top: 330, left: 120, right: 120, display: 'flex', flexDirection: 'column', gap: 34}}>
				{spec.rows.map((r, i) => {
					const start = rowStart(i);
					const p = easeOutExpo(interpolate(frame, [start, start + grow], [0, 1], clamp));
					return (
						<div
							key={r.label}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 30,
								opacity: interpolate(frame, [start, start + 10], [0, 1], clamp) * (r.highlight ? 1 : 1 - highlight * 0.5),
							}}
						>
							<div style={{width: 240, fontFamily: fonts.body, fontWeight: 600, fontSize: 30, color: colors.text}}>{r.label}</div>
							<div style={{flex: 1, height: 44, position: 'relative'}}>
								<div style={{position: 'absolute', inset: 0, borderRadius: 22, background: 'rgba(255,255,255,0.06)'}} />
								<div
									style={{
										position: 'absolute',
										left: 0,
										top: 0,
										bottom: 0,
										width: `${Math.min(1, r.value / spec.max) * 100 * p}%`,
										borderRadius: 22,
										background: toneGradient(r.tone),
										boxShadow: r.highlight ? `0 0 ${40 * highlight}px rgba(226,102,43,${0.9 * highlight})` : 'none',
									}}
								/>
							</div>
							<div style={{minWidth: 280, textAlign: 'right', whiteSpace: 'nowrap'}}>
								<span style={{fontFamily: fonts.display, fontWeight: 700, fontSize: 40, color: colors.text}}>
									<Counter to={r.value} start={start} duration={grow} decimals={r.decimals} suffix={spec.unit} />
								</span>
								{r.note ? <div style={{fontFamily: fonts.body, fontSize: 19, color: colors.muted}}>{r.note}</div> : null}
							</div>
						</div>
					);
				})}
			</div>
			{spec.footnote ? (
				<AbsoluteFill style={{justifyContent: 'flex-end', padding: '0 120px 80px'}}>
					<RevealText
						text={spec.footnote}
						start={fast ? hiAt - 10 : hiAt + 5}
						stagger={3}
						style={{fontFamily: fonts.body, fontWeight: 600, fontSize: 34, color: colors.accent}}
					/>
				</AbsoluteFill>
			) : null}
		</SceneFade>
	);
};

// ─── Финальная карточка ────────────────────────────────────────────
export const EndCardScene: React.FC<{spec: EndCardSceneSpec}> = ({spec}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const fadeOut = interpolate(frame, [durationInFrames - 24, durationInFrames - 1], [1, 0], clamp);
	return (
		<AbsoluteFill style={{opacity: fadeOut}}>
			<SceneFade outFrames={1}>
				<Background footage={spec.background ? {dim: 0.65, ...spec.background} : undefined} />
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
					{spec.overline ? (
						<Overline start={10} style={{justifyContent: 'center'}}>
							{spec.overline}
						</Overline>
					) : null}
					<RevealText
						text={spec.title}
						start={20}
						stagger={5}
						style={{justifyContent: 'center', marginTop: 30, fontFamily: fonts.display, fontWeight: 700, fontSize: 80, color: colors.text, maxWidth: 1600}}
					/>
					{spec.accent ? (
						<RevealText
							text={spec.accent}
							start={40}
							stagger={5}
							style={{justifyContent: 'center', fontFamily: fonts.display, fontWeight: 700, fontSize: 80}}
							wordStyle={() => accentText}
						/>
					) : null}
					{spec.cta ? (
						<RevealText
							text={spec.cta}
							start={80}
							style={{
								justifyContent: 'center',
								marginTop: 44,
								fontFamily: fonts.body,
								fontWeight: 600,
								fontSize: 28,
								letterSpacing: '0.3em',
								textTransform: 'uppercase',
								color: colors.muted,
							}}
						/>
					) : null}
				</AbsoluteFill>
			</SceneFade>
		</AbsoluteFill>
	);
};
