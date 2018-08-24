const UglifyJs = require('uglifyjs-webpack-plugin');

module.exports = {

    entry: './src/selection.js',

    output: {
        path: __dirname + '/dist',
        publicPath: 'dist/',
        filename: 'selection.min.js',
        library: 'Selection',
        libraryTarget: 'umd'
    },

    devServer: {
        contentBase: __dirname + '/',
        host: '0.0.0.0',
        port: 8088
    },

    module: {
        rules: [
            {
                test: /\.js/,
                loader: 'babel-loader'
            }
        ]
    },

    optimization: {
        minimizer: [
            new UglifyJs({
                uglifyOptions: {
                     output: {
                        comments: false
                    }
                }
            })
        ]
    }
};