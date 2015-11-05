Debug Workbench
===============
Extensible multi-platform debugger frontend.

Development
===========

Prerequisites
-------------
- [Node.js](https://nodejs.org/) **4.x.x**
- [NPM](https://www.npmjs.com/) **3.x.x** (2.x.x may also work)
- [Bower](http://bower.io/) - `npm install bower -g`
- [Grunt](http://gruntjs.com) - `npm install grunt-cli -g`

Setup
-----
Clone this repository and then do:
```
npm install
cd build
npm install
grunt rebuild-native-modules
```

To build just execute `grunt`, then you can run the app with `npm start`.

Debugging JavaScript in the main process
----------------------------------------
[node-inspector](https://github.com/node-inspector/node-inspector) can be used to debug JavaScript
code running in the main Electron process, to launch `node-inspector` run
`grunt run-node-inspector` from the `build` directory.

You will see a URL printed out, e.g. `http://127.0.0.1:8080/?ws=127.0.0.1:8080&port=5858`
open it in Chrome. Now launch Electron with the `--debug-brk` or `--debug` argument
(this part will be handled by a Grunt task soon).

License
=======
MIT
