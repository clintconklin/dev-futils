// TODO: arguments/environments
var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var gutil = require('gulp-util');

var less = require('gulp-less');
var mincss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var size = require('gulp-size');

/*
    NOTE: globbing the entire webroot directory for both less and js results in a 'maximum call
    stack size exceeded' error, so the watch tasks are now grouped by project; this has the added
    benefit that we don't need to check for common.less vs. theme.less or whatever, since the
    filenames are by convention project-specific
*/

gulp.task('senx-utils', function() {
    // less files in the themes folder
    gulp.watch('../senator_x/trunk/themes/**/*.less', function (event) {
        var pathArray = event.path.split('/');
        var file = pathArray[pathArray.length - 1];
        var dir = event.path.replace(file, '');

        try {
            // by convention the root compile sheet is common.less
            gulp.src(dir + 'common.less')
            .pipe(less())
            .pipe(size({
                'title': 'senx-utils: less pre-css minify',
                'showFiles': true
            })) // filesize pre-minify css
            .pipe(mincss())
            .pipe(gulp.dest(dir + '../'))
            .pipe(size({
                'title': 'senx-utils: less post-css minify',
                'showFiles': true
            })) // filesize post-minify css
            .on('error', gutil.log);
        } catch (e) {
            console.log(e.name + ' -> ' + e.message);
        }
    });

    // js files in the scripts/src folder
    gulp.watch('../senator_x/trunk/scripts/src/**/*.js', function (event) {
        var pathArray = event.path.split('/');
        var file = pathArray[pathArray.length - 1];
        var dir = event.path.replace(file, '');

        try {
            gulp.src(event.path)
            .pipe(size({
                'title': 'senx-utils: js pre-uglify',
                'showFiles': true
            })) // filesize pre-uglify
            .pipe(uglify())
            .pipe(gulp.dest(dir.replace('/src', '')))
            .pipe(size({
                'title': 'senx-utils: js post-uglify',
                'showFiles': true
            })) // filesize post-uglify
            .on('error', gutil.log)
        } catch (e) {
            console.log(e.name + ' -> ' + e.message);
        }
    });
});
