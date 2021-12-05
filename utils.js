let _ = require('lodash');
let { args } = require('./parse_args');
let colors = require('chalk'); // print colored text into console


/**
 * Get Object containing query from searchObject
 * @param searchObject Large object containing many nested objects
 * @param query The object filter to match
 * @returns Matching Object of the query
 */
function findNestedObject(searchObject, query) {
  if (_.isMatch(searchObject, query)) {
    return searchObject;
  }
  if (searchObject instanceof Array) {
    for (let element of searchObject) {
      let result = findNestedObject(element, query);
      if (result)
        return result;
    }
  } else {
    for (let key in searchObject) {
      if (searchObject[key] instanceof Object || searchObject[key] instanceof Array) {
        let result = findNestedObject(searchObject[key], query);
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
  if (args.verbose) {
    console.log(`${colors.blue("[DEBUG]")} Replaced '${colors.red(oldString)}' with '${colors.green(newString)}'`);
  }
}

module.exports = { findNestedObject, replaceRangeInString, printDebug };
