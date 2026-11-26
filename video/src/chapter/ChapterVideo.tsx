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
import {accentTimeMs, chapterDuration, fittedShotDurations, leadIn, msToFrames, musicVolume, xfade} from './timing';
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
					<Custom />
					{spec.credit ? <CreditTag text={spec.credit} /> : null}
				</AbsoluteFill>
			);
		}
	}
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
	const x = xfade(config);
	const offset = leadIn(config);

	return (
		<AbsoluteFill style={{backgroundColor: colors.bg}}>
			<SceneFadeDisabled.Provider value={x > 0}>
				<TransitionSeries>
					{config.shots.map((spec, i) => (
						<Fragment key={i}>
							<TransitionSeries.Sequence durationInFrames={durations[i]}>
								<Shot spec={{...spec, durationInFrames: durations[i]}} />
							</TransitionSeries.Sequence>
							{i < config.shots.length - 1 && x > 0 ? (
								<TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: x})} />
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
						from={offset + msToFrames(ms) - 4}
						durationInFrames={msToFrames(a.durationMs ?? 1800)}
					>
						<AccentWord text={a.text} position={a.position} />
					</Sequence>
				);
			})}

			{config.fadeEdges === false ? null : <EdgeFade total={total} />}

			<Sequence from={offset}>
				<Audio src={staticFile(config.voiceover.src)} volume={config.voiceover.volume ?? 1} />
			</Sequence>
			{config.music ? (
				<Audio
					src={staticFile(config.music.src)}
					volume={musicVolume(config, config.music)}
					trimBefore={Math.round((config.music.startFromSeconds ?? 0) * 30)}
					loop
				/>
			) : null}
			{(config.sfx ?? []).map((s, k) => (
				<Sequence key={`sfx${k}`} from={offset + msToFrames(s.atMs)}>
					<Audio src={staticFile(s.src)} volume={s.volume ?? 0.5} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
