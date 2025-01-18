import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import banner from 'vite-plugin-banner';
import dts from 'vite-plugin-dts';
import {version} from './package.json';

const header = `/*! @viselect/react v${version} MIT | https://github.com/simonwep/viselect/tree/master/packages/react */`;

export default defineConfig(env => ({
    root: env.mode === 'production' ? '.' : './demo',

    plugins: [react(), banner(header), dts()],

    build: {
        sourcemap: true,
        minify: 'esbuild',
        lib: {
            entry: 'src/index.tsx',
            name: 'SelectionArea',
            fileName: 'viselect'
        },
        rollupOptions: {
            external: ['react', 'react-dom', '@viselect/vanilla'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    '@viselect/vanilla': 'SelectionArea'
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
