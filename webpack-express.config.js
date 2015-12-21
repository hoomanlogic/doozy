var webpack = require("webpack");
var path = require("path");
module.exports = {
    entry: {
        doozy: path.resolve(__dirname, 'webpack-express.entry.js'),
    },
    eslint: {
        configFile: '.eslintrc'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel',
                exclude: /node_modules|bower_components/,
                query: {
                    optional: ['spec.undefinedToVoid', 'runtime'],
                    stage: 0
                }
            },
            {
                test: /\.jsx?$/,
                loader: 'eslint',
                exclude: /node_modules|bower_components/
            },
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.json', '.coffee'],
        root: path.resolve('./src/Client')
    },
    output: {
        filename: 'doozy.js',
        path: '../webprompt/build/public'
    }
};
