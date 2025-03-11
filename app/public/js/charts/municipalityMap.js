const conf = {
  width: 600,
  height: 350,
  landColor: "#09A573",
  landStroke: "#FCF5E9",
  markerColor: "#E26F99",
  backgroundColor: "#EAF2FA",
};

export function renderMunicipalityMap(data) {
  const projection = d3.geoAlbers().fitSize([conf.width, conf.height], data);
  const pathGenerator = d3.geoPath().projection(projection);

  const svg = d3
    .select("[municipality-map]")
    .append("svg")
    .attr("viewBox", `0 0 ${conf.width} ${conf.height}`);

  const path = svg
    .selectAll("path")
    .data(data.features)
    .join("path")
    .attr("d", pathGenerator)
    .style("fill", (d) => {
      const value = Math.sqrt(d.properties.AREA);
      return value
        ? d3.scaleSequential(d3.interpolateViridis).domain([0, 100000])(value)
        : "#000000";
    })
    .attr("stroke", conf.landStroke)
    .attr("stroke-width", 1);

  const node = svg.node();
  const xCenter = node.getBBox().x + node.getBBox().width / 2;
  const yCenter = node.getBBox().y + node.getBBox().height / 2;
  path.attr("transform", `rotate(70, ${xCenter}, ${yCenter})`);
}
