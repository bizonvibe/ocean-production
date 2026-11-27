import {fade} from '@remotion/transitions/fade';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {Fragment} from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp, Grain, SceneFadeDisabled, Vignette} from '../components/ui';
import {CreditTag} from '../templates/Footage';
import {BarsScene, EndCardScene, FootageScene, StatScene, StatsScene, TitleScene} from '../templates/scenes';
import type {SceneSpec} from '../templates/types';
import {colors} from '../theme';
import {AccentWord} from './AccentWord';
import {
	accentTimeMs,
	chapterDuration,
	fittedShotDurations,
	leadIn,
	msToFrames,
	musicVolume,
	transitionAt,
	voicePieces,
	voiceToChapterMs,
} from './timing';
import type {ChapterConfig} from './types';

const Shot: React.FC<{spec: SceneSpec}> = ({spec}) => {
	switch (spec.type) {
		case 'footage':
			return <FootageScene spec={spec} />;
		case 'title':
			return <TitleScene spec={spec} />;
		case 'stats':
			return <StatsScene spec={spec} />;
		case 'stat':
			return <StatScene spec={spec} />;
		case 'bars':
			return <BarsScene spec={spec} />;
		case 'endCard':
			return <EndCardScene spec={spec} />;
		case 'custom': {
			const Custom = spec.component;
			return (
				<AbsoluteFill>
					<LivingCamera>
						<Custom />
					</LivingCamera>
					{spec.credit ? <CreditTag text={spec.credit} /> : null}
				</AbsoluteFill>
			);
		}
	}
};

/**
 * «Живая камера» для анимаций: медленный постоянный наезд (~0,6 % в секунду, не больше 12 %) и лёгкий дрейф,
 * чтобы инфографика не застывала, пока диктор договаривает (собственные движения камеры сцен — поверх).
 */
const LivingCamera: React.FC<{children: React.ReactNode}> = ({children}) => {
	const frame = useCurrentFrame();
	const sec = frame / 30;
	const scale = 1 + Math.min(0.12, 0.006 * sec);
	const dx = Math.sin(sec / 7) * 14;
	const dy = Math.sin(sec / 9 + 1) * 8;
	return <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(${scale})`}}>{children}</AbsoluteFill>;
};

/**
 * Музыка главы. Если известна длина трека (durationSeconds) и он короче главы — повторы
 * накладываются с плавным переходом (crossfadeSeconds), без резкого обрыва; иначе обычный loop.
 */
const Music: React.FC<{config: ChapterConfig}> = ({config}) => {
	const m = config.music!;
	const vol = musicVolume(config, m);
	const start = Math.round((m.startFromSeconds ?? 0) * 30);
	if (!m.durationSeconds) {
		return <Audio src={staticFile(m.src)} volume={vol} trimBefore={start} loop />;
	}
	const total = chapterDuration(config);
	const len = Math.round(m.durationSeconds * 30) - start;
	const xf = Math.round((m.crossfadeSeconds ?? 4) * 30);
	const copies: number[] = [];
	for (let at = 0; at < total; at += len - xf) copies.push(at);
	return (
		<>
			{copies.map((at, i) => (
				<Sequence key={`m${i}`} from={at} durationInFrames={Math.min(len, total - at)}>
					<Audio
						src={staticFile(m.src)}
						trimBefore={start}
						volume={(f) => {
							const fin = i === 0 ? 1 : Math.min(1, f / xf);
							const fout = i === copies.length - 1 ? 1 : Math.min(1, (len - f) / xf);
							return vol(at + f) * Math.max(0, Math.min(fin, fout));
						}}
					/>
				</Sequence>
			))}
		</>
	);
};

/** Затемнение из чёрного в начале и в чёрное в конце главы. */
const EdgeFade: React.FC<{total: number}> = ({total}) => {
	const frame = useCurrentFrame();
	const o = Math.max(
		interpolate(frame, [0, 12], [1, 0], clamp),
		interpolate(frame, [total - 24, total], [0, 1], clamp),
	);
	return <AbsoluteFill style={{backgroundColor: '#000', opacity: o, pointerEvents: 'none'}} />;
};

/**
 * Ролик одной главы: планы с наплывами, зерно и виньетка, озвучка,
 * музыка тише диктора (с подъёмом в паузах), звуки и акцентные слова.
 */
export const ChapterVideo: React.FC<{config: ChapterConfig}> = ({config}) => {
	const total = chapterDuration(config);
	const durations = fittedShotDurations(config);
	const offset = leadIn(config);

	return (
		<AbsoluteFill style={{backgroundColor: colors.bg}}>
			<SceneFadeDisabled.Provider value>
				<TransitionSeries>
					{config.shots.map((spec, i) => (
						<Fragment key={i}>
							<TransitionSeries.Sequence durationInFrames={durations[i]}>
								<Shot spec={{...spec, durationInFrames: durations[i]}} />
							</TransitionSeries.Sequence>
							{i < config.shots.length - 1 && transitionAt(config, i) > 0 ? (
								<TransitionSeries.Transition
									presentation={fade()}
									timing={linearTiming({durationInFrames: transitionAt(config, i)})}
								/>
							) : null}
						</Fragment>
					))}
				</TransitionSeries>
			</SceneFadeDisabled.Provider>

			<Grain opacity={0.08} />
			<Vignette />

			{(config.accents ?? []).map((a, k) => {
				const ms = accentTimeMs(a, config.words);
				if (ms === null) {
					console.warn(`[${config.id}] акцент «${a.text}»: слово не найдено в озвучке`);
					return null;
				}
				return (
					<Sequence
						key={`accent${k}`}
						from={offset + msToFrames(voiceToChapterMs(config, ms)) - 4}
						durationInFrames={msToFrames(a.durationMs ?? 1800)}
					>
						<AccentWord text={a.text} position={a.position} />
					</Sequence>
				);
			})}

			{config.fadeEdges === false ? null : <EdgeFade total={total} />}

			{voicePieces(config).map(([a, b, at]) => (
				<Sequence key={`v${a}`} from={offset + msToFrames(at)} durationInFrames={Math.max(1, msToFrames(b - a))}>
					<Audio
						src={staticFile(config.voiceover.src)}
						trimBefore={msToFrames(a)}
						trimAfter={msToFrames(b)}
						// Микро-затухание на стыках кусков (1 кадр ≈ 33 мс) — без щелчков.
						volume={(f) => {
							const len = msToFrames(b - a);
							const edge = voicePieces(config).length > 1 ? Math.min(1, (f + 1) / 2, (len - f) / 2) : 1;
							return (config.voiceover.volume ?? 1) * Math.max(0, edge);
						}}
					/>
				</Sequence>
			))}
			{config.music ? <Music config={config} /> : null}
			{(config.sfx ?? []).map((s, k) => (
				<Sequence
					key={`sfx${k}`}
					from={msToFrames(s.atMs)}
					durationInFrames={s.durationSeconds ? Math.round(s.durationSeconds * 30) : undefined}
				>
					<Audio
						src={staticFile(s.src)}
						volume={s.volume ?? 0.5}
						trimBefore={s.startFromSeconds ? Math.round(s.startFromSeconds * 30) : undefined}
					/>
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
