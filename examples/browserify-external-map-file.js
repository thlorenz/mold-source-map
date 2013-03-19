'use strict';

var path       =  require('path')
  , fs         =  require('fs')
  , browserify =  require('browserify')
  , mold       =  require('..')
  , bundlePath =  path.join(__dirname, 'project', 'js', 'build', 'bundle.js')
  , mapFilePath =  path.join(__dirname, 'project', 'js', 'build', 'bundle.js.map');

function mapFileUrlComment(sourcemap, cb) {
  fs.writeFile(mapFilePath, sourcemap.toJSON(2), 'utf-8', function (err) {
    if (err) return console.error(err);
    cb('//@ sourceMappingURL=' + mapFilePath);
  });
}

browserify()
  .require(require.resolve('./project/js/main.js'), { entry: true })
  .bundle({ debug: true })
  .on('error', function (err) { console.error(err); })
  .pipe(mold.transform(mapFileUrlComment))
  .pipe(fs.createWriteStream(bundlePath));

console.log('Please open the index.html inside examples/project.');
console.log('An external map file was generated at: ', path.relative(process.cwd(), mapFilePath));
