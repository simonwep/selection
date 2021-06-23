import {svelte} from '@sveltejs/vite-plugin-svelte';
import {resolve} from 'path';
import {defineConfig} from 'vite';
import {version} from './package.json';

export default defineConfig({
    plugins: [svelte()],

    resolve: {
        alias: {
            '@vanilla': resolve(__dirname, '../vanilla/src')
        }
    },

    server: {
        port: 3009
    },

    define: {
        'VERSION': JSON.stringify(version)
    }
});
