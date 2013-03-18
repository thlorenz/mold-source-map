'use strict';

var path       =  require('path')
  , fs         =  require('fs')
  , browserify =  require('browserify')
  , mold       =  require('..')
  , bundlePath =  path.join(__dirname, 'project', 'js', 'build', 'bundle.js')
  , jsRoot     =  path.join(__dirname, 'project');

browserify()
  .require(require.resolve('./project/js/main.js'), { entry: true })
  .bundle({ debug: true })
  .on('error', function (err) { console.error(err); })
  .pipe(mold.sourcesRelative(jsRoot))
  .pipe(fs.createWriteStream(bundlePath));
