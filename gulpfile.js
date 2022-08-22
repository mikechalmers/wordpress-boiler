import { createRequire } from "module";
const require = createRequire(import.meta.url);

import gulp from 'gulp';
import del from 'del';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass( dartSass );
import cleanCSS from 'gulp-clean-css';
import concat from 'gulp-concat';
import uglify from 'gulp-uglify';
import svgsprite from 'gulp-svg-sprite';
import imagemin, {gifsicle, mozjpeg, optipng, svgo} from 'gulp-imagemin';
import hb from 'gulp-hb';
import ext from 'gulp-ext-replace'

const root = "dist/wp-content/themes/";
const theme = "wordpress";
const themeRoot = root + theme;

export const clean = () => del([themeRoot]);

export function scripts() {
  return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.bundle.js', 'src/js/main.js'], { sourcemaps: true })
    .pipe(uglify())
    .pipe(concat('scripts.min.js'))
    .pipe(gulp.dest(themeRoot + '/js/'));
}

export function styles() {
  return gulp.src('src/scss/main.scss')
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(cleanCSS())
    .pipe(concat('style.css'))
    .pipe(gulp.dest(themeRoot));
}

export function sprite() {
  return gulp.src('src/sprite/**/**/*.svg')
    .pipe(svgsprite({
      shape: { spacing: { padding: 5 } },
      mode: { symbol: true },
      svg: { xmlDeclaration: false, doctypeDeclaration: false, namespaceIDs: false, namespaceClassnames: false }
    }))
    .pipe(concat('sprite.hbs'))
    .pipe(gulp.dest('src/html/partials/global/'));
}

export function images() {
  return gulp.src('src/img/**/**/*')
    .pipe(imagemin([
      gifsicle({interlaced: true}),
      mozjpeg({quality: 75, progressive: true}),
      optipng({optimizationLevel: 5}),
      svgo({
        plugins: [
          {
            name: 'removeViewBox',
            active: true
          },
          {
            name: 'cleanupIDs',
            active: true
          },
          {
            name: 'collapseGroups',
            active: true
          }
        ]
      })
    ]))
    .pipe(gulp.dest(themeRoot + '/img/'));
}

export function html() {
  return gulp.src('src/html/*.hbs')
    .pipe(hb().partials('src/html/partials/**/*.hbs'))
    .pipe(ext('.php'))
    .pipe(gulp.dest(themeRoot));
}

function watchFiles() {
  gulp.watch('src/js/**/*.js', scripts);
  gulp.watch('src/sprite/**/*.svg', sprite);
  gulp.watch('src/html/**/*.hbs', html);
  gulp.watch('src/scss/**/*.scss', styles);
  gulp.watch('src/img/**/*', images);
}

const build = gulp.series(clean, gulp.parallel(sprite, images, scripts, styles, html), watchFiles);

export default build;
