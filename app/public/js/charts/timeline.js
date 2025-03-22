import { dispatch } from "../county.js";

let svg;

const size = {
  height: 140,
};

const margin = { top: 0, right: 0, bottom: 6, left: 0 };

export function renderTimeline(data) {
  const container = d3.select("[timeline]");
  const containerWidth = container.node().getBoundingClientRect().width;
  const width = containerWidth - margin.left - margin.right;

  svg = container
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${size.height}`)
    // .attr("transform", `translate(${margin.left},${margin.top})`)
    .attr("overflow", "visible");

  const xAccessor = (d) => d.date;
  const yAccessor = (d) => d.pricePerSquareMeter;

  const xDomain = d3.extent(data, xAccessor);
  const xScale = d3.scaleTime().domain(xDomain).range([0, width]);

  const yDomain = [0, d3.max(data, yAccessor)];
  const yScale = d3.scaleLinear().domain(yDomain).range([size.height, 30]);

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
    .attr("stroke-width", 5)
    .attr("stroke-linejoin", "round")
    .attr("fill", "none");

  const areaGenerator = d3
    .area()
    .x((d) => xScale(xAccessor(d)))
    .y1((d) => yScale(yAccessor(d)))
    .y0(size.height)
    .curve(d3.curveBumpX);

  const area = svg
    .append("path")
    .datum(data)
    .attr("d", areaGenerator)
    .attr("fill", "lavender");

  // small dot for hover effect
  const hoverDot = svg
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 2)
    .attr("fill", "darkcyan")
    .attr("opacity", 0);

  // vertical line for click interaction
  const hoverLineVertical = svg
    .append("line")
    .attr("x1", -10)
    .attr("x2", -10)
    .attr("y1", 0)
    .attr("y2", size.height)
    .attr("stroke-width", 1)
    .attr("stroke", "gray")
    .attr("opacity", 0)
    .attr("pointer-events", "none")
    .attr("stroke-dasharray", "3,3");

  const hoverLineHorizontal = svg
    .append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", -10)
    .attr("y2", -10)
    .attr("stroke-width", 1)
    .attr("stroke", "gray")
    .attr("opacity", 0)
    .attr("pointer-events", "none")
    .attr("stroke-dasharray", "3,3");

  const bisect = d3.bisector(xAccessor);

  // Hover functionality
  svg.on("mousemove", (e) => {
    const [posX] = d3.pointer(e);
    const date = xScale.invert(posX);
    const index = bisect.center(data, date);
    const d = data[index];

    const x = xScale(xAccessor(d));
    const y = yScale(yAccessor(d));

    hoverLineVertical.attr("x1", x).attr("x2", x).attr("opacity", 1);
    hoverLineHorizontal.attr("y1", y).attr("y2", y).attr("opacity", 1);
    hoverDot.attr("cx", x).attr("cy", y).attr("opacity", 1);

    var selectedYear = d.date.getFullYear();
    dispatch.call("start", null, selectedYear);
    console.log(selectedYear);
  });
}
