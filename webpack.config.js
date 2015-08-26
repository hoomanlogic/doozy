var webpack = require("webpack");
var path = require("path");
module.exports = {
    entry: "./entry.js",
    eslint: {
        configFile: '.eslintrc'
    },
    module: {
        loaders: [
            { test: /\.jsx?$/, loader: 'babel' },
            { test: /\.jsx?$/, loader: 'eslint' },
            { test: /\.css$/, loader: "style!css" },
            { test: /\.less$/, loader: "style!css!less" },

            // required for bootstrap/font-awesome
            { test: /\.woff$/,   loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff" },
            { test: /\.ttf$/,    loader: "file-loader" },
            { test: /\.eot$/,    loader: "file-loader" },
            { test: /\.svg$/,    loader: "file-loader" },
        ]
    },
    externals: {
        //don't bundle the 'react' npm package with our bundle.js
        //but get it from a global 'React' variable
        'react': 'React'
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    output: {
        path: __dirname + '/src/Server/js',
        filename: "bundle.js",
        //at this directory our bundle file will be available
        //make sure port 8090 is used when launching webpack-dev-server
        publicPath: 'http://localhost:8090/assets'
    }
};
