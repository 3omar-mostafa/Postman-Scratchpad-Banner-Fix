let yargs = require('yargs');

const usage = `Usage:
  npm run fix -p postman_directory
`

module.exports.args = yargs.usage(usage)
  .option('postman_dir', {
    alias: 'p',
    describe: 'Path to Postman Installation Directory',
    nargs: 1
  })
  .option('verbose', {
    alias: 'v',
    describe: 'Increase Verbosity to show Debug and Error messages'
  })
  .demandOption(['postman_dir'])
  .alias('h', 'help')
  .help('h')
  .argv

