var webpack = require("webpack");
var path = require("path");
module.exports = {
    entry: {
        doozy:  path.resolve(__dirname, 'entry.js'),
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
            //{ test: /\.css$/, loader: "style!css" },
            //{ test: /\.less$/, loader: "style!css!less" },

            // required for bootstrap/font-awesome
            //{ test: /\.woff$/,   loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff" },
            //{ test: /\.ttf$/,    loader: "file-loader" },
            //{ test: /\.eot$/,    loader: "file-loader" },
            //{ test: /\.svg$/,    loader: "file-loader" },
        ]
    },
    externals: {
        //don't bundle the 'react' npm package with our bundle.js
        //but get it from a global 'React' variable
        'react': 'React',
        'react/addons': 'React.addons',
        'toastr': 'toastr',
        'jquery': '$',
        'rx': 'Rx'
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.json', '.coffee'],
        root: path.resolve('./src/Client')
    },
    output: {
        filename: 'react-[name].js',
        path: './src/Server/js',
        //at this directory our bundle file will be available
        //make sure port 8090 is used when launching webpack-dev-server
        publicPath: 'http://localhost:8090/assets'
    }
    // plugins: [
    //     new CommonsChunkPlugin("react-shared.js", ["deck", "kiosk", "powertrack", "playground"])
    // ]
};
