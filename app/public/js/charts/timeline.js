import { baseColor, contrastColor } from "../colors.js";
import { dispatch } from "../county.js";

let svg, xScale;
const size = { height: 160 };
const margin = { top: 20, right: 20, bottom: 30, left: 40 };

function renderLegend(svg){
  const legendData = [
    { label: "m2 price", color: baseColor },
    { label: "avg salary", color: contrastColor }
  ];
  
  // Append a group for the legend
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(30,30)");

  // Add colored rectangles
  legend.selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", 20)
    .attr("y", (d, i) => i * 20)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", d => d.color);

  // Add text labels
  legend.selectAll("text")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", 35)
    .attr("y", (d, i) => i * 20 + 8)
    .style("font-size", "12px")
    .text(d => d.label);

}

export function renderTimeline(data) {
  const container = d3.select("[timeline]");
  const containerWidth = container.node().getBoundingClientRect().width;
  const width = containerWidth - margin.left - margin.right;

  container.html("");

  console.log(data)
  svg = container
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${size.height}`)
    .attr("overflow", "visible");

  const chartGroup = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xAccessor = (d) => d.date;
  const yAccessor = (d) => d.pricePerSquareMeter;
  const ySalaryAccessor = (d) => d.meanSalary;

  xScale = d3.scaleTime().domain(d3.extent(data, xAccessor)).range([0, width]);

  const yScale = d3
    .scaleLinear()
    // Get the maximum value for price per m2 or mean salary
    .domain([0, Math.max(d3.max(data, yAccessor), d3.max(data, ySalaryAccessor))])
    .range([size.height - margin.top - margin.bottom, 0]);

  // add background color for grid
  chartGroup
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", size.height - margin.top - margin.bottom)
    .attr("fill", "#f9f9f9"); // Light gray background

  // add horizontal gridlines
  const yGrid = d3.axisLeft(yScale).tickSize(-width).tickFormat("").ticks(5);

  chartGroup.append("g").attr("class", "grid").call(yGrid);

  // add vertical gridlines
  const xGrid = d3
    .axisBottom(xScale)
    .tickSize(-(size.height - margin.top - margin.bottom))
    .tickFormat("")
    .ticks(d3.timeYear.every(2));

  chartGroup
    .append("g")
    .attr("class", "grid")
    .attr(
      "transform",
      `translate(0,${size.height - margin.top - margin.bottom})`
    )
    .call(xGrid);

  // X Axis
  const xAxis = d3
    .axisBottom(xScale)
    .ticks(d3.timeYear.every(2))
    .tickFormat(d3.timeFormat("%Y"));

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr(
      "transform",
      `translate(${margin.left},${size.height - margin.bottom})`
    )
    .call(xAxis)
    .call((g) => g.select(".domain").remove());

  // Y Axis
  let yAxis;

  
  yAxis = d3
    .axisLeft(yScale)
    .ticks(5)
    .tickFormat((d) => `${d3.format(",.0f")(d)}`);

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .call(yAxis)
    .call((g) => g.select(".domain").remove());

  // chart line
  const lineGenerator = d3
    .line()
    .x((d) => xScale(xAccessor(d)))
    .y((d) => yScale(yAccessor(d)))
    .curve(d3.curveBumpX);

  chartGroup
    .append("path")
    .datum(data)
    .attr("d", lineGenerator)
    .attr("stroke", baseColor)
    .attr("stroke-width", 3)
    .attr("fill", "none");

  const salaryLineGenerator = d3
    .line()
    .x((d) => xScale(xAccessor(d)))
    .y((d) => yScale(ySalaryAccessor(d)))
    .curve(d3.curveBumpX);

  chartGroup
    .append("path")
    .datum(data)
    .attr("d", salaryLineGenerator)
    .attr("stroke", contrastColor)
    .attr("stroke-width", 3)
    .attr("fill", "none");

  renderLegend(svg)

  // slider indicator
  const sliderIndicator = chartGroup
    .append("g")
    .attr("class", "slider-indicator")
    .attr("opacity", 0);

  sliderIndicator
    .append("line")
    .attr("stroke", baseColor)
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "3,3")
    .attr("y1", 0)
    .attr("y2", size.height - margin.top - margin.bottom);

  sliderIndicator
    .append("text")
    .attr("class", "uk-text-meta uk-text-light")
    .attr("text-anchor", "middle")
    .attr("dy", "-0.5em");
  
}

document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("year-slider");
  const selectedYearDisplay = document.getElementById("selected-year");

  const storedYear = sessionStorage.getItem("year");
  if (storedYear) {
    slider.value = storedYear;
    selectedYearDisplay.textContent = storedYear;
  }

  const updateSliderIndicator = (year) => {
    if (!xScale) return;

    const date = new Date(year, 0, 1);
    const xPos = xScale(date);

    d3.select(".slider-indicator")
      .transition()
      .duration(100)
      .attr("transform", `translate(${xPos},0)`)
      .attr("opacity", 1);

    selectedYearDisplay.textContent = year; // Update displayed year in HTML
  };

  slider.addEventListener("input", (event) => {
    const selectedYear = event.target.value;

    dispatch.call("start", null, parseInt(selectedYear));

    updateSliderIndicator(selectedYear);
  });

  // initial update
  updateSliderIndicator(slider.value);
});
