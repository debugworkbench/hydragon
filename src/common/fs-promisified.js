'use strict';

var fs = require('fs');
var thenify = require('thenify');

exports.readdir = thenify(fs.readdir);
exports.stat = thenify(fs.stat);
exports.readFile = thenify(fs.readFile);
