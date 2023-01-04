import preact from '@preact/preset-vite';
import {defineConfig} from 'vite';
import banner from 'vite-plugin-banner';
import dts from 'vite-plugin-dts';
import {version} from './package.json';

const header = `/*! @viselect/preact v${version} MIT | https://github.com/Simonwep/selection/tree/master/packages/preact */`;

export default defineConfig(env => ({
    root: env.mode === 'production' ? '.' : './demo',

    plugins: [preact(), banner(header), dts()],

    resolve: {
        alias: {
            'react': 'preact/compat'
        }
    },

    build: {
        sourcemap: true,
        minify: 'esbuild',
        lib: {
            entry: 'src/index.tsx',
            name: 'SelectionArea',
            fileName: 'viselect',
        },
        rollupOptions: {
            external: ['preact', '@viselect/react'],
            output: {
                globals: {
                    preact: 'Preact',
                    '@viselect/react': 'SelectionArea'
                },
            },
        },
    },

    server: {
        port: 3006
    },

    define: {
        'VERSION': JSON.stringify(version)
    }
}));
