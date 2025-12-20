//Globals:
var _countries = new Array();
var _clusters = {};
var _features = {};

function getCountryByIdx(index) {
    return _countries[index];
}

function getCountryByName(name) {
    for (let i=0; i<_countries.length; ++i) {
        let country = _countries[i];
        if (country.name == name) {
            return country
        }
    }
    return null;
}

function getCountries() {
    return _countries;
}

function addCountry(country) {
    _countries.push(country);
}

function getCluster(name) {
    return _clusters[name];
}

function getClusters() {
    return _clusters;
}

function setCluster(svgFilename, cluster) {
    _clusters[svgFilename] = cluster;
}

function getCluster(svgFilename) {
    return _clusters[svgFilename];
}

function getFeature(svgFilename) {
    return _features[svgFilename];
}

function getFeatures() {
    return _features;
}

function setFeature(svgFilename, feature) {
    _features[svgFilename] = feature;
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
        addCountry(new Country($(this).text()));
    });
});

//load clusters json
$.get("flag_clusters.json", {}, function(data){
    for (const [key, value] of Object.entries(data)) {
        setCluster(key, value);
    }
});

//load features json
$.get("flag_features.json", {}, function(data){
    for (const [key, value] of Object.entries(data)) {
        setFeature(key, value);
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

/* Examples:
 * getSvgFilenameFromPngFilePath("flags/png/Flag_of_Tanzania.png") => "Flag_of_Tanzania.svg"
 * getSvgFilenameFromPngFilePath("flags/png/Flag_of_Egypt.png") => "Flag_of_Egypt.svg"
 */

function getSvgFilenameFromPngFilePath(pngFilePath) {
    return getFilename(pngFilePath).replace(".png", ".svg");
}

/* Examples:
 * getClusterBySvgFilename("Tanzania") => 0
 * getClusterBySvgFilename("Egypt") => 2
 */
function getClusterByCountryName(countryName) {
    let countryObj = getCountryByName(countryName);
    let svgFilename = getSvgFilenameFromPngFilePath(countryObj.filename);
    let cluster = getCluster(svgFilename);
    return cluster;
}

function getClusterByCountryIdx(countryIdx) {
    let countryObj = getCountryByIdx(countryIdx);
    let svgFilename = getSvgFilenameFromPngFilePath(countryObj.filename);
    let cluster = getCluster(svgFilename);
    return cluster;
}

/* Examples:
 * getFeaturesByCountry("Tanzania") =>
 * {
        "fills_rgb": [
            [
                30,
                181,
                58
            ],
            [
                0,
                163,
                221
            ]
        ],
        "fills_hsl": [
            [
                0.375,
                1.0,
                0.5
            ],
            [
                0.5,
                1.0,
                1.0
            ]
        ],
        "strokes_rgb": [
            [
                0,
                0,
                0
            ],
            [
                252,
                209,
                22
            ]
        ],
        "strokes_hsl": [
            [
                0.0,
                0.0,
                0.0
            ],
            [
                0.125,
                1.0,
                1.0
            ]
        ]
    },
 */
function getFeaturesByCountryName(countryName) {
    let countryObj = getCountryByName(countryName);
    let svgFilename = getSvgFilenameFromPngFilePath(countryObj.filename);
    let features = getFeature(svgFilename);
    return features;
}

function getFeaturesByCountryIdx(countryIdx) {
    let countryObj = getCountryByIdx(countryIdx);
    let svgFilename = getSvgFilenameFromPngFilePath(countryObj.filename);
    let features = getFeature(svgFilename);
    return features;
}

function getCountryFromSvgFilename(svgFilename) {
    let fname = svgFilename.replace(".svg", ".png");
    for (let i=0; i<getCountries().length; ++i) {
        let country = getCountryByIdx(i);
        if (country.filename.endsWith(fname)) {
            return country
        }
    }
    return null;
}
