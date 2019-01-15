const debug = require('debug')('sayori');
const walk = require('walk');
const path = require('path');

const DEFAULT_ACTIONS_PATH = 'actions';
const VERBS = [
  'checkout',
  'copy',
  'delete',
  'get',
  'head',
  'lock',
  'merge',
  'mkactivity',
  'mkcol',
  'move',
  'm-search',
  'notify',
  'options',
  'patch',
  'post',
  'purge',
  'put',
  'report',
  'search',
  'subscribe',
  'trace',
  'unlock',
  'unsubscribe',
];

module.exports = (app, options = {}) => {
  debug('Initialized');

  const base = path.dirname(require.main.filename);
  const actionsPath = `${base}/${DEFAULT_ACTIONS_PATH}`;

  const walkerOptions = {
    listeners: {
      names(root, nodeNamesArray) {
        nodeNamesArray.sort((a, b) => {
          if (a > b) return 1;
          if (a < b) return -1;
          return 0;
        });
      },

      file(root, fileStats, next) {
        const verb = fileStats.name.split('.')[0];
        if (!VERBS.includes(verb)) {
          next();
          return;
        }

        const pth = root.replace(actionsPath, '').replace('_', ':');

        const m = require(`${root}/${fileStats.name}`); // eslint-disable-line

        debug('Registered route %o', { path: pth, verb });

        app[verb](pth, ...m);
      },

      errors(root, nodeStatsArray, next) {
        debug('Errored on file %s', `${root}/${nodeStatsArray[0].name}`);
        // Not doing `throw nodeStatsArray[0].error` to have nicer appearance in the traceback
        const errorRegisteringRoute = nodeStatsArray[0].error;
        throw errorRegisteringRoute;
      },
    },
  };

  walk.walkSync(actionsPath, walkerOptions);
};
