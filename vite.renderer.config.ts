import type {ConfigEnv, UserConfig} from 'vite';
import {defineConfig} from 'vite';
import {pluginExposeRenderer} from './vite.base.config';

// https://vitejs.dev/config
export default defineConfig(async env => {
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const {root, mode, forgeConfigSelf} = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  // cant load the plugin directly because it uses cjs and electron forge
  // will fail because it now uses esm. So we need to load it dynamically.
  const preact = await import('@preact/preset-vite').then(mod => mod.default);

  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [pluginExposeRenderer(name), preact()],
    resolve: {
      preserveSymlinks: true,
    },
    clearScreen: false,
  } as UserConfig;
});
