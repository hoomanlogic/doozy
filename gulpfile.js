var gulp = require('gulp');
var react = require('gulp-react');
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
    'bower_components/jquery/dist/jquery.min.js', 
    'bower_components/underscore/underscore-min.js',
    'bower_components/toastr/build/toastr.min.js',
    'bower_components/skycons/skycons.min.js', 
    //'bower_components/showdown/compressed/Showdown.min.js', 
    'bower_components/jstorage/jstorage.min.js', 
    'aes.js', //bower_components/crypto-js/crypto-js is currently causing an issue
    'nuget_packages/Microsoft.AspNet.SignalR.JS.2.1.2/content/Scripts/jquery.signalR-2.1.2.min.js', 
    'bower_components/selectize/dist/js/standalone/selectize.min.js',
	'bower_components/babble/dist/babble.min.js',
	'bower_components/Sugar/release/date.min.js',
    '../errl_js/dist/*.min.js', 
    '../common_js/dist/common.min.js',
    '../common_js/dist/datetime.min.js',
    '../common_js/dist/EventHandler.min.js',
    '../common_js/dist/extensions.min.js',
    '../common_js/dist/io.min.js',
    '../common_js/dist/uri.min.js',
	'../common_js/dist/store.min.js',
];

var cssAll = [
	'bower_components/fontawesome/css/font-awesome.min.css', 
	'bower_components/toastr/build/toastr.min.css', 
	'bower_components/selectize/dist/css/selectize.css', 
	'bower_components/selectize/dist/css/selectize.default.css',
	'src/server/css/app.min.css'
];

var jsxFiles = [
    '../react_components/src/**', 
    
    'src/client/jsx/components/ActionRow.jsx',
    'src/client/jsx/components/FocusListItem.jsx',
    'src/client/jsx/components/NotificationListItem.jsx',
    'src/client/jsx/components/TagListItem.jsx',
    'src/client/jsx/components/Uploader.jsx',
    
    'src/client/jsx/components/SendMessage.jsx',
    
    'src/client/jsx/components/AddEditAction.jsx',
    'src/client/jsx/components/BoxedActions.jsx',
    'src/client/jsx/components/Conversation.jsx',
    'src/client/jsx/components/LogAction.jsx',
    'src/client/jsx/components/Microphone.jsx',
    'src/client/jsx/components/NextActions.jsx',
    'src/client/jsx/components/NotificationDropdown.jsx',
    'src/client/jsx/components/ProfilePic.jsx',
    'src/client/jsx/components/RecentActions.jsx',
    'src/client/jsx/components/TagList.jsx',
    'src/client/jsx/components/Timer.jsx',
    'src/client/jsx/components/UpcomingActions.jsx',
    'src/client/jsx/components/WeatherIcon.jsx',
    
    'src/client/jsx/components/FocusActions.jsx',
    
    'src/client/jsx/pages/ManageFocus.jsx',
    'src/client/jsx/pages/PrimaryNavigation.jsx',
    
    'src/client/jsx/pages/App.jsx',
];

var maps = [
    'bower_components/jquery/dist/jquery.min.js.map', 
];

gulp.task('build', ['concat-js-libs', 'concat-css-all', 'concat-js-app']);

// TASK: Compile JSX source
gulp.task('compile-jsx', function () {
    return gulp.src(jsxFiles)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concat('views.js'))
        .pipe(react())
        .pipe(gulp.dest('build'));
});

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

// TASK: Concat Js Libs
gulp.task('concat-js-libs', function () {
    return gulp.src(jsLibs)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concat('libs.min.js'))
        .pipe(gulp.dest('src/server/js'));
});

// TASK: Concat Js Internal Code
gulp.task('concat-js-app', ['compile-jsx'], function () {
    return gulp.src(['src/client/js/app/*.js', 'src/client/js/stores/*.js', 'build/views.js'])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('src/server/js'))
        .pipe(rename(function (path) {
            path.basename += '.min';
        }))
        .pipe(uglify())
        .pipe(gulp.dest('src/server/js'));
});

// TASK: Concat Css Libs
gulp.task('concat-css-all', ['compile-less'], function () {
    return gulp.src(cssAll)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concat('all.min.css'))
        .pipe(gulp.dest('src/server/css'));
});

gulp.task('watch', function () {
    // Watch JSX source and recompile whenever a change occurs
    var jsxWatcher = gulp.watch(['../react_components/src/**', 'src/client/jsx/components/**', 'src/client/jsx/pages/**', 'src/client/js/**'], ['compile-jsx', 'concat-js-app']);
    jsxWatcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running task...');
    });

    // Watch LESS source and recompile whenever a change occurs
    var lessWatcher = gulp.watch(['src/client/less/mixins/**', 'src/client/less/base/**', 'src/client/less/element_selectors/**', 'src/client/less/*.less'], ['compile-less', 'concat-css-all']);
    lessWatcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running task...');
    });
    
    // Watch Internal JS Libraries for Updates
    var jsLibWatcher = gulp.watch(['../errl_js/dist/*.min.js', '../common_js/dist/*.min.js'], ['concat-js-libs']);
    jsLibWatcher.on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running task...');
    });
});