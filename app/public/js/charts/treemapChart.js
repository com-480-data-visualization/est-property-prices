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
    .attr("id", "treemap-tooltip")
    .style("opacity", 0);

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
    .range(["#402D54", "#D18975"]);

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
    .style("stroke", "black")
    .style("fill", (d) => color(d.parent.data.name))
    .attr("rx", 6)
    .attr("ry", 6)
    .on("mouseover", function (event, d) {
      // Get metric label from propertyMap
      const metricLabel = Object.keys(propertyMap).find(
        (key) => propertyMap[key] === propertyName
      );

      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `
        <strong>${d.data.Name}</strong><br>
        ${metricLabel}: ${d.data[propertyName].toLocaleString()}
      `
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
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
    }) // +10 to adjust position (more right)
    .attr("y", function (d) {
      return d.y0 + 20;
    }) // +20 to adjust position (lower)
    .text(function (d) {
      return d.data.Name;
    })
    .attr("font-size", "15px")
    .attr("fill", "white");

  svg
    .selectAll("vals")
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
    }) // +10 to adjust position (more right)
    .attr("y", function (d) {
      return d.y0 + 35;
    }) // +20 to adjust position (lower)
    .text(function (d) {
      return d.data[propertyName];
    })
    .attr("font-size", "10px")
    .attr("fill", "white")

  // add title for the groups ("Buyers" and "Sellers")
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
    })
}
