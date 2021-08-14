#!/usr/bin/env node

let fs = require('fs');
let esprima = require('esprima');
let _ = require('lodash');
let colors = require('chalk'); // print colored text into console
let { args } = require('./parse_args');

/**
 * Get Object containing query from searchObject
 * @param searchObject Large object containing many nested objects
 * @param query The object filter to match
 * @returns Matching Object of the query
 */
function getObject(searchObject, query) {
  if (_.isMatch(searchObject, query)) {
    return searchObject;
  }
  if (searchObject instanceof Array) {
    for (let element of searchObject) {
      let result = getObject(element, query);
      if (result)
        return result;
    }
  } else {
    for (let key in searchObject) {
      if (searchObject[key] instanceof Object || searchObject[key] instanceof Array) {
        let result = getObject(searchObject[key], query);
        if (result)
          return result;
      }
    }
  }
}


function replaceRangeInString(str, start, end, toReplace) {
  if (toReplace === null) {
    return str;
  }
  return str.substring(0, start) + toReplace + str.substring(end);
}

function printDebug(oldString, newString) {
  console.log(`${colors.blue("[DEBUG]")} Replaced '${colors.red(oldString)}' with '${colors.green(newString)}'`);
}

function injectCode(rawFileData, searchQuery, replaceString) {
  // We need to reparse the data after each manipulation because we have changed their position
  let parsedJS = esprima.parseScript(rawFileData, { range: true, tolerant: true });
  let parsedObject = getObject(parsedJS, searchQuery);
  let range = parsedObject.range;

  printDebug(rawFileData.substring(range[0], range[1]), replaceString);
  rawFileData = replaceRangeInString(rawFileData, range[0], range[1], replaceString);
  return rawFileData;
}

(async function () {


    await fs.copyFileSync(args.requester_js, `${args.requester_js}.bak`);
    console.log(colors.yellow(`[INFO] Backed up the file into ${args.requester_js}.bak`));
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
