const dimensions = {
    width: 600,
    height: 600,
  };
  
  let chart;
  
  export function renderTreemapChart(data) {
    const svg = d3
      .select("[treemap-chart]")
      .append("svg")
      .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`);
  
    const year = sessionStorage.getItem("year");
  
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
  
  export function updateYearTreemap(data, newYear) {
    chart.transition().duration(1500).text(newYear);
  }
  