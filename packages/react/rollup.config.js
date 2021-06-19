import {terser} from 'rollup-plugin-terser';
import ts from 'rollup-plugin-ts';
import replace from '@rollup/plugin-replace';
import {main, module, version} from './package.json';

const banner = `/*! @viselect/react ${version} MIT | https://github.com/Simonwep/selection */`;

const externals = {
    'react': 'React',
    'react-dom': 'ReactDOM'
};

export default {
    input: 'src/index.tsx',
    external: Object.keys(externals),
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
