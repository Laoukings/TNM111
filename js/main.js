const width = 1200, height = 900;

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
        let currentData = datasets[7]; // Default to full data

        // Create SVG containers for both graphs
        const svg1 = d3.select("#graph")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const svg2 = d3.select("#graph2")
            .append("svg")
            .attr("width", 300) // Smaller width for sorted nodes
            .attr("height", height);

        // Define scales
        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(currentData.nodes, d => d.value)])
            .range([3, 15]);

        const linkWidthScale = d3.scaleLinear()
            .domain([0, d3.max(currentData.links, d => d.value)])
            .range([1, 5]);

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
                    .on("end", dragended));

            const labels = svg.append("g")
                .selectAll("text")
                .data(data.nodes)
                .enter()
                .append("text")
                .text(d => d.name)
                .attr("font-size", "10px")
                .attr("dx", 10)
                .attr("dy", 5);

            const simulation = d3.forceSimulation(data.nodes)
                .force("link", d3.forceLink(data.links).id(d => d.index))
                .force("charge", d3.forceManyBody().strength(-50))
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

                    labels
                        .attr("x", d => d.x)
                        .attr("y", d => d.y);
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

            const nodes = svg.append("g")
                .selectAll("circle")
                .data(sortedNodes)
                .enter()
                .append("circle")
                .attr("r", d => radiusScale(d.value))
                .attr("fill", d => d.colour)
                .attr("cx", 50) // Fixed x position
                .attr("cy", (d, i) => 50 + i * 30) // Vertical spacing
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
                .attr("x", 70) // Fixed x position
                .attr("y", (d, i) => 55 + i * 30); // Align with nodes
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

        // Control Panel - Node Radius Slider
        document.getElementById("node-radius-slider").addEventListener("input", function () {
            const newRadius = this.value;
            radiusScale.range([3, newRadius]);
            svg1.selectAll("circle").attr("r", d => radiusScale(d.value));
            svg2.selectAll("circle").attr("r", d => radiusScale(d.value));
        });

        // Control Panel - Link Width Slider
        document.getElementById("link-width-slider").addEventListener("input", function () {
            const newWidth = this.value;
            linkWidthScale.range([1, newWidth]);
            svg1.selectAll("line").attr("stroke-width", d => linkWidthScale(d.value));
        });

    }).catch(function (error) {
        console.error("Error loading the data:", error);
    });
});