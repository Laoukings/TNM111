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
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======

            if (document.getElementById('common-nodes-only').checked) {
                const filteredData = filterCommonNodes(currentData, selectedDataset || datasets[0]);
                svg1.selectAll("*").remove();
                svg2.selectAll("*").remove();
                svg3.selectAll("*").remove();
                svg4.selectAll("*").remove();
                
                drawGraph1(svg1, filteredData.data1);
                drawGraph2(svg2, filteredData.data1);
                drawGraph1(svg3, filteredData.data2);
                drawGraph2Edges(svg4, filteredData.data2);
            }
        });

        // Control Panel - Episode Selector for Graphs 3 & 4
        document.getElementById("episode-select-3").addEventListener("change", function () {
            const episodeIndex = this.value;
            selectedDataset = datasets[episodeIndex];  // Store the selected dataset

            // Update scales
            radiusScale.domain([0, d3.max(selectedDataset.nodes, d => d.value)]);
            linkWidthScale.domain([0, d3.max(selectedDataset.links, d => d.value)]);

            // Update edge slider max value
            const maxEdgeValue = d3.max(selectedDataset.links, d => d.value);
            edgeSlider.max = maxEdgeValue;
            edgeSlider.value = 0;
            edgeDisplay.textContent = "0";

            // Clear and redraw graphs
            svg3.selectAll("*").remove();
            svg4.selectAll("*").remove();
            drawGraph1(svg3, selectedDataset);
            drawGraph2Edges(svg4, selectedDataset);

            if (document.getElementById('common-nodes-only').checked) {
                const filteredData = filterCommonNodes(currentData, selectedDataset || datasets[0]);
                svg1.selectAll("*").remove();
                svg2.selectAll("*").remove();
                svg3.selectAll("*").remove();
                svg4.selectAll("*").remove();
                
                drawGraph1(svg1, filteredData.data1);
                drawGraph2(svg2, filteredData.data1);
                drawGraph1(svg3, filteredData.data2);
                drawGraph2Edges(svg4, filteredData.data2);
            }
        });

        const highlightEdge = (edge) => {
            // Highlight the selected edge group in graph4
            svg4.selectAll("line")
                .attr("stroke", d => d === edge ? "orange" : "#999")
                .attr("stroke-width", d => d === edge ? 5 : linkWidthScale(d.value))
                .attr("stroke-opacity", d => d === edge ? 1 : 0.6);

            // Highlight the connected nodes (circles) in graph4
            svg4.selectAll("circle")
                .attr("stroke", d => {
                    const isSourceOrTarget = 
                        (edge.source === d || edge.target === d) ||
                        (edge.source.name === d.name || edge.target.name === d.name);
                    return isSourceOrTarget ? "orange" : null;
                })
                .attr("stroke-width", d => {
                    const isSourceOrTarget = 
                        (edge.source === d || edge.target === d) ||
                        (edge.source.name === d.name || edge.target.name === d.name);
                    return isSourceOrTarget ? 3 : 0;
                });

            // Highlight the corresponding edge in graph3
            svg3.selectAll("line")
                .attr("stroke", d => 
                    (d.source.name === edge.source.name && d.target.name === edge.target.name) ||
                    (d.source.name === edge.target.name && d.target.name === edge.source.name)
                        ? "orange" 
                        : "#999")
                .attr("stroke-width", d => 
                    (d.source.name === edge.source.name && d.target.name === edge.target.name) ||
                    (d.source.name === edge.target.name && d.target.name === edge.source.name)
                        ? 5 
                        : linkWidthScale(d.value))
                .attr("stroke-opacity", d => 
                    (d.source.name === edge.source.name && d.target.name === edge.target.name) ||
                    (d.source.name === edge.target.name && d.target.name === edge.source.name)
                        ? 1 
                        : 0.6);

            // Highlight the connected nodes in graph3
            svg3.selectAll("circle")
                .attr("stroke", d => 
                    d.name === edge.source.name || d.name === edge.target.name 
                        ? "orange" 
                        : null)
                .attr("stroke-width", d => 
                    d.name === edge.source.name || d.name === edge.target.name 
                        ? 3 
                        : 0);
        };

        // Filter functions
        const filterNodesByValue = (threshold) => {
            // Filter nodes and related links
            const filteredNodes = currentData.nodes.filter(node => node.value >= threshold);
            const filteredNodeNames = new Set(filteredNodes.map(node => node.name));
            
            const filteredLinks = currentData.links.filter(link => {
                const sourceNode = typeof link.source === 'object' ? link.source : currentData.nodes[link.source];
                const targetNode = typeof link.target === 'object' ? link.target : currentData.nodes[link.target];
                return filteredNodeNames.has(sourceNode.name) && filteredNodeNames.has(targetNode.name);
            });

            return {
                nodes: filteredNodes,
                links: filteredLinks
            };
        };

        const filterEdgesByValue = (threshold) => {
            // Use selectedDataset instead of currentData
            const dataToFilter = selectedDataset || datasets[0];  // Default to first dataset if none selected
            
            // Filter links and related nodes
            const filteredLinks = dataToFilter.links.filter(link => link.value >= threshold);
            
            const usedNodes = new Set();
            filteredLinks.forEach(link => {
                const sourceNode = typeof link.source === 'object' ? link.source : dataToFilter.nodes[link.source];
                const targetNode = typeof link.target === 'object' ? link.target : dataToFilter.nodes[link.target];
                usedNodes.add(sourceNode.name);
                usedNodes.add(targetNode.name);
            });

            const filteredNodes = dataToFilter.nodes.filter(node => usedNodes.has(node.name));

            return {
                nodes: filteredNodes,
                links: filteredLinks
            };
        };

        const filterCommonNodes = (data1, data2) => {
            // Create sets of node names from both datasets
            const names1 = new Set(data1.nodes.map(node => node.name));
            const names2 = new Set(data2.nodes.map(node => node.name));

            // Filter nodes that exist in both datasets
            const filteredNodes1 = data1.nodes.filter(node => names2.has(node.name));
            const filteredNodes2 = data2.nodes.filter(node => names1.has(node.name));

            // Get the filtered node names
            const filteredNames1 = new Set(filteredNodes1.map(node => node.name));
            const filteredNames2 = new Set(filteredNodes2.map(node => node.name));

            // Filter links that connect common nodes
            const filteredLinks1 = data1.links.filter(link => {
                const sourceNode = typeof link.source === 'object' ? link.source : data1.nodes[link.source];
                const targetNode = typeof link.target === 'object' ? link.target : data1.nodes[link.target];
                return filteredNames1.has(sourceNode.name) && filteredNames1.has(targetNode.name);
            });

            const filteredLinks2 = data2.links.filter(link => {
                const sourceNode = typeof link.source === 'object' ? link.source : data2.nodes[link.source];
                const targetNode = typeof link.target === 'object' ? link.target : data2.nodes[link.target];
                return filteredNames2.has(sourceNode.name) && filteredNames2.has(targetNode.name);
            });

            return {
                data1: { nodes: filteredNodes1, links: filteredLinks1 },
                data2: { nodes: filteredNodes2, links: filteredLinks2 }
            };
        };

        // Event listeners for sliders
        const nodeSlider = document.getElementById('node-value-slider');
        const nodeDisplay = document.getElementById('node-value-display');
        const edgeSlider = document.getElementById('edge-value-slider');
        const edgeDisplay = document.getElementById('edge-value-display');

        // Add slider event listeners
        nodeSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            nodeDisplay.textContent = value;
            
            if (document.getElementById('common-nodes-only').checked) {
                // First filter by value
                const filteredByValue = filterNodesByValue(value);
                // Then filter common nodes between the filtered data and the other graph
                const filteredData = filterCommonNodes(filteredByValue, selectedDataset || datasets[0]);
                
                // Redraw all graphs with filtered data
                svg1.selectAll("*").remove();
                svg2.selectAll("*").remove();
                svg3.selectAll("*").remove();
                svg4.selectAll("*").remove();
                
                drawGraph1(svg1, filteredData.data1);
                drawGraph2(svg2, filteredData.data1);
                drawGraph1(svg3, filteredData.data2);
                drawGraph2Edges(svg4, filteredData.data2);
            } else {
                // Original behavior when checkbox is unchecked
                const filteredData = filterNodesByValue(value);
                svg1.selectAll("*").remove();
                svg2.selectAll("*").remove();
                drawGraph1(svg1, filteredData);
                drawGraph2(svg2, filteredData);
            }
        });

        edgeSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            edgeDisplay.textContent = value;
            
            if (document.getElementById('common-nodes-only').checked) {
                // First filter by value
                const filteredByValue = filterEdgesByValue(value);
                // Then filter common nodes between the graphs
                const filteredData = filterCommonNodes(currentData, filteredByValue);
                
                // Redraw all graphs with filtered data
                svg1.selectAll("*").remove();
                svg2.selectAll("*").remove();
                svg3.selectAll("*").remove();
                svg4.selectAll("*").remove();
                
                drawGraph1(svg1, filteredData.data1);
                drawGraph2(svg2, filteredData.data1);
                drawGraph1(svg3, filteredData.data2);
                drawGraph2Edges(svg4, filteredData.data2);
            } else {
                // Original behavior when checkbox is unchecked
                const filteredData = filterEdgesByValue(value);
                svg3.selectAll("*").remove();
                svg4.selectAll("*").remove();
                drawGraph1(svg3, filteredData);
                drawGraph2Edges(svg4, filteredData);
            }
        });

        // Add checkbox event listener
        document.getElementById('common-nodes-only').addEventListener('change', function() {
            if (this.checked) {
                // Get the filtered data
                const filteredData = filterCommonNodes(currentData, selectedDataset || datasets[0]);
                
                // Redraw graphs with filtered data
                svg1.selectAll("*").remove();
                svg2.selectAll("*").remove();
                svg3.selectAll("*").remove();
                svg4.selectAll("*").remove();
                
                drawGraph1(svg1, filteredData.data1);
                drawGraph2(svg2, filteredData.data1);
                drawGraph1(svg3, filteredData.data2);
                drawGraph2Edges(svg4, filteredData.data2);
            } else {
                // Reset to original data
                svg1.selectAll("*").remove();
                svg2.selectAll("*").remove();
                svg3.selectAll("*").remove();
                svg4.selectAll("*").remove();
                
                drawGraph1(svg1, currentData);
                drawGraph2(svg2, currentData);
                drawGraph1(svg3, selectedDataset || datasets[0]);
                drawGraph2Edges(svg4, selectedDataset || datasets[0]);
            }
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
