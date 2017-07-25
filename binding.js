
'use strict';

var fs = require('fs');
var builds = ['Release', 'Debug'];
var loadBuild = function (build) {
    var buildModule = __dirname + '/build/' + build + '/binding.node';
    if (fs.existsSync(buildModule)) {
        try {
            module.exports = require(buildModule);
            return true;
        } catch (e) {
            console.log('Cant\'t load `.node` module ' + buildModule);
            throw e;
        }
    }
    return false;
};

for (var i in builds) {
    if (loadBuild(builds[i])) {
        return;
    }
}

function compiler(a, b) {
    if (!/^(?:\d+.?)+$/.test(a) || !/^(?:\d+.?)+/.test(b)) {
        return a > b;
    }

    var aArr = a.split('.');
    var bArr = b.split('.');
    var max = Math.max(aArr.length, bArr.length);

    for (var i = 0; i < max; i++) {
        if ((aArr[i] && !bArr[i])  || aArr[i] > bArr[i]) {
            return 1;
        } else if ((!aArr[i] && bArr[i]) || aArr[i] < bArr[i]) {
            return -1;
        }
    }

    return 0;
}

var pkgInf = require('./package.json');
var bindingMap = pkgInf.bindingMap;
var bugUrl = pkgInf['bugs'] ? (pkgInf['bugs']['url'] || '') : '';

for ( var i in bindingMap)  {
    if (bindingMap.hasOwnProperty(i)) {
        var target = i;
        var versions = bindingMap[i];

        var cur = process.versions['node'];

        if (compiler(versions[0], cur) <= 0 && compiler(versions[1], cur) >= 0) {
            try {
                module.exports = require('./bindings/'+ process.platform + '/' + process.arch + '/' + target + '/binding.node');
                return;
            } catch ( e ) {
                throw new Error('Can\'t load the addon. Issue to: ' + bugUrl + '\n' + e.stack);
            }
        }
    }
}

throw new Error('Can\'t load the addon. Issue to: ' + bugUrl);
