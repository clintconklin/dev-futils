var fs = require('fs');
var path = require('path');

var gulp = require('gulp-param')(require('gulp'), process.argv);
var gutil = require('gulp-util');
var rename = require("gulp-rename");
var merge = require('merge');

var less = require('gulp-less');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var mincss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var webpack = require('webpack-stream');
var size = require('gulp-size');
var notify = require("gulp-notify");

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
    "committee-hearings": {
        "name": "Committee Hearings",
        "root": "/Applications/ColdFusion11/cfusion/wwwroot/amend/branches/v3.5.5/content/committee/hearings/",
        "js": null,
        "less": {
            "getDest": function(dir) {
                return dir + '../';
            },
            "getTarget": function(dir, file) {
                return dir + 'app.less';
            },
            "glob": "styles/**/*.less"
        }
    },
    "committee-mail": {
        "name": "Committee Mail",
        "root": "/Applications/ColdFusion11/cfusion/wwwroot/amend/branches/v3.5.5/content/committee/mail/",
        "js": null,
        "less": {
            "getDest": function(dir) {
                return dir + '../';
            },
            "getTarget": function(dir, file) {
                return dir + 'app.less';
            },
            "glob": "styles/**/*.less"
        }
    },
    "csa": {
        "name": "Casting Society of America",
        "root": "/Applications/ColdFusion11/cfusion/wwwroot/csa/site/trunk/",
        "js": null,
        "less": {
            "getDest": function(dir) {
                return dir + '../css/';
            },
            "getTarget": function(dir, file) {
                return dir + file;
            },
            "glob": "styles/**/*.less"
        }
    },
    "forms": {
        "name": "Forms",
        "root": "/Applications/ColdFusion11/cfusion/wwwroot/test/forms/",
        "js": null,
        "sass": {
            "getDest": function(dir) {
                return dir + '../';
            },
            "getTarget": function(dir, file) {
                return dir + file;
            },
            "glob": "styles/**/*.scss"
        }
    },
    "forms-composer": {
        "name": "Forms Composer",
        "root": "/Users/clint/working/forms/composer/",
        "js": {
            "webpack": true,
            "config": "webpack.config.js",
            "glob": [ "main.js", "app/**/*.js"],
            "getDest": function(dir) {
                return 'public/'; // filename in config
            }
        },
        "less": {
            "getDest": function(dir) {
                return dir + '../';
            },
            "getTarget": function(dir, file) {
                return dir + 'forms-composer.less';
            },
            "glob": "public/styles/**/*.less"
        }
    },
    "hsgac": {
        "name": "HSGAC",
        "root": "/Applications/ColdFusion11/cfusion/wwwroot/hsgac/site/trunk/",
        "js": null,
        "less": {
            "getDest": function(dir) {
                return dir + '../css/';
            },
            "getTarget": function(dir, file) {
                return dir + file;
            },
            "glob": "styles/less/*.less"
        }
    },
    "lab": {
        "name": "LA's BEST",
        "root": "/Applications/ColdFusion11/cfusion/wwwroot/lasbest/branches/v3/trunk/",
        "js": null,
        "less": {
            "getDest": function(dir) {
                return dir + '../css/';
            },
            "getTarget": function(dir, file) {
                return dir + file;
            },
            "glob": "styles/**/*.less"
        }
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
                if (dir.indexOf('themes/vitter') !== -1 || dir.indexOf('themes/casey') !== -1 || dir.indexOf('themes/kaine') !== -1 || dir.indexOf('themes/donnelly') !== -1 || dir.indexOf('themes/murphy') !== -1) {
                    return dir.replace(/\/amend/i, '') + '../';
                } else {
                    return dir + '../';
                }
            },
            "getTarget": function(dir, file) {
                if (dir.indexOf('themes/vitter') !== -1 || dir.indexOf('themes/casey') !== -1 || dir.indexOf('themes/kaine') !== -1 || dir.indexOf('themes/donnelly') !== -1 || dir.indexOf('themes/murphy') !== -1) { // target file is bootstrap.less, and some less files are in an /amend subdirectory
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

var setWatch = function(id, env, theme) {
    gutil.log(gutil.colors.blue('Notice: [' + id + ']'), 'Environment successfully set to ', gutil.colors.blue(env.name));
    if (typeof env.dev !== 'undefined' && env.dev === true) {
        gutil.log(gutil.colors.blue('Notice [' + id + ']: '), 'dev mode is enabled');
    }

    if (typeof env.less != 'undefined' && env.less) {
        if (id == 'senx' && theme) {
            env.less.glob = env.less.glob.replace(/themes/, 'themes/' + theme);
            gutil.log(gutil.colors.blue('Notice: '), 'senx theme set to ' + gutil.colors.blue(theme) + ' for LESS compilation');
        }

        gulp.watch(env.root + env.less.glob, function (event) {
            var pathArray = event.path.split('/');
            var file = pathArray[pathArray.length - 1];
            var dir = event.path.replace(file, '');

            try {
                var target = env.less.getTarget(dir, file);
                gulp.src(target)
                .pipe(typeof env.dev !== 'undefined' && env.dev === true ? sourcemaps.init() : gutil.noop())
                .pipe(less())
                .on('error', notify.onError(function (e) {
                    return {
                        'title': 'dev-futils',
                        'subtitle': 'LESS compilation error',
                        'message': e.message,
                        'sound': false // deactivate sound?
                    };
                }))
                /*.on('error', function(e) {
                    gutil.log(gutil.colors.red('LESS compilation error [' + id + ']: '), e.message);
                    this.emit('end');
                })*/
                .pipe(size({
                    'title': 'dev-futils [' + id + ']: less pre-css minify',
                    'showFiles': true
                })) // filesize pre-minify css
                .pipe(mincss())
                .pipe(typeof env.dev !== 'undefined' && env.dev === true ? sourcemaps.write() : gutil.noop())
                .pipe(gulp.dest(env.less.getDest(dir)))
                .pipe(size({
                    'title': 'dev-futils [' + id + ']: less post-css minify',
                    'showFiles': true
                })) // filesize post-minify css
                .pipe(notify({
                    'title': 'dev-futils',
                    'subtitle': 'LESS task',
                    'message': 'Successfully compiled ' + target
                }))
                .on('error', gutil.log);
            } catch (e) {
                gutil.log(gutil.colors.red('Error [' + id + ']: '), e.message);
            }
        });
    }

    if (typeof env.sass != 'undefined' && env.sass) {
        if (id == 'senx' && theme) {
            env.less.glob = env.less.glob.replace(/themes/, 'themes/' + theme);
            gutil.log(gutil.colors.blue('Notice: '), 'senx theme set to ' + gutil.colors.blue(theme) + ' for LESS compilation');
        }

        gulp.watch(env.root + env.sass.glob, function (event) {
            var pathArray = event.path.split('/');
            var file = pathArray[pathArray.length - 1];
            var dir = event.path.replace(file, '');

            try {
                var target = env.sass.getTarget(dir, file);
                gulp.src(target)
                .pipe(typeof env.dev !== 'undefined' && env.dev === true ? sourcemaps.init() : gutil.noop())
                .pipe(sass().on('error', sass.logError))
                .on('error', function(e) {
                    gutil.log(gutil.colors.red('SASS compilation error [' + id + ']: '), e.message);
                    this.emit('end');
                })
                .pipe(size({
                    'title': 'dev-futils [' + id + ']: SASS pre-css minify',
                    'showFiles': true
                })) // filesize pre-minify css
                .pipe(mincss())
                .pipe(typeof env.dev !== 'undefined' && env.dev === true ? sourcemaps.write() : gutil.noop())
                .pipe(gulp.dest(env.sass.getDest(dir)))
                .pipe(size({
                    'title': 'dev-futils [' + id + ']: SASS post-css minify',
                    'showFiles': true
                })) // filesize post-minify css
                .on('error', gutil.log);
            } catch (e) {
                gutil.log(gutil.colors.red('Error [' + id + ']: '), e.message);
            }
        });
    }

    if (typeof env.js != 'undefined' && env.js) {
        // note: the glob setting can be either a string (single filepath) or an array (of globs)
        if (env.js.glob.constructor === Array) {
            env.js.glob.forEach(function(expr, idx) {
                env.js.glob[idx] = env.root + expr;
            });
        } else {
            env.js.glob = env.root + env.js.glob;
        }

        gulp.watch(env.js.glob, function (event) {
            var pathArray = event.path.split('/');
            var file = pathArray[pathArray.length - 1];
            var dir = event.path.replace(file, '');

            try {
                if (typeof env.js.webpack !== 'undefined' && env.js.webpack === true) {
                    gulp.src(event.path)
                    .pipe(webpack(require(env.root + env.js.config)))
                    .on('error', notify.onError(function (e) {
                        return {
                            'title': 'dev-futils',
                            'subtitle': 'webpack compilation error',
                            'message': e.message,
                            'sound': false // deactivate sound?
                        };
                    }))
                    .pipe(gulp.dest(env.root + env.js.getDest()))
                    .pipe(notify({
                        'title': 'dev-futils',
                        'subtitle': 'webpack task',
                        'message': 'Successful compile'
                    }))
                    .on('error', gutil.log);
                } else {
                    gulp.src(event.path)
                    .pipe(size({
                        'title': 'dev-futils[' + id + ']: js pre-uglify',
                        'showFiles': true
                    })) // filesize pre-uglify
                    .pipe(uglify())
                    .on('error', function(e) {
                        gutil.log(gutil.colors.red('uglification error[' + id + ']: '), e.message);
                        this.emit('end');
                    })
                    //.pipe(rename(env.js.getName(file)))
                    .pipe(typeof env.js.getName === 'function' ? rename(env.js.getName(file)) : gutil.noop())
                    .pipe(gulp.dest(env.js.getDest(dir)))
                    .pipe(size({
                        'title': 'dev-futils[' + id + ']: js post-uglify',
                        'showFiles': true
                    })) // filesize post-uglify
                    .on('error', gutil.log);
                }
            } catch (e) {
                gutil.log(gutil.colors.red('Error[' + id + ']: '), e.message);
            }
        });
    }
};

gulp.task('dev-futils', function(help, list, all, env, dev, theme) {
    if (help) {
        gutil.log(
            gutil.colors.blue('Here\s a listng of all available arguments:\n\n'),

            gutil.colors.blue('\t--help'),
            '- ./\n',

            gutil.colors.blue('\t--list'),
            '- lists all available environments\n',

            gutil.colors.blue('\t--env [environment]'),
            '- loads the specified environment\n',

            gutil.colors.blue('\t--theme [theme]'),
            '- restricts less and sass globbing to a specific senx theme\n',

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
                } else {
                    config[env].dev = false;
                }
                setWatch(env, config[env]);
            }
        }
    } else if (env) {
        if (typeof config[env] != 'undefined') {
            if (dev) {
                config[env].dev = true;
            } else {
                config[env].dev = false;
            }

            setWatch(env, config[env], theme);
        } else {
            gutil.log(gutil.colors.red('Error: '), 'Couldn\'t find the \'' + env + '\' environment... exiting');
        }
    } else {
        gutil.log(gutil.colors.red('Error: '), 'Please specify an evironment; e.g. --env senx, or use the --all argument.\nExiting...');
    }
});
