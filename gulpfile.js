var path = require('path'),
    gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-htmlmin'),
    html2js = require('gulp-html2js'),
    jade = require('gulp-jade'),
    connect = require('gulp-connect'),
    karma = require('gulp-karma'),
    jshint = require('gulp-jshint'),
    minifyCSS = require('gulp-minify-css'),

    ngmin = require('gulp-ngmin'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    template = require('gulp-template'),
    using = require('gulp-using'),

    map = require('map-stream'),


    imagemin = require('gulp-imagemin'),
    protractor = require("gulp-protractor").protractor,
    program = require('commander'),
    stylish = require('jshint-stylish'),
    debug = false,
    WATCH_MODE = 'watch',
    RUN_MODE = 'run';

var mode = RUN_MODE;

/**
 * Load in our build configuration file.
 */
var userConfig = require( './build.config.js' );

/**
 * We read in our `package.json` file so we can access the package name and
 * version. It's already there, so we don't repeat ourselves here.
 */
var pkg = require('./package.json');

console.log("userConfig", userConfig.build_dir);
function list(val) {
    return val.split(',');
}

/**
 * A utility function to get all app JavaScript sources.
 */
function filterForJS ( files ) {
  return files.filter( function ( file ) {
    return file.match( /\.js$/ );
  });
}

/**
 * A utility function to get all app CSS sources.
 */
function filterForCSS ( files ) {
  return files.filter( function ( file ) {
    return file.match( /\.css$/ );
  });
}

function filesUsed(options) {
    options = options || {};
    return map(function(file, cb) {
        var f = file.path.replace(file.cwd, '.');
        if (options.path == 'relative') { f = file.relative; }
        else if (options.path == 'path') { f = file.path; }

        //console.log('FIL: ', f);
        options.files.data.push(f);
        cb(null, file);
    });
}
program
    .version('0.0.1')
    .option('-t, --tests [glob]', 'Specify which tests to run')
    .option('-b, --browsers <items>', 'Specify which browsers to run on', list)
    .option('-r, --reporters <items>', 'Specify which reporters to use', list)
    .parse(process.argv);

gulp.task('js', function() {
    var jsTask = gulp.src('src/**/*.js');
    if (!debug) {
        console.log("js debug false");
        jsTask.pipe(uglify());
    }
    jsTask.pipe(gulp.dest('build/src'))
        .pipe(connect.reload());
});

gulp.task('template', function() {
    var templateTask = gulp.src('src/template/**/*.html');
    if (!debug) {
        templateTask.pipe(htmlmin({
            collapseWhitespace: true
        }));
    }
    templateTask.pipe(gulp.dest('build/template'))
        .pipe(connect.reload());
});

gulp.task('html2js', function() {
    var html2jsTask = gulp.src('src/**/*.html');
    if (!debug) {
        html2jsTask.pipe(html2js({
            outputModuleName: 'templates-app',
            useStrict: true
        }));
    }
    html2jsTask
      .pipe(concat('templates-app.js'))
      .pipe(gulp.dest('build/src/app'))
      .pipe(connect.reload());
});

gulp.task('clean', function () {
  return gulp.src(userConfig.build_dir)
    .pipe(clean({force: true}));
});

gulp.task('copy-assets', function () {
    return gulp.src('src/assets/**')
    .pipe(gulp.dest('build/src/assets'));
});

gulp.task('index', function() {
    var jsFiles = Array.prototype.concat(userConfig.app_files.js, userConfig.vendor_files.js);

    var dirRE = new RegExp( '^('+userConfig.build_dir+'|'+userConfig.compile_dir+')\/', 'g' );
    var jsFiles = filterForJS( jsFiles ).map( function ( file ) {
      return file.replace( dirRE, '' );
    });
    //var cssFiles = filterForCSS( userConfig.app_files.less ).map( function ( file ) {
    //  return file.replace( dirRE, '' );
    //});

    return gulp.src(userConfig.app_files.html)
    .pipe(template({
        scripts: jsFiles,
        styles: ['aba', 'cece'],
        version: pkg.version
    }))
    .pipe(gulp.dest('build/src'));
});

gulp.task('css', function() {
    var options = {
        errLogToConsole: true
    };
    if (!debug) {
        options.outputStyle = 'expanded';
        options.sourceComments = 'map';
    }
    var cssTask = gulp.src('src/less/main.less')
        .pipe(less(options));
    if (!debug) {
        cssTask.pipe(minifyCSS());
    }
    cssTask.pipe(gulp.dest('public/css'))
        .pipe(connect.reload());
});

gulp.task('image', function() {
    gulp.src('src/image/**.*')
        .pipe(imagemin())
        .pipe(gulp.dest('public/image'))
        .pipe(connect.reload());
});

gulp.task('lint', function() {
    gulp.src('src/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('karma', function() {
    // undefined.js: unfortunately necessary for now
    return gulp.src(['undefined.js'])
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: mode,
            tests: program.tests,
            reporters: program.reporters || ['progress'],
            browsers: program.browsers || ['PhantomJS']
        }))
        .on('error', function() {});
});

gulp.task('protractor', function(done) {
    gulp.src(["test/ui/**/*.js"])
        .pipe(protractor({
            configFile: 'protractor.conf.js',
            args: [
                '--baseUrl', 'http://127.0.0.1:8080',
                '--browser', program.browsers ? program.browsers[0] : 'phantomjs'
            ]
        }))
        .on('end', function() {
            if (mode === RUN_MODE) {
                connect.serverClose();
            }
            done();
        })
        .on('error', function() {
            if (mode === RUN_MODE) {
                connect.serverClose();
            }
            done();
        });
});

gulp.task('connect', function() {
    if (mode === WATCH_MODE) {
        gulp.watch(['index.html'], function() {
            gulp.src(['index.html'])
                .pipe(connect.reload());
        });
    }

    connect.server({
        livereload: mode === WATCH_MODE
    });
});

gulp.task('watch-mode', function() {
    mode = WATCH_MODE;

    var jsWatcher = gulp.watch('src/js/**/*.js', ['js']),
        cssWatcher = gulp.watch('src/less/**/*.less', ['css', 'protractor']),
        imageWatcher = gulp.watch('src/assets/images/**/*', ['image']),
        htmlWatcher = gulp.watch('src/template/**/*.html', ['template', 'protractor']),
        testWatcher = gulp.watch('test/**/*.js', ['karma', 'protractor']);

    jsWatcher.on('change', changeNotification);
    cssWatcher.on('change', changeNotification);
    imageWatcher.on('change', changeNotification);
    htmlWatcher.on('change', changeNotification);
    testWatcher.on('change', changeNotification);
});

gulp.task('debug', function() {
    debug = true;
});

function changeNotification(event) {
    console.log('File', event.path, 'was', event.type, ', running tasks...');
}
gulp.task('assets', ['css', 'js', 'lint', 'index', 'image', 'html2js']);
gulp.task('all', ['assets', 'protractor', 'karma']);
gulp.task('default', ['watch-mode', 'all']);
gulp.task('server', ['connect', 'default']);
gulp.task('test', ['debug', 'connect', 'all']);