import vue from '@vitejs/plugin-vue';
import {resolve} from 'path';
import {defineConfig} from 'vite';
import {version} from './package.json';

export default defineConfig({
    plugins: [vue()],

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
});
