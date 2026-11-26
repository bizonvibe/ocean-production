/**
 * Описание ролика данными. Новый ролик = новый конфиг (см. src/videos/_template/video.config.ts).
 * Все длительности — в кадрах при 30 fps (1 с = 30 кадров).
 */

export type FootageSource = {
	/** Путь внутри public/ (например 'footage/pexels-lion-savanna.mp4') или https-ссылка. */
	src: string;
	kind: 'video' | 'image';
	/** Подпись источника в кадре, например 'Ivan Petrov / Pexels' или 'USFWS'. Обязательна для CC BY. */
	credit: string;
	/** С какой секунды исходника начинать (для видео). */
	startFromSeconds?: number;
	/** Наезд камеры (Ken Burns): масштаб в начале и в конце сцены. */
	zoom?: [number, number];
	/** Сдвиг по X в пикселях за сцену — лёгкая панорама. */
	panX?: number;
	/** Затемнение футажа (0–1), чтобы текст читался. */
	dim?: number;
	/** cover — заполнить кадр (по умолчанию), contain — целиком на чёрном (например, глобус). */
	fit?: 'cover' | 'contain';
	/** Скорость воспроизведения видео (например 0.8, если клип короче плана). */
	playbackRate?: number;
	/** Пометка в правом верхнем углу, например 'Художественная реконструкция' — обязательна для анимаций/гипотез. */
	label?: string;
};

export type TitleSceneSpec = {
	type: 'title';
	durationInFrames: number;
	overline?: string;
	/** Строки заголовка. accent: true — слово/строка подсвечивается градиентом. */
	lines: {text: string; accent?: boolean; weight?: 300 | 500 | 700}[];
	subtitle?: string;
	background?: FootageSource;
};

export type FootageSceneSpec = {
	type: 'footage';
	durationInFrames: number;
	footage: FootageSource;
	overline?: string;
	/** Подпись-«нижняя треть» (lower third). */
	caption?: string;
};

export type StatSpec = {
	value: number;
	decimals?: number;
	prefix?: string;
	suffix?: string;
	caption: string;
};

export type StatsSceneSpec = {
	type: 'stats';
	durationInFrames: number;
	overline?: string;
	title: string;
	/** 1–4 цифры. Появляются по очереди, на каждую — удар в звуке. */
	stats: StatSpec[];
	background?: FootageSource;
};

/** Одна крупная цифра на весь план — для монтажа по 4 с (каждая цифра на своём фоне). */
export type StatSceneSpec = {
	type: 'stat';
	durationInFrames: number;
	overline?: string;
	stat: StatSpec;
	background?: FootageSource;
	/** left — цифра слева (по умолчанию), center — по центру. */
	align?: 'left' | 'center';
};

export type BarRow = {
	label: string;
	value: number;
	/** Знаков после запятой (например 11,2). */
	decimals?: number;
	note?: string;
	/** 'hot' | 'cold' | 'neutral' — цвет полосы. */
	tone?: 'hot' | 'cold' | 'neutral';
	highlight?: boolean;
};

export type BarsSceneSpec = {
	type: 'bars';
	durationInFrames: number;
	overline?: string;
	title: string;
	unit: string;
	/** Значение, которое соответствует полной длине полосы. */
	max: number;
	rows: BarRow[];
	footnote?: string;
	background?: FootageSource;
};

export type EndCardSceneSpec = {
	type: 'endCard';
	durationInFrames: number;
	overline?: string;
	title: string;
	accent?: string;
	cta?: string;
	background?: FootageSource;
};

/** Своя сцена (карта, силуэты, схема и т. п.), написанная вручную в папке ролика. */
export type CustomSceneSpec = {
	type: 'custom';
	durationInFrames: number;
	component: React.FC;
	/** Подпись источника внизу кадра, если анимация сделана по чужой картинке (иначе не нужна). */
	credit?: string;
};

export type SceneSpec =
	| TitleSceneSpec
	| FootageSceneSpec
	| StatsSceneSpec
	| StatSceneSpec
	| BarsSceneSpec
	| EndCardSceneSpec
	| CustomSceneSpec;

export type VideoConfig = {
	/** id композиции в Remotion и имя файла в out/. Только латиница и дефисы. */
	id: string;
	scenes: SceneSpec[];
	/** Фоновая музыка из public/ (громкость 0–1). */
	music?: {src: string; volume?: number};
	/** Озвучка (одна дорожка на весь ролик) из public/. */
	voiceover?: {src: string; volume?: number};
	/** Звуки на склейках и на появлении цифр. */
	sfx?: {whoosh?: string; hit?: string};
	/**
	 * Монтаж между планами: 'leak' — световая вспышка на каждой склейке (по умолчанию, для длинных сцен);
	 * 'crossfade' — плавный наплыв (для частой смены кадра по 4 с). Наплыв съедает crossfadeFrames
	 * у соседних сцен: длина ролика = сумма длительностей − (число склеек × crossfadeFrames).
	 */
	cut?: 'leak' | 'crossfade';
	crossfadeFrames?: number;
	/** Дополнительные «удары» на сильных долях музыки (кадры на общей шкале, из scripts/beats.py → hit_frames). */
	extraHits?: number[];
	/** Индексы сцен, на начале которых дополнительно играет вспышка + «вжух» (смена главы). */
	leakAt?: number[];
};
