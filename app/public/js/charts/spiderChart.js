import { baseColor, darkBaseColor } from "../colors.js";

const dimensions = {
  width: 500,
  height: 500,
  radius: 200,
};

function setupTooltip(paths) {
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  paths
    .on("mouseover", function (event, d) {
      tooltip.html("");

      tooltip
        .append("div")
        .attr("class", "tooltip-label")
        .text(`${d.category} (ha):`);

      tooltip
        .append("div")
        .attr("class", "tooltip-value")
        .text(`${d.value.toFixed(2)}`);

      const tooltipHeight = tooltip.node().getBoundingClientRect().height;
      tooltip
        .style("left", `${event.pageX - 20}px`)
        .style("top", `${event.pageY - tooltipHeight - 15}px`)
        .transition()
        .duration(200)
        .style("opacity", 1);
    })
    .on("mouseout", function () {
      tooltip.transition().duration(500).style("opacity", 0);
    })
    .on("mousemove", function (event) {
      const tooltipNode = tooltip.node();
      const tooltipWidth = tooltipNode.getBoundingClientRect().width;

      let xPosition = event.pageX - 20;
      if (xPosition + tooltipWidth > window.innerWidth) {
        xPosition = window.innerWidth - tooltipWidth - 10;
      }

      tooltip.style("left", `${xPosition}px`);
    });
}

export function renderSpiderChart(data, maxValue) {
  d3.select("[spider-chart]").selectAll("*").remove();

  const svg = d3
    .select("[spider-chart]")
    .append("svg")
    .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)
    .append("g")
    .attr(
      "transform",
      `translate(${dimensions.width / 2}, ${dimensions.height / 2})`
    );

  const angleSlice = (2 * Math.PI) / data.length;

  const scale = d3
    .scaleLinear()
    .domain([0, maxValue])
    .range([0, dimensions.radius]);

  // Add circular grid lines with scale labels
  const numCircles = 5;
  const gridGroup = svg.append("g").attr("class", "grid-lines");

  d3.range(1, numCircles + 1).forEach((i) => {
    const r = (i / numCircles) * dimensions.radius;

    // Add circles
    gridGroup
      .append("circle")
      .attr("r", r)
      .attr("fill", "none")
      .attr("stroke", "gray")
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0.5);

    // Add scale labels
    gridGroup
      .append("text")
      .attr("x", -12) // Adjust position
      .attr("y", -r - 5) // Place label on the left side of the grid
      .attr("class", "radar-chart-scale")
      .attr("fill", "currentColor")
      .text(`${Math.round((i / numCircles) * maxValue)} ha`);
  });

  // Define radial line generator
  const line = d3
    .lineRadial()
    .radius((d) => scale(d.value))
    .angle((d, i) => i * angleSlice);

  // Draw filled area with transparency
  const closedData = [...data, data[0]];
  svg
    .append("path")
    .datum(closedData)
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke-width", 2)
    // .attr("fill", baseColor)
    // .attr("stroke-width", 0)
    .attr("stroke", baseColor)
    .attr("opacity", 0.7);

  // Add category labels
  svg
    .selectAll("text.category-label") // Ensure only category labels are targeted
    .data(data)
    .enter()
    .append("text")
    .attr("class", "uk-text-meta") // Add class for differentiation
    // .attr("fill", "currentColor")
    .attr(
      "x",
      (d, i) =>
        (dimensions.radius + 20) * Math.cos(i * angleSlice - Math.PI / 2)
    )
    .attr(
      "y",
      (d, i) =>
        (dimensions.radius + 20) * Math.sin(i * angleSlice - Math.PI / 2)
    )
    .attr("text-anchor", "middle")
    .text((d) => d.category);

  const circles = svg
    .selectAll("circle.data-point")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "data-point")
    .attr(
      "cx",
      (d, i) => scale(d.value) * Math.cos(i * angleSlice - Math.PI / 2)
    )
    .attr(
      "cy",
      (d, i) => scale(d.value) * Math.sin(i * angleSlice - Math.PI / 2)
    )
    .attr("r", 7)
    .attr("opacity", 1)
    .attr("fill", darkBaseColor);

  setupTooltip(circles);
}

export function updateYearSpider(data) {
  // Function to update chart dynamically if needed
}
