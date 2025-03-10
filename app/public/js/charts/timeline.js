import { dispatch } from "../county.js"

const dimensions = {
  width: 600,
  height: 150,
  marginBottom: 20,
};

export function renderTimeline(data) {
  const svg = d3
    .select("[timeline]")
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

  svg
    .append("path")
    .datum(data)
    .attr("d", lineGenerator)
    .attr("stroke", "darkcyan")
    .attr("stroke-width", 1)
    .attr("stroke-linejoin", "round")
    .attr("fill", "none");

  // small dot for hover effect
  const hoverDot = svg
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 4)
    .attr("fill", "darkcyan")
    .attr("opacity", 0);

  // bigger dot for click interaction
  const clickedDot = svg
    .append("circle")
    .attr("cx", -10) // Initially off-screen
    .attr("cy", -10)
    .attr("r", 6) // Larger radius
    .attr("fill", "darkcyan")
    .attr("opacity", 0);

  // vertical line for click interaction
  const clickedLine = svg
    .append("line")
    .attr("x1", -10)
    .attr("x2", -10)
    .attr("y1", 0)
    .attr("y2", dimensions.height)
    .attr("stroke-width", 1)
    .attr("stroke", "darkcyan")
    .attr("opacity", 0);

  svg
    .append("g")
    .attr("transform", `translate(0,${dimensions.height - dimensions.marginBottom})`)
    .call(d3.axisBottom(xScale).ticks(dimensions.width / 80).tickSizeOuter(0));

  const bisect = d3.bisector(xAccessor);

  // Hover functionality
  svg.on("mousemove", (e) => {
    const [posX] = d3.pointer(e);
    const date = xScale.invert(posX);
    const index = bisect.center(data, date);
    const d = data[index];

    const x = xScale(xAccessor(d));
    const y = yScale(yAccessor(d));

    hoverDot.attr("cx", x).attr("cy", y).attr("opacity", 1);
  });

  svg.on("mouseleave", () => {
    hoverDot.attr("opacity", 0);
  });

  svg.on("click", (e) => {
    const [posX] = d3.pointer(e);
    const date = xScale.invert(posX);
    const index = bisect.center(data, date);
    const selectedData = data[index];

    const x = xScale(xAccessor(selectedData));
    const y = yScale(yAccessor(selectedData));

    clickedDot
      .attr("cx", x)
      .attr("cy", y)
      .attr("opacity", 1);

    clickedLine
      .attr("x1", x)
      .attr("x2", x)
      .attr("opacity", 1);
    
    svg.selectAll('circle, path')
      .style('cursor', 'pointer');

    var selectedYear = selectedData.date.getFullYear();
    dispatch.call("start", null, selectedYear);
  });
}
