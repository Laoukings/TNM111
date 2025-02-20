const width = 1200, height = 900;

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

        // Add event listener for dropdown changes
        d3.select("#episode-select").on("change", function() {
            // Stop the current simulation
            if (currentSimulation) {
                currentSimulation.stop();
                currentSimulation = null;
            }
            
            // Clear existing visualization
            d3.select("#graph").selectAll("*").remove();
            
            // Get selected episode index and create new visualization
            const selectedIndex = this.value;
            // Create a deep copy of the dataset to ensure fresh data
            const newData = JSON.parse(JSON.stringify(datasets[selectedIndex]));
            currentSimulation = createVisualization(newData);
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
