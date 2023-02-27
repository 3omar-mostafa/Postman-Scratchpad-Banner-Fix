# Postman Scratchpad Banner Fix
### Remove Scratchpad Banner from Postman 8.x.x, 9.x.x and 10.x.x

# Description
Starting from [Postman](https://www.postman.com/) v8, working locally in scratchpad mode introduces this annoying banner which can't be disabled completely.

![Scratchpad Banner](screenshots/scratchpad-banner.png)

Therefore, I've created this repo to solve the problem, I've patched postman files to disable the scratchpad banner

Tested on Postman versions from *`8.1.0`* to *`10.10.9`*

# Install
* Install [node.js](https://nodejs.org/en/download/)
* Clone this repo `git clone https://github.com/3omar-mostafa/Postman-Scratchpad-Banner-Fix.git`
* `cd Postman-Scratchpad-Banner-Fix`
* Run ***`npm install`*** to install dependencies

# Usage
## Patch your already installed postman
Run ***`node fix.js -p ${postman_dir}`*** , where ***`${postman_dir}`*** is Postman installation directory

## Download patched postman
* You can find downloads for Linux and MacOS at [Releases](https://github.com/3omar-mostafa/Postman-Scratchpad-Banner-Fix/releases)
* Windows is not included because its installer is *`exe`* file which I can extract and patch the files, but unfortunately I can not re-create the same installer, but you can still patch you existing installation

# Methodology and Manual Patching
* There are some files which are responsible for displaying scratchpad banner as ***`requester.js`*** and ***`scratchpad.js`*** in newer versions
* These files contains ***`getWorkingInScratchpadBanner`*** , ***`getScratchpadBannerMode`*** functions and  ***`SHOW_BANNER_IN_SCRATCHPAD`*** flag

I've made changes to these files

* ***`getWorkingInScratchpadBanner`***
    * Modified this function to automatically close the scratchpad banner instead of creating it, using ***`this.closeBanner()`*** function call

If you are on windows/macos, you may find no code in Postman installation directory, instead you may find ***`app.asar`*** file (which is like a tar archive file) and you can use [asar](https://github.com/electron/asar#command-line-utility) to extract ***`app.asar`*** and modify the files then repack it again

# Notes
This repo use github actions to automate checking for new releases every month, also can run manually for custom version

To do this you should fork this repo and go to Actions tab and enable Github Actions

You can see [this guide](https://docs.github.com/en/actions/managing-workflow-runs/manually-running-a-workflow) to manually run an Action
