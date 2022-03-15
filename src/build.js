const fs = require("fs");
const {copyAssetFile} = require("./utils/normalizeCopy");
const {svgToJS} = require("./utils/svgToJS");
const { compressImages } = require('./utils/compressImages');

/*
  Define as pastas de SVGS
  Percorre cada pasta
  define o caminho de entrada e saída
  e chama o método que transfrme o svg em módulo Javascript
*/
const assetModulesFolders = ['icons'];
assetModulesFolders.forEach(asset => {
  const options = {
    inputDir: `src/assets/${asset}`,
    outputDir: `dist/assets/${asset}`
  }

  svgToJS(options);
})
/*
  Cria um arquivo index com o export de todos os módulos javascript SVG
*/

fs.writeFileSync("dist/index.js", `
  import * as icons from "./assets/icons";
  export {
    icons
  }
`)

/*
  Chama o método de compressão para imagens Jpeg
*/
compressImages("src/assets/images", 'dist/assets/images/')

/*
  Percorre a pasta de fonts
  Copia as fonts para a pasta dist
*/
const fontFiles = fs.readdirSync("src/assets/fonts");
fontFiles.forEach(filePath => {
  const sourceFullPath = "src/assets/fonts/" + filePath;
  copyAssetFile(sourceFullPath);
})