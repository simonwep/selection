import {terser} from 'rollup-plugin-terser';
import ts from 'rollup-plugin-ts';
import replace from '@rollup/plugin-replace';
import vue from 'rollup-plugin-vue';
import {main, module, version} from './package.json';

const banner = `/*! @viselect/vue ${version} MIT | https://github.com/Simonwep/selection */`;

const externals = {
    'vue': 'vue'
}

export default {
    input: 'src/SelectionArea.vue',
    external: Object.keys(externals),
    plugins: [
        replace({
            preventAssignment: true,
            VERSION: JSON.stringify(version)
        }),
        vue(),
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
            file: main,
            name: 'SelectionArea',
            format: 'umd',
            sourcemap: true,
            globals: externals,
            exports: 'named'
        },
        {
            banner,
            file: module,
            format: 'es',
            sourcemap: true,
            globals: externals,
            exports: 'named'
        }
    ]
};
