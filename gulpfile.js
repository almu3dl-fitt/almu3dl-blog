var gulp = require('gulp'),
    rename = require('gulp-rename'),
    postcss = require('gulp-postcss'),
    rtlcss = require('rtlcss');

var rtl_css_files = [
    './assets/css/admin-style.css',
];

gulp.task('rtl', function () {
    return gulp.src(rtl_css_files)
        .pipe(postcss([rtlcss]))
        .pipe(rename(function (path) {
            path.basename += '.rtl'
        }))
        .pipe(gulp.dest(function (file) {
            return file.base;
        }));
});

gulp.task('default', gulp.series('rtl'));
