/**
 * The MIT License (MIT)
 * Copyright (c) 2016 SERPs.com
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var browserify = require('browserify')
var buffer = require('vinyl-buffer')
var connect = require('connect')
var eslint = require('gulp-eslint')
var fs = require('fs')
var gulp = require('gulp')
var gutil = require('gulp-util')
var ngrok = require('ngrok')
var pkg = require('./package.json')
var source = require('vinyl-source-stream')
var sourcemaps = require('gulp-sourcemaps')
var uglify = require('gulp-uglify')


/**
 * Build bundled library
 * Based off autotrack.js gulpfile
 * https://github.com/googleanalytics/autotrack/blob/master/gulpfile.js
 */
gulp.task('build', function(done){

  // Gets the license string from this file (the first 15 lines),
  // and adds an @license tag.
 var license = fs.readFileSync(__filename, 'utf-8')
      .split('\n').slice(0, 15)
      .join('\n').replace(/^\/\*\*/, '/**\n * @license');

  var version = '/*! scroll-depth-tracker.js by SERPs.com v' + pkg.version + ' */';

  browserify('./', {
    debug: false
  })
  .bundle()

  // TODO(philipwalton): Add real error handling.
  // This temporary hack fixes an issue with tasks not restarting in
  // watch mode after a syntax error is fixed.
  .on('error', function(err) { gutil.beep(); done(err); })
  .on('end', done)

  .pipe(source('./scroll-depth-tracker.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(uglify({output: {preamble: license + '\n\n' + version}}))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('./'));

})

var browserSync = require('browser-sync')
var selenium = require('selenium-standalone')
var webdriver = require('gulp-webdriver')

var browserSyncServer, seleniumServer

gulp.task('serve',['build'], function(done){

      browserSyncServer = browserSync({
        open: false,
        port: 9000,
        server: {
          baseDir: ['test', './'],
          routes : {
            '/scripts' : './'
          }
        },
        ui: false
      }, done)

})

gulp.task('selenium', function(done){
  selenium.install({logger: console.log}, () => {
    selenium.start((err, child) => {
      if (err) { 
        return done(err)
      }
      seleniumServer = child
      done()
    });
  });

})

gulp.task('e2e', ['serve', 'selenium'],function(){
  return gulp.src('wdio.conf.js')
    .pipe(webdriver()).on('error', function() {
      seleniumServer.kill()
      process.exit(1)
    })
})

gulp.task('test', ['e2e'], function(){
  browserSyncServer.exit()
  seleniumServer.kill()
  process.exit(1)
})


/**
 * Tests
 */


// var gulp = require('gulp');
// var browserSync = require('browser-sync');
// var webdriver = require('gulp-webdriver');
// var mocha = require('gulp-mocha');

// gulp.task('serve:test', function (done) {
//   browserSync({
//     logLevel: 'silent',
//     notify: false,
//     open: false,
//     port: 9000,
//     server: {
//       baseDir: ['test']
//     },
//     ui: false
//   }, done);
// });

// gulp.task('test', ['serve:test'], function () {
//   return gulp.src('test/spec/**/*.js', {read: false})
//     .pipe(webdriver({
//       desiredCapabilities: {
//         browserName: 'phantomjs'
//       }
//     }))
//     .once('end', function () {
//       browserSync.exit();
//     });
// });