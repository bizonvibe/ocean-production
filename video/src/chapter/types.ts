import type {SceneSpec} from '../templates/types';

/** Слово озвучки с таймингом — формат scripts/transcribe.py (Caption из @remotion/captions). */
export type Word = {text: string; startMs: number; endMs: number};

/**
 * Акцентное слово поверх кадра. Время задаётся либо словом из озвучки (`match`),
 * либо явно (`atMs` от начала озвучки). Акцентов в главе должно быть немного: 0–3.
 */
export type Accent = {
	/** Что показать в кадре. */
	text: string;
	/** Слово озвучки, на котором появиться (без учёта регистра и знаков препинания, можно начало слова). */
	match?: string;
	/** Какое по счёту вхождение `match` брать (с 1). */
	occurrence?: number;
	/** Явное время от начала озвучки, мс (если нет `match`). */
	atMs?: number;
	/** Сколько держать на экране, мс (по умолчанию 1800). */
	durationMs?: number;
	/** Где в кадре (по умолчанию center). */
	position?: 'center' | 'lower' | 'upper';
};

export type MusicSpec = {
	/** Путь внутри public/. */
	src: string;
	/** Базовая громкость под диктором, 0–1. По умолчанию 0.14 (≈ −17 дБ: заметно тише голоса). */
	volume?: number;
	/** Поднимать музыку в паузах диктора. */
	boostInPauses?: boolean;
	/** Громкость в паузе, 0–1. По умолчанию 0.3. */
	boostVolume?: number;
	/** Минимальная пауза для подъёма, мс. По умолчанию 5000. */
	minPauseMs?: number;
	/** С какой секунды трека начинать. */
	startFromSeconds?: number;
	/** Длина трека, с — если трек короче главы, повторы склеиваются плавным переходом. */
	durationSeconds?: number;
	/** Длина перехода между повторами, с (по умолчанию 4). */
	crossfadeSeconds?: number;
	/** Не повторять трек: играет один раз (для треков чуть короче главы). */
	once?: boolean;
};

export type SfxSpec = {
	src: string;
	/** Время от начала главы, мс. */
	atMs: number;
	/** С какой секунды файла играть (например, звук из стокового видео). */
	startFromSeconds?: number;
	/** Сколько играть, секунды (по умолчанию — до конца файла). */
	durationSeconds?: number;
	volume?: number;
};

/**
 * Глава = один ролик. Длину задаёт озвучка: leadIn + озвучка + tail.
 * Планы (shots) раскладываются подряд; последний растягивается до конца главы.
 * Тип плана 'footage' = сток (видео/картинка), всё остальное = анимация.
 * Доля стоков — около 20 % длительности (проверяется при регистрации, предупреждение в логе).
 */
export type ChapterConfig = {
	/** id композиции и имя файла: латиница, цифры, дефисы. Например 'ocean-ch01'. */
	id: string;
	voiceover: {
		/** Путь внутри public/, например 'projects/ocean/ch01/voice.wav'. */
		src: string;
		/** Длина озвучки, мс (пишет scripts/tts.py в voice.json). */
		durationMs: number;
		volume?: number;
		/**
		 * Драматические паузы: в момент atMs файла озвучки (между словами) вставить тишину padMs.
		 * Всё после паузы (голос, слова, акценты) сдвигается.
		 */
		gaps?: {atMs: number; padMs: number}[];
		/** Участки тишины в озвучке [начало, конец] мс (scripts/silences.py) — для проверки разрезов. */
		silences?: [number, number][];
	};
	/** Тайминги слов озвучки (voice.captions.json из scripts/transcribe.py). Нужны для акцентов и пауз. */
	words?: Word[];
	/** Тишина до начала озвучки и после неё, кадры. По умолчанию 15 и 45. */
	leadInFrames?: number;
	tailFrames?: number;
	shots: SceneSpec[];
	/** Наплыв между планами, кадры (0 — прямая склейка). По умолчанию 10. */
	crossfadeFrames?: number;
	/** Индивидуальные переходы: transitions[i] — кадры наплыва между планом i и i+1 (0 — склейка). */
	transitions?: (number | undefined)[];
	music?: MusicSpec;
	sfx?: SfxSpec[];
	accents?: Accent[];
	/** Затемнение в начале и в конце главы (для финальной склейки глав). По умолчанию true. */
	fadeEdges?: boolean;
};
