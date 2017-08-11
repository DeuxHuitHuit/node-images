/*
 * utils.js
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


'use strict';

var fs = require('fs'),
    path = require('path'),
    cp = require('child_process');

function mkdirP ( p, mode, made ) {
    if (mode === undefined) {
        mode = parseInt('0777', 8) & (~process.umask());
    }
    if (!made) made = null;

    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);

    try {
        fs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = mkdirP(path.dirname(p), mode, made);
                mkdirP(p, mode, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = fs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
}

function versionCompare(left, right) {
    if (typeof left + typeof right != 'stringstring')
        return false;

    var a = left.split('.'),
        b = right.split('.'),
        i = 0,
        len = Math.max(a.length, b.length);

    for (; i < len; i++) {
        if ((a[i] && !b[i] && parseInt(a[i], 10) > 0) || (parseInt(a[i], 10) > parseInt(b[i], 10))) {
            return 1;
        } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i], 10) < parseInt(b[i], 10))) {
            return -1;
        }
    }

    return 0;
}

function forkToNpm(args, done) {
    cp.spawn(
        process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
        stdio: [0, 1, 2]
    })
    .on('exit', function (err) {
        if (err) {
            console.error('npm failed');
        }
        done(err);
    });
}

function forkToNodeGyp(args, done) {
    cp.spawn(
        process.platform === 'win32' ? 'node-gyp.cmd' : 'node-gyp', args, {
        stdio: [0, 1, 2]
    })
    .on('exit', function (err) {
        if (err) {
            if (err === 127) {
                console.error(
                    'node-gyp not found! Please upgrade your install of npm! You need at least 1.1.5 (I think) ' +
                    'and preferably 5.x.x.'
                );
            } else {
                console.error('Build failed');
            }
        }
        done(err);
    });
}

module.exports = {
    mkdirP: mkdirP,
    versionCompare: versionCompare,
    forkToNodeGyp: forkToNodeGyp,
    forkToNpm: forkToNpm
}
