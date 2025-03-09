const dimensions = {
  width: 600,
  height: 150,
  marginBottom: 20,
};

export function createTimeline(data) {
  const svg = d3
    .select("[timeline]")
    /* Append the SVG */
    .append("svg")
    .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)
    .attr("overflow", "visible");

  const xAccessor = (d) => d.date;
  const yAccessor = (d) => d.pricePerSquareMeter;

  const xDomain = d3.extent(data, xAccessor);
  const xScale = d3.scaleTime().domain(xDomain).range([0, dimensions.width]);

  const yDomain = [0, d3.max(data, yAccessor)];
  const yScale = d3
    .scaleLinear()
    .domain(yDomain)
    .range([dimensions.height, 30]);

  const lineGenerator = d3
    .line()
    .x((d) => xScale(xAccessor(d)))
    .y((d) => yScale(yAccessor(d)))
    .curve(d3.curveBumpX);

  const line = svg
    .append("path")
    .datum(data)
    .attr("d", lineGenerator)
    .attr("stroke", "darkcyan")
    .attr("stroke-width", 1)
    .attr("stroke-linejoin", "round")
    .attr("fill", "none");

  const markerDot = svg
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 4)
    .attr("fill", "darkcyan")
    .attr("opacity", 0);

  svg
    .append("g")
    .attr(
      "transform",
      `translate(0,${dimensions.height - dimensions.marginBottom})`
    )
    .attr("class", "uk-text-small")
    .attr("class", "uk-text-light")
    .call(
      d3
        .axisBottom(xScale)
        .ticks(dimensions.width / 80)
        .tickSizeOuter(0)
    );

  const bisect = d3.bisector(xAccessor);

  svg.on("mousemove", (e) => {
    const pointerCoords = d3.pointer(e);
    const [posX, posY] = pointerCoords;

    /* Find date from position */
    const date = xScale.invert(posX);

    /* Find the closest data point */
    const index = bisect.center(data, date);
    const d = data[index];

    const x = xScale(xAccessor(d));
    const y = yScale(yAccessor(d));

    markerDot.attr("cx", x).attr("cy", y).attr("opacity", 1);
  });

  svg.on("mouseleave", () => {
    const lastDatum = data[data.length - 1];

    markerDot.attr("opacity", 0);

    // d3.select("[data-heading]").text("Weekly downloads");
    // d3.select("[data-total]").text(yAccessor(lastDatum));
  });

  // Add click event listener for interactivity
  svg.on("click", (e) => {
    const pointerCoords = d3.pointer(e);
    const [posX] = pointerCoords;

    /* Find date from position */
    const date = xScale.invert(posX);

    /* Find the closest data point */
    const index = bisect.center(data, date);
    const selectedData = data[index];

    console.log(`Selected Year: ${selectedData.date.getFullYear()}`);

    // Trigger callback to update other charts
    // updateChartsCallback(selectedData);
  });
}
