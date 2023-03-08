#!/usr/bin/env node

let fs = require('fs');
let path = require('path');
let os = require('os');
let espree = require('espree');
let colors = require('chalk'); // print colored text into console
let asar = require('@electron/asar');
let replace = require("replace");
let workers = require('worker_threads');
let { args } = require('./parse_args');
let { findNestedObject, replaceRangeInString, printDebug } = require("./utils");

/**
 * Get Relevant Files to process, these files are javascript files containing `getWorkingInScratchpadBanner` function,
 * or asar archives
 * @param postmanDirectory Postman Directory to search in
 * @returns Array of strings containing found file paths
 */
function getRelevantFilePaths(postmanDirectory) {
  let searchResults = replace({
    regex: "getWorkingInScratchpadBanner",
    include: "*.js,app.asar",
    paths: [postmanDirectory],
    recursive: true,
    silent: true,
  });
  return searchResults.map(obj => obj.path);
}


function injectCode(rawFileData, searchQuery, replaceString) {
  // We need to reparse the data after each manipulation because we have changed their position
  let parsedJS = espree.parse(rawFileData, { range: true, ecmaVersion: 2022 });
  let parsedObject = findNestedObject(parsedJS, searchQuery);
  let range = parsedObject.range;

  printDebug(rawFileData.substring(range[0], range[1]), replaceString);
  rawFileData = replaceRangeInString(rawFileData, range[0], range[1], replaceString);
  return rawFileData;
}


async function fixPostmanScratchpadBanner(requester_js_path) {
  console.log(colors.yellow(`[INFO] Processing ${colors.bold(requester_js_path)}`));
  try {

    let data = String(await fs.readFileSync(requester_js_path));

    let getWorkingInScratchpadBanner = {
      query: {
        type: 'MethodDefinition',
        key: { name: "getWorkingInScratchpadBanner" }
      },
      replaceString: "getWorkingInScratchpadBanner() { this.closeBanner(); }"
    };

    data = injectCode(data, getWorkingInScratchpadBanner.query, getWorkingInScratchpadBanner.replaceString);

    console.log(colors.yellow(`[INFO] Saving the file into ${colors.bold(requester_js_path)}`));
    await fs.writeFileSync(requester_js_path, data);

  } catch (e) {
    if (args.verbose) {
      console.log(colors.red(`------------------------------------------------`));
      console.log(colors.red(`[ERROR] Error Processing ${colors.bold(requester_js_path)}`));
      console.log(colors.red(`[ERROR] ${e.stack}`));
      console.log(colors.red(`------------------------------------------------`));
    }
  }

  console.log(colors.yellow(`------------------------------------------------`));
}

// Main function
(async function () {

  let postmanDirectory = args.postman_dir;

  for (let filepath of getRelevantFilePaths(postmanDirectory)) {
    if (filepath.toLowerCase().endsWith("app.asar")) {
      let app_asar = filepath;
      let tmpDir = path.join(os.tmpdir(), "postman_app.asar_extracted");
      workers.parentPort.postMessage(tmpDir);

      if (fs.existsSync(tmpDir)) {
        console.log(colors.yellow(`[INFO] Temp Dir '${colors.bold(tmpDir)}' already exists, IT WILL BE DELETED`));
        await fs.rmSync(tmpDir, { recursive: true, force: true });
        console.log(colors.yellow(`[INFO] Successfully Deleted ${colors.blue(tmpDir)}`));
      }
      console.log(colors.yellow(`[INFO] Extracting ${colors.bold(app_asar)} ...`));
      asar.extractAll(app_asar, tmpDir);
      console.log(colors.yellow(`[INFO] Extracted ${colors.bold(app_asar)} into ${colors.bold(tmpDir)}`));

      console.log(colors.yellow(`------------------------------------------------`));
      for (let filepath of getRelevantFilePaths(tmpDir)) {
        await fixPostmanScratchpadBanner(filepath);
      }

      await asar.createPackage(tmpDir, app_asar);
      console.log(colors.yellow(`[INFO] Archived ${colors.bold(tmpDir)} back into ${colors.bold(app_asar)}`));

    } else {
      await fixPostmanScratchpadBanner(filepath);
    }
  }
}
)()
