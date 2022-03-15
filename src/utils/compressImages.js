const compress_images = require('compress-images');

/*
** Uso da lib Compress-images
** Veja documentação em
** https://www.npmjs.com/package/compress-images
*/

function compressImages(inputDir, outputDir) {
  // We will be compressing images [jpg] with two algorithms, [webp] and [jpg];

  //[jpg] ---to---> [webp]
  compress_images(
    inputDir+"/*.{jpg,JPG,jpeg,JPEG}",
    outputDir,
    { compress_force: false, statistic: true, autoupdate: true },
    false,
    { jpg: { engine: "webp", command: false } },
    { png: { engine: false, command: false } },
    { svg: { engine: false, command: false } },
    { gif: { engine: false, command: false } },
    function (err) {
      if (err === null) {
        //[jpg] ---to---> [jpg(jpegtran)] WARNING!!! autoupdate  - recommended to turn this off, it's not needed here - autoupdate: false
        compress_images(
          inputDir+"/*.{jpg,JPG,jpeg,JPEG}",
          outputDir,
          { compress_force: false, statistic: true, autoupdate: false },
          false,
          { jpg: { engine: "jpegtran", command: false } },
          { png: { engine: false, command: false } },
          { svg: { engine: false, command: false } },
          { gif: { engine: false, command: false } },
          function () {}
        );
      } else {
        console.error(err);
      }
    }
  );
}

module.exports = {
  compressImages
}
