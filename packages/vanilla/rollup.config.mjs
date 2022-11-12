import terser from '@rollup/plugin-terser';
import ts from 'rollup-plugin-ts';
import replace from '@rollup/plugin-replace';
import {readFileSync} from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const banner = `/*! @viselect/vanilla ${pkg.version} MIT | https://github.com/Simonwep/selection */`;

export default {
    input: 'src/index.ts',
    plugins: [
        replace({
            preventAssignment: true,
            VERSION: JSON.stringify(pkg.version)
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
