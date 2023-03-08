#!/usr/bin/env node
let colors = require('chalk'); // print colored text into console
let fs = require('fs');
let workers = require('worker_threads');
let process = require('process');

let worker = new workers.Worker('./worker.js', { argv: process.argv });
let asar_extraction_dir;

worker.on('message', (asar_dir) => {
  asar_extraction_dir = asar_dir;
});

process.on('SIGINT', async () => {
  console.log(colors.yellow(`[INFO] Detected Ctrl+C, Exiting after cleaning resources`));
  if (asar_extraction_dir) {
    try {
      await fs.rmSync(asar_extraction_dir, { recursive: true, force: true });
    } catch { }
    finally {
      console.log(colors.yellow(`[INFO] Deleted ${colors.bold(asar_extraction_dir)}`));
      process.exit();
    }
  }
});
