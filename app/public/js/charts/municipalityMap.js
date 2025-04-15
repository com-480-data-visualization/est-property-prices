import { Legend } from "./countryMap.js";
import { CustomGradient } from "../colors.js";

let globalMunicipalityStats;
let path;
let maxValue;
let colorScale;
let currentCountyId;

const conf = {
  width: 600,
  height: 340,
  landStroke: "#FCF5E9",
};

function getMaxValueForCurrentCounty(data, countyId) {
  const statistic = "Price per unit area avg(eur /m2)";

  const countyData = data.find((d) => d.MKOOD === countyId);
  if (!countyData) return 0;

  const values = Object.values(countyData.data)
    .flatMap((yearData) =>
      Object.values(yearData).flatMap((municipality) =>
        municipality.data
          .filter((d) => d["Area(m2)"] === "TOTAL")
          .map((d) => parseFloat(d[statistic]))
      )
    )
    .filter((v) => !isNaN(v));

  const rawMax = values.length ? Math.max(...values) : 0;
  return Math.ceil(rawMax / 500) * 500; // Round up to nearest 500
}

function getValueForID(data, countyId, municipalityName) {
  const year = sessionStorage.getItem("year");
  const county = data.find((d) => d.MKOOD === countyId);
  if (!county) return null;

  const yearData = county.data[year] || {};
  const municipality = yearData[municipalityName];
  if (!municipality) return null;

  const totalEntry = municipality.data.find((d) => d["Area(m2)"] === "TOTAL");
  return totalEntry
    ? parseFloat(totalEntry["Price per unit area avg(eur /m2)"])
    : null;
}

function renderOneMunicipality(d) {
  const value = getValueForID(
    globalMunicipalityStats,
    d.properties.MKOOD,
    d.properties.ONIMI
  );

  return value !== null ? colorScale(value) : "#CCCCCC";
}

function setupTooltip(paths) {
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  paths
    .on("mouseover", function (event, d) {
      d3.select(this).style("fill", "orange");

      const countyId = d.properties.MKOOD;
      const municipalityName = d.properties.ONIMI;
      const year = sessionStorage.getItem("year");

      const stats = globalMunicipalityStats
        .find((d) => d.MKOOD === countyId)
        ?.data[year]?.[municipalityName]?.data?.find(
          (d) => d["Area(m2)"] === "TOTAL"
        );

      const municipalityNameEnglish = municipalityName
        .replace(" vald", " parish")
        .replace(" linn", " town");

      if (!stats) return;

      tooltip.html("");

      tooltip
        .append("div")
        .attr("class", "tooltip-title")
        .text(municipalityNameEnglish);

      tooltip
        .append("div")
        .attr("class", "tooltip-label")
        .text("Average price (€ / m²):");

      tooltip
        .append("div")
        .attr("class", "tooltip-value")
        .text(`${stats["Price per unit area avg(eur /m2)"].toFixed(2)}`);

      const tooltipHeight = tooltip.node().getBoundingClientRect().height;
      tooltip
        .style("left", `${event.pageX - 20}px`)
        .style("top", `${event.pageY - tooltipHeight - 15}px`)
        .transition()
        .duration(200)
        .style("opacity", 1);
    })
    .on("mouseout", function () {
      d3.select(this)
        .style("fill", (d) => renderOneMunicipality(d));

      tooltip.transition().duration(500).style("opacity", 0);
    })
    .on("mousemove", function (event) {
      const tooltipNode = tooltip.node();
      const tooltipWidth = tooltipNode.getBoundingClientRect().width;

      let xPosition = event.pageX - 20;
      if (xPosition + tooltipWidth > window.innerWidth) {
        xPosition = window.innerWidth - tooltipWidth - 10;
      }

      tooltip.style("left", `${xPosition}px`);
    });
}

export function renderMunicipalityMap(data, municipalityStats) {
  globalMunicipalityStats = municipalityStats;

  currentCountyId = data.features[0]?.properties.MKOOD;
  maxValue = getMaxValueForCurrentCounty(municipalityStats, currentCountyId);

  colorScale = CustomGradient(0, maxValue);

  const projection = d3.geoMercator().fitExtent(
    [
      [0, 0],
      [conf.width, conf.height],
    ],
    data
  );

  const svg = d3
    .select("[municipality-map]")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${conf.width} ${conf.height}`);

  path = svg
    .selectAll("path")
    .data(data.features)
    .join("path")
    .attr("d", d3.geoPath().projection(projection))
    .style("fill", (d) => renderOneMunicipality(d))
    .attr("stroke", conf.landStroke)
    .attr("stroke-width", 1);

  setupTooltip(path);

  Legend(colorScale, {
    title: "",
    width: 400,
    marginLeft: 10,
    tickSize: 6,
  });
}

export function updateMunicipalityMap() {
  maxValue = getMaxValueForCurrentCounty(
    globalMunicipalityStats,
    currentCountyId
  );
  colorScale.domain([0, maxValue]);

  path
    .transition()
    .duration(300)
    .style("fill", (d) => renderOneMunicipality(d))
    .style("stroke", conf.landStroke);
}
