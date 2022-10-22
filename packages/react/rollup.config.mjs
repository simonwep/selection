import {terser} from 'rollup-plugin-minification';
import ts from 'rollup-plugin-ts';
import replace from '@rollup/plugin-replace';
import {readFileSync} from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const banner = `/*! @viselect/react ${pkg.version} MIT | https://github.com/Simonwep/selection */`;

const externals = {
    'react': 'React',
    'react-dom': 'ReactDOM'
};

export default {
    input: 'src/index.tsx',
    external: Object.keys(externals),
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
