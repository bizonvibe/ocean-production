import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
// WebGL нужен для Three.js и эффектов (@remotion/effects).
// "angle" использует GPU, если он есть, иначе программный рендер.
Config.setChromiumOpenGlRenderer('angle');
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');

// В облачной среде используем уже установленный headless Chromium,
// чтобы Remotion не скачивал свой. Локально переменная не нужна.
if (process.env.REMOTION_BROWSER) {
	Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
