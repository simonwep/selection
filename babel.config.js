module.exports = {

    plugins: [
        '@babel/plugin-proposal-object-rest-spread'
    ],


    presets: [
        [
            '@babel/preset-env', {
            'targets': {
                'browsers': [
                    'Chrome >= 52',
                    'FireFox >= 45',
                    'Safari >= 10',
                    'edge 15'
                ]
            },
            'modules': 'umd'
        }
        ]
    ]
};
