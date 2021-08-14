#!/usr/bin/env node

let fs = require('fs');
let path = require('path');
let os = require('os')
let esprima = require('esprima');
let colors = require('chalk'); // print colored text into console
let asar = require('asar');
let { args } = require('./parse_args');
let { findNestedObject, replaceRangeInString, printDebug } = require("./utils");


function injectCode(rawFileData, searchQuery, replaceString) {
  // We need to reparse the data after each manipulation because we have changed their position
  let parsedJS = esprima.parseScript(rawFileData, { range: true, tolerant: true });
  let parsedObject = findNestedObject(parsedJS, searchQuery);
  let range = parsedObject.range;

  printDebug(rawFileData.substring(range[0], range[1]), replaceString);
  rawFileData = replaceRangeInString(rawFileData, range[0], range[1], replaceString);
  return rawFileData;
}


async function fixPostmanScratchpadBanner(requester_js_path) {

    let data = String(await fs.readFileSync(requester_js_path));

    let getWorkingInScratchpadBanner = {
      query: {
        type: 'MethodDefinition',
        key: { name: "getWorkingInScratchpadBanner" }
      },
      replaceString: "getWorkingInScratchpadBanner() { this.closeBanner(); }"
    };

    data = injectCode(data, getWorkingInScratchpadBanner.query, getWorkingInScratchpadBanner.replaceString);

    let RETURN_SHOW_BANNER_IN_SCRATCHPAD = {
      query: {
        type: 'ReturnStatement',
        argument: { type: 'Identifier', name: 'SHOW_BANNER_IN_SCRATCHPAD' }
      },
      replaceString: "return HIDE_SCRATCHPAD_BANNER;"
    };

    data = injectCode(data, RETURN_SHOW_BANNER_IN_SCRATCHPAD.query, RETURN_SHOW_BANNER_IN_SCRATCHPAD.replaceString);

    let CONST_SHOW_BANNER_IN_SCRATCHPAD = {
      query: {
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: 'SHOW_BANNER_IN_SCRATCHPAD' }
      },
      replaceString: "SHOW_BANNER_IN_SCRATCHPAD = HIDE_SCRATCHPAD_BANNER;"
    };

    data = injectCode(data, CONST_SHOW_BANNER_IN_SCRATCHPAD.query, CONST_SHOW_BANNER_IN_SCRATCHPAD.replaceString);

    console.log(colors.yellow(`[INFO] Saving the file into ${requester_js_path}`))
    await fs.writeFileSync(requester_js_path, data);

}

(async function () {

    if (args.app_asar) {
      let tmpDir = path.join(os.tmpdir(), "postman_app.asar_extracted");
      asar.extractAll(args.app_asar, tmpDir);
      console.log(colors.yellow(`[INFO] Extracted ${args.app_asar} into ${tmpDir}`));
      let requester_js = path.join(tmpDir, 'js', 'requester.js');

      await fixPostmanScratchpadBanner(requester_js);

      await asar.createPackage(tmpDir, args.app_asar);
      console.log(colors.yellow(`[INFO] Archived ${tmpDir} back into ${args.app_asar}`));
      await fs.rmSync(tmpDir, { recursive: true });

    } else {
      await fixPostmanScratchpadBanner(args.requester_js);
    }

  }
)()
