import {terser} from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import preprocess from 'svelte-preprocess';
import {main, module, version} from './package.json';
import alias from '@rollup/plugin-alias';

const banner = `/*! @viselect/svelte ${version} MIT | https://github.com/Simonwep/selection */`;

const externals = {
    'svelte': 'svelte',
    'svelte/internal': 'svelte'
};

export default {
    input: 'src/index.ts',
    external: Object.keys(externals),
    plugins: [
        typescript({
            tsconfig: './tsconfig.json'
        }),
        svelte({
            preprocess: preprocess()
        }),
        replace({
            preventAssignment: true,
            VERSION: JSON.stringify(version)
        }),
        terser({
            mangle: {
                keep_classnames: true,
                properties: {
                    regex: /^_/
                }
            }
        })
    ],
    output: [
        {
            banner,
            file: main,
            name: 'SelectionArea',
            format: 'umd',
            sourcemap: true,
            globals: externals
        },
        {
            banner,
            file: module,
            format: 'es',
            sourcemap: true,
            globals: externals
        }
    ]
};
