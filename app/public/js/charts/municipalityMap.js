let globalMunicipalityStats;
let path;

const conf = {
  width: 600,
  height: 350,
  landColor: "#09A573",
  landStroke: "#FCF5E9",
  markerColor: "#E26F99",
  backgroundColor: "#EAF2FA",
};

function getValueForID(data, countyId, municipalityName) {
  const year = sessionStorage.getItem("year");
  const countyYear = data.filter((d) => d.MKOOD === countyId)[0].data[year];
  let municipalityList
  if (countyYear.hasOwnProperty(municipalityName)) {
    municipalityList = countyYear[municipalityName].data
  } else{
    console.log("Could not find '" + municipalityName + "' in the JSON data")
    return 0;
  }
  const totalList = municipalityList.filter((d) => d["Area(m2)"] === "TOTAL")
  if (totalList.length > 0) {
    const statistic = "Price per unit area median(eur /m2)";
    return totalList[0][statistic];
  } else {
    console.log("Could not find 'TOTAL' aggregation for: " + municipalityName)
    return 0;
  }
  
}

function renderOneMunicipality(d) {
  //const value = Math.sqrt(d.properties.AREA);
  const countyId = d.properties.MKOOD;
  const municipalityName = d.properties.ONIMI
  const value = getValueForID(globalMunicipalityStats, countyId, municipalityName);
  return value
    ? d3.scaleSequential(d3.interpolateViridis).domain([0, 2000])(value)
    : "#000000";
}

export function renderMunicipalityMap(data, municipalityStats) {
  globalMunicipalityStats = municipalityStats

  const projection = d3.geoMercator().fitExtent([[0, 0], [conf.width - 0, conf.height - 0]], data)
  const pathGenerator = d3.geoPath().projection(projection);

  const svg = d3
    .select("[municipality-map]")
    .append("svg")
    .attr("width", "100%") // Make it responsive
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${conf.width} ${conf.height}`);

  path = svg
    .selectAll("path")
    .data(data.features)
    .join("path")
    .attr("d", pathGenerator)
    .style("fill", renderOneMunicipality)
    .attr("stroke", conf.landStroke)
    .attr("stroke-width", 1);
}

export function updateMunicipalityMap() {
  path
    .transition()
    .duration(150)
    .style("fill", renderOneMunicipality)
    .style("stroke", "white");
}