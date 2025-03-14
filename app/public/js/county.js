import { renderTimeline } from "./charts/timeline.js";
import { renderMunicipalityMap, updateMunicipalityMap } from "./charts/municipalityMap.js";
import { renderSpiderChart, updateYearSpider } from "./charts/spiderChart.js";
import { renderBubbleChart, updateYearBubble } from "./charts/bubbleChart.js";
import {
  renderTreemapChart,
  updateYearTreemap,
} from "./charts/treemapChart.js";

const municipalityFilePath = "/static/data/municipalities.json";
const statisticsFilePath = "/static/data/transactions_with_residential_apartments_county_level.json"
const municipalityStatisticsFilePath = "/static/data/transactions_with_residential_apartments_detailed.json"


sessionStorage.setItem("selectedYear", 2024); // initial default value

export const dispatch = d3.dispatch("start", "end");
dispatch.on("start", updateChartsWithYear);

const getCountyRelatedMap = (data, id) => {
  return data.filter((d) => d.properties.MKOOD === id)[0];
};

const getCountyRelatedStatistics = (data, id) => {
  return data.filter((d) => d.MKOOD === id)[0];
};

const formatTimelineData = (statistics) => {
  return Object.entries(statistics.data)
    .map(([year, entry]) => ({
      date: new Date(`${year}-01-01`),
      pricePerSquareMeter: entry.filter((d) => d["Area(m2)"] === "TOTAL")[0]["Price per unit area median(eur /m2)"],
    }))
    .sort((a, b) => d3.ascending(a.date, b.date));
};

const getMunicipalitiesByCounty = (data, id) => {
  return {
    type: "FeatureCollection",
    features: data.features.filter(
      (feature) => feature.properties.MKOOD === id
    ),
  };
};

Promise.all([
  fetch(municipalityFilePath).then((response) => response.json()),
  fetch(statisticsFilePath).then((response) => response.json()),
  fetch(municipalityStatisticsFilePath).then((response) => response.json()),
])
  .then(([municipalityMapData, countyData, municipalityStats]) => {
    const id = sessionStorage.getItem("countyId");
    countyData = getCountyRelatedStatistics(countyData, id);

    const timelineData = formatTimelineData(countyData, year);
    renderTimeline(timelineData);

    renderSpiderChart(null);
    renderBubbleChart(null);
    renderTreemapChart(null);

    municipalityMapData = getMunicipalitiesByCounty(municipalityMapData, id);
    renderMunicipalityMap(municipalityMapData, municipalityStats);
  })
  .catch((error) => console.log(error));

function updateChartsWithYear(selectedYear) {
  sessionStorage.setItem("selectedYear", selectedYear);
  updateYearSpider(null, selectedYear);
  updateYearBubble(null, selectedYear);
  updateYearTreemap(null, selectedYear);
  updateMunicipalityMap();
}
