const fs = require("fs");
const svgsToCompress = require("./assets/svgsToCompress");
const assetModulesFolders = ['brands', 'emojis', 'icons'];
const {compressFile, copyAssetFile, normalizedOutputPath} = require("./utils/generateCompressedBitmaps");
const {svgToJS} = require("./utils/svgToJS");

svgsToCompress.forEach(sourceFilePath => {
  compressFile(sourceFilePath);
  copyAssetFile(sourceFilePath);
})

assetModulesFolders.forEach(asset => {
  const options = {
    inputDir: `src/assets/${asset}`,
    outputDir: `dist/assets/${asset}`
  }

  svgToJS(options);
})

const bitmapFiles = fs.readdirSync("src/assets/images");
bitmapFiles.forEach(filePath => {
  const sourceFullPath = "src/assets/images/" + filePath;
  copyAssetFile(sourceFullPath);
})

fs.writeFileSync("dist/index.js", `
  import * as brands from "./assets/brands";
  import * as emojis from "./assets/emojis";
  import * as icons from "./assets/icons";
  export {
    brands,
    emojis,
    icons
  }
`)