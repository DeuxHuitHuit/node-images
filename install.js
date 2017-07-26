/*
 * install.js
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013 ZhangYuanwei <zhangyuanwei1988@gmail.com>
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
 * This script will be executed while npm installing this package.
 *
 * The flow of this script.
 * 1. According to the client's platform download an addon binary
 *    package from github.
 * 2. Try the addon if fail then try `node-gyp` to rebuild a new addon bindary
 *    package.
 * 3. Run the test script.
 */

'use strict';

var step = require('step'),
    fs = require('fs'),
    path = require('path'),
    utils = require('./utils.js');

// Try to download binding.node from github.
function download() {
    var pkg = require('./package.json'),
        https = require('https'),
        url = require('url'),
        done = this,
        githubUser, githubRepos, downloadUrl;

    if ( pkg.bindingsCDN ) {
        downloadUrl = pkg.bindingsCDN;
    } else if ( /([^\/]+?)\/([^\.\/]+?)\.git$/i.test( pkg.repository.url ) ) {
        githubUser = RegExp.$1;
        githubRepos = RegExp.$2;
        downloadUrl = 'https://raw.github.com/' + githubUser + '/' +
                githubRepos + '/master/bindings/';
    }

    // Accroding to the client's platform and try to download an addon binary
    // package from github.
    if ( downloadUrl ) {
        var map = require('./map.json'),
            candidates, version, modPath, candidate;

        version = process.versions.node;

        try {
            candidates = map[ process.platform ][ process.arch ];
        } catch ( e ) {
            return done( true, '' );
        }

        if ( candidates.length ) {
            do {
                candidate = candidates.pop();

                if ( utils.versionCompare( version, candidate ) >= 0 ) {
                    break;
                }

            } while ( candidates.length );

            modPath = process.platform + '/' + process.arch + '/' +
                    candidate + '/binding.node';
        } else {
            console.error( 'Can\'t find the binding.node file.' );
            return done( true );
        }

        // start to download.
        var options = url.parse( downloadUrl + modPath ),
            dest = './build/Release/binding.node',
            client;

        if ( fs.existsSync( dest ) ) {
            console.log( 'The binding.node file exist, skip download.' );
            done( false );
            return;
        }

        console.log('Downloading', options.href );
        client = https.get( options, function( res ) {
            var count = 0,
                notifiedCount = 0,
                outFile;

            if ( res.statusCode === 200 ) {
                utils.mkdirP( path.dirname( dest ) );
                outFile = fs.openSync( dest, 'w' );

                res.on('data', function( data ) {
                    fs.writeSync(outFile, data, 0, data.length, null);
                    count += data.length;

                    if ( (count - notifiedCount) > 512 * 1024 ) {
                      console.log('Received ' + Math.floor( count / 1024 ) + 'K...');
                      notifiedCount = count;
                    }
                });

                res.addListener('end', function() {
                    console.log('Received ' + Math.floor(count / 1024) + 'K total.');
                    fs.closeSync( outFile );
                    done( false );
                });

            } else {
                client.abort()
                console.error('Error requesting archive');
                done( true );
            }
        }).on('error', function(e) {
            console.error( e.message );
            done( true, e );
        });
    } else {
        done( true );
    }
}

// try to rebuild this.
function rebuild( error ) {
    var done = this,
        args = ['rebuild', '--release', '--silent', '-j 4'];

    utils.forkToNodeGyp(args, done);
}

// simply include the binding.js script.
function test( err ) {
    // already failed?
    if ( !err ) {
        try {
            delete require.cache[ require.resolve('./binding.js') ];

            require('./binding.js');
            this( false );
        } catch ( e ) {
            console.error('Test failed!');
            err = true;
        }
    }

    this( err );
}

// donwload first, if fail then rebuild it.
step( download, test, function( error ) {
    // Do I need to rebuild?
    if ( error ) {
        step( rebuild, test, this );
    } else {
        return;
    }
}, function( error ) {
    process.exit( error ? 1 : 0 );
});