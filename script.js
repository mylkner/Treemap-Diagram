import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const fetchdata = async () => {
    try {
        const res = await axios.get(
            "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
        );
        return res.data;
    } catch (err) {
        console.log(err);
    }
};

const render = async () => {
    const data = await fetchdata();
    const colorArr = [
        "#f44336",
        "#e81e63",
        "#9c27b0",
        "#673ab7",
        "#3f51b5",
        "#2196f3",
        "#03a9f4",
        "#00bcd4",
        "#009688",
        "#4caf50",
        "#8bc34a",
        "#cddc39",
        "#ffeb3b",
        "#ffc107",
        "#ff9800",
        "#ff5722",
        "#FF73E8",
        "#B9EBFF",
    ];
    const colors = d3.scaleOrdinal(
        data.children.map((item) => item.name),
        colorArr
    );

    const h = 1050;
    const w = 1200;

    const svg = d3
        .select("body")
        .append("svg")
        .attr("id", "graph")
        .attr("width", w)
        .attr("height", h);

    const root = d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value);
    d3.treemap().size([w, h]).padding(1)(root);

    svg.selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr("class", "tile")
        .attr("data-name", (d) => d.data.name)
        .attr("data-category", (d) => d.data.category)
        .attr("data-value", (d) => d.data.value)
        .attr("height", (d) => d.y1 - d.y0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .style("fill", (d) => colors(d.data.category))
        .on("mouseover", (d, i) => {
            d3
                .select("body")
                .append("div")
                .attr("id", "tooltip")
                .attr("data-value", i.data.value)
                .style("position", "absolute")
                .style("left", d.pageX + 20 + "px")
                .style("top", d.pageY - 20 + "px")
                .style("opacity", 0.9).html(`
                <p>Name: ${i.data.name}</p>
                <p>Category: ${i.data.category}</p>
                <p>Value: ${i.data.value}</p>
                `);
        })
        .on("mouseout", () => d3.selectAll("#tooltip").remove());

    svg.selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
        .selectAll("tspan")
        .data((d) => {
            return d.data.name.split(/(?=[A-Z][^A-Z])/g).map((text) => {
                return {
                    text,
                    x0: d.x0,
                    y0: d.y0,
                };
            });
        })
        .enter()
        .append("tspan")
        .attr("x", (d) => d.x0 + 5)
        .attr("y", (d, i) => d.y0 + 10 + i * 10)
        .text((d) => d.text)
        .style("font-size", "10px")
        .style("pointer-events", "none");

    const g = svg
        .append("g")
        .attr("id", "legend")
        .attr("transform", "translate(0, 1080)");

    const placeX = (i) => {
        if (i < 6) {
            return 370;
        } else if (i < 12) {
            return 570;
        } else {
            return 770;
        }
    };
    const placeY = (i) => {
        if (i < 6) {
            return i * 30;
        } else if (i < 12) {
            return i * 30 - 180;
        } else {
            return i * 30 - 360;
        }
    };

    g.selectAll("rect")
        .data(data.children.map((item) => item.name))
        .enter()
        .append("rect")
        .attr("class", "legend-item")
        .attr("height", 25)
        .attr("width", 25)
        .attr("x", (_, i) => placeX(i))
        .attr("y", (_, i) => placeY(i))
        .style("fill", (d) => colors(d));

    g.selectAll("text")
        .data(data.children.map((item) => item.name))
        .enter()
        .append("text")
        .attr("x", (_, i) => placeX(i) + 30)
        .attr("y", (_, i) => placeY(i) + 20)
        .text((d) => d);
};

render();
