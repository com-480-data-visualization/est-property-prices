const dimensions = {
  width: 600,
  height: 600,
};

let chart;

export function renderBubbleChart(data) {
  const svg = d3
    .select("[bubble-chart]")
    .append("svg")
    .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`);

  var year = sessionStorage.getItem("year");

  chart = svg
    .append("text")
    .attr("x", dimensions.width / 2)
    .attr("y", dimensions.height / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-size", "24px")
    .style("fill", "steelblue")
    .text(year);
}

export function updateYearBubble(data, newYear) {
  chart.transition().duration(1500).text(newYear);
}
