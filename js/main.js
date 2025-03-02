const width = 574; // Set width of the SVG container
const height = 304; // Set height of the SVG container
let selectedNode = null;  // Track selected node for Graphs 1 & 2
let selectedDataset = null;  // Track selected dataset for Graphs 3 & 4

document.addEventListener('DOMContentLoaded', function () {
    Promise.all([ // Load all datasets
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

        // Scales for radius and link width
        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(currentData.nodes, d => d.value)]) // Set domain to 0 -> max value in the current dataset
            .range([3, 15]);

        const linkWidthScale = d3.scaleLinear()
            .domain([0, d3.max(currentData.links, d => d.value)]) // Set domain to 0 -> max value in the current dataset
            .range([1, 5]);

        // Tooltip div
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Draw Graph 1, visualizing nodes and links
        const drawGraph1 = (svg, data) => {

            // Append and draw links
            const links = svg.append("g")
                .selectAll("line")
                .data(data.links)
                .enter()
                .append("line")
                .attr("stroke", "#999")
                .attr("stroke-width", d => linkWidthScale(d.value))
                .attr("stroke-opacity", 0.6);

            // Append and draw nodes
            const nodes = svg.append("g")
                .selectAll("circle")
                .data(data.nodes)
                .enter()
                .append("circle")
                .attr("r", d => radiusScale(d.value))
                .attr("fill", d => d.colour)
                .call(d3.drag()
                    // Enable dragging of nodes and update simulation
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

            //Create a force simulation
            const simulation = d3.forceSimulation(data.nodes)
                .force("link", d3.forceLink(data.links).id(d => d.index))  // Pulling-force for nodes using links
                .force("charge", d3.forceManyBody().strength(-50)) // Repulsion between nodes
                .force("center", d3.forceCenter(width / 2, height / 2)) // Force to center nodes in the middle of the graph
                .force("collide", d3.forceCollide().radius(d => radiusScale(d.value) + 2)) //Collision force
                .on("tick", () => {

                    // Apply boundary constraints
                    data.nodes.forEach(node => {
                        const r = radiusScale(node.value);
                        // Bound x coordinate
                        node.x = Math.max(r, Math.min(width - r, node.x));
                        // Bound y coordinate
                        node.y = Math.max(r, Math.min(height - r, node.y));
                    });

                    // Update node and link positions on each tick
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
                if (!event.active) simulation.alphaTarget(0.3).restart(); // Restart simulation if not active
                //fx and fy are used to fix the node in the position where it is dragged, ovveriding the simulation
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                //fx and fy are used to fix the node in the position where it is dragged, ovveriding the simulation
                d.fx = event.x;
                d.fy = event.y;
            }

            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0); // Stop simulation if not active
                //Remove the fixed positions so that the simulation can take over again
                d.fx = null;
                d.fy = null;
            }
        };

        // Draw the sorted nodes graph (graph2)
        const drawGraph2 = (svg, data) => {
            // Sort nodes by value in descending order
            const sortedNodes = data.nodes.sort((a, b) => b.value - a.value);

            // Define grid parameters
            const nodesPerRow = 4;
            const horizontalSpacing = 150;
            const verticalSpacing = 70;

            // Calculate total rows needed and total height
            const totalRows = Math.ceil(sortedNodes.length / nodesPerRow);
            const totalHeight = (totalRows * verticalSpacing) + 20; // Add padding

            // Set the SVG height to accommodate all nodes
            svg.attr("height", totalHeight);

            // Append circles for each node
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
                        resetHighlights([svg1, svg2]);
                    } else {
                        // Update selected node and highlight the node
                        selectedNode = d;
                        highlightNode(d);
                    }
                });

            // Append labels for each node
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
            // Sort links by value in descending order
            const sortedLinks = data.links.sort((a, b) => b.value - a.value);

            // Define grid parameters
            const linksPerRow = 4;
            const horizontalSpacing = 150;
            const verticalSpacing = 100;

            // Calculate total rows and total height
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
                .attr("fill", d => d.source.colour || "#999") // Set colour to source node colour or default to grey
                .attr("cy", -15);

            // Add circles for target nodes
            edgeGroups.append("circle")
                .attr("r", 5)
                .attr("fill", d => d.target.colour || "#999") // Set colour to source node colour or default to grey
                .attr("cy", 15);

            // Add lines connecting the nodes
            edgeGroups.append("line")
                .attr("y1", -15)
                .attr("y2", 15)
                .attr("stroke", "#999")
                .attr("stroke-width", d => linkWidthScale(d.value))
                .attr("stroke-opacity", 0.6)
                .on("click", function (event, d) {
                    // Toggle highlight when clicking the same edge
                    if (selectedNode === d) {
                        selectedNode = null;
                        resetHighlights([svg3, svg4]);
                    } else {
                        // Update selected node and highlight the edge
                        selectedNode = d;
                        highlightEdge(d);
                    }
                });

            // Add the names for source and target nodes
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
        drawGraph1(svg1, currentData);  // Graph 1 for nodes and links
        drawGraph1(svg3, currentData); // Graph 3 for nodes and links
        drawGraph2(svg2, currentData); // Graph 2 for sorted nodes
        drawGraph2Edges(svg4, currentData); // Graph 4 for sorted links

        // Highlight nodes and links when clicked, function for Graph 1, used in Graph 2 
        const highlightNode = (node) => {

            // Highlight links connected to the clicked node
            svg1.selectAll("line")
                // Check if the node is the source or target of the link, if true, change the color to orange else to grey, d is the data of the link
                .attr("stroke", d => d.source === node || d.target === node ? "orange" : "#999")
                .attr("stroke-width", d => d.source === node || d.target === node ? 3 : linkWidthScale(d.value));

            // Find connected nodes
            const connectedNodes = currentData.links
                .filter(link => link.source === node || link.target === node) // Filter links connected to the node
                .map(link => (link.source === node ? link.target : link.source)); // Get the connected nodes, if the source is the node, get the target and vice versa

            // Highlight the connected nodes in the graph
            svg1.selectAll("circle")
                .attr("stroke", d => connectedNodes.includes(d) ? "orange" : null)
                .attr("stroke-width", d => connectedNodes.includes(d) ? 3 : 0);
        };

        // Highlight edges and nodes when clicked, function for Graph 3, used in Graph 4
        const highlightEdge = (edge) => {

            // Highlight the selected edge in Graph 4
            svg4.selectAll("line")
                .attr("stroke", d => d === edge ? "orange" : "#999")
                .attr("stroke-width", d => d === edge ? 5 : linkWidthScale(d.value))
                .attr("stroke-opacity", d => d === edge ? 1 : 0.6);

            // Highlight the corresponding edge in Graph 3
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

            // Highlight the connected nodes in Graph 3
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

        // Reset highlights function for all graphs
        const resetHighlights = (graphs) => {
            // Reset each specified graph
            graphs.forEach(svg => {
                // Reset links
                svg.selectAll("line")
                    .attr("stroke", "#999")
                    .attr("stroke-width", d => linkWidthScale(d.value))
                    .attr("stroke-opacity", 0.6);

                // Reset nodes
                svg.selectAll("circle")
                    .attr("stroke", null)
                    .attr("stroke-width", 0);
            });
        };

        // Function to handle episode change
        const handleEpisodeChange = (episodeIndex, isFirstGraph) => {

            // First uncheck the common nodes checkbox
            const commonNodesCheckbox = document.getElementById('common-nodes-only');
            if (commonNodesCheckbox.checked) {
                commonNodesCheckbox.checked = false;
            }

            // Update the appropriate dataset
            if (isFirstGraph) {
                currentData = datasets[episodeIndex];
            } else {
                selectedDataset = datasets[episodeIndex];
            }

            const dataToUpdate = isFirstGraph ? currentData : selectedDataset;

            // Update scales based on selected data
            radiusScale.domain([0, d3.max(dataToUpdate.nodes, d => d.value)]);
            linkWidthScale.domain([0, d3.max(dataToUpdate.links, d => d.value)]);

            // Update slider settings
            if (isFirstGraph) {
                // Update node slider
                const maxNodeValue = d3.max(dataToUpdate.nodes, d => d.value);
                nodeSlider.max = maxNodeValue;
                nodeSlider.value = 0;
                nodeDisplay.textContent = "0";
            } else {
                // Update edge slider
                const maxEdgeValue = d3.max(dataToUpdate.links, d => d.value);
                edgeSlider.max = maxEdgeValue;
                edgeSlider.value = 0;
                edgeDisplay.textContent = "0";
            }

            // Determine which SVGs to update
            const svgsToUpdate = isFirstGraph ? [svg1, svg2] : [svg3, svg4];

            // Clear the appropriate graphs
            svgsToUpdate.forEach(svg => svg.selectAll("*").remove());

            // Redraw the appropriate graphs
            if (isFirstGraph) {
                drawGraph1(svg1, dataToUpdate);
                drawGraph2(svg2, dataToUpdate);
            } else {
                drawGraph1(svg3, dataToUpdate);
                drawGraph2Edges(svg4, dataToUpdate);
            }
        };

        document.getElementById("episode-select").addEventListener("change", function () {
            handleEpisodeChange(this.value, true); // true = updating Graphs 1 & 2
        });

        document.getElementById("episode-select-3").addEventListener("change", function () {
            handleEpisodeChange(this.value, false); // false = updating Graphs 3 & 4
        });

        // Filter nodes based on value thresholds
        const filterNodesByValue = (threshold) => {
            // Filter nodes and related links
            const filteredNodes = currentData.nodes.filter(node => node.value >= threshold);
            const filteredNodeNames = new Set(filteredNodes.map(node => node.name));

            // Filter links that connect the filtered nodes and show only those
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

        // Filter edges based on value thresholds
        const filterEdgesByValue = (threshold) => {
            // Determine which dataset to filter
            const dataToFilter = selectedDataset || datasets[0];

            // Filter links based on the threshold
            const filteredLinks = dataToFilter.links.filter(link => link.value >= threshold);

            // Create a set of node names that are connected by the filtered links
            const usedNodes = new Set();
            filteredLinks.forEach(link => {
                const sourceNode = typeof link.source === 'object' ? link.source : dataToFilter.nodes[link.source];
                const targetNode = typeof link.target === 'object' ? link.target : dataToFilter.nodes[link.target];
                usedNodes.add(sourceNode.name);
                usedNodes.add(targetNode.name);
            });

            // Filter nodes that are connected by the filtered links
            const filteredNodes = dataToFilter.nodes.filter(node => usedNodes.has(node.name));

            return {
                nodes: filteredNodes,
                links: filteredLinks
            };
        };

        // Filter common nodes between two datasets
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
        nodeSlider.addEventListener('input', function () {
            const value = parseInt(this.value);
            nodeDisplay.textContent = value;

            if (document.getElementById('common-nodes-only').checked) {
                // First filter by value
                const filteredByNodeValue = filterNodesByValue(value);

                // Get current edge threshold and apply it to second dataset
                const edgeThreshold = parseInt(edgeSlider.value) || 0;
                let secondData = selectedDataset || datasets[0];

                if (edgeThreshold > 0) {
                    secondData = filterEdgesByValue(edgeThreshold);
                }

                // Then filter common nodes between the filtered data and the other graph
                const filteredData = filterCommonNodes(filteredByNodeValue, secondData);

                // Update scales based on filtered data
                radiusScale.domain([0, Math.max(
                    d3.max(filteredData.data1.nodes, d => d.value) || 0,
                    d3.max(filteredData.data2.nodes, d => d.value) || 0
                )]);

                linkWidthScale.domain([0, Math.max(
                    d3.max(filteredData.data1.links, d => d.value) || 0,
                    d3.max(filteredData.data2.links, d => d.value) || 0
                )]);


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

        edgeSlider.addEventListener('input', function () {
            const value = parseInt(this.value);
            edgeDisplay.textContent = value;

            if (document.getElementById('common-nodes-only').checked) {

                // Get current node threshold value
                const nodeThreshold = parseInt(nodeSlider.value) || 0;

                // First dataset - for Graphs 1 & 2
                let firstData = currentData;
                if (nodeThreshold > 0) {
                    firstData = filterNodesByValue(nodeThreshold);
                }

                // Second dataset - for Graphs 3 & 4
                let secondData = selectedDataset || datasets[0];
                if (value > 0) {
                    secondData = filterEdgesByValue(value);
                }

                // Filter common nodes between the two datasets
                const filteredData = filterCommonNodes(firstData, secondData);

                // Update scales based on filtered data
                radiusScale.domain([0, Math.max(
                    d3.max(filteredData.data1.nodes, d => d.value) || 0,
                    d3.max(filteredData.data2.nodes, d => d.value) || 0
                )]);

                linkWidthScale.domain([0, Math.max(
                    d3.max(filteredData.data1.links, d => d.value) || 0,
                    d3.max(filteredData.data2.links, d => d.value) || 0
                )]);

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
        document.getElementById('common-nodes-only').addEventListener('change', function () {
            if (this.checked) {

                // Get current slider values
                const nodeThreshold = parseInt(nodeSlider.value) || 0;
                const edgeThreshold = parseInt(edgeSlider.value) || 0;

                // Variables for value filtering, if needed
                let firstData = currentData;
                let secondData = selectedDataset || datasets[0];

                // Apply node value filtering if threshold > 0
                if (nodeThreshold > 0) {
                    firstData = filterNodesByValue(nodeThreshold);
                }

                // Apply edge value filtering if threshold > 0
                if (edgeThreshold > 0) {
                    secondData = filterEdgesByValue(edgeThreshold);
                }

                // Get the filtered data
                const filteredData = filterCommonNodes(firstData, secondData || datasets[0]);

                // Update scales based on filtered data
                radiusScale.domain([0, Math.max(
                    d3.max(filteredData.data1.nodes, d => d.value) || 0,
                    d3.max(filteredData.data2.nodes, d => d.value) || 0
                )]);

                linkWidthScale.domain([0, Math.max(
                    d3.max(filteredData.data1.links, d => d.value) || 0,
                    d3.max(filteredData.data2.links, d => d.value) || 0
                )]);

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

                // Get current slider values
                const nodeThreshold = parseInt(nodeSlider.value) || 0;
                const edgeThreshold = parseInt(edgeSlider.value) || 0;

                // Create variables for potentially filtered data
                let firstData = currentData;
                let secondData = selectedDataset || datasets[0];

                // Apply filters based on sliders
                if (nodeThreshold > 0) {
                    firstData = filterNodesByValue(nodeThreshold);
                }

                if (edgeThreshold > 0) {
                    secondData = filterEdgesByValue(edgeThreshold);
                }

                // Update scales based on filtered data
                radiusScale.domain([0, Math.max(
                    d3.max(firstData.nodes, d => d.value),
                    d3.max(secondData.nodes, d => d.value) || 0
                )]);

                linkWidthScale.domain([0, Math.max(
                    d3.max(firstData.links, d => d.value),
                    d3.max(secondData.links, d => d.value) || 0
                )]);

                // Reset to original data
                svg1.selectAll("*").remove();
                svg2.selectAll("*").remove();
                svg3.selectAll("*").remove();
                svg4.selectAll("*").remove();

                drawGraph1(svg1, firstData);
                drawGraph2(svg2, firstData);
                drawGraph1(svg3, secondData);
                drawGraph2Edges(svg4, secondData);
            }
        });
    }).catch(function (error) {
        console.error("Error loading the data:", error);
    });
});