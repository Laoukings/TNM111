const width = 425;
const height = 400;
let selectedNode = null;  // Add this line

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

        // Create SVG containers for all graphs
        const svg1 = d3.select("#graph")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const svg2 = d3.select("#graph2")
            .append("svg")
            .attr("width", width);

        const svg3 = d3.select("#graph3")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const svg4 = d3.select("#graph4")
            .append("svg")
            .attr("width", width);

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
                .force("charge", d3.forceManyBody().strength(-50))
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("collide", d3.forceCollide().radius(d => radiusScale(d.value) + 2))
                .force("bounds", () => {
                    for (let node of data.nodes) {
                        // Get the radius of the current node
                        const r = radiusScale(node.value);
                        
                        // Bound x coordinate
                        node.x = Math.max(r, Math.min(width - r, node.x));
                        
                        // Bound y coordinate
                        node.y = Math.max(r, Math.min(height - r, node.y));
                    }
                })
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
            const nodesPerRow = 3;
            const horizontalSpacing = 150;
            const verticalSpacing = 70;
            
            // Calculate total rows needed
            const totalRows = Math.ceil(sortedNodes.length / nodesPerRow);
            const totalHeight = (totalRows * verticalSpacing) + 20; // Add padding
            
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
                    // Toggle highlight when clicking the same node
                    if (selectedNode === d) {
                        selectedNode = null;
                        resetHighlightGraphs12();
                    } else {
                        selectedNode = d;
                        highlightNode(d);
                    }
                });

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

        const drawGraph2Edges = (svg, data) => {
            // Sort links by value
            const sortedLinks = data.links.sort((a, b) => b.value - a.value);
            
            // Define grid parameters
            const linksPerRow = 3;
            const horizontalSpacing = 150;
            const verticalSpacing = 100;  // Increased for edge visualization
            
            // Calculate total rows needed
            const totalRows = Math.ceil(sortedLinks.length / linksPerRow);
            const totalHeight = (totalRows * verticalSpacing) + 20; // Add padding
            
            // Set the SVG height to accommodate all links
            svg.attr("height", totalHeight);
            
            // Create group for each edge visualization
            const edgeGroups = svg.append("g")
                .selectAll("g")
                .data(sortedLinks)
                .enter()
                .append("g")
                .attr("transform", (d, i) => {
                    const x = 50 + (i % linksPerRow) * horizontalSpacing;
                    const y = 50 + Math.floor(i / linksPerRow) * verticalSpacing;
                    return `translate(${x},${y})`;
                });

            // Add circles for source nodes
            edgeGroups.append("circle")
                .attr("r", 5)
                .attr("fill", d => d.source.colour || "#999")
                .attr("cy", -15);

            // Add circles for target nodes
            edgeGroups.append("circle")
                .attr("r", 5)
                .attr("fill", d => d.target.colour || "#999")
                .attr("cy", 15);

            // Add lines connecting the nodes
            edgeGroups.append("line")
                .attr("y1", -15)
                .attr("y2", 15)
                .attr("stroke", "#999")
                .attr("stroke-width", d => linkWidthScale(d.value))
                .attr("stroke-opacity", 0.6)
                .on("click", function(event, d) {
                    // Toggle highlight when clicking the same edge
                    if (selectedNode === d) {
                        selectedNode = null;
                        resetHighlightGraphs34();
                    } else {
                        selectedNode = d;
                        highlightEdge(d);
                    }
                });

            // Add labels
            edgeGroups.append("text")
                .text(d => `${d.source.name} → ${d.target.name}`)
                .attr("font-size", "10px")
                .attr("y", 35)
                .attr("text-anchor", "middle");

            // Add value labels
            edgeGroups.append("text")
                .text(d => `Value: ${d.value}`)
                .attr("font-size", "10px")
                .attr("y", -25)
                .attr("text-anchor", "middle");
        };

        // Draw all graphs
        drawGraph1(svg1, currentData);
        drawGraph2(svg2, currentData);
        drawGraph2Edges(svg4, currentData);
        drawGraph1(svg3, datasets[0]); // Full interactions graph

        // Highlight nodes and links in graph1
        const highlightNode = (node) => {

            // Highlight links connected to the clicked node
            svg1.selectAll("line")
                .attr("stroke", d => d.source === node || d.target === node ? "orange" : "#999")
                .attr("stroke-width", d => d.source === node || d.target === node ? 3 : linkWidthScale(d.value));

            // Highlight the first connected node
            const connectedNodes = currentData.links
                .filter(link => link.source === node || link.target === node)
                .map(link => (link.source === node ? link.target : link.source));

            svg1.selectAll("circle")
                .attr("stroke", d => connectedNodes.includes(d) ? "orange" : null)
                .attr("stroke-width", d => connectedNodes.includes(d) ? 3 : 0);
        };

        // Reset all highlights
        const resetHighlightGraphs12 = () => {
            // Reset graph1 highlights
            svg1.selectAll("line")
                .attr("stroke", "#999")
                .attr("stroke-width", d => linkWidthScale(d.value));

            svg1.selectAll("circle")
                .attr("stroke", null)
                .attr("stroke-width", 0);

            // Reset graph2 highlights
            svg2.selectAll("line")
                .attr("stroke", "#999")
                .attr("stroke-width", d => linkWidthScale(d.value))
                .attr("stroke-opacity", 0.6);

            svg2.selectAll("circle")
                .attr("stroke", null)
                .attr("stroke-width", 0);
        };

        const resetHighlightGraphs34 = () => {
            // Reset graph3 highlights
            svg3.selectAll("line")
                .attr("stroke", "#999")
                .attr("stroke-width", d => linkWidthScale(d.value))
                .attr("stroke-opacity", 0.6);

            svg3.selectAll("circle")
                .attr("stroke", null)
                .attr("stroke-width", 0);

            // Reset graph4 highlights
            svg4.selectAll("line")
                .attr("stroke", "#999")
                .attr("stroke-width", d => linkWidthScale(d.value))
                .attr("stroke-opacity", 0.6);

            svg4.selectAll("circle")
                .attr("stroke", null)
                .attr("stroke-width", 0);
        };

        // Control Panel - Episode Selector for Graphs 1 & 2
        document.getElementById("episode-select").addEventListener("change", function () {
            const episodeIndex = this.value;
            currentData = datasets[episodeIndex];

            // Update scales
            radiusScale.domain([0, d3.max(currentData.nodes, d => d.value)]);
            linkWidthScale.domain([0, d3.max(currentData.links, d => d.value)]);

            // Update node slider max value
            const maxNodeValue = d3.max(currentData.nodes, d => d.value);
            nodeSlider.max = maxNodeValue;
            nodeSlider.value = 0;
            nodeDisplay.textContent = "0";

            // Redraw graphs 1 & 2
            svg1.selectAll("*").remove();
            svg2.selectAll("*").remove();
            drawGraph1(svg1, currentData);
            drawGraph2(svg2, currentData);
        });

        // Control Panel - Episode Selector for Graphs 3 & 4
        document.getElementById("episode-select-3").addEventListener("change", function () {
            const episodeIndex = this.value;
            const selectedData = datasets[episodeIndex];

            // Update scales
            radiusScale.domain([0, d3.max(selectedData.nodes, d => d.value)]);
            linkWidthScale.domain([0, d3.max(selectedData.links, d => d.value)]);

            // Update edge slider max value
            const maxEdgeValue = d3.max(selectedData.links, d => d.value);
            edgeSlider.max = maxEdgeValue;
            edgeSlider.value = 0;
            edgeDisplay.textContent = "0";

            // Clear and redraw graphs
            svg3.selectAll("*").remove();
            svg4.selectAll("*").remove();
            drawGraph1(svg3, selectedData);
            drawGraph2Edges(svg4, selectedData);
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
            // Filter links and related nodes
            const filteredLinks = currentData.links.filter(link => link.value >= threshold);
            
            const usedNodes = new Set();
            filteredLinks.forEach(link => {
                const sourceNode = typeof link.source === 'object' ? link.source : currentData.nodes[link.source];
                const targetNode = typeof link.target === 'object' ? link.target : currentData.nodes[link.target];
                usedNodes.add(sourceNode.name);
                usedNodes.add(targetNode.name);
            });

            const filteredNodes = currentData.nodes.filter(node => usedNodes.has(node.name));

            return {
                nodes: filteredNodes,
                links: filteredLinks
            };
        };

        // Event listeners for sliders
        const nodeSlider = document.getElementById('node-value-slider');
        const nodeDisplay = document.getElementById('node-value-display');
        const edgeSlider = document.getElementById('edge-value-slider');
        const edgeDisplay = document.getElementById('edge-value-display');

        // Update the episode-select event listener
        document.getElementById("episode-select").addEventListener("change", function () {
            const episodeIndex = this.value;
            currentData = datasets[episodeIndex];

            // Update scales
            radiusScale.domain([0, d3.max(currentData.nodes, d => d.value)]);
            linkWidthScale.domain([0, d3.max(currentData.links, d => d.value)]);

            // Update node slider max value
            const maxNodeValue = d3.max(currentData.nodes, d => d.value);
            nodeSlider.max = maxNodeValue;
            nodeSlider.value = 0;
            nodeDisplay.textContent = "0";

            // Redraw graphs 1 & 2
            svg1.selectAll("*").remove();
            svg2.selectAll("*").remove();
            drawGraph1(svg1, currentData);
            drawGraph2(svg2, currentData);
        });

        // Update the episode-select-3 event listener
        document.getElementById("episode-select-3").addEventListener("change", function () {
            const episodeIndex = this.value;
            const selectedData = datasets[episodeIndex];

            // Update scales
            radiusScale.domain([0, d3.max(selectedData.nodes, d => d.value)]);
            linkWidthScale.domain([0, d3.max(selectedData.links, d => d.value)]);

            // Update edge slider max value
            const maxEdgeValue = d3.max(selectedData.links, d => d.value);
            edgeSlider.max = maxEdgeValue;
            edgeSlider.value = 0;
            edgeDisplay.textContent = "0";

            // Clear and redraw graphs
            svg3.selectAll("*").remove();
            svg4.selectAll("*").remove();
            drawGraph1(svg3, selectedData);
            drawGraph2Edges(svg4, selectedData);
        });

        // Add slider event listeners
        nodeSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            nodeDisplay.textContent = value;
            const filteredData = filterNodesByValue(value);
            
            // Redraw graphs 1 & 2
            svg1.selectAll("*").remove();
            svg2.selectAll("*").remove();
            drawGraph1(svg1, filteredData);
            drawGraph2(svg2, filteredData);
        });

        edgeSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            edgeDisplay.textContent = value;
            const filteredData = filterEdgesByValue(value);
            
            // Redraw graphs 3 & 4
            svg3.selectAll("*").remove();
            svg4.selectAll("*").remove();
            drawGraph1(svg3, filteredData);
            drawGraph2Edges(svg4, filteredData);
        });
    }).catch(function (error) {
        console.error("Error loading the data:", error);
    });
});