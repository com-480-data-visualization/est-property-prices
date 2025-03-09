import { createTimeline } from "./charts/timeline.js";

const dataDirectory = "/static/data/geojson/counties.json";

const getCountyRelatedData = (data, id) => { 
  return data.filter((d) => d.properties.MKOOD === id)[0];
};

const getTimeline = (data) => {
  return (
    Object.entries(data.properties.timeline)
      .map(([year, entry]) => ({
        date: new Date(`${year}-01-01`),
        pricePerSquareMeter: entry.pricePerSquareMeter
      }))
      .sort((a, b) => d3.ascending(a.date, b.date))
  );
};


fetch(dataDirectory)
  .then(response => response.json())
  .then(data => {
    const id = sessionStorage.getItem("countyId");
    const countyData = getCountyRelatedData(data.features, id);
    const timelineData = getTimeline(countyData);
    createTimeline(timelineData);
  })
  .catch(error => console.log(error));
