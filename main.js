const express = require("express");

const app = express();

const { fs } = require("memfs");
const path = require("path");

const subtitleService = require("./services/subtitle.service");
const extractorService = require("./services/extractor.service");
const downloadService = require("./services/download.service");

const SEP = path.sep;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");

  next();
});

app.use(express.json());

app.get("/subtitle", (req, res) => {
  downloadService
    .downloadSubtitle(
      "http://legendas.tv/downloadarquivo/2b0f733829c93fee16b9afea02db3a79"
    )
    .then(resp => res.json(resp));
});

app.get("/find", (req, appRes) => {
  const release = req.query.release;

  subtitleService
    .findSubtitle({
      name: req.query.title,
      release
    })
    .then(resSub => {

      const link = resSub[0].result.linkLegenda;

      downloadService.downloadSubtitle(link).then(res => {
        const subtitleLocation = `${downloadService.subtitlesDir}${SEP}${release}`;
        const successExtraction = () => {
          const bestMatch = subtitleService.findBestSRT(
            subtitleLocation,
            release
          );
          console.log("bestMatch", bestMatch);
          console.log("subLocatioin", subtitleLocation);
          appRes.setHeader("content-type", "application/x-subrip");
          appRes.setHeader(
            "Content-Disposition",
            "attachment;filename=" + bestMatch.match.name
          );
          fs.createReadStream(bestMatch.path).pipe(appRes);

          // appRes.download(bestMatch.path, bestMatch.match.name);
        };

        extractorService.extractSubtitle(
          res.pathToZip,
          subtitleLocation,
          successExtraction
        );
      });
    })
    .catch(() => {
      appRes.status(404).send("Não encontrado");
    });
});

app.listen(3002, () => console.log("App is running"));
