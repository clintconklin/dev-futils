var fs = require('fs');
var path = require('path');

//var gulp = require('gulp');
var gulp = require('gulp-param')(require('gulp'), process.argv);
var gutil = require('gulp-util');
var merge = require('merge')

var less = require('gulp-less');
var mincss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var size = require('gulp-size');

var defaults = {
    "senx": {
        "name": "Senator X",
        "root": "/Applications/ColdFusion11/cfusion/wwwroot/senator_x/trunk/",
        "js": {
            "getDest": function(path) {
                return path.replace('/src', '');
            },
            "glob": "scripts/src/**/*.js"
        },
        "less": {
            "getDest": function(path) {
                return path + '../';
            },
            "glob": "themes/**/*.less",
            "target": "common.less" // the file to compile
        }
    }
};

// load the config if it's present
var config = null;
try {
    var localConfig = require('./config.js');
    config = merge(defaults, localConfig.config());
    console.log('Successfully loaded config.json and merged with the defaults.');
} catch (e) { console.dir(e);
    if (e instanceof Error && e.code === "MODULE_NOT_FOUND") {
        console.log("No config file present, using defaults.");
        config = defaults;
    } else {
        throw e;
    }
}

gulp.task('ce-utils', function(env) {
    if (env) {
        if (typeof config[env] != 'undefined') {
            env = config[env];
            console.log('Environment successfully set to ' + env.name);

            if (typeof env.less != 'undefined' && env.less) { console.log('watching ' + env.root + env.less.glob);
                gulp.watch(env.root + env.less.glob, function (event) {
                    var pathArray = event.path.split('/');
                    var file = pathArray[pathArray.length - 1];
                    var dir = event.path.replace(file, '');

                    try {
                        // by convention the root compile sheet is common.less
                        gulp.src(dir + env.less.target)
                        .pipe(less())
                        .pipe(size({
                            'title': 'ce-utils: less pre-css minify',
                            'showFiles': true
                        })) // filesize pre-minify css
                        .pipe(mincss())
                        .pipe(gulp.dest(env.less.getDest(dir)))
                        .pipe(size({
                            'title': 'ce-utils: less post-css minify',
                            'showFiles': true
                        })) // filesize post-minify css
                        .on('error', gutil.log);
                    } catch (e) {
                        console.log(e.name + ' -> ' + e.message);
                    }
                });
            }

            if (typeof env.js != 'undefined' && env.js) {
                gulp.watch(env.root + env.js.glob, function (event) {
                    var pathArray = event.path.split('/');
                    var file = pathArray[pathArray.length - 1];
                    var dir = event.path.replace(file, '');

                    try {
                        gulp.src(event.path)
                        .pipe(size({
                            'title': 'ce-utils: js pre-uglify',
                            'showFiles': true
                        })) // filesize pre-uglify
                        .pipe(uglify())
                        .pipe(gulp.dest(env.js.getDest(dir)))
                        .pipe(size({
                            'title': 'ce-utils: js post-uglify',
                            'showFiles': true
                        })) // filesize post-uglify
                        .on('error', gutil.log)
                    } catch (e) {
                        console.log(e.name + ' -> ' + e.message);
                    }
                });
            }
        } else {
            console.log('Couldn\'t find the \'' + env + '\' environment... exiting');
        }
    } else {
        console.log('Please specify an evironment; e.g. --env senx\nExiting...');
    }
});

/*  DEPRECATED, BUT STILL WORKS
    NOTE: globbing the entire webroot directory for both less and js results in a 'maximum call
    stack size exceeded' error, so the watch tasks are now grouped by project; this has the added
    benefit that we don't need to check for common.less vs. theme.less or whatever, since the
    filenames are by convention project-specific
*/
gulp.task('senx-utils', function(env) {
    // less files in the themes folder
    gulp.watch('../senx/trunk/themes/**/*.less', function (event) {
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
    gulp.watch('../senx/trunk/scripts/src/**/*.js', function (event) {
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