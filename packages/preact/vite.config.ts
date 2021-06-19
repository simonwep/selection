import preact from '@preact/preset-vite';
import {resolve} from 'path';
import {defineConfig} from 'vite';
import {version} from './package.json';

export default defineConfig({
    plugins: [preact()],

    resolve: {
        alias: {
            '@vanilla': resolve(__dirname, '../vanilla/src'),
            '@react': resolve(__dirname, '../react/src'),
            'react': 'preact',
            'react-dom': 'preact/compat'
        }
    },

    server: {
        port: 3007
    },

    define: {
        'VERSION': JSON.stringify(version)
    }
});
