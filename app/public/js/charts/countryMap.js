let chart;
let svg;
let legend;
let legendContainer;
let legendSvg;
let globalStatsData;
let maxValue;

const legendConf = {
  height: 40,
  width: "100%",
  tickSize: 6,
  marginTop: 0,
  marginRight: 0,
  marginLeft: 0,
};

function getValueForID(data, id) {
  const year = sessionStorage.getItem("year");
  const yearList = data.filter((d) => d.MKOOD === id)[0].data[year];

  const statistic = "Price per unit area median(eur /m2)";
  return yearList.filter((d) => d["Area(m2)"] === "TOTAL")[0][statistic];
}

function getMaxValueForCurrentYear(data) {
  const year = sessionStorage.getItem("year");
  const statistic = "Price per unit area median(eur /m2)";

  const maxValue = Math.max(
    ...data
      .flatMap((item) => item.data[year] || [])
      .filter((d) => d["Area(m2)"] === "TOTAL")
      .map((d) => parseFloat(d[statistic]))
      .filter((value) => !isNaN(value))
  );

  // Round up to the nearest 500
  return isFinite(maxValue) ? Math.ceil(maxValue / 500) * 500 : null;
}

export function renderMap(geoJson, statsData) {
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
      return value
        ? d3.scaleSequential(d3.interpolateCividis).domain([0, maxValue])(value)
        : "#ccc";
    })
    .style("stroke", "white");

  // Add interactivity (tooltips and click events)
  setupTooltip(chart);

  chart.on("click", (event, d) => {
    const pathId = formatPathID(d.properties.MNIMI);
    window.location.href = `/county/${pathId}`;
    sessionStorage.setItem("countyId", d.properties.MKOOD);
  });

  legendContainer = d3.select("#map-legend");
  const legendWidth = legendContainer.node().getBoundingClientRect().width;
  const legendHeight = legendContainer.node().getBoundingClientRect().height;

  legendSvg = legendContainer
    .append("svg")
    .attr("width", "100%") // Make it responsive
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${legendWidth} ${legendHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  legend = legendSvg.append("g").attr("class", "legend");
  // .attr("transform", `translate(${width - 400},30)`);

  Legend(d3.scaleSequential([0, maxValue], d3.interpolateCividis), {
    title: "",
    width: 400,
    marginLeft: 10,
    tickSize: 6,
  });

  console.log("global data: ", globalStatsData);
  // createLegend(svg, width);
}

function createLegend(svg, width) {}

function setupTooltip(paths) {
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  paths
    .on("mouseover", function (event, d) {
      d3.select(this).style("fill", "orange").style("cursor", "pointer");
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(d.properties.MNIMI)
        .style("left", `${event.pageX}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseout", function () {
      d3.select(this).style("fill", (d) => {
        const id = d.properties.MKOOD;
        const value = getValueForID(globalStatsData, id);
        return value
          ? d3.scaleSequential(d3.interpolateCividis).domain([0, 2000])(value)
          : "#000000";
      });
      tooltip.transition().duration(500).style("opacity", 0);
    });
}

function formatPathID(pathID) {
  return pathID
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-zõäöõü0-9-]/g, "");
}

export function updateYearMap(statsData) {
  chart
    .transition()
    .duration(150)
    .style("fill", (d) => {
      const id = d.properties.MKOOD;
      const value = getValueForID(statsData, id);
      return value
        ? d3.scaleSequential(d3.interpolateCividis).domain([0, maxValue])(value)
        : "#ccc";
    })
    .style("stroke", "white");
}

// https://observablehq.com/@d3/color-legend
function Legend(
  color,
  {
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

  width = legendContainer.node().getBoundingClientRect().width;
  height = legendContainer.node().getBoundingClientRect().height;

  let tickAdjust = (g) =>
    g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
  let x;

  x = Object.assign(
    color
      .copy()
      .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
    {
      range() {
        return [marginLeft, width - marginRight];
      },
    }
  );

  legend
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

  legend
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
  // updateLegendPosition();
}

function updateLegendPosition() {
  var height = parseInt(svg.style("height"), 10);
  legend.attr("transform", `translate(0, ${height - 35})`);
}

window.onresize = updateLegendPosition;
