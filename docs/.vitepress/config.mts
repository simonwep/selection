import {defineConfig} from 'vitepress';
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export default defineConfig({
    title: 'Viselect',
    base: '/viselect/',
    description: 'Viselect - A high performance and lightweight library to add a visual way of selecting elements, just like on your Desktop. Zero dependencies, super small.',
    head: [
        ['link', {rel: 'icon', href: 'favicon.png'}]
    ],
    themeConfig: {
        nav: [
            {text: 'Home', link: '/'},
            {text: 'FAQ', link: '/pages/faq'},
            {text: 'API Reference', link: 'pages/api-reference'},
        ],
        sidebar: [
            {
                text: 'Introduction',
                items: [
                    {text: 'Quickstart', link: 'pages/quickstart'},
                    {text: 'API Reference', link: 'pages/api-reference'},
                    {text: 'Custom Integration', link: 'pages/custom-integration'},
                    {text: 'FAQ', link: 'pages/faq'},
                ]
            },
            {
                text: 'Frameworks',
                items: [
                    {text: 'Vanilla', link: 'pages/frameworks/vanilla'},
                    {text: 'React', link: 'pages/frameworks/react'},
                    {text: 'Preact', link: 'pages/frameworks/preact'},
                    {text: 'Vue', link: 'pages/frameworks/vue'}
                ]
            }
        ],
        socialLinks: [
            {icon: 'github', link: 'https://github.com/simonwep/viselect'}
        ],
        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2018-present Simon Reinisch'
        }
    },
    vite: {
        resolve: {
            alias: {
                '@viselect/vanilla': require.resolve('../../packages/vanilla/dist/viselect.mjs')
            }
        }
    }
});
