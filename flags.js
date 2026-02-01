//Globals:
const format = "webp";
const res = "x300";
var countries = new Array();
var clusters = {};
var features = {};
var clusterCountryIdxs = {}  // map of cluster id to list of country indexes

function getClusterCountryIdxsCount() {
    return Object.keys(clusterCountryIdxs).length
}

function getClusterCountryIdxs() {
    return clusterCountryIdxs;
}

function getClusterCountryIdxsByClusterId(clusterId) {
    return clusterCountryIdxs[clusterId];
}

function addClusterCountryIdx(cluster, countryIdx) {
    if (cluster in clusterCountryIdxs) {
        clusterCountryIdxs[cluster].push(countryIdx);
    } else {
        clusterCountryIdxs[cluster] = [countryIdx];
    }
}

function getCountryCount() {
    return countries.length;
}

function getCountryByIdx(index) {
    return countries[index];
}

function getCountryIdxByName(name) {
    for (let i=0; i<countries.length; ++i) {
        let country = countries[i];
        if (country.name == name) {
            return i
        }
    }
    return null;
}

function getCountryByName(name) {
    for (let i=0; i<countries.length; ++i) {
        let country = countries[i];
        if (country.name == name) {
            return country
        }
    }
    return null;
}

function getCountries() {
    return countries;
}

function getCountryIdxs() {
    let n = countries.length;
    return Array.from({ length: n }, (_, index) => index);
}

function getCountryIdxsFiltered(lang, tags) {
    ret = [];
    for (let i=0; i<countries.length; ++i) {
        let country = countries[i];
        let tagsIntersection = [];
        if (tags != null) {
            tagsIntersection = tags.filter(element => country.tags.includes(element));
        }
        if ((tags == null || tags.length == 0 || tagsIntersection.length > 0) 
         && (!lang || lang == "" || lang == "*" || country.lang == lang)) {
            ret.push(i);
        }
    }
    return ret;
}

function addCountry(country) {
    countries.push(country);
}

function getClusterCount() {
    return Object.keys(clusters).length
}

function getCluster(name) {
    return clusters[name];
}

function getClusters() {
    return clusters;
}

function setCluster(svgFilename, cluster) {
    clusters[svgFilename] = cluster;
}

function getCluster(svgFilename) {
    return clusters[svgFilename];
}

function getFeature(svgFilename) {
    return features[svgFilename];
}

function getFeatureCount() {
    return Object.keys(features).length
}

function getFeatures() {
    return features;
}

function setFeature(svgFilename, feature) {
    features[svgFilename] = feature;
}

function getSvgFilenameFromName(name) {
    var ret = name.replace(/ /g,"_"); //replace spaces with underscores
    ret = ret.replace(/'/g,"_"); //replace apostrophies with underscores
    ret = ret.replace(/,/g, ""); //strip commas
    ret = ret.replace(/\./g, ""); //strip periods
    return ret
}

//class
function Country(name, tags, lang)
{
    this.name = name;
    this.tags = tags;
    this.lang = lang;
    let fname = getSvgFilenameFromName(name); 
    this.filename = `flags/${format}/${res}/Flag_of_${fname}.${format}`;
    this.imagehtml = `<img class="flag-image" src="${this.filename}">`;
}

//load xml
$.get("countries.xml", {}, function(data){
    $("country",data).each(function(){
        let node = $(this)[0];
        let tags = [];
        if (node.hasAttribute('tags')) {
            tagsString = node.getAttribute('tags');
            tags = tagsString.split(",");
        }
        let lang = "en"
        if (node.hasAttribute('lang')) {
            lang = node.getAttribute('lang');
        }
        let name = node.textContent;
        let c = new Country(name, tags, lang);
        addCountry(c);
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


$(document).ajaxStop(function() {
    // This function runs when the number of active AJAX requests becomes zero.
    console.log("All jQuery AJAX requests have completed.");

    // Build country cluster lists
    for (const [svgFilename, assignedCluster] of Object.entries(getClusters())) {
        //console.log(`cluster ${svgFilename}=${assignedCluster}`);
        let countryIdx = getCountryIdxFromSvgFilename(svgFilename);
        //skip svgs not in countries list e.g. retired flag
        if (countryIdx == -1) {
            console.warn(`Country not found for SVG file: ${svgFilename}`);
        } else {
            addClusterCountryIdx(assignedCluster, countryIdx);
        }
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
    return getFilename(pngFilePath).replace(`.${format}`, ".svg");
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

function getCountryIdxFromSvgFilename(svgFilename) {
    let fname = svgFilename.replace(".svg", `.${format}`);
    for (let i=0; i<getCountryCount(); ++i) {
        let country = getCountryByIdx(i);
        if (country.filename.endsWith(fname)) {
            return i;
        }
    }
    return -1;
}
