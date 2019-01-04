const webpack = require('webpack');

module.exports = {

    entry: './src/selection.js',

    output: {
        path: __dirname + '/dist',
        publicPath: 'dist/',
        filename: 'selection.min.js',
        library: 'Selection',
        libraryExport: 'default',
        libraryTarget: 'umd'
    },

    devServer: {
        contentBase: __dirname + '/',
        host: '0.0.0.0',
        port: 3001
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    'babel-loader',
                    'eslint-loader'
                ]
            }
        ]
    },

    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: 'selection.min.js.map'
        })
    ]
};
