<<<<<<< Updated upstream
const width = 1200, height = 900;
=======
const width = 500;
const height = 400;
>>>>>>> Stashed changes

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Store current simulation globally so we can stop it when switching episodes
    let currentSimulation = null;

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
        // Create initial visualization with Episode 1
        const initialData = JSON.parse(JSON.stringify(datasets[0]));
        currentSimulation = createVisualization(initialData);

<<<<<<< Updated upstream
        // Add event listener for dropdown changes
        d3.select("#episode-select").on("change", function() {
            // Stop the current simulation
            if (currentSimulation) {
                currentSimulation.stop();
                currentSimulation = null;
=======
        // Create SVG containers for all graphs
        const svg1 = d3.select("#graph")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const svg2 = d3.select("#graph2")
            .append("svg")
            .attr("width", 750)
            .attr("height", 400);

        const svg3 = d3.select("#graph3")
            .append("svg")
            .attr("width", width)
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

                    labels
                        .attr("x", d => d.x)
                        .attr("y", d => d.y);
                });

            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
>>>>>>> Stashed changes
            }
            
<<<<<<< Updated upstream
            // Clear existing visualization
            d3.select("#graph").selectAll("*").remove();
            
            // Get selected episode index and create new visualization
            const selectedIndex = this.value;
            // Create a deep copy of the dataset to ensure fresh data
            const newData = JSON.parse(JSON.stringify(datasets[selectedIndex]));
            currentSimulation = createVisualization(newData);
=======
            // Define grid parameters
            const nodesPerRow = 5;
            const horizontalSpacing = 140;
            const verticalSpacing = 70;
            
            // Calculate total rows needed
            const totalRows = Math.ceil(sortedNodes.length / nodesPerRow);
            const totalHeight = (totalRows * verticalSpacing) + 100; // Add padding
            
            // Set the SVG height to accommodate all nodes
            svg.attr("height", totalHeight);
            
            const nodes = svg.append("g")
                .selectAll("circle")
                .data(sortedNodes)
                .enter()
                .append("circle")
                .attr("r", d => radiusScale(d.value))
                .attr("fill", d => d.colour)
                .attr("cx", (d, i) => 50 + (i % nodesPerRow) * horizontalSpacing)
                .attr("cy", (d, i) => 50 + Math.floor(i / nodesPerRow) * verticalSpacing)
                .on("click", function (event, d) {
                    // Highlight clicked node in both graphs
                    highlightNode(d);
                });;

            const labels = svg.append("g")
                .selectAll("text")
                .data(sortedNodes)
                .enter()
                .append("text")
                .text(d => d.name)
                .attr("font-size", "10px")
                .attr("x", (d, i) => 50 + (i % nodesPerRow) * horizontalSpacing)
                .attr("y", (d, i) => 80 + Math.floor(i / nodesPerRow) * verticalSpacing)
                .attr("text-anchor", "middle");
        };

        // Draw all graphs
        drawGraph1(svg1, currentData);
        drawGraph2(svg2, currentData);
        drawGraph1(svg3, datasets[7]); // Full interactions graph

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

            // Redraw graphs
            svg1.selectAll("*").remove();
            svg2.selectAll("*").remove();
            drawGraph1(svg1, currentData);
            drawGraph2(svg2, currentData);
>>>>>>> Stashed changes
        });
    }).catch(function (error) {
        console.error("Error loading the data:", error);
    });
});

function createVisualization(data) {
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
            tooltip
                .datum(d)
                .style("opacity", 1)
                .attr("transform", `translate(${d.x},${d.y})`)
                .select("text")
                .text(d.name);
        })
        .on("mouseout", function () {
            tooltip.style("opacity", 0);
        });

    // Add node labels (text)
    const tooltip = svg.append("g")
        .attr("class", "tooltip")
        .style("pointer-events", "none")
        .style("opacity", 0);

    tooltip.append("text")
        .attr("font-size", "10px")
        .attr("fill", "black")
        .attr("dx", 10)
        .attr("dy", 5);

    // Initialize force simulation with fresh nodes and links
    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links)
            .id(d => d.index)
            .distance(100))
        .force("charge", d3.forceManyBody().strength(-50))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .alpha(1) // Reset alpha to ensure simulation starts fresh
        .restart() // Explicitly restart the simulation
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
            const opacity = parseFloat(this.style.opacity);
            if (opacity > 0) {
                const d = d3.select(this).datum();
                if (d) {
                    d3.select(this).attr("transform", `translate(${d.x},${d.y})`);
                }
            }
            return opacity;
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

    return simulation;
}
