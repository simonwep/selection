const {version} = require('./package');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: './src/selection.js',

    output: {
        path: `${__dirname}/dist`,
        publicPath: 'dist/',
        filename: 'selection.min.js',
        library: 'Selection',
        libraryExport: 'default',
        libraryTarget: 'umd'
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: [
                    'babel-loader',
                    'eslint-loader'
                ]
            }
        ]
    },

    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: 'selection.min.js.map'
        }),

        new webpack.BannerPlugin({
            banner: `Selectionjs ${version} MIT | https://github.com/Simonwep/selection`
        })
    ]
};
