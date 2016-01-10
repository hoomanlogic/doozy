var webpack = require("webpack");
var path = require("path");
module.exports = {
    entry: {
        // MAIN INTERFACES
        actions: path.resolve(__dirname, 'src/Client/interfaces/mount.actions.js'),
        'plans': path.resolve(__dirname, 'src/Client/interfaces/mount.plans.js'),
        'plan-steps': path.resolve(__dirname, 'src/Client/interfaces/mount.plan-steps.js'),
        'tags': path.resolve(__dirname, 'src/Client/interfaces/mount.tags.js'),
        'targets': path.resolve(__dirname, 'src/Client/interfaces/mount.targets.js'),

        // FORMS
        'action-form': path.resolve(__dirname, 'src/Client/interfaces/mount.action-form.js'),
        'logentry-form': path.resolve(__dirname, 'src/Client/interfaces/mount.logentry-form.js'),
        'plan-form': path.resolve(__dirname, 'src/Client/interfaces/mount.plan-form.js'),
        'plan-step-form': path.resolve(__dirname, 'src/Client/interfaces/mount.plan-step-form.js'),
        'tag-form': path.resolve(__dirname, 'src/Client/interfaces/mount.tag-form.js'),
        'target-form': path.resolve(__dirname, 'src/Client/interfaces/mount.target-form.js'),
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
