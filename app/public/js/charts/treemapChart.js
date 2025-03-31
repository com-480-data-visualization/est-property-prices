const dimensions = {
  width: 600,
  height: 600,
};

let chart;

export function renderTreemapChart(data, metric = "Number of Transactions") {
  d3.select("[treemap-chart]").selectAll("*").remove();

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

  // Give the data to this cluster layout:
  var root = d3.hierarchy(data).sum(function (d) {
    return d[propertyName];
  });

  // Then d3.treemap computes the position of each element of the hierarchy
  var treemap = d3
    .treemap()
    .size([dimensions.width, dimensions.height])
    .paddingTop(28)
    .paddingRight(7)
    .paddingInner(3)(
    // Padding between each rectangle
    //.paddingOuter(6)
    //.padding(20)
    root
  );

  // prepare a color scale
  var color = d3
    .scaleOrdinal()
    .domain(["Buyers", "Sellers"])
    .range(["#402D54", "#D18975"]);

  // And an opacity scale
  var opacity = d3.scaleLinear().domain([10, 30]).range([0.5, 1]);

  // use this information to add rectangles:
  svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return d.x0;
    })
    .attr("y", function (d) {
      return d.y0;
    })
    .attr("width", function (d) {
      return d.x1 - d.x0;
    })
    .attr("height", function (d) {
      return d.y1 - d.y0;
    })
    .style("stroke", "black")
    .style("fill", function (d) {
      return color(d.parent.data.Name);
    })
    .style("opacity", function (d) {
      return opacity(d.data[propertyName]);
    })
    .attr("rx", 6)
    .attr("ry", 6);

  // and to add the text labels
  // const tooSmall = width < 0.001 || height < 0.001

  svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
    .attr("x", function (d) {
      return d.x0 + 5;
    }) // +10 to adjust position (more right)
    .attr("y", function (d) {
      return d.y0 + 20;
    }) // +20 to adjust position (lower)
    .text(function (d) {
      return d.data.Name;
    })
    // .attr('opacity', tooSmall ? 0 : 0.9)
    .attr("font-size", "16px")
    .attr("fill", "white");

  // and to add the text labels
  svg
    .selectAll("vals")
    .data(root.leaves())
    .enter()
    .append("text")
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
    .attr("fill", "white");

  // Add title for the 3 groups
  svg
    .selectAll("titles")
    .data(
      root.descendants().filter(function (d) {
        return d.depth == 1;
      })
    )
    .enter()
    .append("text")
    .attr("x", function (d) {
      return d.x0;
    })
    .attr("y", function (d) {
      return d.y0 + 21;
    })
    .text(function (d) {
      return d.data.name;
    })
    .attr("font-size", "19px")
    .attr("fill", function (d) {
      return color(d.data.name);
    });

  // Add title for the 3 groups
  svg
    .selectAll("titles")
    .data(
      root.descendants().filter(function (d) {
        return d.depth == 1;
      })
    )
    .enter()
    .append("text")
    .attr("x", function (d) {
      return d.x0;
    })
    .attr("y", function (d) {
      return d.y0 + 21;
    })
    .text(function (d) {
      return d.data.Name;
    })
    .attr("font-size", "19px")
    .attr("fill", function (d) {
      return color(d.data.Name);
    });
}

export function updateYearTreemap(data, newYear) {
  chart.transition().duration(1500).text(newYear);
}
