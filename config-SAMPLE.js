var config = function() {
    return {
        "senx": {
            "name": "Senator X - Custom Configuration",
            "root": "/Applications/ColdFusion11/cfusion/wwwroot/senx/trunk/",
            "js": {
                "getDest": function(dir) {
                    return dir.replace('/src', '');
                },
                "getName": function(file) {
                    return file;
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
    }
};

module.exports.config = config;
