var fs = require('fs');
var path = require('path');

var gulp = require('gulp-param')(require('gulp'), process.argv);
var gutil = require('gulp-util');
var rename = require("gulp-rename");
var merge = require('merge')

var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
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
            "getTarget": function(dir) {
                if (dir.indexOf('themes/vitter') !== -1) { // target file is bootstrap.less, and some less files are in an /amend subdirectory
                    return dir.replace(/\/amend/i, '') + 'bootstrap.less';
                } else {
                    return dir + 'common.less';
                }
            },
            "glob": "themes/**/*.less"
        }
    }
};

var config = null;
try { // load the config if it's present
    var localConfig = require('./config.js');
    config = merge(defaults, localConfig.config());
    gutil.log(gutil.colors.blue('Notice: '), 'Successfully loaded config.js and merged with the defaults.');
} catch (e) {
    if (e instanceof Error && e.code === "MODULE_NOT_FOUND") {
        gutil.log(gutil.colors.blue('Notice: '), 'No config.js file present, using defaults.');
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
                gulp.src(env.less.getTarget(dir))
                .pipe(typeof env.dev !== 'undefined' && env.dev === true ? sourcemaps.init() : gutil.noop())
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
                .pipe(typeof env.dev !== 'undefined' && env.dev === true ? sourcemaps.write() : gutil.noop())
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

gulp.task('ce-utils', function(help, list, all, env, dev) {
    if (help) {
        gutil.log(
            gutil.colors.blue('Here\s a listng of all available arguments:\n\n'),

            gutil.colors.blue('\t--help'),
            '- ./\n',

            gutil.colors.blue('\t--list'),
            '- lists all available environments\n',

            gutil.colors.blue('\t--env [environment]'),
            '- loads the specified environment\n',

            gutil.colors.blue('\t--all'),
            '- loads all available environments\n',

            gutil.colors.blue('\t--dev'),
            '- generates an inline less sourcemap when passed with either --env or --all\n'
        );
    } else if (list) {
        var msg = gutil.colors.blue('Here\'s a listing of all available environments:') + '\n\n';

        for (env in config) {
            if (config.hasOwnProperty(env)) {
                msg += '\t' + gutil.colors.blue(env) + ' - ' + config[env].name + '\n';
            }
        }

        gutil.log(msg);
    } else if (all) {
        for (env in config) {
            if (config.hasOwnProperty(env)) {
                if (dev) {
                    config[env].dev = true;
                    gutil.log(gutil.colors.blue('Notice: '), 'dev mode is enabled');
                } else {
                    config[env].dev = false;
                }
                setWatch(config[env]);
            }
        }
    } else if (env) {
        if (typeof config[env] != 'undefined') {
            if (dev) {
                config[env].dev = true;
                gutil.log(gutil.colors.blue('Notice: '), 'dev mode is enabled');
            } else {
                config[env].dev = false;
            }
            setWatch(config[env]);
        } else {
            gutil.log(gutil.colors.red('Error: '), 'Couldn\'t find the \'' + env + '\' environment... exiting');
        }
    } else {
        gutil.log(gutil.colors.red('Error: '), 'Please specify an evironment; e.g. --env senx, or use the --all argument.\nExiting...');
    }
});
