import { CustomGradient, darkBaseColor } from "../colors.js";

let chart;
let svg;
let globalStatsData;
let maxValue;

function getValueForID(data, id) {
  const year = sessionStorage.getItem("year");
  const yearList = data.filter((d) => d.MKOOD === id)[0].data[year];

  const statistic = "Price per unit area avg(eur /m2)";
  return yearList.filter((d) => d["Area(m2)"] === "TOTAL")[0][statistic];
}

export function getMaxValueForCurrentYear(data) {
  const statistic = "Price per unit area avg(eur /m2)";

  const maxValue = Math.max(
    ...data.flatMap((item) =>
      Object.values(item.data) // Get data for all years
        .flatMap((yearData) => yearData || [])
        .filter((d) => d["Area(m2)"] === "TOTAL")
        .map((d) => parseFloat(d[statistic]))
        .filter((value) => !isNaN(value))
    )
  );

  // Round up to the nearest 500
  return isFinite(maxValue) ? Math.ceil(maxValue / 1000) * 1000 : null;
}

export function renderMap(geoJson, statsData, citiesData) {
  globalStatsData = statsData;
  const container = d3.select("#map-container");
  const width = container.node().getBoundingClientRect().width;
  const height = width / 1.53;

  // Remove existing SVG if any
  container.select("svg").remove();

  svg = container
    .append("svg")
    .attr("width", "100%") // Make it responsive
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const projection = d3.geoMercator().fitExtent(
    [
      [0, 0],
      [width - 0, height - 0],
    ],
    geoJson
  );
  const pathGenerator = d3.geoPath().projection(projection);

  maxValue = getMaxValueForCurrentYear(statsData);

  // Bind data and create paths
  chart = svg
    .selectAll("path")
    .data(geoJson.features)
    .enter()
    .append("path")
    .attr("d", pathGenerator)
    .style("fill", (d) => {
      const id = d.properties.MKOOD;
      const value = getValueForID(statsData, id);
      const colorScale = CustomGradient(0, maxValue);
      return value ? colorScale(value) : "#ccc";
    })
    .style("stroke", "white");

  // Add interactivity (tooltips and click events)
  setupTooltip(chart);

  chart.on("click", (event, d) => {
    const pathId = formatPathID(d.properties.MNIMI);
    window.location.href = `/county/${pathId}`;
    sessionStorage.setItem("countyId", d.properties.MKOOD);
  });

  // Generate tick values every 1000 from 0 to maxValue
  const tickValues = [];
  for (let i = 0; i <= maxValue; i += 1000) {
    tickValues.push(i);
  }
  if (tickValues[tickValues.length - 1] !== maxValue) {
    tickValues.push(maxValue);
  }

  Legend(CustomGradient(0, maxValue), {
    title: "",
    width: 400,
    marginLeft: 10,
    tickSize: 6,
    tickValues: tickValues,
    tickFormat: ",d",
  });

  // Draw city markers as dashed gray circles
  svg.selectAll("circle.city")
    .data(citiesData.features)
    .enter()
    .append("circle")
    .attr("class", "city")
    .attr("cx", d => projection(d.geometry.coordinates)[0])
    .attr("cy", d => projection(d.geometry.coordinates)[1])
    .attr("r", 6) // Adjust radius as needed
    .attr("r", 7)
    .attr("opacity", 1)
    .attr("fill", darkBaseColor);

  // Optional: Add city name labels next to circles
  svg.selectAll("text.city-label")
    .data(citiesData.features)
    .enter()
    .append("text")
    .attr("class", "city-label")
    .attr("x", d => projection(d.geometry.coordinates)[0] + 8)
    .attr("y", d => projection(d.geometry.coordinates)[1] + 4)
    .text(d => d.properties.name)
    .attr("font-size", "10px")
    .attr("fill", "black")
    .attr("pointer-events", "none");



}

