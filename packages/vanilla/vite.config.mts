import {defineConfig} from 'vite';
import {version} from './package.json';
import banner from 'vite-plugin-banner';
import dts from 'vite-plugin-dts';

const header = `/*! @viselect/vanilla v${version} MIT | https://github.com/Simonwep/selection/tree/master/packages/vanilla */`;

export default defineConfig((env) => ({
    root: env.mode === 'production' ? '.' : './demo',

    plugins: [
        banner(header),
        dts()
    ],

    build: {
        sourcemap: true,
        minify: 'esbuild',
        lib: {
            entry: 'src/index.ts',
            name: 'SelectionArea',
            fileName: 'viselect'
        }
    },

    server: {
        port: 3005
    },

    define: {
        'VERSION': JSON.stringify(version)
    },

    test: {
        reporters: ['html'],
        browser: {
            enabled: true,
            name: 'chromium',
            provider: 'playwright',
        },
    },
}));
