var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');

var onError = function (err) {
    gutil.beep();
    console.log(err);
};

var jsLibs = [
    'node_modules/jquery/dist/jquery.js',
    'packages/Microsoft.AspNet.SignalR.JS.2.1.2/content/Scripts/jquery.signalR-2.1.2.js',

    'bower_components/underscore/underscore.js',
    'node_modules/json2/lib/JSON2/static/json2.js',
    'bower_components/toastr/toastr.js',
    'bower_components/skycons/skycons.js',
    'bower_components/jstorage/jstorage.js',

    'bower_components/crypto-js/core.js',
    'bower_components/crypto-js/enc-base64.js',
    'bower_components/crypto-js/md5.js',
    'bower_components/crypto-js/evpkdf.js',
    'bower_components/crypto-js/cipher-core.js',
    'bower_components/crypto-js/aes.js',

    'bower_components/selectize/dist/js/standalone/selectize.js',
	'bower_components/Sugar/release/date.js',

    '../common_js/src/common.js',
    '../common_js/src/extensions.js',
    '../common_js/src/polyfills.js',
    '../common_js/src/io.js',
    '../common_js/src/uri.js',
	'../common_js/src/store.js',

    'bower_components/rxjs/dist/rx.lite.js',
    '../common_js/src/EventHandler.js',

];

var cssAll = [
	'bower_components/fontawesome/css/font-awesome.css',
	'bower_components/toastr/build/toastr.css',
	'bower_components/selectize/dist/css/selectize.css',
	'bower_components/selectize/dist/css/selectize.default.css',
	'src/server/css/app.css'
];

gulp.task('build', ['concat-js-libs', 'concat-css-all']);

// TASK: Compile LESS source
gulp.task('compile-less', function () {
    return gulp.src(['src/client/less/mixins/**', 'src/client/less/base/**', 'src/client/less/element_selectors/**', 'src/client/less/*.less'])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concat('app.css'))
        .pipe(less())
        .pipe(gulp.dest('src/server/css'))
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(minifyCSS())
        .pipe(gulp.dest('src/server/css'));
});

// TASK: Concat Css Libs
gulp.task('concat-css-all', ['compile-less'], function () {
    return gulp.src(cssAll)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concat('all.css'))
        .pipe(gulp.dest('src/server/css'));
});

// TASK: Concat Js Libs
gulp.task('concat-js-libs', function () {
    return gulp.src(jsLibs)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concat('libs.js'))
        .pipe(gulp.dest('src/server/js'))
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(uglify())
        .pipe(gulp.dest('src/server/js'));
});

gulp.task('watch', function () {
    // Watch LESS source and recompile whenever a change occurs
    var lessWatcher = gulp.watch(['src/client/less/mixins/**', 'src/client/less/base/**', 'src/client/less/element_selectors/**', 'src/client/less/*.less'], ['compile-less', 'concat-css-all']);
    lessWatcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running task...');
    });
});
