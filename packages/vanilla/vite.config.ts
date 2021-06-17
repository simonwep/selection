import {resolve} from 'path';
import {defineConfig} from 'vite';
import {version} from './package.json';

export default defineConfig({
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@utils': resolve('./src/utils')
        }
    },

    server: {
        port: 3005
    },

    define: {
        'VERSION': JSON.stringify(version)
    }
});
