import { renderTimeline } from "./charts/timeline.js";
import {
  renderMunicipalityMap,
  updateMunicipalityMap,
} from "./charts/municipalityMap.js";
import { renderSpiderChart } from "./charts/spiderChart.js";
import { renderCircularPacking } from "./charts/circularPacking.js";
import { renderTreemapChart } from "./charts/treemapChart.js";

const municipalityFilePath = "/static/data/municipalities.json";
const statisticsFilePath =
  "/static/data/transactions_with_residential_apartments_county_level.json";
const municipalityStatisticsFilePath =
  "/static/data/transactions_with_residential_apartments_detailed.json";
const landTypeFilePath = "/static/data/normalized_spider_data.json";
const sellersFilePath =
  "/static/data/transactions_by_residency_of_sellers_county_level.json";
const buyersFilePath =
  "/static/data/transactions_by_residency_of_buyers_county_level.json";
const circularFilePath =
  "/static/data/transactions_by_type_of_real_property_county_level.json";
const salaryFilePath = "/static/data/mean_salaries_eur.json";

const year = sessionStorage.getItem("year");
const treemapDropdown = document.querySelector(".uk-select.treemap-select");

export const dispatch = d3.dispatch("start", "end");
dispatch.on("start", updateChartsWithYear);

let sellersDataGlobal;
let buyersDataGlobal;
let circularDataGlobal;
let countyDataGlobal;
let salaryDataGlobal;

const getCountyRelatedStatistics = (data, id) => {
  return data.filter((d) => d.MKOOD === id)[0];
};

const formatTimelineData = (statistics, salaryData) => {
  /** Formats data for the Eur/m2  graph */
  return Object.entries(statistics.data)
    .map(([year, entry]) => ({
      date: new Date(`${year}-01-01`),
      pricePerSquareMeter: entry.filter((d) => d["Area(m2)"] === "TOTAL")[0][
        "Price per unit area avg(eur /m2)"
      ],
      meanSalary: salaryData["values"][year]
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
  yearData.map((entry) => ({
    category: entry.Name,
    value: entry["Total area (ha)"],
  }));

const formatTreemapData = (
  countyId,
  year,
  sellersData,
  buyersData,
  metric = "Number"
) => {
  const sellersByCounty =
    sellersData.find((d) => d.MKOOD === countyId)?.data || {};
  const buyersByCounty =
    buyersData.find((d) => d.MKOOD === countyId)?.data || {};

  const sellersByYear = sellersByCounty[year] || [];
  const buyersByYear = buyersByCounty[year] || [];

  const filteredSellersData = sellersByYear.filter(
    (entry) =>
      entry.Name !== "Estonia" && !entry.Name.toLowerCase().includes("total")
  );

  const filteredBuyersData = buyersByYear.filter(
    (entry) =>
      entry.Name !== "Estonia" && !entry.Name.toLowerCase().includes("total")
  );

  filteredSellersData.sort((a, b) => b[metric] - a[metric]);
  filteredBuyersData.sort((a, b) => b[metric] - a[metric]);

  return {
    children: [
      { name: "Sellers", children: filteredSellersData },
      { name: "Buyers", children: filteredBuyersData },
    ],
  };
};

let landTypeData = {};

Promise.all([
  fetch(municipalityFilePath).then((response) => response.json()),
  fetch(statisticsFilePath).then((response) => response.json()),
  fetch(landTypeFilePath).then((response) => response.json()),
  fetch(municipalityStatisticsFilePath).then((response) => response.json()),
  fetch(sellersFilePath).then((response) => response.json()),
  fetch(buyersFilePath).then((response) => response.json()),
  fetch(circularFilePath).then((response) => response.json()),
  fetch(salaryFilePath).then((response) => response.json()),
])
  .then(
    ([
      municipalityMapData,
      countyData,
      fetchedData,
      municipalityStats,
      sellersData,
      buyersData,
      circularData,
      salaryData,
    ]) => {
      // fetchedLandTypeData = fetchedData; // Store globally
      sellersDataGlobal = sellersData;
      buyersDataGlobal = buyersData;
      circularDataGlobal = circularData;

      const id = sessionStorage.getItem("countyId");
      const selectedYear = sessionStorage.getItem("year");

      countyDataGlobal = getCountyRelatedStatistics(countyData, id);
      landTypeData = getCountyRelatedStatistics(fetchedData, id);
      circularData = getCountyRelatedStatistics(circularData, id);
      salaryDataGlobal = salaryData[id];

      const countyName = salaryDataGlobal.MNIMI.replace("maakond", "county");
      const p = document.getElementById("salary-info");
      p.innerHTML = `<i>The average monthly gross salary in ${countyName} for ${selectedYear} was €${salaryDataGlobal.values[selectedYear]}.</i>`;

      const maxValue = Math.max(
        ...Object.values(landTypeData.data) // Iterate over all years' data
          .flatMap((year) => year.map((entry) => entry["Total area (ha)"])) // Extract values
      );

      const timelineData = formatTimelineData(countyDataGlobal, salaryDataGlobal);
      renderTimeline(timelineData);

      const yearData = landTypeData.data[selectedYear];
      const spiderData = formatSpiderData(yearData);
      renderSpiderChart(spiderData, maxValue);

      const circularYearData = circularData.data[selectedYear];
      renderCircularPacking(circularYearData);

      municipalityMapData = getMunicipalitiesByCounty(municipalityMapData, id);
      renderMunicipalityMap(municipalityMapData, municipalityStats);

      const treemapData = formatTreemapData(
        id,
        selectedYear,
        sellersData,
        buyersData
      );
      renderTreemapChart(treemapData);
    }
  )
  .catch((error) => console.log(error));

function updateChartsWithYear(selectedYear) {
  sessionStorage.setItem("year", selectedYear);

  const countyName = salaryDataGlobal.MNIMI.replace("maakond", "county");
  const p = document.getElementById("salary-info");
  p.innerHTML = `<i>The average monthly gross salary in ${countyName} for ${selectedYear} was €${salaryDataGlobal.values[selectedYear]}.</i>`;

  const maxValue = Math.max(
    ...Object.values(landTypeData.data) // Iterate over all years' data
      .flatMap((year) => year.map((entry) => entry["Total area (ha)"])) // Extract values
  );

  const yearData = landTypeData.data[selectedYear];
  const spiderData = formatSpiderData(yearData);
  renderSpiderChart(spiderData, maxValue);

  const id = sessionStorage.getItem("countyId");
  const treemapData = formatTreemapData(
    id,
    selectedYear,
    sellersDataGlobal,
    buyersDataGlobal
  );
  renderTreemapChart(treemapData, treemapDropdown.value);

  updateMunicipalityMap();

  const circularData = getCountyRelatedStatistics(circularDataGlobal, id);
  const circularYearData = circularData.data[selectedYear];
  renderCircularPacking(circularYearData);
}

treemapDropdown.addEventListener("change", (event) => {
  const id = sessionStorage.getItem("countyId");
  const selectedYear = sessionStorage.getItem("year");
  const selectedValue = event.target.value;

  const treemapData = formatTreemapData(
    id,
    selectedYear,
    sellersDataGlobal,
    buyersDataGlobal
  );

  renderTreemapChart(treemapData, selectedValue);
});
