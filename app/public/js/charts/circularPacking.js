const dimensions = {
  width: 928,
  height: 928,
};

let focus;

export function renderCircularPacking(data) {
  d3.select("[bubble-chart]").selectAll("*").remove();
  const svg = d3
    .select("[bubble-chart]")
    .append("svg")
    .attr(
      "viewBox",
      `-${dimensions.width / 2} -${dimensions.height / 2} ${dimensions.width} ${
        dimensions.height
      }`
    )
    .attr("style", "max-width: 100%; height: auto;");

  const color = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, 5]);

  const rootData = {
    name: "root",
    children: data,
  };

  const hierarchy = d3
    .hierarchy(rootData)
    .sum((d) => d["Total value (eur)"] || 0)
    .sort((a, b) => b.value - a.value);

  const packLayout = d3
    .pack()
    .size([dimensions.width, dimensions.height])
    .padding(3);

  const root = packLayout(hierarchy);
  focus = root;

  draw(svg, root, color);
}

function draw(svg, root, color) {
  const node = svg
    .selectAll("circle")
    .data(root.descendants().slice(1))
    .join("circle")
    .attr("fill", (d) => (d.children ? color(d.depth) : "white"))
    .attr("stroke", "#000")
    .attr("stroke-opacity", 0.1)
    .style("cursor", "pointer")
    .on(
      "click",
      (event, d) => focus !== d && (zoom(event, d), event.stopPropagation())
    );

  node
    .on("mouseover", function (event, d) {
      d3.select(this)
        .attr("stroke", "#222")
        .attr("stroke-width", 3)
        .attr("fill", d3.color(d3.select(this).attr("fill")).darker(0.5));
    })
    .on("mouseout", function (event, d) {
      d3.select(this)
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("fill", d3.color(d3.select(this).attr("fill")).brighter(0.5));
    });

  const label = svg
    .selectAll("text")
    .data(root.descendants())
    .join("text")
    .style("font-size", "10px")
    .attr("text-anchor", "middle")
    .text(
      (d) =>
        `${d.data.name}\n${d3.format(",.2r")(d.data["Total value (eur)"])}€`
    );

  svg.on("click", (event) => zoom(event, root));
  zoomTo([focus.x, focus.y, focus.r * 2]);

  function zoomTo(v) {
    const k = dimensions.width / v[2];

    label.attr(
      "transform",
      (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
    );
    node.attr(
      "transform",
      (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`
    );
    node.attr("r", (d) => d.r * k);
  }

  function zoom(event, d) {
    const transition = svg
      .transition()
      .duration(event.altKey ? 7500 : 750)
      .tween("zoom", () => {
        const i = d3.interpolateZoom(
          [focus.x, focus.y, focus.r * 2],
          [d.x, d.y, d.r * 2]
        );
        return (t) => zoomTo(i(t));
      });

    focus = d;
  }
}
