import {defineConfig} from 'vite';
import {version} from './package.json';

export default defineConfig({
    root: './demo',

    server: {
        port: 3005
    },

    define: {
        'VERSION': JSON.stringify(version)
    }
});
