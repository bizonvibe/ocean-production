import {useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * Сцена из послойных SVG репозитория Ocean Animations.
 *
 * Слои (1920×1080, прозрачные) накладываются по порядку. Элементы с id анимируются по ТЗ:
 * функция `animate(t)` на каждом кадре возвращает стили для id — transform, opacity, filter,
 * точку трансформации `origin` в координатах холста (transform-box: view-box) и др.
 * Стили применяются напрямую к DOM-элементам SVG (без перерисовки React) — это быстро и детерминированно:
 * каждый кадр задаёт полный набор стилей, всё, что не задано, сбрасывается.
 */

export type ElStyle = {
	transform?: string;
	opacity?: number;
	filter?: string;
	/** Точка трансформации в координатах холста 1920×1080. */
	origin?: [number, number];
	/** CSS clip-path; для SVG-элементов рамка отсчёта — bbox элемента (revealX/revealY из motion.ts). */
	clipPath?: string;
	/** Доля прорисовки линий 0–1 (stroke draw-on): для всех path/line/polyline/circle/rect/ellipse внутри. */
	draw?: number;
	mixBlendMode?: React.CSSProperties['mixBlendMode'];
	/** Межбуквенный интервал для текста внутри (px). */
	letterSpacing?: number;
	/** Заменить текст первого <text> внутри (счётчики). */
	text?: string;
	/** Толщина линий внутри (для вспышек перегородок и т. п.). */
	strokeWidth?: number;
	/** Бегущий пунктир: шаблон и смещение (px), для потоков воды и звука. */
	dash?: {array: string; offset: number};
};

export type Camera = {
	/** Масштаб камеры (1 — весь кадр). */
	scale?: number;
	/** Точка холста, которая находится в центре кадра. По умолчанию (960, 540). */
	focus?: [number, number];
	/** Поворот, градусы. */
	rotate?: number;
	/** Если задано — масштаб вокруг этой неподвижной точки холста (вместо focus). */
	origin?: [number, number];
};

const textCache = new Map<string, string>();

const loadSvg = async (src: string) => {
	const cached = textCache.get(src);
	if (cached) return cached;
	const res = await fetch(staticFile(src));
	if (!res.ok) throw new Error(`SVG не найден: ${src}`);
	// Шрифт подписей ТЗ (Inter) заменяем на локальный Manrope с кириллицей — позиции сохраняются.
	const text = (await res.text()).replace(/font-family="[^"]*"/g, 'font-family="Manrope, sans-serif"');
	textCache.set(src, text);
	return text;
};

const DRAWABLE = 'path, line, polyline, polygon, circle, rect, ellipse';

export const SvgScene: React.FC<{
	/** Папка сцены внутри public/, например 'projects/sperm-whale/ch01/anim/scene-02_squid-vs-bus'. */
	dir: string;
	/** Имена файлов слоёв без .svg, по порядку снизу вверх. По умолчанию — все слои из ТЗ, передаются явно. */
	layers: string[];
	/** Стили элементов по id в момент t (секунды от начала сцены). */
	animate?: (t: number) => Record<string, ElStyle>;
	/** Камера в момент t. */
	camera?: (t: number) => Camera;
	/** Слои, на которые камера не действует (например, виньетка). */
	cameraExclude?: string[];
	/** Стили целых слоёв (по имени файла) в момент t — для параллакса. */
	layerStyle?: (t: number) => Record<string, ElStyle>;
	/** Дополнительные React-элементы поверх слоёв (внутри камеры). */
	children?: React.ReactNode;
}> = ({dir, layers, animate, camera, cameraExclude = [], layerStyle, children}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame / fps;
	const [texts, setTexts] = useState<string[] | null>(() => {
		const all = layers.map((l) => textCache.get(`${dir}/layers/${l}.svg`));
		return all.every(Boolean) ? (all as string[]) : null;
	});
	const [handle] = useState(() => (texts ? null : delayRender(`SVG ${dir}`)));
	const root = useRef<HTMLDivElement>(null);
	const touched = useRef(new Set<Element>());

	if (texts === null && handle !== null) {
		// Загружаем один раз; рендер ждёт через delayRender.
		Promise.all(layers.map((l) => loadSvg(`${dir}/layers/${l}.svg`)))
			.then((all) => {
				setTexts(all);
				continueRender(handle);
			})
			.catch((e) => cancelRender(e));
	}

	useLayoutEffect(() => {
		const el = root.current;
		if (!el || !texts) return;
		const styles = animate ? animate(t) : {};
		const seen = new Set<Element>();
		for (const [id, s] of Object.entries(styles)) {
			// Ключ — id элемента или CSS-селектор (если есть пробел, >, . или #), например '#marker-sub-250 > g'.
			const sel = /[\s>.#\[:]/.test(id) ? id : `#${CSS.escape(id)}`;
			const node = el.querySelector(sel) as SVGGraphicsElement | null;
			if (!node) {
				console.warn(`[${dir}] нет элемента #${id}`);
				continue;
			}
			apply(node, s);
			seen.add(node);
		}
		// Сбрасываем стили элементов, которые на этом кадре не анимируются (рендер идёт в произвольном порядке кадров).
		for (const node of touched.current) if (!seen.has(node)) reset(node as SVGGraphicsElement);
		touched.current = seen;
	});

	if (!texts) return null;
	const cam = camera ? camera(t) : {};
	const s = cam.scale ?? 1;
	const [fx, fy] = cam.focus ?? [960, 540];
	const camTransform = cam.origin
		? `scale(${s}) rotate(${cam.rotate ?? 0}deg)`
		: `translate(${960 - fx * s}px, ${540 - fy * s}px) scale(${s}) rotate(${cam.rotate ?? 0}deg)`;
	const camOrigin = cam.origin ? `${cam.origin[0]}px ${cam.origin[1]}px` : '0 0';
	const ls = layerStyle ? layerStyle(t) : {};

	const layerDiv = (name: string, i: number) => (
		<div
			key={name}
			style={{position: 'absolute', inset: 0, ...cssOf(ls[name])}}
			// eslint-disable-next-line react/no-danger
			dangerouslySetInnerHTML={{__html: texts[i]}}
		/>
	);

	return (
		<AbsoluteFill ref={root} style={{overflow: 'hidden', backgroundColor: '#000'}}>
			<AbsoluteFill style={{transformOrigin: camOrigin, transform: camTransform}}>
				{layers.map((l, i) => (cameraExclude.includes(l) ? null : layerDiv(l, i)))}
				{children}
			</AbsoluteFill>
			{layers.map((l, i) => (cameraExclude.includes(l) ? layerDiv(l, i) : null))}
		</AbsoluteFill>
	);
};

const cssOf = (s?: ElStyle): React.CSSProperties => {
	if (!s) return {};
	return {
		transform: s.transform,
		opacity: s.opacity,
		filter: s.filter,
		transformOrigin: s.origin ? `${s.origin[0]}px ${s.origin[1]}px` : undefined,
		clipPath: s.clipPath,
		mixBlendMode: s.mixBlendMode,
	};
};

function apply(node: SVGGraphicsElement, s: ElStyle) {
	const st = node.style;
	st.transformBox = 'view-box';
	st.transform = s.transform ?? '';
	st.transformOrigin = s.origin ? `${s.origin[0]}px ${s.origin[1]}px` : '';
	st.opacity = s.opacity === undefined ? '' : String(Math.max(0, Math.min(1, s.opacity)));
	st.filter = s.filter ?? '';
	st.clipPath = s.clipPath ?? '';
	st.mixBlendMode = s.mixBlendMode ?? '';
	st.letterSpacing = s.letterSpacing === undefined ? '' : `${s.letterSpacing}px`;
	if (s.text !== undefined) {
		const tx = node.tagName === 'text' ? node : node.querySelector('text');
		if (tx) {
			if (!tx.hasAttribute('data-orig')) tx.setAttribute('data-orig', tx.textContent ?? '');
			tx.textContent = s.text;
		}
	} else restoreText(node);
	st.strokeWidth = s.strokeWidth === undefined ? '' : String(s.strokeWidth);
	if (s.dash) {
		st.strokeDasharray = s.dash.array;
		st.strokeDashoffset = String(s.dash.offset);
	} else if (s.draw === undefined) {
		st.strokeDasharray = '';
		st.strokeDashoffset = '';
	}
	if (s.draw !== undefined) {
		const own = node.matches(DRAWABLE) ? [node] : [];
		for (const p of [...own, ...Array.from(node.querySelectorAll(DRAWABLE))] as SVGGeometryElement[]) {
			p.setAttribute('pathLength', '1');
			p.style.strokeDasharray = '1 1';
			p.style.strokeDashoffset = String(1 - Math.max(0, Math.min(1, s.draw)));
		}
	} else {
		clearDraw(node);
	}
}

function restoreText(node: Element) {
	const tx = node.tagName === 'text' ? node : node.querySelector('text');
	if (tx && tx.hasAttribute('data-orig')) tx.textContent = tx.getAttribute('data-orig');
}

function clearDraw(node: Element) {
	const own = node.hasAttribute('pathLength') ? [node] : [];
	for (const p of [...own, ...Array.from(node.querySelectorAll('[pathLength]'))] as SVGGeometryElement[]) {
		p.removeAttribute('pathLength');
		p.style.strokeDasharray = '';
		p.style.strokeDashoffset = '';
	}
}

function reset(node: SVGGraphicsElement) {
	const st = node.style;
	st.transform = '';
	st.transformOrigin = '';
	st.opacity = '';
	st.filter = '';
	st.clipPath = '';
	st.mixBlendMode = '';
	st.letterSpacing = '';
	st.strokeWidth = '';
	st.strokeDasharray = '';
	st.strokeDashoffset = '';
	restoreText(node);
	clearDraw(node);
}
