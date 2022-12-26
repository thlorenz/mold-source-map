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
  t.plan(2)
  var bundle = '';
  browserify({ debug: true })
    .require(require.resolve('../examples/project/js/main.js'), { entry: true })
    .bundle()
    .pipe(mold.transform(mapFileUrlComment))
    .on('error', function (err) { console.error(err); })
    .on('data', function (data) {
      bundle += data;    
    })
    .on('end', function () {
      t.notOk(~bundle.indexOf('application/json'), 'removes original comment')
      t.ok(~bundle.indexOf('//@ sourceMappingURL=/bundle.js.map'), 'adds returned comment')
    });
});

test('mold transform async without sourcemap present', function (t) {
  t.plan(3)
  var bundle = '';
  var originalSource;
  browserify({ debug: false })
    .require(require.resolve('../examples/project/js/main.js'), { entry: true })
    .bundle()
    .pipe(mold.transform(function(src, write) {
      originalSource = src.source;
      write(src.source);
    }))
    .on('error', function (err) { console.error(err); })
    .on('data', function (data) {
      bundle += data;
    })
    .on('end', function () {
      t.notOk(~bundle.indexOf('application/json'), 'no inline sourcemap')
      t.notOk(~bundle.indexOf('//@ sourceMappingURL=/bundle.js.map'), 'no external sourcemap')
      t.equal(bundle, originalSource, 'source piped trough without modification')
    });
});

test('mold transform sync', function (t) {
  t.plan(2)
  var bundle = '';
  browserify({ debug: true })
    .require(require.resolve('../examples/project/js/main.js'), { entry: true })
    .bundle()
    .pipe(mold.transform(mapFileUrlCommentSync))
    .on('error', function (err) { console.error(err); })
    .on('data', function (data) {
      bundle += data;    
    })
    .on('end', function () {
      t.notOk(~bundle.indexOf('application/json'), 'removes original comment')
      t.ok(~bundle.indexOf('//@ sourceMappingURL=/bundle.js.map'), 'adds returned comment')
    });
});
