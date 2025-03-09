import { renderTimeline } from "./charts/timeline.js";
import { renderMunicipalityMap } from "./charts/municipalityMap.js";

const countyFilePath = "/static/data/counties.json";
const municipalityFilePath = "/static/data/municipalities.json";

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
  })
  .catch((error) => console.log(error));

fetch(municipalityFilePath)
  .then((response) => response.json())
  .then((data) => {
    const id = sessionStorage.getItem("countyId");

    const municipalityMapData = getMunicipalitiesByCounty(data, id);
    console.log(municipalityMapData);
    renderMunicipalityMap(municipalityMapData);
  })
  .catch((error) => console.log(error));
