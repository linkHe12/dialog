/**
 * @author 贺翔
 * @file compile sass
 */

const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");

module.exports = function (gulp, config) {
    const scssFilePath = "source/*.scss";
    gulp.task("compilesass", function () {
        return gulp.src("source/*.scss")
            .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(postcss([autoprefixer(config.autoprefixer)]))
            .pipe(gulp.dest('./source/'))
    });

    gulp.task("watch:compilesass", function () {
        gulp.watch(scssFilePath, ["compilesass"]);
    });
};