import reactRefresh from '@vitejs/plugin-react-refresh';
import {resolve} from 'path';
import {defineConfig} from 'vite';
import {version} from './package.json';

export default defineConfig({
    root: './demo',

    plugins: [reactRefresh()],

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
