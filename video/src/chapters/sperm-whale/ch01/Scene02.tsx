import {SvgScene} from '../../../svg/SvgScene';
import {ease, mix, p, wave} from '../../../svg/motion';
import {DIR} from './paths';

/**
 * Сцена 02 — Кальмар размером с автобус (ТЗ: 14.0–28.0 с). Время — от начала сцены.
 * a.bus — слово «автобус» (въезд тормозит на нём), a.hooks — слово «крючьями» (раскрывается лупа).
 */
export const Scene02: React.FC<{a: {bus: number; hooks: number}}> = ({a}) => {
	const B = a.bus; // ТЗ: 16.8 − 14 = 2.8
	const H = a.hooks; // ТЗ: 19.5 − 14 = 5.5
	return (
		<SvgScene
			dir={`${DIR}/scene-02_squid-vs-bus`}
			layers={['00_background', '10_ruler', '20_bus', '30_squid', '40_sucker-inset', '90_labels']}
			camera={(t) => ({scale: mix(1, 1.04, p(t, H + 5, H + 8.5, ease.inOutSine))})}
			animate={(t) => {
				const squidIn = p(t, B, B + 0.8, ease.outCubic);
				const inset = p(t, H, H + 0.8, ease.spring(12));
				return {
					bg: {opacity: p(t, 0, 0.6)},
					title: {opacity: p(t, 0.3, 1, ease.outCubic), transform: `translateY(${mix(-30, 0, p(t, 0.3, 1, ease.outCubic))}px)`},
					bus: {transform: `translateX(${mix(1300, 0, p(t, B - 1.6, B, ease.outBack(1.1)))}px)`},
					'label-bus': {opacity: p(t, B - 0.2, B + 0.2), transform: `translateY(${mix(10, 0, p(t, B - 0.2, B + 0.2))}px)`},
					squid: {opacity: squidIn, transform: `translateY(${mix(200, 0, squidIn)}px)`},
					'squid-tentacles': {transform: `scaleX(${mix(0.35, 1, p(t, B + 0.4, B + 1.8, ease.outExpo))})`, origin: [660, 735]},
					'squid-arms': {transform: `skewY(${p(t, H + 1.5, H + 2) * wave(t, 1.6, 3)}deg)`, origin: [660, 735]},
					'label-squid': {opacity: p(t, B + 1.2, B + 1.6)},
					ruler: {transform: `scaleX(${p(t, B + 1.6, B + 2.6, ease.outCubic)})`, origin: [360, 870]},
					'inset-line': {transform: `scaleX(${p(t, H, H + 0.5, ease.outCubic)})`, origin: [1545, 735]},
					'inset-sucker': {
						transform: `scale(${inset}) rotate(${mix(0, 20, p(t, H + 0.8, H + 4.5))}deg)`,
						origin: [1740, 735],
					},
					'label-inset': {opacity: p(t, H + 0.8, H + 1.1)},
					'label-note': {opacity: p(t, H + 2.5, H + 3.1)},
				};
			}}
		/>
	);
};
