let chart;

function getValueForID(data, id) {
  const year = sessionStorage.getItem("mapYear");
  const yearList = data.filter((d) => d.MKOOD === id)[0].data[year];

  const statistic = "Price per unit area median(eur /m2)";
  return yearList.filter((d) => d["Area(m2)"] === "10-29,99")[0][statistic];
}

export function renderMap(geoJson, statsData) {
  const container = d3.select("#map-container");
  const width = container.node().getBoundingClientRect().width;
  const height = container.node().getBoundingClientRect().height;

  // Remove existing SVG if any
  container.select("svg").remove();

  const svg = container.append("svg").attr("viewBox", `0 0 ${width} ${height}`);
  const zoomGroup = svg.append("g");
  const rotationGroup = zoomGroup.append("g");

  const projection = d3.geoAlbers().fitSize([width, height], geoJson);
  const pathGenerator = d3.geoPath().projection(projection);

  // Bind data and create paths
  chart = rotationGroup
    .selectAll("path")
    .data(geoJson.features)
    .enter()
    .append("path")
    .attr("d", pathGenerator)
    .style("fill", (d) => {
      const id = d.properties.MKOOD;
      const value = getValueForID(statsData, id);
      return value
        ? d3.scaleSequential(d3.interpolateViridis).domain([0, 2000])(value)
        : "#ccc";
    })
    .style("stroke", "white");

  // Rotate map to center it properly
  const node = svg.node();
  const xCenter = node.getBBox().x + node.getBBox().width / 2;
  const yCenter = node.getBBox().y + node.getBBox().height / 1.7;
  rotationGroup.attr("transform", `rotate(70, ${xCenter}, ${yCenter})`);

  // Add interactivity (tooltips and click events)
  setupTooltip(chart);

  chart.on("click", (event, d) => {
    const pathId = formatPathID(d.properties.MNIMI);
    window.location.href = `/county/${pathId}`;
    sessionStorage.setItem("countyId", d.properties.MKOOD);
  });

  setupZoom(svg, zoomGroup);
  createLegend(svg, width);
}

function setupZoom(svg, zoomGroup) {
  const zoomBehavior = d3
    .zoom()
    .scaleExtent([0.5, 1.5])
    .on("zoom", (event) => {
      zoomGroup.attr("transform", event.transform);
    });

  svg.call(zoomBehavior);
}

function createLegend(svg, width) {
  const colorScale = d3
    .scaleSequential(d3.interpolateViridis)
    .domain([0, 100000]);
  const legendWidth = 300;

  const legendGroup = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${(width - legendWidth) / 2},10)`);

  const legendItems = legendGroup
    .selectAll(".legend-item")
    .data(colorScale.ticks(6))
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr(
      "transform",
      (d, i) =>
        `translate(${i * (legendWidth / colorScale.ticks(6).length)},140)`
    );

  legendItems
    .append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", colorScale);

  legendItems
    .append("text")
    .attr("x", 10)
    .attr("y", -5)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text((d) => d);
}

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
        const value = Math.sqrt(d.properties.AREA);
        return value
          ? d3.scaleSequential(d3.interpolateViridis).domain([0, 100000])(value)
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
  console.log("Updating map with new year.");
  chart
    .transition()
    .duration(150)
    .style("fill", (d) => {
      const id = d.properties.MKOOD;
      const value = getValueForID(statsData, id);
      return value
        ? d3.scaleSequential(d3.interpolateViridis).domain([0, 2000])(value)
        : "#ccc";
    })
    .style("stroke", "white");
}
