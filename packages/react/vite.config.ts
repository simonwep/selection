import react from '@vitejs/plugin-react';
import {resolve} from 'path';
import {defineConfig} from 'vite';
import {version} from './package.json';

export default defineConfig({
    root: './demo',

    plugins: [react()],

    resolve: {
        alias: {
            '@vanilla': resolve(__dirname, '../vanilla/src')
        }
    },

    server: {
        port: 3006
    },

    define: {
        'VERSION': JSON.stringify(version)
    }
});
