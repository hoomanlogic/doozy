var webpack = require("webpack");
var path = require("path");
module.exports = {
    entry: {
        // MAIN INTERFACES
        'action-list': path.resolve(__dirname, 'src/Client/interfaces/mount/mount.actions.js'),
        'focus-list': path.resolve(__dirname, 'src/Client/interfaces/mount/mount.focuses.js'),
        'plan-list': path.resolve(__dirname, 'src/Client/interfaces/mount/mount.plans.js'),
        'planstep-list': path.resolve(__dirname, 'src/Client/interfaces/mount/mount.plan-steps.js'),
        'tag-list': path.resolve(__dirname, 'src/Client/interfaces/mount/mount.tags.js'),
        'target-list': path.resolve(__dirname, 'src/Client/interfaces/mount/mount.targets.js'),

        // FORMS
        'action-form': path.resolve(__dirname, 'src/Client/interfaces/mount/mount.action-form.js'),
        'focus-form': path.resolve(__dirname, 'src/Client/interfaces/mount/mount.focus-form.js'),
        'logentry-form': path.resolve(__dirname, 'src/Client/interfaces/mount/mount.logentry-form.js'),
        'plan-form': path.resolve(__dirname, 'src/Client/interfaces/mount/mount.plan-form.js'),
        'plan-step-form': path.resolve(__dirname, 'src/Client/interfaces/mount/mount.plan-step-form.js'),
        'tag-form': path.resolve(__dirname, 'src/Client/interfaces/mount/mount.tag-form.js'),
        'target-form': path.resolve(__dirname, 'src/Client/interfaces/mount/mount.target-form.js'),
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
