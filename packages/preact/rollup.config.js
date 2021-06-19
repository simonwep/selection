import {terser} from 'rollup-plugin-terser';
import ts from 'rollup-plugin-ts';
import replace from '@rollup/plugin-replace';
import {main, module, version} from './package.json';
import alias from '@rollup/plugin-alias';

const banner = `/*! @viselect/preact ${version} MIT | https://github.com/Simonwep/selection */`;

const externals = {
    'preact': 'Preact',
    'preact/compat': 'preact/compat'
};

export default {
    input: 'src/index.tsx',
    external: Object.keys(externals),
    plugins: [
        alias({
            entries: [
                {find: 'react', replacement: 'preact/compat'}
            ]
        }),
        ts(),
        terser({
            mangle: {
                keep_classnames: true,
                properties: {
                    regex: /^_/
                }
            }
        }),
        replace({
            preventAssignment: true,
            VERSION: JSON.stringify(version)
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
