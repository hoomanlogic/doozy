var webpack = require("webpack");
var path = require("path");
module.exports = {
    entry: {
        actions: path.resolve(__dirname, 'webpack-interfaces.actions.js'),
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
            {
                test: /\.json$/,
                loader: 'json-loader',
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                loader: 'url-loader?limit=10000',
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
            },
            {
                test: /\.(md|markdown)$/,
                loader: ['html-loader', 'markdown-loader'],
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader',
            },
            {
                test: /\.less$/,
                loader: 'style-loader!css-loader!less-loader',
            },
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.json', '.coffee'],
        root: path.resolve('./src/Client')
    },
    output: {
        filename: '[name].js',
        path: '../operator/build/public/doozy'
    }
};
