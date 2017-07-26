/*
 * dist.js
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 ZhangYuanwei <zhangyuanwei1988@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sub license, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice (including the
 * next paragraph) shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT.
 * IN NO EVENT SHALL INTEL AND/OR ITS SUPPLIERS BE LIABLE FOR
 * ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * Running this file will compile the source and update the binding.node
 * file in the bindings folders. All supported version must be included in map.json.
 * Make sure to run `npm run configure` at least once.
 */

'use strict';

var utils = require('./utils.js');
var map = require('./map.json');
var path = require('path');
var fs = require('fs');
var candidates = null;
var minimal_node_version = 4;

try {
    candidates = map[ process.platform ][ process.arch ];
} catch ( e ) {
    console.error('Platform or architecture unsupported!');
    process.exit(1);
}

(function build() {
    if (!candidates.length) {
        return;
    }
    var version = candidates.pop();
    var major = parseInt(version.split('.')[0], 10) || 0;
    if (major < minimal_node_version) {
        console.log('Skipping unsupported version ' + version);
        build();
        return;
    }
    console.log('= Configuring v' + version + ' for distribution');
    var args = ['configure', '--release', '--target=v' + version, '--silent', '-j 4'];
    utils.forkToNodeGyp(args, function (err) {
        if (err) {
            console.error('Configure v' + version + ' failed :(');
            build();
        } else {
            args[0] = 'build';
            console.log('+ Building v' + version + ' for distribution');
            utils.forkToNodeGyp(args, function (err) {
                if (err) {
                    console.error('Build v' + version + ' failed :(');
                } else {
                    var fresh = './build/Release/binding.node';
                    var dest = './bindings/' + process.platform + '/' + process.arch + '/' +
                            version + '/binding.node';
                    utils.mkdirP( path.dirname( dest ) );
                    fs.createReadStream(fresh).pipe(fs.createWriteStream(dest));
                    console.log('binding.node copied to ' + dest);
                }
                build();
            });
        }
    });
})();
