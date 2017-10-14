{
    'variables': {
        'with_png%':  'true',
        'with_jpeg%': 'true',
        'with_gif%':  'true',
        'with_webp%': 'true',
        'with_bmp%':  'false',
        'with_raw%':  'true',
    },
    'targets': [{
        'target_name': 'binding',
        'sources': [
            'src/Image.cc',
            'src/Resize.cc',
            'src/Rotate.cc',
            'src/resampler.cpp'
        ],
        'defines': [
            'V8_DEPRECATION_WARNINGS=1',
            'NODE_IMAGES_ARCH_<(target_arch)',
        ],
        'conditions': [
            ['with_png=="true"', {
                'defines': ['HAVE_PNG'],
                'sources': ['src/Png.cc'],
                'dependencies': [
                    'gyp/gyp/libpng.gyp:libpng',
                ]
            }],
            ['with_jpeg=="true"', {
                'defines': ['HAVE_JPEG'],
                'sources': ['src/Jpeg.cc'],
                'dependencies': [
                    'gyp/gyp/libjpeg-turbo.gyp:libjpeg-turbo',
                ]
            }],
            ['with_gif=="true"', {
                'defines': ['HAVE_GIF'],
                'sources': ['src/Gif.cc'],
                'dependencies': [
                    'gyp/gyp/giflib.gyp:giflib',
                ]
            }],
            ['with_webp=="true"', {
                'defines': ['HAVE_WEBP'],
                'sources': ['src/Webp.cc'],
                'dependencies': [
                    'gyp/gyp/libwebp.gyp:libwebp',
                ]
            }],
            ['with_bmp=="true"', {
                'defines': ['HAVE_BMP'],
                'sources': ['src/Bmp.cc']
            }],
            ['with_raw=="true"', {
                'defines': ['HAVE_RAW'],
                'sources': ['src/Raw.cc']
            }]
        ],
        'cflags': [
            '-Wall',
        ],
        'cflags!': [
            '-g'
        ],
        'xcode_settings': {
            'WARNING_CFLAGS!': [
                '-W'
            ],
            'CLANG_CXX_LIBRARY': 'libc++',
            'CLANG_CXX_LANGUAGE_STANDARD':'c++11',
            'GCC_ENABLE_CPP_RTTI': 'YES',
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
            'MACOSX_DEPLOYMENT_TARGET':'10.9',
        },
    }],
    'target_defaults': {
        'default_configuration': 'Release',
        'configurations': {
            'Debug': {
                'defines': [
                    'ASAN_OPTIONS=symbolize=1'
                ],
                'xcode_settings': {
                    'GCC_OPTIMIZATION_LEVEL': '0',
                    'GCC_GENERATE_DEBUGGING_SYMBOLS': 'YES',
                }
            },
            'Release': {
                'defines': [ 'NDEBUG' ],
                'cflags!': ['-Os'],
                'cflags': ['-O3'],
                'xcode_settings': {
                    'GCC_OPTIMIZATION_LEVEL': '3',
                    'GCC_GENERATE_DEBUGGING_SYMBOLS': 'NO',
                    'DEAD_CODE_STRIPPING': 'YES',
                    'GCC_INLINES_ARE_PRIVATE_EXTERN': 'YES',
                }
            }
        },
    }
}
