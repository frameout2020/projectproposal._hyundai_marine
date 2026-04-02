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
    dest: 'dist',
    docsDest: 'docs'
  },
  styles: {
    entry: 'src/scss/style.scss',
    src: 'src/scss/**/*.scss',
    dest: 'dist/assets/css',
    docsDest: 'docs/assets/css'
  },
  assets: {
    src: 'src/assets/**/*',
    dest: 'dist/assets',
    docsDest: 'docs/assets'
  }
};

function clean() {
  return deleteAsync(['dist']);
}

function cleanBuild() {
  return deleteAsync(['dist', 'docs']);
}

function html() {
  return src(paths.html.src).pipe(dest(paths.html.dest)).pipe(browserSync.stream());
}

function htmlBuild() {
  return src(paths.html.src).pipe(dest(paths.html.dest)).pipe(dest(paths.html.docsDest));
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
    .pipe(dest(paths.styles.dest))
    .pipe(dest(paths.styles.docsDest));
}

function assets() {
  return src(paths.assets.src).pipe(dest(paths.assets.dest)).pipe(browserSync.stream());
}

function assetsBuild() {
  return src(paths.assets.src).pipe(dest(paths.assets.dest)).pipe(dest(paths.assets.docsDest));
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

const build = series(cleanBuild, parallel(htmlBuild, stylesBuild, assetsBuild));
const dev = series(clean, parallel(html, styles, assets), server, watcher);

exports.clean = clean;
exports.html = html;
exports.styles = styles;
exports.assets = assets;
exports.cleanBuild = cleanBuild;
exports.htmlBuild = htmlBuild;
exports.assetsBuild = assetsBuild;
exports.build = build;
exports.default = dev;
