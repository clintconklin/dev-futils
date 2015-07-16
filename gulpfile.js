var fs = require('fs');
var path = require('path');

var gulp = require('gulp-param')(require('gulp'), process.argv);
var gutil = require('gulp-util');
var rename = require("gulp-rename");
var merge = require('merge')

var less = require('gulp-less');
var mincss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var size = require('gulp-size');

var defaults = {
    "amend-tinymce": {
        "name": "Amend - tinymce plugins",
        "root": "/Applications/ColdFusion11/cfusion/wwwroot/amend/branches/v3.5/script/tinymce/jscripts/tiny_mce/plugins/",
        "js": {
            "getDest": function(dir) {
                return dir;
            },
            "getName": function(file) {
                return file.replace('_src', '');
            },
            "glob": "**/editor_plugin_src.js"
        },
        "less": null
    },
    "senx": {
        "name": "Senator X",
        "root": "/Applications/ColdFusion11/cfusion/wwwroot/senator_x/trunk/",
        "js": {
            "getDest": function(dir) {
                return dir.replace('/src', '');
            },
            "glob": "scripts/src/**/*.js"
        },
        "less": {
            "getDest": function(dir) {
                return dir + '../';
            },
            "glob": "themes/**/*.less",
            "target": "common.less"
        }
    }
};

// load the config if it's present
var config = null;
try {
    var localConfig = require('./config.js');
    config = merge(defaults, localConfig.config());
    gutil.log(gutil.colors.blue('Notice: '), 'Successfully loaded config.json and merged with the defaults.');
} catch (e) {
    if (e instanceof Error && e.code === "MODULE_NOT_FOUND") {
        gutil.log(gutil.colors.blue('Notice: '), 'No config file present, using defaults.');
        config = defaults;
    } else {
        throw e;
    }
}

var setWatch = function(env) {
    gutil.log(gutil.colors.blue('Notice: '), 'Environment successfully set to ' + env.name);

    if (typeof env.less != 'undefined' && env.less) {
        gulp.watch(env.root + env.less.glob, function (event) {
            var pathArray = event.path.split('/');
            var file = pathArray[pathArray.length - 1];
            var dir = event.path.replace(file, '');

            try {
                // by convention the root compile sheet is common.less
                gulp.src(dir + env.less.target)
                .pipe(less())
                .on('error', function(e) {
                    gutil.log(gutil.colors.red('LESS compilation error: '), e.message);
                    this.emit('end');
                })
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
                gutil.log(gutil.colors.red('Error: '), e.message);
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
                .on('error', function(e) {
                    gutil.log(gutil.colors.red('uglification error: '), e.message);
                    this.emit('end');
                })
                //.pipe(rename(env.js.getName(file)))
                .pipe(typeof env.js.getName === 'function' ? rename(env.js.getName(file)) : gutil.noop())
                .pipe(gulp.dest(env.js.getDest(dir)))
                .pipe(size({
                    'title': 'ce-utils: js post-uglify',
                    'showFiles': true
                })) // filesize post-uglify
                .on('error', gutil.log)
            } catch (e) {
                gutil.log(gutil.colors.red('Error: '), e.message);
            }
        });
    }
};

gulp.task('ce-utils', function(env, all, list, help) {
    if (help) {
        gutil.log(gutil.colors.blue('List of available options:'));
        gutil.log(gutil.colors.blue('--list'), ' - lists all available environments');
        gutil.log(gutil.colors.blue('--env [environment]'), ' - loads the specified environment');
        gutil.log(gutil.colors.blue('--all'), ' - loads all available environments');
    } else if (list) {
        gutil.log(gutil.colors.blue('List of available environments:'));
        for (env in config) {
            if (config.hasOwnProperty(env)) {
                gutil.log(gutil.colors.blue(env), ' - ', config[env].name);
            }
        }
    } else if (all) {
        for (env in config) {
            if (config.hasOwnProperty(env)) {
                setWatch(config[env]);
            }
        }
    } else if (env) {
        if (typeof config[env] != 'undefined') {
            setWatch(config[env]);
        } else {
            gutil.log(gutil.colors.red('Error: '), 'Couldn\'t find the \'' + env + '\' environment... exiting');
        }
    } else {
        gutil.log(gutil.colors.red('Error: '), 'Please specify an evironment; e.g. --env senx, or use the --all argument.\nExiting...');
    }
});
