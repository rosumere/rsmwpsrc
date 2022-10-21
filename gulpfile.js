const { src, dest, watch, series, parallel } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const browserSync = require("browser-sync").create();
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("gulp-autoprefixer");
const rename = require("gulp-rename");
const gcmq = require("gulp-group-css-media-queries");
const cleanCSS = require("gulp-clean-css");
const gulpif = require("gulp-if");
const image = require("gulp-imagemin");
const webp = require("gulp-webp");
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;

const destFolder = 'www/wp-content/themes/rsmprofiblock/';
let isProd = false;

/**
 * Main styles task
 */
function mainStyles() {
  return src('src/scss/style.scss')
    .pipe(gulpif(!isProd, sourcemaps.init()))
    .pipe(sass())
    .pipe(gulpif(isProd, gcmq()))
    .pipe(
      autoprefixer({
        cascade: false,
        grid: true,
        overrideBrowserslist: ["last 5 versions"],
      })
    )
    .pipe(
      gulpif(
        isProd,
        cleanCSS({
          level: 2,
        })
      )
    )
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulpif(!isProd, sourcemaps.write(".")))
    .pipe(dest(destFolder + '/assets/css'))
    .pipe(browserSync.stream());
}
exports.mainStyles = mainStyles;

/**
 * Vendor styles task
 */
function vendorStyles() {
  return src('src/css/*.{css,min.css}')
    .pipe(concat('vendor.min.css'))
    .pipe(dest(destFolder + 'css'))
}
exports.vendorStyles = vendorStyles;

/**
 * Images task
 */

function images() {
  return src('src/media/**/**.{jpg,jpeg,png,svg}')
    .pipe(
      gulpif(
        isProd,
        image([
          image.mozjpeg({
            quality: 80,
            progressive: true,
          }),
          image.optipng({
            optimizationLevel: 2,
          }),
        ])
      )
    )
    .pipe(dest(destFolder + '/assets/media/'));
}
exports.images = images;

/**
 * Webp images task
 */

function webpImages() {
  return src('src/media/**/**.{jpg,jpeg,png}')
    .pipe(webp())
    .pipe(dest(destFolder + '/assets/media/'));
}
exports.webpImages = webpImages;

/**
 * Copying additional resource task
 */

function resource() {
  return src("src/resource/**").pipe(
    dest(destFolder + '/assets/')
  );
}
exports.resource = resource;

/**
 * Vendor scripts task
 */
function vendorScripts() {
  return src('src/js/vendor/*.{js,min.js}')
    .pipe(concat('vendor.min.js'))
    .pipe(dest(destFolder + 'js/'))
}
exports.vendorScripts = vendorScripts;

/**
 * Main scripts task
 */
function mainScripts() {
  return src('src/js/main.js')
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(dest(destFolder + 'js/'))
}
exports.mainScripts = mainScripts;

/**
 * Watching task
 */

function watching() {
  watch('src/scss/**/*.scss', parallel(mainStyles));
  watch('src/css/**/*.+{css|min.css}', parallel(vendorStyles));
  watch('src/js/**/*.{js,min.js}', parallel(vendorScripts));
  watch('src/js/main.js', parallel(mainScripts));
  watch('src/**/**.{jpg,jpeg,png,svg}', images);
  watch('src/**/**.{jpg,jpeg,png}', webpImages);
}
exports.watching = watching;


exports.default = parallel(
  vendorStyles,
  vendorScripts,
  mainScripts,
  styles,
  images,
  webpImages,
  resource,
  watching
);
