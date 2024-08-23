import { createEffect, createSignal } from "solid-js";
import * as d3 from "d3";
import weaponsJson from "./assets/weapons.json";

const width = 1440;
const height = 810;
const margin = 40;

type Row = {
  "Weapon Name": string;
  Translated: string;
  "Teammate Rank": string;
  "Enemy Rank": string;
};

const nameToId = Object.entries(weaponsJson).map(([key, value]) => {
  return [value, key.replace("MAIN_", "")];
});

function App() {
  let svgRef: SVGSVGElement | undefined;
  const [data, setData] =
    createSignal<{ x: number; y: number; name: string; img: string }[]>();

  d3.csv("/data.csv").then((csv) => {
    if (!svgRef) return;

    setData(
      csv.map((row: Row) => {
        const id = nameToId.find(([key]) => key === row["Translated"])?.[1];

        return {
          x: parseFloat(row["Teammate Rank"]) - 0.009148,
          y: parseFloat(row["Enemy Rank"]) + 0.009148,
          name: row["Translated"],
          img: `https://sendou.ink/static-assets/img/main-weapons/${id}.png`,
        };
      })
    );
  });

  createEffect(() => {
    const max = Math.max(
      ...d3.extent(data()!, (d) => d.x).map((v) => Math.abs(v! - 0.5)),
      ...d3.extent(data()!, (d) => d.y).map((v) => Math.abs(v! - 0.5))
    );

    const x = d3
      .scaleLinear()
      .domain([0.5 - max, 0.5 + max])
      .range([0 + 40, width - 40]);

    const y = d3
      .scaleLinear()
      .domain([0.5 - max, 0.5 + max])
      .range([0 + 40, height - 40]);

    const svg = d3
      .select(svgRef!)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", `min-width: ${width}px; min-height: ${height}px;`);
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin})`)
      .call(d3.axisBottom(x).ticks(width / 80))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", width)
          .attr("y", margin - 4)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .text("Teammate Win %")
      );

    svg
      .append("g")
      .attr("transform", `translate(${margin},0)`)
      .call(d3.axisLeft(y))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .append("text")
          .attr("x", -margin)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text("Enemy Win %")
      );

    // Create the grid.
    svg
      .append("g")
      .attr("stroke", "currentColor")
      .call((g) =>
        g
          .append("g")
          .selectAll("line")
          .data(x.ticks())
          .join("line")
          .attr("stroke-opacity", (d) => (d == 0.5 ? 0.5 : 0.1))
          .attr("x1", (d) => 0.5 + x(d))
          .attr("x2", (d) => 0.5 + x(d))
          .attr("y1", margin)
          .attr("y2", height - margin)
      )
      .call((g) =>
        g
          .append("g")
          .selectAll("line")
          .data(y.ticks())
          .join("line")
          .attr("stroke-opacity", (d) => (d == 0.5 ? 0.5 : 0.1))
          .attr("y1", (d) => 0.5 + y(d))
          .attr("y2", (d) => 0.5 + y(d))
          .attr("x1", margin)
          .attr("x2", width - margin)
      )
      .call((g) =>
        g
          .append("line")
          .attr("x1", 40)
          .attr("y1", 40)
          .attr("x2", width - 40)
          .attr("y2", height - 40)
          .attr("stroke-width", 1)
          .attr("stroke-opacity", 0.75)
          .attr("stroke-dasharray", "5,5")
      );

    // Add a layer of dots.
    svg
      .append("g")
      .selectAll("image")
      .data(data()!)
      .join("image")
      .attr("x", (d) => x(d.x) - 12)
      .attr("y", (d) => y(d.y) - 12)
      .attr("height", "24px")
      .attr("width", "24px")
      .attr("href", (d) => d.img);
    // .attr(
    //   "style",
    //   (d) => `opacity: ${hovered() ? (hovered() === d.name ? 1 : 0) : 1}`
    // )
    // .on("mouseover", (event, d) => setHovered(d.name))
    // .on("mouseout", (event, d) => setHovered());
  });
  return <svg ref={svgRef} />;
}

export default App;
