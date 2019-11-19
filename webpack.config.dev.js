module.exports = {
    mode: 'development',
    entry: './src/selection.js',

    output: {
        path: `${__dirname}/dist`,
        publicPath: 'dist/',
        filename: 'selection.min.js',
        library: 'Selection',
        libraryExport: 'default',
        libraryTarget: 'umd'
    },

    devServer: {
        host: '0.0.0.0',
        port: 3003
    }
};
