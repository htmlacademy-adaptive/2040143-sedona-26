import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import scoosh from 'gulp-libsquoosh';
import svgo from 'svgo';
import svgstore from 'svgstore';
import del from 'del';


// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

//html

const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

//reload

const reload = (done) => {
  browser.reload();
  done();
}



//script
const script = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'))
}

//images
const images = () => {
  return gulp.src('source/images/**/*.{jpg,png}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/images'))
}


//webP

const createWebP = () => {
  return gulp.src('source/images/**/*.{jpg,png}')
    .pipe(scoosh({
      webp: {}
    }))
    .pipe(gulp.dest('build/images'))
}


//svg

const svg = () => {
  return gulp.src(['source/images/logos/*.svg', 'source/images/icons/advantage-icons*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/images'))
}

const sprite = () => {
  return (['source/images/slogan/*.svg', 'source/images/icons/**/*.svg', '!source/images/icons/advantage-icons*.svg'])
    .pipe(svgo())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename(sprite.svg))
    .pipe(gulp.dest('build/images'))
}

//copy

const copy = () => {
  gulp.src([
    'source/fonts/*.{woff,woff2}',
    'source/*.ico',
  ], {
    base: 'sourse'
  })
    .pipe(gulp.dest('build'))
}

//clean

const clean = () => {
  return del('build')
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/*.html').on('change', browser.reload);
}


export default gulp.series(
  html, styles, server, watcher
);

//build

export const build = gulp.series(
  clean,
  copy,
  images,
  gulp.parallel(
    styles,
    html,
    svg,
    sprite,
    script,
    createWebP
  )
)
