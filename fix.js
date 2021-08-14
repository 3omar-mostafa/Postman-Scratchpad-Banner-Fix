#!/usr/bin/env node

let fs = require('fs');
let esprima = require('esprima');
let colors = require('chalk'); // print colored text into console
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

(async function () {

    let data = String(await fs.readFileSync(args.requester_js));

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

    console.log(colors.yellow(`[INFO] Saving the file into ${args.requester_js}`))
    await fs.writeFileSync(args.requester_js, data);

  }
)()
