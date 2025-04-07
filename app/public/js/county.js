import { renderTimeline } from "./charts/timeline.js";
import {
  renderMunicipalityMap,
  updateMunicipalityMap,
} from "./charts/municipalityMap.js";
import { renderSpiderChart } from "./charts/spiderChart.js";
import { renderBubbleChart, updateYearBubble } from "./charts/bubbleChart.js";
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

const year = sessionStorage.getItem("year");
const treemapDropdown = document.querySelector(".uk-select.treemap-select");

export const dispatch = d3.dispatch("start", "end");
dispatch.on("start", updateChartsWithYear);

let sellersDataGlobal;
let buyersDataGlobal;

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
      pricePerSquareMeter: entry.filter((d) => d["Area(m2)"] === "TOTAL")[0][
        "Price per unit area median(eur /m2)"
      ],
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
])
  .then(
    ([
      municipalityMapData,
      countyData,
      fetchedData,
      municipalityStats,
      sellersData,
      buyersData,
    ]) => {
      // fetchedLandTypeData = fetchedData; // Store globally
      sellersDataGlobal = sellersData;
      buyersDataGlobal = buyersData;

      const id = sessionStorage.getItem("countyId");
      const selectedYear = sessionStorage.getItem("year");

      countyData = getCountyRelatedStatistics(countyData, id);
      landTypeData = getCountyRelatedStatistics(fetchedData, id);

      const maxValue = Math.max(
        ...Object.values(landTypeData.data) // Iterate over all years' data
          .flatMap((year) => year.map((entry) => entry["Total area (ha)"])) // Extract values
      );

      const timelineData = formatTimelineData(countyData);
      renderTimeline(timelineData);

      const yearData = landTypeData.data[selectedYear];
      const spiderData = formatSpiderData(yearData);
      renderSpiderChart(spiderData, maxValue);

      renderBubbleChart(null);
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
  console.log("rendering treemap");
  renderTreemapChart(treemapData, treemapDropdown.value);

  updateYearBubble(null, selectedYear);
  updateMunicipalityMap();
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
