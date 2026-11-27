import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fonts} from '../theme';
import {CYAN, DEEP, Particles} from './ChannelIntro';

/**
 * Слайд перед главой (3 с) в стиле заставки KoKo Crabs: «ГЛАВА N», название, о чём глава.
 * 0–8 из чёрного · 6–20 текст собирается · 24–40 блик · 80–90 в чёрное.
 * Звук — scripts/card_sound.py → public/sfx/chapter-card.wav.
 */
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const p = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

export type CardProps = {n: number; title: string; subtitle: string};

export const CHAPTER_CARDS: CardProps[] = [
	{n: 1, title: 'Вторжение воздуха в вечный мрак', subtitle: 'Почему хищник, дышащий воздухом, правит бездной'},
	{n: 2, title: 'Рацион хищника против мирных гигантов', subtitle: 'Чем зубатый кит отличается от усатых великанов'},
	{n: 3, title: 'Чудо биоакустики и тайна огромного черепа', subtitle: 'Как голова-контейнер стала самым мощным сонаром планеты'},
	{n: 4, title: 'Инженерия бешеных глубин', subtitle: 'Как пережить давление в сотни атмосфер и не заболеть кессонной болезнью'},
	{n: 5, title: 'Титаны бездны', subtitle: 'Битвы с гигантскими кальмарами и секрет амбры'},
	{n: 6, title: 'Сверхмозг, кланы и морская морзянка', subtitle: 'Самый большой мозг на Земле, семьи и язык щелчков'},
	{n: 7, title: 'Застывшие монолиты и двигатель планеты', subtitle: 'Сон, оборона от косаток и роль кашалотов в жизни океана'},
];

export const ChapterCard: React.FC<CardProps> = ({n, title, subtitle}) => {
	const f = useCurrentFrame();
	const {fps, width, height} = useVideoConfig();
	const head = spring({frame: f - 4, fps, config: {damping: 18, stiffness: 140}});
	const ti = spring({frame: f - 9, fps, config: {damping: 16, stiffness: 120}});
	const sub = p(f, 18, 30);
	const sheen = interpolate(f, [24, 42], [-30, 130], clamp);
	const push = interpolate(f, [0, 90], [1, 1.04], clamp);
	const fade = Math.max(1 - p(f, 0, 8), p(f, 80, 90));
	return (
		<AbsoluteFill style={{backgroundColor: DEEP, overflow: 'hidden'}}>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #0f3a5a 0%, #061c30 42%, #020a14 82%)'}} />
			<Particles f={f} speed={0.5} seed={n * 17} count={55} />
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${push})`, padding: '0 160px'}}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 26,
						opacity: head,
						fontFamily: fonts.body,
						fontWeight: 700,
						fontSize: 34,
						letterSpacing: `${interpolate(head, [0, 1], [0.6, 0.4])}em`,
						color: CYAN,
						marginBottom: 34,
					}}
				>
					<span style={{width: 90 * head, height: 2, background: CYAN, display: 'inline-block'}} />
					ГЛАВА {n}
					<span style={{width: 90 * head, height: 2, background: CYAN, display: 'inline-block'}} />
				</div>
				<div
					style={{
						fontFamily: fonts.display,
						fontWeight: 700,
						fontSize: title.length > 30 ? 74 : 92,
						lineHeight: 1.15,
						textAlign: 'center',
						maxWidth: 1500,
						opacity: ti,
						transform: `translateY(${interpolate(ti, [0, 1], [30, 0])}px)`,
						filter: `blur(${(1 - ti) * 10}px) drop-shadow(0 0 24px rgba(127,233,255,0.3))`,
						backgroundImage: `linear-gradient(100deg, #eafaff 0%, #eafaff ${sheen - 12}%, #ffffff ${sheen}%, ${CYAN} ${sheen + 4}%, #eafaff ${sheen + 14}%, #eafaff 100%)`,
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
					}}
				>
					{title}
				</div>
				<div
					style={{
						marginTop: 34,
						fontFamily: fonts.body,
						fontWeight: 500,
						fontSize: 38,
						textAlign: 'center',
						maxWidth: 1400,
						color: 'rgba(205,240,255,0.85)',
						opacity: sub,
						transform: `translateY(${interpolate(sub, [0, 1], [14, 0])}px)`,
					}}
				>
					{subtitle}
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.75) 100%)'}} />
			<AbsoluteFill style={{backgroundColor: '#000', opacity: fade}} />
			<Audio src={staticFile('sfx/chapter-card.wav')} />
			{/* width/height используются частицами */}
			<div style={{display: 'none'}}>{width + height}</div>
		</AbsoluteFill>
	);
};
