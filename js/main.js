const width = 700, height = 400;

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
        let currentData = datasets[0]; // Default to Episode 1

        // Create SVG containers for both graphs
        const svg1 = d3.select("#graph")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const svg2 = d3.select("#graph2")
            .append("svg")
            .attr("width", 1500)
            .attr("height", 400); // Increased height to accommodate multiple rows

        // Define scales
        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(currentData.nodes, d => d.value)])
            .range([3, 15]);

        const linkWidthScale = d3.scaleLinear()
            .domain([0, d3.max(currentData.links, d => d.value)])
            .range([1, 5]);

        // Tooltip div
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Draw the original graph (graph1)
        const drawGraph1 = (svg, data) => {
            const links = svg.append("g")
                .selectAll("line")
                .data(data.links)
                .enter()
                .append("line")
                .attr("stroke", "#999")
                .attr("stroke-width", d => linkWidthScale(d.value))
                .attr("stroke-opacity", 0.6);

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
                    // Show tooltip on hover
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    tooltip.html(`Name: ${d.name}<br>Value: ${d.value}`)
                        .style("left", `${event.pageX + 5}px`)
                        .style("top", `${event.pageY - 28}px`);
                })
                .on("mouseout", function () {
                    // Hide tooltip on mouseout
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            const simulation = d3.forceSimulation(data.nodes)
                .force("link", d3.forceLink(data.links).id(d => d.index))
                .force("charge", d3.forceManyBody().strength(-100))
                .force("center", d3.forceCenter(width / 2, height / 2))
                .on("tick", () => {
                    links
                        .attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y);

                    nodes
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y);
                });

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
        };

        // Draw the sorted nodes graph (graph2)
        const drawGraph2 = (svg, data) => {
            // Sort nodes by value (or any other property)
            const sortedNodes = data.nodes.sort((a, b) => b.value - a.value);
            
            // Define grid parameters
            const nodesPerRow = 10;
            const horizontalSpacing = 140;
            const verticalSpacing = 70;

            const nodes = svg.append("g")
                .selectAll("circle")
                .data(sortedNodes)
                .enter()
                .append("circle")
                .attr("r", d => radiusScale(d.value))
                .attr("fill", d => d.colour)
                .attr("cx", (d, i) => 50 + (i % nodesPerRow) * horizontalSpacing) // Position in row
                .attr("cy", (d, i) => 50 + Math.floor(i / nodesPerRow) * verticalSpacing) // Position in column
                .on("click", function (event, d) {
                    // Highlight clicked node in both graphs
                    highlightNode(d);
                });

            const labels = svg.append("g")
                .selectAll("text")
                .data(sortedNodes)
                .enter()
                .append("text")
                .text(d => d.name)
                .attr("font-size", "10px")
                .attr("x", (d, i) => 50 + (i % nodesPerRow) * horizontalSpacing) // Align with circles
                .attr("y", (d, i) => 80 + Math.floor(i / nodesPerRow) * verticalSpacing) // Position below circles
                .attr("text-anchor", "middle"); // Center text under circles
        };

        // Draw both graphs
        drawGraph1(svg1, currentData);
        drawGraph2(svg2, currentData);

        // Highlight nodes and links in graph1
        const highlightNode = (node) => {
            // Highlight the clicked node
            svg1.selectAll("circle")
                .attr("stroke", d => d === node ? "yellow" : null)
                .attr("stroke-width", d => d === node ? 3 : 0);

            // Highlight links connected to the clicked node
            svg1.selectAll("line")
                .attr("stroke", d => d.source === node || d.target === node ? "red" : "#999")
                .attr("stroke-width", d => d.source === node || d.target === node ? 3 : linkWidthScale(d.value));

            // Highlight the first connected node
            const connectedNodes = currentData.links
                .filter(link => link.source === node || link.target === node)
                .map(link => (link.source === node ? link.target : link.source));

            svg1.selectAll("circle")
                .attr("stroke", d => connectedNodes.includes(d) ? "orange" : null)
                .attr("stroke-width", d => connectedNodes.includes(d) ? 3 : 0);
        };

        // Control Panel - Episode Selector
        document.getElementById("episode-select").addEventListener("change", function () {
            const episodeIndex = this.value;
            currentData = datasets[episodeIndex];

            // Update scales
            radiusScale.domain([0, d3.max(currentData.nodes, d => d.value)]);
            linkWidthScale.domain([0, d3.max(currentData.links, d => d.value)]);

            // Redraw both graphs
            svg1.selectAll("*").remove();
            svg2.selectAll("*").remove();
            drawGraph1(svg1, currentData);
            drawGraph2(svg2, currentData);
        });
    }).catch(function (error) {
        console.error("Error loading the data:", error);
    });
});