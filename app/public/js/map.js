import { renderMap, updateYearMap } from "./charts/countryMap.js";
import { rangeSlider } from "./charts/slider.js";

let mapFilePath = "/static/data/counties.json";
let statisticsFilePath = "/static/data/transactions_with_residential_apartments_county_level.json"

let globalStatsData;

export const dispatch = d3.dispatch("start", "end");
dispatch.on("start", updateMapWithYear);

sessionStorage.setItem("year", 2024); // initial default value

Promise.all([
  d3.json(mapFilePath),
  d3.json(statisticsFilePath)
]).then(([geoData, statsData]) => {
  globalStatsData = statsData;
  renderMap(geoData, statsData);
}).catch(error => console.error(error));

rangeSlider();

function updateMapWithYear(selectedYear) {
  sessionStorage.setItem("year", selectedYear);
  updateYearMap(globalStatsData);
}
