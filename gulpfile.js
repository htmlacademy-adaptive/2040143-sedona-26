import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import sqoosh from 'gulp-libsquoosh';
import svgstore from 'gulp-svgstore';
import del from 'del';
import svgo from 'gulp-svgmin';
import terser from 'gulp-terser';


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
const optimizeImages = () => {
  return gulp.src('source/images/**/*.{jpg,png}')
    .pipe(sqoosh())
    .pipe(gulp.dest('build/images'))
}


//webP

const createWebP = () => {
  return gulp.src('source/images/**/*.{jpg,png}')
    .pipe(sqoosh({
      webp: {}
    }))
    .pipe(gulp.dest('build/images'))
}


//svg

const sprite = () => {
  return gulp.src(['source/images/slogan/*.svg', 'source/images/icons/**/*.svg', '!source/images/icons/advantage-icons/*.svg'])
    .pipe(svgo())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/images'))
}

//copy

const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff,woff2}',
    'source/*.ico',
    'source/images/**/*'
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done()
}

function copyImages() {
  return gulp.src('source/images/**/*.{jpg,png}')
    .pipe(gulp.dest('build/images'));
}

//clean

const clean = () => {
  return del('build')
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/*.js', gulp.series(script));
  gulp.watch('source/*.html', gulp.series(html, reload));
};


export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    html,
    styles,
    sprite,
    script,
    createWebP
  ),
  gulp.series(
    server,
    watcher
  )
);

//build

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    sprite,
    script,
    createWebP
  )
)
