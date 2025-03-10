import { renderTimeline } from "./charts/timeline.js";
import { renderMunicipalityMap } from "./charts/municipalityMap.js";
import { renderSpiderChart, updateYearSpider } from "./charts/spiderChart.js";
import { renderBubbleChart, updateYearBubble } from "./charts/bubbleChart.js";
import { renderTreemapChart, updateYearTreemap } from "./charts/treemapChart.js";

const countyFilePath = "/static/data/counties.json";
const municipalityFilePath = "/static/data/municipalities.json";

sessionStorage.setItem("selectedYear", 2024); // initial default value

export const dispatch = d3.dispatch("start", "end");
dispatch.on("start", updateChartsWithYear);

const getCountyRelatedData = (data, id) => {
  return data.filter((d) => d.properties.MKOOD === id)[0];
};

const getTimeline = (data) => {
  return Object.entries(data.properties.timeline)
    .map(([year, entry]) => ({
      date: new Date(`${year}-01-01`),
      pricePerSquareMeter: entry.pricePerSquareMeter,
    }))
    .sort((a, b) => d3.ascending(a.date, b.date));
};

const getMunicipalitiesByCounty = (data, id) => {
  return {
    type: "FeatureCollection",
    features: data.features.filter((feature) => feature.properties.MKOOD === id)
  };
};

fetch(countyFilePath)
  .then((response) => response.json())
  .then((data) => {
    const id = sessionStorage.getItem("countyId");
    const countyData = getCountyRelatedData(data.features, id);

    const timelineData = getTimeline(countyData);
    renderTimeline(timelineData);

    renderSpiderChart(null);
    renderBubbleChart(null);
    renderTreemapChart(null);
  })
  .catch((error) => console.log(error));

fetch(municipalityFilePath)
  .then((response) => response.json())
  .then((data) => {
    const id = sessionStorage.getItem("countyId");

    const municipalityMapData = getMunicipalitiesByCounty(data, id);
    renderMunicipalityMap(municipalityMapData);
  })
  .catch((error) => console.log(error));


function updateChartsWithYear(selectedYear) {
  sessionStorage.setItem("selectedYear", selectedYear);
  updateYearSpider(null, selectedYear);
  updateYearBubble(null, selectedYear);
  updateYearTreemap(null, selectedYear);
}
