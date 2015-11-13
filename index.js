'use strict';

var convert = require('convert-source-map')
  , inherits = require('util').inherits
  , concat = require('concat-stream')
  , through = require('through')
  , duplex = require('duplexer')
  , path = require('path');

function extractComment (source) {
  var m = source.match(convert.commentRegex);
  return m ? m.pop() : null;
} 

function Molder(sourcemap) {
  this.sourcemap = sourcemap;
}

Molder.prototype.toJSON    =  function (space) { return this.sourcemap.toJSON(space); };
Molder.prototype.toBase64  =  function () { return this.sourcemap.toBase64(); };
Molder.prototype.toComment =  function () { return this.sourcemap.toComment(); };
Molder.prototype.toObject  =  function () { return this.sourcemap.toObject(); };

Molder.prototype._map = function (key, fn) {
  this.sourcemap.setProperty(key, this.sourcemap.getProperty(key).map(fn));
};

Molder.prototype.mapSources = function (fn) {
  this._map('sources', fn);
};

Molder.prototype.mapSourcesContent = function (fn) {
  this._map('sourcesContent', fn);
};

Molder.prototype.file = function (file) {
  this.sourcemap.setProperty('file', file);
};

Molder.prototype.sourceRoot = function (sourceRoot) {
  this.sourcemap.setProperty('sourceRoot', sourceRoot);
};

function SourceMolder(source) {
  this.source = source;
  this.comment = extractComment(source);
  if (!this.comment) return undefined;

  var sm = convert.fromComment(this.comment);
  Molder.call(this, sm);
}

inherits(SourceMolder, Molder);

SourceMolder.prototype.replaceComment = function () {
  var moldedComment = this.sourcemap.toComment();
  return this.source.replace(this.comment, moldedComment);
};

function mapToTransform(fnKey, mapFn) {
  var output = through();

  return duplex(concat(done), output);

  function done (data) { 
    var source = data.toString();
    var sourceMolder = fromSource(source);
    sourceMolder[fnKey](mapFn);
    output.queue(sourceMolder.replaceComment());
    output.queue(null);
  }
}

var fromSource = exports.fromSource = function (source) {
  return new SourceMolder(source);
};

function mapPathRelativeTo (root) {
  return function map(file) {
    return path.relative(root, file);
  };
}

exports.mapPathRelativeTo = mapPathRelativeTo;

exports.transform = function (fn) {
  var output = through();

  return duplex(concat(done), output);

  function done (data) { 
    var source = data.toString();
    var sourceMolder = fromSource(source);

    function queue(adaptedComment) {
      output.queue(source.replace(sourceMolder.comment, adaptedComment));
      output.queue(null);
    }

    if (fn.length === 1) {
      var adaptedComment = fn(sourceMolder);
      queue(adaptedComment);
    } else if (fn.length > 1) {
      fn(sourceMolder, queue);
    } else {
      throw new Error('Function passed to transform needs to take 1 or 2 parameters.');
    }
  }   
};

exports.transformSourcesContent = function (map) {
  return mapToTransform('mapSourcesContent', map);
};

exports.transformSources = function (map) {
  return mapToTransform('mapSources', map);
};

/**
 * Adjusts all sources paths inside the source map contained in the content that is piped to it.
 *
 * Example: bundleStream.pipe(mold.sourcesRelative(root)).pipe(fs.createWriteStream(bundlePath))
 *
 * @name transformSourcesRelativeTo
 * @function
 * @param root {String} The path to make sources relative to.
 * @return {Stream} A duplex stream that writes out content with source map that had all sources paths adjusted.
 */
exports.transformSourcesRelativeTo = function (root) {
  return exports.transformSources(mapPathRelativeTo(root));
};

