# Star Wars Character Interactions Visualization

A web-based interactive visualization tool for exploring character interactions across the Star Wars movie series. This visualization project allows users to analyze relationships between characters, identify key characters with the most interactions, and compare interaction patterns across different Star Wars episodes.

## Overview

This project visualizes character interaction data from the Star Wars movie franchise using D3.js. The tool features multiple interactive visualizations that allow users to explore how characters interact within and across movies, with options to filter by character importance, interaction strength, and movie episodes.

## Features

- **Four Connected Visualizations:**
  - **Graph 1:** Force-directed network graph showing characters (nodes) and their interactions (links)
  - **Graph 2:** Grid layout of characters sorted by interaction value
  - **Graph 3:** Comparison network graph with selectable episode data
  - **Graph 4:** Edge-centric visualization showing character interaction pairs

- **Interactive Controls:**
  - Episode selection for both graph pairs
  - Node value filtering to show only significant characters
  - Edge value filtering to show only strong interactions
  - Option to display only characters common between selected episodes
  - Interactive highlighting of connected characters and interactions

- **Responsive Design:**
  - Tooltips showing additional information
  - Visual feedback when interacting with nodes and edges
  - Scrollable containers for large datasets
  - Automatic layout adjustment

## Usage

1. **Select Episodes:**
   - Use the dropdown menus at the top of each column to select which Star Wars episode to visualize
   - "Full Data" option shows interactions across all episodes

2. **Apply Filters:**
   - Adjust the "Node Value Filter" slider to show only characters with a minimum number of interactions
   - Adjust the "Edge Value Filter" slider to show only interactions of a minimum strength
   - Check "Show only common nodes between graphs" to display characters that appear in both selected episodes

3. **Interact with Visualizations:**
   - Click on nodes/characters to highlight their connections
   - Drag nodes in the force-directed graphs to rearrange the layout
   - Hover over elements to see detailed information via tooltips

## Data

The visualization uses JSON data files representing character interactions from:
- Star Wars Episode 1: The Phantom Menace
- Star Wars Episode 2: Attack of the Clones
- Star Wars Episode 3: Revenge of the Sith
- Star Wars Episode 4: A New Hope
- Star Wars Episode 5: The Empire Strikes Back
- Star Wars Episode 6: Return of the Jedi
- Star Wars Episode 7: The Force Awakens
- Combined data from all episodes

Each interaction is represented with:
- Source character
- Target character
- Interaction value (strength of the connection)
- Character metadata (name, total value, color)

## Technology

- **D3.js (v7)**: For creating the interactive data visualizations
- **HTML/CSS**: For structure and styling
- **JavaScript**: For application logic and interactivity

## Setup

Simply open the 

-**index.html** file in a modern web browser. No server is required as the application uses client-side rendering.

## Authors

- Nikita Sidarovich
- Lukas Pettersson

## Files and Structure

- index.html: Main HTML file
- styles.css: CSS styling
- main.js: Main JavaScript code containing all visualization logic
- `Datan/`: Directory containing JSON data files for each Star Wars episode

## License

This project is for educational purposes. Star Wars and its characters are property of Lucasfilm Ltd. and The Walt Disney Company.
