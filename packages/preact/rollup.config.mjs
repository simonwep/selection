import {terser} from 'rollup-plugin-minification';
import ts from 'rollup-plugin-ts';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import {readFileSync} from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const banner = `/*! @viselect/preact ${pkg.version} MIT | https://github.com/Simonwep/selection */`;

const externals = {
    'preact': 'Preact',
    'preact/compat': 'preact/compat'
};

export default {
    input: 'src/index.tsx',
    external: Object.keys(externals),
    plugins: [
        replace({
            preventAssignment: true,
            VERSION: JSON.stringify(pkg.version)
        }),
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
        })
    ],
    output: [
        {
            banner,
            file: pkg.main,
            name: 'SelectionArea',
            format: 'umd',
            sourcemap: true,
            globals: externals,
            exports: 'named'
        },
        {
            banner,
            file: pkg.module,
            format: 'es',
            sourcemap: true,
            globals: externals,
            exports: 'named'
        }
    ]
};
