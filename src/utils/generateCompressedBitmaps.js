const { convertFile }  = require('convert-svg-to-png');
const fs = require('fs');
const fse = require("fs-extra");

function createOutputDirSync(dirPath){
  if (!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function normalizedOutputPath(sourceFilePath){
  const outputFilePath = sourceFilePath.replace("src", "dist").replace("svg", "png");
  const outputDirArr = outputFilePath.split("/");
  outputDirArr.pop();
  const outputDirPath = outputDirArr.join("/");

  return {
    outputDirPath,
    outputFilePath
  }
}

function compressFile(sourceFilePath){
  const output = normalizedOutputPath(sourceFilePath);
  createOutputDirSync(output.outputDirPath);

  (async () => {
    //COMPRESS SVG FILE TO A TINY BITMAP IMAGE (PNG)
    await convertFile(sourceFilePath, {outputFilePath: output.outputFilePath});
  })();
}

function copyAssetFile(sourceFilePath){
  const output = normalizedOutputPath(sourceFilePath)
  createOutputDirSync(output.outputDirPath)

  fse.copyFileSync(sourceFilePath, output.outputFilePath);
}

module.exports = {
  normalizedOutputPath,
  compressFile,
  copyAssetFile
}