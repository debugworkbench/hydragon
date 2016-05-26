(function () {
  if (process.env.NODE_ENV !== 'production') {
    // React DevTools need to be injected before React is loaded
    require('electron-react-devtools').inject();
  }
  require('../lib/renderer/init-window');
})();
