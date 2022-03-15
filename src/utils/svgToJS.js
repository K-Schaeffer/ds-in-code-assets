const fs = require("fs");
const path = require("path");
const fse = require("fs-extra");

/*
** Helper functions
*/
// Encontra caracteres inválidos
const specialCharactherRegex = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/gi;
function matchSpecialCharacters() {
  return new RegExp(specialCharactherRegex);
}
// Remove caracteres inválidos do começo do nome do arquivo
function normalizeName(name) {
  const regex = matchSpecialCharacters();
  return !regex.test(name[0]) ? name[0].toUpperCase() + name.slice(1, name.length) : name[1].toUpperCase() + name.slice(2, name.length);
}
// Transforma no padrão CamelCase
function _camelCase(name) {
  return name.toLowerCase()
    .replace( /[-_]+/g, ' ')
    .replace( /[^\w\s]/g, '')
    .replace( / (.)/g, function($1) { return $1.toUpperCase(); })
    .replace( / /g, '');
}


/*
**
** Cria um módulo Javascript a partir do SVG
**
*/

function svgToJS (config) {
  // Config para deixar o SVG escalável
  const scale = config.scale || 1
  // Lista todos os nomes dos arquivos
  const files = fs.readdirSync(config.inputDir)
  // Cria um array para armazenar todas as informações dos SVGS
  const svgs = [];
  // True ou False se estamos na pasta de icons
  // Somente a pasta de icons terá fill=currentColor
  const isIcon = config.inputDir.includes('icons');

  // Percorre todos os arquivos
  for (const file of files) {
    // Se extensão for diferente de svg passa para o próximo
    if (file.slice(-4) !== '.svg') continue
    // Conteúdo do SVG
    const code = fs.readFileSync(path.join(config.inputDir, file), 'utf-8')
    // Tamanho da viewBox do SVG
    const size = String(code.match(/viewBox="[^"]+/)).slice(9)
    // Nome do arquivo sem extensão
    const name = file.slice(0, -4)

    // Regex para pegar as tags <svg> e </svg>
    // Recriaremos elas com as opções corretas de escala e tamanhos
    const svgExpression = /^[^>]+>|<[^<]+$/g;
    let body = code.replace(svgExpression, '')
                   .replace(/(\r\n|\n|\r)/g, '');

    //  Se estivermos na pasta de icons substituimos o valor de fill para currentColor
    if (isIcon) {
      body = body.replace(/fill="[^"]+/g, 'fill="currentColor')
    }

    // Transforma o nome em camelCase
    const camelCase = name.replace(/-+./g, (m) => m.slice(-1).toUpperCase())
    // Tranforma o a primeira letra em maiuscúla
    const titleCase = camelCase.replace(/./, (m) => m.toUpperCase())
    // Cria altura e largura baseado nos valores iniciais dividido pela escala
    const [w, h] = size.split(' ').slice(2).map((val) => `${(val / scale).toFixed(3)}em`)
    if (!h) throw new Error(`Malformed viewBox in SVG ${file}`)

    // Popula o array com as informações dos SVGS
    svgs.push({
      camelCase,
      titleCase,
      name,
      svg: `<svg viewBox="${size}" class="${name}" width="${w}" height="${h}" aria-hidden="true" focusable="false">${body}</svg>`
    })
  }


  // Inicia variável para arquivo index.js com exports na dist e na src
  let commonAssetIndex = ``;
  let srcAssetIndex = ``;
  // Array para os nomes dos SVGS
  let svgsList = [];

  // Percorre as informações de todos os svgs
  svgs.forEach(({ svg, name }) => {
    // Substitui - por _
    const _name = name.replace(/-/g, '_').toLocaleLowerCase();
    // Remove caracter inválido
    const normalizedName = normalizeName(_camelCase(_name));

    // Cria o conteúdo do js
    const currentFileContent = `const ${normalizedName} = '${svg}';\nexport default ${normalizedName}`;

    // Preenche o index.js com o import do arquivo js e svg para as respectivas pastas de saída
    commonAssetIndex += `import ${normalizedName} from "./${_name}.js";\n`;
    srcAssetIndex += `import ${normalizedName} from "./${name}.svg";\n`;

    // Popula o Array com o nome do SVG
    svgsList.push(normalizedName);

    // Cria o arquivo de módulo javascript do svg atual
    fse.outputFileSync(`${config.outputDir}/${name.replace(/-/g, '_').toLocaleLowerCase()}.js`, currentFileContent);
  });

  // Cria export com todos os svgs
  const exportsAssets = `
  export {
    ${svgs.map(svg => normalizeName(_camelCase(svg.name))).join()}
  }
`
  // Insere o export nos arquivos index
  commonAssetIndex += exportsAssets;
  srcAssetIndex += exportsAssets;

  // Cria os arquivos index
  fse.outputFileSync(`${config.outputDir}/index.js`, commonAssetIndex);
  fse.outputFileSync(`${config.inputDir}/index.js`, srcAssetIndex);

  // Cria um arquivo exported-assets-list com um array de todos os nomes de SVGS
  // É útil para montar o select do storybook ou listar todos os svgs disponíveis
  fse.outputFileSync(`${config.outputDir}/exported-assets-list.js`, `export default ${JSON.stringify(svgsList)}`);
}


module.exports = {
  svgToJS
}