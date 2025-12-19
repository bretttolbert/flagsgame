//Globals:
var countries = new Array();
var clusters = {};

function getCountries() {
    return countries;
}

function getClusters() {
    return clusters;
}

//class
function Country(name)
{
    this.name = name;
    var filename = name.replace(/ /g,"_"); //replace spaces with underscores
    filename = filename.replace(/'/g,"_"); //replace apostrophies with underscores
    var ocircumflex = new RegExp("\u00F4","g"); //for côte d'ivoire
    filename = filename.replace(ocircumflex,"o");
    this.filename = "flags/png/300x158/Flag_of_" + filename + ".png";
    this.imagehtml = '<img class="flag-image" src="' + this.filename + '" >';
}

//load xml
$.get("countries.xml", {}, function(data){
    $("country",data).each(function(){
        countries.push(new Country($(this).text()));
    });
});

//load clusters json
$.get("flag_clusters.json", {}, function(data){
    for (const [key, value] of Object.entries(data)) {
        clusters[key] = value;
    }
});

/**
 * Extracts the filename (with extension) from a given path string.
 * @param {string} fullPath The full file path or URL.
 * @returns {string} The filename.
 */
function getFilename(fullPath) {
  // Use split with a regex for both '/' and '\\' separators, then pop the last element.
  const pathParts = fullPath.split(/(\\|\/)/g);
  const filename = pathParts.pop();
  return filename;
}

/*
 * "flags/png/Flag_of_Tanzania.png" -> "Flag_of_Tanzania.svg" -> 0
 * "flags/png/Flag_of_Egypt.png" -> "Flag_of_Egypt.svg" -> 2
 */
function getClusterFromPngFilePath(pngFilePath) {
    let fname = getFilename(pngFilePath).replace(".png", ".svg")
    let cluster = clusters[fname];
    return cluster;
}

function getCountryFromSvgFilename(svgFilename) {
    let fname = svgFilename.replace(".svg", ".png");
    for (let i=0; i<countries.length; ++i) {
        let country = getCountries()[i];
        if (country.filename.endsWith(fname)) {
            return country
        }
    }
    return null;
}
