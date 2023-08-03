const {src, dest, watch, parallel, series} = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');

function scripts() {
    return src([
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
            'app/scss/**/*.scss'
        ])
        .pipe(autoprefixer({overrideBrowserslist: ['last 10 version']}))
        .pipe(concat('style.min.css'))
        .pipe(scss({ outputStyle: 'compressed' }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function watching() {
    watch(['app/scss/**/*.scss'], styles);
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
        'app/js/main.min.js',
        'app/**/*.html'
    ], {base : 'app'})
    .pipe(dest('dist'))
}

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
}

exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.browsersync = browsersync;

exports.build = series(cleanDist, build)
exports.default = parallel(styles, scripts, watching, browsersync);