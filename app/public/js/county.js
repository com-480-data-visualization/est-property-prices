import { renderTimeline } from "./charts/timeline.js";
import { renderMunicipalityMap, updateMunicipalityMap } from "./charts/municipalityMap.js";
import { renderSpiderChart, updateYearSpider } from "./charts/spiderChart.js";
import { renderBubbleChart, updateYearBubble } from "./charts/bubbleChart.js";
import { renderTreemapChart, updateYearTreemap } from "./charts/treemapChart.js";

const municipalityFilePath = "/static/data/municipalities.json";
const statisticsFilePath = "/static/data/transactions_with_residential_apartments_county_level.json"
const municipalityStatisticsFilePath = "/static/data/transactions_with_residential_apartments_detailed.json"
const landtypeFilePath = "/static/data/normalized_spider_data.json";


const year = sessionStorage.getItem("year");

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

const formatSpiderData = (yearData) => 
  yearData.map(entry => ({
    category: entry.Name,
    value: entry["Total area (ha)"]
  }));

  let landTypeData = {}; 
  // let fetchedLandTypeData = {}; // Declare globally
  
  Promise.all([
    fetch(municipalityFilePath).then((response) => response.json()),
    fetch(statisticsFilePath).then((response) => response.json()),
    fetch(landtypeFilePath).then((response) => response.json()),
    fetch(municipalityStatisticsFilePath).then((response) => response.json())
  ])
    .then(([municipalityMapData, countyData, fetchedData, municipalityStats]) => {
      // fetchedLandTypeData = fetchedData; // Store globally
  
      const id = sessionStorage.getItem("countyId");
      const selectedYear = sessionStorage.getItem("year");
  
      countyData = getCountyRelatedStatistics(countyData, id);
      landTypeData = getCountyRelatedStatistics(fetchedData, id);

      const maxValue = Math.max(
        ...Object.values(landTypeData.data) // Iterate over all years' data
          .flatMap(year => year.map(entry => entry["Total area (ha)"])) // Extract values
      );
  
      const timelineData = formatTimelineData(countyData);
      renderTimeline(timelineData);
  
      const yearData = landTypeData.data[selectedYear];
      const spiderData = formatSpiderData(yearData);
      renderSpiderChart(spiderData, maxValue);
  
      renderBubbleChart(null);
      renderTreemapChart(null);
      municipalityMapData = getMunicipalitiesByCounty(municipalityMapData, id);
      renderMunicipalityMap(municipalityMapData, municipalityStats);
    })
    .catch((error) => console.log(error));
  
  function updateChartsWithYear(selectedYear) {
    sessionStorage.setItem("year", selectedYear);
  
    const maxValue = Math.max(
      ...Object.values(landTypeData.data) // Iterate over all years' data
        .flatMap(year => year.map(entry => entry["Total area (ha)"])) // Extract values
    );
    
  
    const yearData = landTypeData.data[selectedYear];
    const spiderData = formatSpiderData(yearData);
    renderSpiderChart(spiderData, maxValue);
  
    updateYearBubble(null, selectedYear);
    updateYearTreemap(null, selectedYear);
    updateMunicipalityMap();
  }
  
