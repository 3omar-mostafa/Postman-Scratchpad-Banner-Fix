let yargs = require('yargs');

const usage = `npm run fix [-r requester.js] | [-a app.asar]
You must only use -r or -a but not both

* For Windows users, app.asar is used
  It can be found on path like this: %localappdata%\\Postman\\app-8.10.0\\resources\\app.asar

* For Linux users, requester.js is used
  It can be found on path like this: \${Postman_install_dir}/resources/app/js/requester.js

* For MacOS users, requester.js is used
  It can be found on path like this: \${Postman_install_dir}/Contents/Resources/app/js/requester.js
`

module.exports.args = yargs.usage(usage)
  .option('requester_js', {
    alias: 'r',
    describe: 'Path to requester.js file',
    nargs: 1
  })
  .option('app_asar', {
    alias: 'a',
    describe: 'Path to app.asar file',
    nargs: 1
  })
  .conflicts('requester_js', 'app_asar')
  .check((argv) => {
    if (!(argv.app_asar || argv.requester_js)) {
      throw new Error("You need to provide either requester.js or app.asar");
    }
    return true;
  })
  .alias('h', 'help')
  .alias('v', 'version')
  .help('h')
  .argv