function setupTooltip(paths) {
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  paths
    .on("mouseover", function (event, d) {
      // Change cursor to pointer
      d3.select(this)
        .style("cursor", "pointer")
        .style("fill", "orange");
        
      const id = d.properties.MKOOD;
      const year = sessionStorage.getItem("year");
      const stats = globalStatsData.find((item) => item.MKOOD === id)?.data[year]?.find(
        (data) => data["Area(m2)"] === "TOTAL"
      );

      if (!stats) return;

      const min = stats["Price per unit area min(eur /m2)"];
      const max = stats["Price per unit area max(eur /m2)"];
      const median = stats["Price per unit area median(eur /m2)"];
      const avg = stats["Price per unit area avg(eur /m2)"];
      const std = stats["Price per unit area std(eur /m2)"];
      
      const q1 = Math.max(min, median - std/2);
      const q3 = Math.min(max, median + std/2);

      tooltip.html("");

      tooltip.append("div")
        .attr("class", "tooltip-title")
        .text(d.properties.MNIMI.replace("maakond", "county"));

      tooltip.append("div")
        .attr("class", "tooltip-label")
        .text("Average transaction price (€ / m²):");

      tooltip.append("div")
        .attr("class", "tooltip-value")
        .text(`${median.toFixed(2)}`);

      const tooltipHeight = tooltip.node().getBoundingClientRect().height;
      
      tooltip
        .style("left", `${event.pageX - 20}px`)
        .style("top", `${event.pageY - tooltipHeight - 15}px`) // Position above the cursor
        .transition()
        .duration(200)
        .style("opacity", 1);
    })
    .on("mouseout", function () {
      d3.select(this)
        .style("cursor", "default")
        .style("fill", (d) => {
          const id = d.properties.MKOOD;
          const value = getValueForID(globalStatsData, id);
          const colorScale = CustomGradient(0, maxValue);
          return value ? colorScale(value) : "#ccc";
        });
        
      tooltip.transition().duration(500).style("opacity", 0);
    })
    .on("mousemove", function(event) {
      const tooltipNode = tooltip.node();
      const tooltipHeight = tooltipNode.getBoundingClientRect().height;
      const tooltipWidth = tooltipNode.getBoundingClientRect().width;
      
      let xPosition = event.pageX - 20;
      let yPosition = event.pageY - tooltipHeight - 15;
      if (xPosition + tooltipWidth > window.innerWidth) {
        xPosition = window.innerWidth - tooltipWidth - 10;
      }
      
      tooltip
        .style("left", `${xPosition}px`)
        .style("top", `${yPosition}px`);
    });
}

function formatPathID(pathID) {
  return pathID
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-zõäöõü0-9-]/g, "");
}

export function updateYearMap(statsData) {
  if (!chart) return;
  chart
    .transition()
    .duration(150)
    .style("fill", (d) => {
      const id = d.properties.MKOOD;
      const value = getValueForID(statsData, id);
      const colorScale = CustomGradient(0, maxValue);
      return value ? colorScale(value) : "#ccc";
    })
    .style("stroke", "white");
}

// https://observablehq.com/@d3/color-legend
export function Legend(
  color,
  {
    legendId = "#map-legend",
    title,
    tickSize = 6,
    width = 500,
    height = 24 + tickSize,
    marginTop = 0,
    marginRight = 14,
    marginBottom = 16 + tickSize,
    marginLeft = 0,
    ticks = width / 64,
    tickFormat,
    tickValues,
  } = {}
) {
  function ramp(color, n = 256) {
    const canvas = document.createElement("canvas");
    canvas.width = n;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
      context.fillStyle = color(i / (n - 1));
      context.fillRect(i, 0, 1, 1);
    }
    return canvas;
  }

  const legendContainer = d3.select("#map-legend");
  const legendWidth = legendContainer.node().getBoundingClientRect().width;
  const legendHeight = legendContainer.node().getBoundingClientRect().height;

  width = legendContainer.node().getBoundingClientRect().width;
  height = legendContainer.node().getBoundingClientRect().height;

  const legendSvg = legendContainer
    .append("svg")
    .attr("width", "100%") // Make it responsive
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${legendWidth} ${legendHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  let tickAdjust = (g) =>
    g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
  let x;

  x = Object.assign(
    color.copy().interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
    {
      range() {
        return [marginLeft, width - marginRight];
      }
    }
  );

  legendSvg
    .append("image")
    .attr("x", marginLeft)
    .attr("y", marginTop)
    .attr("width", width - marginLeft - marginRight)
    .attr("height", height - marginTop - marginBottom)
    .attr("preserveAspectRatio", "none")
    .attr("xlink:href", ramp(color.interpolator()).toDataURL());

  // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
  if (!x.ticks) {
    if (tickValues === undefined) {
      const n = Math.round(ticks + 1);
      tickValues = d3
        .range(n)
        .map((i) => d3.quantile(color.domain(), i / (n - 1)));
    }
    if (typeof tickFormat !== "function") {
      tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
    }
  }

  legendSvg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
        .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
        .tickSize(tickSize)
        .tickValues(tickValues)
    )
    .call(tickAdjust)
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop + marginBottom - height - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .attr("class", "title")
        .text(title)
    );
}
