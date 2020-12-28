import {terser} from 'rollup-plugin-terser';
import ts from '@wessberg/rollup-plugin-ts';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

const banner = `/* Selectionjs ${pkg.version} MIT | https://github.com/Simonwep/selection */`;

export default {
    input: 'src/index.ts',
    plugins: [
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
            VERSION: JSON.stringify(pkg.version)
        })
    ],
    output: [
        {
            banner,
            file: pkg.main,
            name: 'Selection',
            format: 'umd',
            sourcemap: true
        },
        {
            banner,
            file: pkg.module,
            format: 'es',
            sourcemap: true
        }
    ]
};
