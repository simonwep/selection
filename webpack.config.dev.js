const {version} = require('./package');
const webpack = require('webpack');
const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/selection.js',

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'selection.min.js',
        library: 'Selection',
        libraryExport: 'default',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: 'this'
    },

    devServer: {
        watchContentBase: true,
        publicPath: '/dist/',
        host: '0.0.0.0',
        port: 3003
    },

    plugins: [
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(version)
        })
    ]
};
