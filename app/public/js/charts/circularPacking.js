import { CustomGradient, defaultColors } from "../colors.js";

const dimensions = {
  width: 928,
  height: 928,
};

let focus;
let colorScale;

Object.defineProperty(String.prototype, 'capitalize', {
  value: function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false
});

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

  const valueExtent = d3.extent(
    root.descendants().slice(1),
    (d) => d.value / 1e6 // convert to millions
  );
  
  colorScale = CustomGradient(
    valueExtent[0], 
    valueExtent[1], 
    defaultColors.slice(0, 4) // only use first 4 colors
  );

  draw(svg, root);
}

function draw(svg, root) {
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.15)")
    .style("pointer-events", "none");

  const node = svg
    .selectAll("circle")
    .data(root.descendants().slice(1))
    .join("circle")
    .attr("fill", (d) => colorScale(d.value / 1e6)) // convert to millions
    .attr("stroke", "#213A57")
    .attr("stroke-opacity", 0.3)
    .style("cursor", "pointer")
    .on(
      "click",
      (event, d) => focus !== d && (zoom(event, d), event.stopPropagation())
    );

  node
    .on("mouseover", function (event, d) {
      d3.select(this)
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 2)
        .attr("fill", d3.color(colorScale(d.value / 1e6)).darker(0.3));

      tooltip.html(`
        <div class="tooltip-title">${d.data.name.capitalize()}</div>
        <div class="tooltip-label">Total Value (€):</div>
        <div class="tooltip-value">${d3.format(",.2f")(d.value / 1e6)}M</div>
      `);

      const [x, y] = adjustTooltipPosition(event, tooltip);
      tooltip
        .style("left", `${x}px`)
        .style("top", `${y}px`)
        .transition()
        .duration(200)
        .style("opacity", 1);
    })
    .on("mouseout", function (event, d) {
      d3.select(this)
        .attr("stroke-opacity", 0.3)
        .attr("stroke-width", 1)
        .attr("fill", colorScale(d.value / 1e6));

      tooltip.transition().duration(500).style("opacity", 0);
    })
    .on("mousemove", function(event) {
      const [x, y] = adjustTooltipPosition(event, tooltip);
      tooltip.style("left", `${x}px`).style("top", `${y}px`);
    });

  svg.on("click", (event) => zoom(event, root));
  zoomTo([focus.x, focus.y, focus.r * 2]);

  function adjustTooltipPosition(event, tooltip) {
    const tooltipNode = tooltip.node().getBoundingClientRect();
    let x = event.pageX + 10;
    let y = event.pageY - tooltipNode.height - 15;
    
    // Prevent right edge overflow
    if (x + tooltipNode.width > window.innerWidth) {
      x = window.innerWidth - tooltipNode.width - 10;
    }
    
    // Prevent top edge overflow
    if (y < 10) y = event.pageY + 20;
    
    return [x, y];
  }

  function zoomTo(v) {
    const k = dimensions.width / v[2];
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
