const width = 1200, height = 900;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    Promise.all([
        d3.json("Datan/starwars-episode-1-interactions-allCharacters.json"),
        d3.json("Datan/starwars-episode-2-interactions-allCharacters.json"),
        d3.json("Datan/starwars-episode-3-interactions-allCharacters.json"),
        d3.json("Datan/starwars-episode-4-interactions-allCharacters.json"),
        d3.json("Datan/starwars-episode-5-interactions-allCharacters.json"),
        d3.json("Datan/starwars-episode-6-interactions-allCharacters.json"),
        d3.json("Datan/starwars-episode-7-interactions-allCharacters.json"),
        d3.json("Datan/starwars-full-interactions-allCharacters.json")
    ]).then(function (datasets) {
        const data = datasets[0];
        // Create your visualization here
        // Create SVG container
        const svg = d3.select("#graph")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        // Define node radius and link stroke scales
        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(data.nodes, d => d.value)])
            .range([3, 15]);

        const linkWidthScale = d3.scaleLinear()
            .domain([0, d3.max(data.links, d => d.value)])
            .range([1, 5]);

        // Draw links (lines)
        const links = svg.append("g")
            .selectAll("line")
            .data(data.links)
            .enter()
            .append("line")
            .attr("stroke", d => data.nodes[d.source].colour)
            .attr("stroke-width", d => linkWidthScale(d.value))
            .attr("stroke-opacity", 0.6);

        // Draw nodes (circles)
        const nodes = svg.append("g")
            .selectAll("circle")
            .data(data.nodes)
            .enter()
            .append("circle")
            .attr("r", d => radiusScale(d.value))
            .attr("fill", d => d.colour)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("mouseover", function (event, d) {
                tooltip.style("opacity", 1)
                    .attr("transform", `translate(${d.x},${d.y})`)
                    .select("text")
                    .text(d.name)
                    //.attr("fill", d.colour);  // Set the text color to match the node color
            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0);
            });

        // Add node labels (text)
        const tooltip = svg.append("g")
            .attr("class", "tooltip")
            .style("pointer-events", "none")  // Prevent tooltip from interfering with mouse events
            .style("opacity", 0);  // Hide by default

        tooltip.append("text")
            .attr("font-size", "10px")
            .attr("fill", "black")
            .attr("dx", 10)
            .attr("dy", 5);

        // Initialize force simulation
        const simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links)
                .id(d => d.index)
                .distance(100))
            .force("charge", d3.forceManyBody().strength(-50))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .on("tick", updatePositions);

        // Update positions on simulation tick
        function updatePositions() {
            links
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            nodes
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            tooltip.style("opacity", function () {
                if (parseFloat(this.style.opacity) > 0) {
                    const node = d3.select(this).datum();
                    d3.select(this).attr("transform", `translate(${node.x},${node.y})`);
                }
                return this.style.opacity;
            });
        }

        // Drag event handlers
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }).catch(function (error) {
        console.error("Error loading the data:", error);
    });
});