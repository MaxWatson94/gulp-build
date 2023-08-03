const {src, dest, watch, parallel, series} = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const include = require('gulp-include');

function pages() {
    return src('app/pages/*.html')
        .pipe(include({
            includePaths: 'app/components'
        }))
        .pipe(dest('app'))
        .pipe(browserSync.stream())

}

function fonts() {
    return src('app/fonts/src/*.*')
        .pipe(fonter({
            formats: ['woff', 'ttf']
        }))
        .pipe(src('app/fonts/*.ttf'))
        .pipe(ttf2woff2())
        .pipe(dest('app/fonts'))
}

function images() {
    return src([
        'app/images/src/*.*',
        '!app/images/src/*.svg'
    ])
    .pipe(newer('app/images/'))
    .pipe(avif({quality : 50}))

    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images/'))
    .pipe(webp())

    .pipe(src('app/images/src/*.*'))
    .pipe(newer('app/images/'))
    .pipe(imagemin())

    .pipe(dest('app/images/'))
}

function sprite() {
    return src('app/images/src/**/*.svg')
    .pipe(svgSprite({
        mode: {
            stack: {
                sprite: '../sprite.svg',
                example: true

            }
        }
    }))
    .pipe(dest('app/images'))
}

function scripts() {
    return src([
            'node_modules/jquery/dist/jquery.js',
            'node_modules/swiper/swiper-bundle.js',
            'node_modules/@popperjs/core/dist/umd/popper.js',
            'node_modules/bootstrap/dist/js/bootstrap.js',
            'app/js/**/*.js',
            '!app/js/main.min.js'
        ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function styles() {
    return src([
            'node_modules/bootstrap/dist/css/bootstrap.css',
            'node_modules/swiper/swiper-bundle.css',
            'app/scss/**/*.scss'
        ])
        .pipe(autoprefixer({overrideBrowserslist: ['last 10 version']}))
        .pipe(concat('style.min.css'))
        .pipe(scss({ outputStyle: 'compressed' }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function watching() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });

    watch(['app/components/*', 'app/pages/*'], pages)
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/app/images/src'], images);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/*.html']). on('change', browserSync.reload);
}

function cleanDist() {
    return src('dist')
        .pipe(clean())
}

function build() {
    return src([
        'app/css/style.min.css',
        'app/fonts/*.*',
        'app/images/*.*',
        '!app/images/*.svg',
        'app/images/sprite.svg',
        'app/js/main.min.js',
        'app/**/*.html'
    ], {base : 'app'})
    .pipe(dest('dist'))
}

exports.pages = pages;
exports.images = images;
exports.sprite = sprite;
exports.styles = styles;
exports.fonts = fonts;
exports.scripts = scripts;
exports.watching = watching;
exports.build = build;

exports.build = series(cleanDist, build)
exports.default = parallel(styles, scripts, pages, watching);