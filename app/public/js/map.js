import { createMap } from "./charts/countryMap.js";
import { rangeSlider } from "./charts/slider.js";

const dataDirectory = "/static/data/counties.json";

d3.json(dataDirectory)
  .then(function (json) {
    createMap(json);
  })
  .catch(function (error) {
    console.error("Error loading the GeoJSON file:", error);
  });

rangeSlider();
