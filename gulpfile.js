'use strict';

const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const browserSync = require('browser-sync').create();
const { deleteAsync } = require('del');

const paths = {
  html: {
    src: 'src/**/*.html',
    dest: 'dist'
  },
  styles: {
    entry: 'src/scss/style.scss',
    src: 'src/scss/**/*.scss',
    dest: 'dist/assets/css'
  },
  assets: {
    src: 'src/assets/**/*',
    dest: 'dist/assets'
  }
};

function clean() {
  return deleteAsync(['dist']);
}

function html() {
  return src(paths.html.src).pipe(dest(paths.html.dest)).pipe(browserSync.stream());
}

function styles() {
  return src(paths.styles.entry)
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: 'expanded'
      }).on('error', sass.logError)
    )
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

function stylesBuild() {
  return src(paths.styles.entry)
    .pipe(
      sass({
        outputStyle: 'expanded'
      }).on('error', sass.logError)
    )
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest(paths.styles.dest));
}

function assets() {
  return src(paths.assets.src).pipe(dest(paths.assets.dest)).pipe(browserSync.stream());
}

function server(done) {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
    notify: false,
    open: false,
    port: 3000
  });

  done();
}

function watcher() {
  watch(paths.html.src, html);
  watch(paths.styles.src, styles);
  watch(paths.assets.src, assets);
}

const build = series(clean, parallel(html, stylesBuild, assets));
const dev = series(clean, parallel(html, styles, assets), server, watcher);

exports.clean = clean;
exports.html = html;
exports.styles = styles;
exports.assets = assets;
exports.build = build;
exports.default = dev;
