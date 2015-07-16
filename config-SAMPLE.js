var config = function() {
    return {
        "senx": {
            "name": "Senator X - Custom Configuration",
            "root": "/Applications/ColdFusion11/cfusion/wwwroot/senx/trunk/",
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
    }
};

module.exports.config = config;
