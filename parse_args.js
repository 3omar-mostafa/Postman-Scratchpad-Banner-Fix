let yargs = require('yargs');

const usage = `npm run fix -r requester.js

* For Linux users, requester.js is used
  It can be found on path like this: \${Postman_install_dir}/resources/app/js/requester.js

* For MacOS users, requester.js is used
  It can be found on path like this: \${Postman_install_dir}/Contents/Resources/app/js/requester.js
`

module.exports.args = yargs.usage(usage)
  .option('requester_js', {
    alias: 'r',
    describe: 'Path to requester.js file',
    nargs: 1,
    demandOption: true
  })
  .alias('h', 'help')
  .alias('v', 'version')
  .help('h')
  .argv

