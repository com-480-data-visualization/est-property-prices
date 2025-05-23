import { baseColor, contrastColor } from "../colors.js";

const dimensions = {
  width: 600,
  height: 600,
};

const hidden = {
  width: 100,
  height: 40,
};

export function renderTreemapChart(data, metric = "Number of Transactions") {
  d3.select("[treemap-chart]").selectAll("*").remove();

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("pointer-events", "none"); // Prevent tooltip from blocking mouse events

  const svg = d3
    .select("[treemap-chart]")
    .append("svg")
    .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`);

  const propertyMap = {
    "Number of Transactions": "Number",
    "Total area (ha)": "Total area (ha)",
    "Total value (€)": "Total value (eur)",
  };

  const propertyName = propertyMap[metric] || "Number";

  var root = d3.hierarchy(data).sum(function (d) {
    return d[propertyName];
  });

  var treemap = d3
    .treemap()
    .size([dimensions.width, dimensions.height])
    .paddingTop(28)
    .paddingRight(7)
    .paddingInner(3)(root);

  var color = d3
    .scaleOrdinal()
    .domain(["Buyers", "Sellers"])
    .range([baseColor, contrastColor]);

  // add rectangles with tooltip interactions
  svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .style("fill", (d) => color(d.parent.data.name))
    .attr("rx", 6)
    .attr("ry", 6)
    .on("mouseover", function (event, d) {
      const metricLabel = Object.keys(propertyMap).find(
        (key) => propertyMap[key] === propertyName
      );
      d3.select(this).style("fill", "orange"); // highlight on hover

      tooltip.html(""); // Clear any existing content

      tooltip.append("div").attr("class", "tooltip-title").text(d.data.Name);

      tooltip
        .append("div")
        .attr("class", "tooltip-label")
        .text(`${metricLabel}:`);

      tooltip
        .append("div")
        .attr("class", "tooltip-value")
        .text(d.data[propertyName].toLocaleString());

      // Position tooltip above mouse
      const tooltipNode = tooltip.node();
      const tooltipHeight = tooltipNode.getBoundingClientRect().height;
      const tooltipWidth = tooltipNode.getBoundingClientRect().width;
      let xPosition = event.pageX - 15;
      if (xPosition + tooltipWidth > window.innerWidth) {
        xPosition = window.innerWidth - tooltipWidth - 10;
      }
      if (xPosition < 0) xPosition = 10;

      tooltip
        .style("left", `${xPosition}px`)
        .style("top", `${event.pageY - tooltipHeight - 15}px`)
        .transition()
        .duration(200)
        .style("opacity", 1);
    })
    .on("mousemove", function (event) {
      // Keep tooltip above mouse, update horizontal position
      const tooltipNode = tooltip.node();
      const tooltipHeight = tooltipNode.getBoundingClientRect().height;
      const tooltipWidth = tooltipNode.getBoundingClientRect().width;
      let xPosition = event.pageX - 15;
      if (xPosition + tooltipWidth > window.innerWidth) {
        xPosition = window.innerWidth - tooltipWidth - 10;
      }
      if (xPosition < 0) xPosition = 10;

      tooltip
        .style("left", `${xPosition}px`)
        .style("top", `${event.pageY - tooltipHeight - 15}px`);
    })
    .on("mouseout", function (event, d) {
      // restore original color
      d3.select(this).style("fill", color(d.parent.data.name));
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // add text labels only if the cell is large enough
  svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
    .filter(function (d) {
      const width = d.x1 - d.x0;
      const height = d.y1 - d.y0;
      return width > hidden.width && height > hidden.height;
    })
    .attr("x", function (d) {
      return d.x0 + 5;
    })
    .attr("y", function (d) {
      return d.y0 + 20;
    })
    .text(function (d) {
      return d.data.Name;
    })
    .attr("font-size", "15px")
    .attr("fill", "white");

  svg
    .selectAll("titles")
    .data(
      root.descendants().filter(function (d) {
        return d.depth === 1;
      })
    )
    .enter()
    .append("text")
    .attr("x", function (d) {
      return d.x0 + 5;
    })
    .attr("y", function (d) {
      return d.y0 + 21;
    })
    .text(function (d) {
      return d.data.name;
    });
}
