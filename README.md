# mold-source-map [![build status](https://secure.travis-ci.org/thlorenz/mold-source-map.png)](http://travis-ci.org/thlorenz/mold-source-map)

Mold a source map that is almost perfect for you into one that is.

```js
var path       =  require('path')
  , fs         =  require('fs')
  , browserify =  require('browserify')
  , mold       =  require('mold-source-map')
  , bundlePath =  path.join(__dirname, 'project', 'js', 'build', 'bundle.js')
  , jsRoot     =  path.join(__dirname, 'project');

browserify()
  .require(require.resolve('./project/js/main.js'), { entry: true })
  .bundle({ debug: true })
  .on('error', function (err) { console.error(err); })

  // will show all source files relative to jsRoot inside devtools
  .pipe(mold.sourcesRelative(jsRoot))
  .pipe(fs.createWriteStream(bundlePath));
```

## Installation

    npm install mold-source-map

## API


### sourcesRelative(root)

```
/**
 * Adjusts all sources paths inside the source map contained in the content that is piped to it.
 *
 * Example: bundleStream.pipe(mold.sourcesRelative(root)).pipe(fs.createWriteStream(bundlePath))
 *
 * @name sourcesRelative
 * @function
 * @param root {String} The path to make sources relative to.
 * @return {Stream} A duplex stream that writes out content with source map that had all sources paths adjusted.
 */
 ```

## Unstable API

A more custom/advanced API will be/is exposed, however it is still in high fluctuation.

Take a look at the `index.js` to get an idea of what's coming/already there.
