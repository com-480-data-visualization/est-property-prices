const dimensions = {
  width: 500,
  height: 500,
  radius: 200,
};

let svg; // Declare chart at the module level

export function renderSpiderChart(data, maxValue) {
  d3.select("[spider-chart]").selectAll("*").remove(); // Clear previous chart

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
  // const maxValue = d3.max(data, (d) => d.value);
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
      .attr("x", 5) // Adjust position
      .attr("y", -r) // Place label on the left side of the grid
      .attr("font-size", "12px")
      .attr("fill", "black")
      .text(`${Math.round((i / numCircles) * maxValue)} ha`);
  });

  // Define radial line generator
  const line = d3
    .lineRadial()
    .radius((d) => scale(d.value))
    .angle((d, i) => i * angleSlice);

  // Draw filled area with transparency
  svg
    .append("path")
    .datum(data)
    .attr("d", line)
    .attr("fill", "steelblue")
    .attr("opacity", 0.5);

  // Add category labels
  svg
    .selectAll("text.category-label") // Ensure only category labels are targeted
    .data(data)
    .enter()
    .append("text")
    .attr("class", "category-label") // Add class for differentiation
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
    .attr("font-size", "14px")
    .attr("fill", "black") // Ensure text is visible
    .text((d) => d.category);


  // Add interactive points with tooltips
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "5px")
    .style("border", "1px solid black")
    .style("border-radius", "5px")
    .style("visibility", "hidden");

  svg
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
    .attr("r", 4)
    .attr("fill", "steelblue")
    .on("mouseover", (event, d) => {
      tooltip
        .style("visibility", "visible")
        .text(`${d.category}: ${d.value.toFixed(2)}`);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("top", `${event.pageY - 12}px`)
        .style("left", `${event.pageX + 12}px`);
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });
}

export function updateYearSpider(data) {
  // Function to update chart dynamically if needed
}
