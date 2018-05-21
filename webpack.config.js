const UglifyJs = require('uglifyjs-webpack-plugin');

module.exports = {

    entry: './src/selection.js',

    output: {
        path: __dirname + '/dist',
        publicPath: 'dist/',
        filename: 'selection.min.js',
        library: 'Selection'
    },

    devServer: {
        contentBase: __dirname + '/'
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