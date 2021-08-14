# Postman Scratchpad Banner Fix
### Remove Scratchpad Banner from Postman 8.x.x

# Description
Starting from [Postman](https://www.postman.com/) v8, working locally in scratchpad mode introduces this annoying banner which can't be disabled completely.

![Scratchpad Banner](screenshots/scratchpad-banner.png)

Therefore, I've created this repo to solve the problem, I've patched postman files to disable the scratchpad banner

# Install
* Install [node.js](https://nodejs.org/en/download/)
* Clone this repo `git clone https://github.com/3omar-mostafa/Postman-Scratchpad-Banner-Fix.git`
* `cd Postman-Scratchpad-Banner-Fix`
* Run ***`npm install`*** to install dependencies

# Usage
## Patch your already installed postman
Run ***`npm run fix ${Postman_install_dir}`*** , where ***`${Postman_install_dir}`*** is Postman installation root directory

## Download prepatch postman
You can find downloads for linux and macos at [Releases](https://github.com/3omar-mostafa/Postman-Scratchpad-Banner-Fix/releases)

Windows is not included because its installer is `exe` file which I can not extract and re-create the installer, but you can still patch you existing installation

# Methodology and Manual Patching
The file which is responsible for displaying scratchpad banner is ***`${Postman_install_dir}/app/resources/app/js/requester.js`*** ,  where ***`${Postman_install_dir}`*** is Postman installation root directory

I've made three changes to the file (they are redundant and any one of them is enough, but made three for more reliability)

* ***`getWorkingInScratchpadBanner`***
    * Modified this function to automatically close the scratchpad banner instead of creating it, using ***`this.closeBanner()`*** function call

* ***`SHOW_BANNER_IN_SCRATCHPAD`***
    * Modified this constant to equal ***`HIDE_SCRATCHPAD_BANNER`*** instead

* ***`_constants_ScratchpadConstants__WEBPACK_IMPORTED_MODULE_8__["SHOW_BANNER_IN_SCRATCHPAD"]`***
    * Modified this object to return ***`HIDE_SCRATCHPAD_BANNER`*** instead
