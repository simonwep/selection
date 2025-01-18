import vue from '@vitejs/plugin-vue';
import {resolve} from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import banner from 'vite-plugin-banner';
import {version} from './package.json';

const header = `/*! @viselect/vue v${version} MIT | https://github.com/simonwep/viselect/tree/master/packages/vue */`;

export default defineConfig(env => ({
    root: env.mode === 'production' ? '.' : './demo',

    plugins: [vue(), banner(header), dts()],

    build: {
        sourcemap: true,
        minify: 'esbuild',
        lib: {
            entry: 'src/index.ts',
            name: 'SelectionArea',
            fileName: 'viselect'
        },
        rollupOptions: {
            external: ['vue', '@viselect/vanilla'],
            output: {
                globals: {
                    vue: 'Vue',
                    '@viselect/vanilla': 'SelectionArea'
                },
            },
        },
    },

    resolve: {
        alias: {
            '@vanilla': resolve(__dirname, '../vanilla/src')
        }
    },

    server: {
        port: 3008
    },

    define: {
        'VERSION': JSON.stringify(version)
    }
}));
