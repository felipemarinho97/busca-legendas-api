const request = require("request").defaults({ jar: true });
const { fs } = require("memfs");
const _path = require("path");

const SEP = _path.sep;
const subtitlesDir = `${__dirname + SEP}subs`;
const credentials =
  "data%5BUser%5D%5Busername%5D=pipoca-filmes&data%5BUser%5D%5Bpassword%5D=pipocafilmes&data%5Blembrar%5D=on";
const loginEndpoint = "http://legendas.tv/login";

if (!fs.existsSync(subtitlesDir)) {
  fs.mkdirSync(subtitlesDir, { recursive: true });
}

function downloadSubtitle(link) {
  return new Promise((resolve, reject) => {
    request(
      {
        headers: {
          "Content-Length": credentials.length,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        jar: true,
        uri: loginEndpoint,
        body: credentials,
        method: "POST"
      },
      () => {
        let filename = "";

        const myStream = request
          .get(link, (_, response) => {
            let path = response.request.path.split("/");

            filename = path[path.length - 1];
          })
          .pipe(fs.createWriteStream(subtitlesDir + SEP + "download"));

        myStream.on("finish", () => {
          fs.renameSync(
            subtitlesDir + SEP + "download",
            subtitlesDir + SEP + filename
          );

          resolve({
            pathToZip: subtitlesDir + SEP + filename,
            subtitleFile: filename
          });
        });
      }
    );
  });
}

module.exports = {
  downloadSubtitle,
  subtitlesDir
};
