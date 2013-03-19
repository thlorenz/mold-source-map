'use strict';
/*jshint asi: true */

var test = require('tap').test
  , browserify =  require('browserify')
  , convert    =  require('convert-source-map')
  , mold       =  require('..')

function mapFileUrlComment(sourcemap, cb) {
  setTimeout(function () {
    cb('//@ sourceMappingURL=' + '/bundle.js.map');
  }, 5);
}

function mapFileUrlCommentSync(sourcemap) {
  return '//@ sourceMappingURL=' + '/bundle.js.map';
}

test('mold transform async', function (t) {
  var bundle = '';
  browserify()
    .require(require.resolve('../examples/project/js/main.js'), { entry: true })
    .bundle({ debug: true })
    .pipe(mold.transform(mapFileUrlComment))
    .on('error', function (err) { console.error(err); })
    .on('data', function (data) {
      bundle += data;    
    })
    .on('end', function () {
      t.notOk(~bundle.indexOf('application/json'), 'removes original comment')
      t.ok(~bundle.indexOf('//@ sourceMappingURL=/bundle.js.map'), 'adds returned comment')
      t.end()
    });
});

test('mold transform sync', function (t) {
  var bundle = '';
  browserify()
    .require(require.resolve('../examples/project/js/main.js'), { entry: true })
    .bundle({ debug: true })
    .pipe(mold.transform(mapFileUrlCommentSync))
    .on('error', function (err) { console.error(err); })
    .on('data', function (data) {
      bundle += data;    
    })
    .on('end', function () {
      t.notOk(~bundle.indexOf('application/json'), 'removes original comment')
      t.ok(~bundle.indexOf('//@ sourceMappingURL=/bundle.js.map'), 'adds returned comment')
      t.end()
    });
});
