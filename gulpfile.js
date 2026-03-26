var gulp = require('gulp'),
    postcss = require('gulp-postcss')
    cleanCSS = require('gulp-minify-css'),
    rtlCSS = require('rtlcss'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

gulp.task('styles', function () {
    return gulp.src(['./css/*.css', '!./css/*.min.css'])
        .pipe(cleanCSS({
            keepSpecialComments: 1,
            level: 2
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(function (file) {
            return file.base;
        }));
});

gulp.task('scripts', function () {
    return gulp.src(['./js/*.js', '!./js/*.min.js'])
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(function (file) {
            return file.base;
        }));
});

gulp.task('watch', function () {
    gulp.watch(['./css/*.css', '!./css/*.min.css'], ['styles']);
    gulp.watch(['./js/*.js', '!./js/*.min.js'], ['scripts']);
});

gulp.task('rtl', function () {
    return gulp.src('css/better-playlist.css')
        .pipe(postcss([rtlCSS]))

        .pipe(rename({basename: 'better-playlist-rtl'}))
        .pipe(gulp.dest('css/'));
});

gulp.task('default', gulp.series('rtl', 'styles', 'scripts'));
