const fs = require('fs');
const fse = require("fs-extra");

/*
** Helper functions
*/
//  Se cria pasta se o destino não existir
function createOutputDirSync(dirPath){
  if (!fs.existsSync(dirPath)){
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
// Cria caminhos de saída do diretorio e arquivo
function normalizedOutputPath(sourceFilePath){
  // Cria caminho de destino do arquivo substituindo src por dist
  const outputFilePath = sourceFilePath.replace("src", "dist");

  // Cria o caminho de destino do diretório excluindo o nome do arquivo da variável outputFilePath
  const outputDirArr = outputFilePath.split("/");
  outputDirArr.pop();
  const outputDirPath = outputDirArr.join("/");

  return {
    outputDirPath,
    outputFilePath
  }
}

/*
** Método que copia os arquivos para a pasta de destino
*/

function copyAssetFile(sourceFilePath){
  // Cria os caminhos da pasta e do arquivo
  const output = normalizedOutputPath(sourceFilePath)
  // Cria a pasta fisicamente se ele não existir
  createOutputDirSync(output.outputDirPath)
  // Copia os arquivos para o destino
  fse.copyFileSync(sourceFilePath, output.outputFilePath);
}

module.exports = {
  normalizedOutputPath,
  copyAssetFile
}