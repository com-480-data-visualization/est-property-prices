import { renderMap, updateYearMap } from "./charts/countryMap.js";
import { initializeSlider } from "./charts/slider.js";

let mapFilePath = "/static/data/counties.json";
let statisticsFilePath = "/static/data/transactions_with_residential_apartments_county_level.json"
let citiesFilePath = "/static/data/cities.json";


let globalStatsData;

sessionStorage.setItem("year", 2010); // initial default value

export const dispatch = d3.dispatch("start", "end");
dispatch.on("start", updateMapWithYear);

initializeSlider(dispatch);

Promise.all([
  d3.json(mapFilePath),
  d3.json(statisticsFilePath),
  d3.json(citiesFilePath)
]).then(([geoData, statsData, citiesData]) => {
  globalStatsData = statsData;
  renderMap(geoData, statsData, citiesData);
}).catch(error => console.error(error));

function updateMapWithYear(selectedYear) {
  sessionStorage.setItem("year", selectedYear);
  updateYearMap(globalStatsData);
}
