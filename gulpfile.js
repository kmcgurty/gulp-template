const gulp = require('gulp');
const browserSync = require('browser-sync');
const del = require('del');

const pp = require('preprocess');
const map = require('map-stream');
const spawn = require('child_process').spawn;

let src = 'src';
let build = 'build';

//subfolders
let js = "javascript";
let css = "css";
let misc = "misc";

let fileToReload = "";

gulp.task('watch', function(done) {
    gulp.watch([`**/*.*`, `!${build}/**/*.*`]).on('change', function(path) {
        console.log(path + " changed.");
        setFileToReload(path);
    });

    gulp.watch('gulpfile.js', exit);

    gulp.watch(`${src}/${js}/*.*`, gulp.series('build-js', reloadFile));
    gulp.watch(`${src}/${css}/*.*`, gulp.series('build-css', reloadFile));
    gulp.watch(`${src}/*.html`, gulp.series('build-html', reloadFile));
    gulp.watch(`${src}/${misc}/*.*`, gulp.series('clean-build', 'build-all', 'reload'));

    done();
});

gulp.task("browser-sync", function(done) {
    browserSync.init({
        server: `./${build}`,
        open: false,
        port: 5000
    });

    done();
});

gulp.task("build-html", function(done) {
    gulp.src([`${src}/**/*.html`, `!${src}/includes/**`])
        .pipe(map(function(file, cb) {
            var fileContents = file.contents.toString();
            // --- do any string manipulation here ---
            fileContents = pp.preprocess(fileContents, process.env, { type: 'html', srcDir: `${src}/includes` });
            // ---------------------------------------
            file.contents = Buffer.from(fileContents);
            cb(null, file);
        }))
        .pipe(gulp.dest(build));

    done();
});

gulp.task("build-js", function(done) {
    gulp.src(`${src}/${js}/*.js`)
        .pipe(gulp.dest(`${build}/${js}`));

    done();
});

gulp.task("build-css", function(done) {
    gulp.src(`${src}/${css}/*.css`)
        .pipe(gulp.dest(`${build}/${css}`));

    done();
});

gulp.task("build-misc", function(done) {
    gulp.src(`${src}/${misc}/**/*.*`)
        .pipe(gulp.dest(`${build}/${misc}`));

    done();
});

gulp.task('clean-build', function(done) {
    del.sync(`${build}/**`, { force: true });
    done();
});

gulp.task('reload', function(done) {
    browserSync.reload();
    done();
});

function reloadFile(done) {
    browserSync.reload(fileToReload);
    done();
}

function setFileToReload(path) {
    var fileChanged = "";
    var last;

    if (path) {
        let split = path.split("\\");
        split.splice(0, 1);

        fileToReload = split.join("\\");
    }
}

function exit() {
    process.exit();
}

gulp.task("build-all", gulp.parallel("build-html", "build-js", "build-css", "build-misc"));
gulp.task('default', gulp.series('clean-build', 'build-all', 'browser-sync', 'watch'));