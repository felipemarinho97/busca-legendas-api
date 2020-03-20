const { fs } = require("memfs");
const path = require("path");
const legendastv = require("node-legendastv");
const levenshtein = require("fast-levenshtein");

const buscaExample = {
  name: "",
  release: ""
};

function findSubtitle(busca) {
  busca.name = busca.name.replace(new RegExp(":"), "");
  console.log(busca);

  return new Promise((resolve, reject) => {
    let search = {
      distance: Number.MAX_VALUE,
      value: null
    };

    let equalFindings = [];

    legendastv.search(busca.release, function(err, results) {
      if (err || results.length === 0) {
        legendastv.search(busca.name, function(err, results) {
          if (results.length !== 0) {
            pickSubtitle(results);
          } else {
            reject({});
          }
        });
      } else {
        pickSubtitle(results);
      }
    });

    function pickSubtitle(results) {
      results.forEach(result => {
        const distance = levenshtein.get(
          result.titulo.toLowerCase(),
          busca.release.toLowerCase()
        );
        if (distance < search.distance) {
          search = {
            distance,
            result
          };
        }
        console.log(result.titulo, distance);
      });

      results.forEach(result => {
        const distance = levenshtein.get(
          result.titulo.toLowerCase(),
          busca.release.toLowerCase()
        );

        if (distance === search.distance) {
          equalFindings.push({
            distance,
            result
          });
        }
      });

      console.log(busca);
      resolve(equalFindings);
    }
  });
}

function findBestSRT(
  subPath,
  movieName,
  bestMatch = { distance: Number.MAX_VALUE, match: null, path: subPath }
) {
  console.log(subPath, movieName, bestMatch);

  const files = fs.readdirSync(subPath, { withFileTypes: true });

  for (let i = 0; i < files.length; i++) {
    let fileName = files[i].name;
    let file = fs.statSync(subPath + path.sep + fileName);
    file.name = files[i].name;

    console.log(file.name);

    if (
      file.isFile() &&
      (fileName.endsWith(".srt") || fileName.endsWith(".ass"))
    ) {
      // fileName = fileName.slice(0, fileName.length - 4);

      const distance = levenshtein.get(fileName, movieName);

      console.log(distance);
      if (distance < bestMatch.distance) {
        bestMatch = {
          distance,
          match: file,
          path: subPath + path.sep + fileName
          // + ".srt"
        };
      }
    } else if (file.isDirectory()) {
      const dirBestMatch = findBestSRT(
        subPath + path.sep + fileName,
        movieName,
        bestMatch
      );

      if (dirBestMatch.match !== null) {
        const distance = levenshtein.get(dirBestMatch.match.name, movieName);

        if (distance < bestMatch.distance) {
          bestMatch = dirBestMatch;
        }
      } else {
        console.log("nulo");
      }
    }
  }

  console.log(bestMatch);

  return bestMatch;
}

module.exports = {
  findSubtitle,
  findBestSRT
};
