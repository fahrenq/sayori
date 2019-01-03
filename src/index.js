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
        console.log({ pth });
        const m = require(`${root}/${fileStats.name}`);

        app[verb](pth, ...m);
      },
    },
  };

  walk.walkSync(actionsPath, walkerOptions);
};
