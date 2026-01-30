(function() {
  let map;
  let markers = [];
  const blockColors = {};
  const primaryColors = ["#d32f2f", "#1976d2", "#fbc02d"];
  let colorIndex = 0;
  let lastClickedMarker = null;
  let currentBlockFilter = "";
  let allCategories = new Set();
  const categoryColors = {
    "Total": "#1976d2",
    "PPC": "#d32f2f",
    "FPS": "#fbc02d",
    "Godown": "#388e3c",
    "Rice Mill": "#7b1fa2"
  };

  function getBlockColor(block) {
    if (!blockColors[block]) {
      blockColors[block] = primaryColors[colorIndex % primaryColors.length];
      colorIndex++;
    }
    return blockColors[block];
  }

  function getCategoryLetter(cat) {
    const catMap = { 
      "PPC": "P", 
      "Rice Mill": "M", 
      "FPS": "F", 
      "Godown": "G" 
    };
    return catMap[cat] || "?";
  }

  function getCategoryColor(category) {
    return categoryColors[category] || getRandomColor();
  }

  function getRandomColor() {
    const colors = ["#455a64", "#5d4037", "#00897b", "#d81b60", "#8e24aa", "#fb8c00"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function linePin(color, scale = 1.1) {
    return {
      path: "M12 1C8.1 1 5 4.1 5 8.2c0 3.7 3.4 6.8 6 9.3V28h2V17.5c2.6-2.5 6-5.6 6-9.3C19 4.1 15.9 1 12 1z",
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#000",
      strokeWeight: 1,
      scale: scale,
      labelOrigin: new google.maps.Point(12, 9)
    };
  }

  function formatCoordinates(lat, lng) {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

  function resetLastMarker() {
    if (lastClickedMarker && lastClickedMarker.meta) {
      lastClickedMarker.setIcon(linePin(
        getBlockColor(lastClickedMarker.meta.block),
        1.1
      ));
      lastClickedMarker = null;
    }
  }

  function createCategoryElement(category, count) {
    const color = getCategoryColor(category);
    const span = document.createElement("span");
    span.style.fontWeight = "bold";
    span.style.color = color;
    span.innerHTML = `${category}: <span style="color: #333;">${count}</span>`;
    span.className = `category-${category.toLowerCase().replace(/\s+/g, '-')}`;
    return span;
  }

  function calculateBoundsForVisibleMarkers() {
    const bounds = new google.maps.LatLngBounds();
    let visibleCount = 0;
    
    markers.forEach(marker => {
      if (marker.getVisible()) {
        bounds.extend(marker.getPosition());
        visibleCount++;
      }
    });
    
    return { bounds, visibleCount };
  }

  function centerMapOnVisibleMarkers() {
    const { bounds, visibleCount } = calculateBoundsForVisibleMarkers();
    
    if (visibleCount === 0) {
      // If no markers are visible, reset to default view
      map.setCenter({ lat: 20.592263, lng: 83.248939 });
      map.setZoom(11);
    } else if (visibleCount === 1) {
      // If only one marker, center on it with zoom 14
      markers.forEach(marker => {
        if (marker.getVisible()) {
          map.setCenter(marker.getPosition());
          map.setZoom(14);
        }
      });
    } else {
      // If multiple markers, fit bounds with padding and minimum zoom
      const padding = 50; // pixels
      map.fitBounds(bounds, padding);
      
      // Set minimum zoom level to 12
      google.maps.event.addListenerOnce(map, 'bounds_changed', function() {
        if (map.getZoom() > 12) {
          map.setZoom(12);
        }
      });
      
      // Ensure zoom doesn't go below 12
      const currentZoom = map.getZoom();
      if (currentZoom < 12) {
        map.setZoom(12);
      }
    }
  }

  function updateLocationCounts() {
    // Count all markers that are currently visible (after filtering)
    let total = 0;
    const categoryCounts = {};
    
    // Initialize all known categories
    allCategories.forEach(category => {
      categoryCounts[category] = 0;
    });
    
    // Count visible markers
    markers.forEach(marker => {
      if (marker.getVisible()) {
        total++;
        const category = marker.meta.category || "Unknown";
        if (!categoryCounts[category]) {
          categoryCounts[category] = 0;
        }
        categoryCounts[category]++;
      }
    });
    
    // Update total count
    document.getElementById("totalCount").textContent = total;
    
    // Get the container for dynamic categories
    const categoriesContainer = document.querySelector("#locationCounts > div:first-child");
    
    // Keep the total count element and remove the rest
    const totalElement = categoriesContainer.children[0];
    categoriesContainer.innerHTML = '';
    categoriesContainer.appendChild(totalElement);
    
    // Add category counts (sorted alphabetically)
    Object.keys(categoryCounts)
      .filter(category => category !== "Total" && category !== "Unknown")
      .sort()
      .forEach(category => {
        if (categoryCounts[category] > 0) {
          const categoryElement = createCategoryElement(category, categoryCounts[category]);
          categoriesContainer.appendChild(categoryElement);
        }
      });
    
    // Add "Unknown" category if there are any
    if (categoryCounts["Unknown"] > 0) {
      const unknownElement = createCategoryElement("Unknown", categoryCounts["Unknown"]);
      categoriesContainer.appendChild(unknownElement);
    }
    
    // Update filter status
    const filterStatus = document.getElementById("filterStatus");
    if (currentBlockFilter) {
      filterStatus.textContent = `Showing locations for block: ${currentBlockFilter}`;
      filterStatus.title = `Filtered by: Block = "${currentBlockFilter}"`;
    } else {
      filterStatus.textContent = "Showing all locations";
      filterStatus.title = "No filters applied";
    }
  }

  function applyFilters() {
    const bV = document.getElementById("blockSearch").value.toUpperCase();
    const cV = document.getElementById("codeSearch").value.toUpperCase();
    const nV = document.getElementById("nameSearch").value.toUpperCase();
    
    currentBlockFilter = bV;

    markers.forEach(m => {
      const match = m.meta.block.includes(bV) && 
                    m.meta.code.includes(cV) && 
                    m.meta.name.includes(nV);
      m.setVisible(match);
      
      if (!match && lastClickedMarker === m) {
        resetLastMarker();
      }
    });
    
    updateLocationCounts();
    
    // Center map on visible markers (only if block filter is applied)
    if (bV) {
      setTimeout(() => {
        centerMapOnVisibleMarkers();
      }, 100); // Small delay to ensure markers are updated
    }
  }

  function initMap() {
    const mapEl = document.getElementById("map");
    if (!mapEl) return;

    map = new google.maps.Map(mapEl, {
      zoom: 11,
      center: { lat: 20.592263, lng: 83.248939 },
      gestureHandling: "greedy",
      mapTypeControl: false
    });

    const sheetURL = "https://docs.google.com/spreadsheets/d/1HI5Wjjwo5OObDaS4W7QaOVc_RcqgREu8pHEQxSjYhUg/gviz/tq?tqx=out:json";

    fetch(sheetURL)
      .then(res => res.text())
      .then(text => {
        const json = JSON.parse(text.substring(47).slice(0, -2));
        const rows = json.table.rows;
        const infoWindow = new google.maps.InfoWindow();
        const blockSet = new Set();

        rows.forEach(r => {
          if (!r.c || !r.c[3] || !r.c[4]) return;

          const block = r.c[0]?.v || "Unknown";
          const name  = r.c[1]?.v || "No Name";
          const code  = r.c[2]?.v || "N/A";
          const lat   = parseFloat(r.c[3].v);
          const lng   = parseFloat(r.c[4].v);
          const cat   = r.c[5]?.v || "Unknown";

          blockSet.add(block);
          allCategories.add(cat);

          const marker = new google.maps.Marker({
            position: { lat, lng },
            map: map, 
            icon: linePin(getBlockColor(block)),
            label: { 
              text: getCategoryLetter(cat), 
              color: "white", 
              fontWeight: "bold", 
              fontSize: "11px" 
            },
            title: name
          });

          marker.meta = { 
            block: block.toUpperCase(), 
            code: String(code).toUpperCase(), 
            name: name.toUpperCase(),
            lat: lat,
            lng: lng,
            category: cat
          };

          google.maps.event.addListener(marker, 'click', function(e) {
            e.stop();
            resetLastMarker();
            lastClickedMarker = marker;
            marker.setIcon(linePin(getBlockColor(block), 1.5));
            
            const content = `
              <div style="min-width: 200px; max-width: 300px;">
                <h3 style="margin: 0 0 8px 0; color: #1976d2;">${name}</h3>
                <div style="margin-bottom: 5px;"><strong>Code:</strong> ${code}</div>
                <div style="margin-bottom: 5px;"><strong>Block:</strong> ${block}</div>
                <div style="margin-bottom: 5px;"><strong>Category:</strong> ${cat}</div>
                <div style="margin-bottom: 5px; padding: 8px; background: #f5f5f5; border-radius: 4px; font-family: monospace;">
                  <strong>Coordinates:</strong><br>
                  ${formatCoordinates(lat, lng)}
                </div>
                <div style="font-size: 12px; color: #666; margin-top: 8px;">
                  Click anywhere to close
                </div>
              </div>
            `;
            
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
          });

          markers.push(marker);
        });

        map.addListener("click", () => {
          infoWindow.close();
          resetLastMarker();
        });

        // Populate block list
        const list = document.getElementById("blockList");
        [...blockSet].sort().forEach(b => {
          const opt = document.createElement("option");
          opt.value = b;
          list.appendChild(opt);
        });

        // Initial update of location counts
        updateLocationCounts();
      });

    // Filtering Logic
    const filters = ["blockSearch", "codeSearch", "nameSearch"];
    filters.forEach(id => {
      const input = document.getElementById(id);
      
      input.addEventListener("input", () => {
        applyFilters();
      });
    });
    
    // Clear filters with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        document.getElementById("blockSearch").value = '';
        document.getElementById("codeSearch").value = '';
        document.getElementById("nameSearch").value = '';
        currentBlockFilter = '';
        
        markers.forEach(m => {
          m.setVisible(true);
        });
        
        updateLocationCounts();
        
        // Reset map to default view
        map.setCenter({ lat: 20.592263, lng: 83.248939 });
        map.setZoom(11);
      }
    });
    
    // Add "Show All" button dynamically
    const mapControls = document.querySelector('.map-controls');
    const showAllButton = document.createElement('button');
    showAllButton.textContent = 'Show All';
    showAllButton.style.cssText = 'padding: 8px 16px; font-size: 14px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;';
    showAllButton.title = 'Reset all filters and show all locations';
    showAllButton.addEventListener('click', function() {
      document.getElementById("blockSearch").value = '';
      document.getElementById("codeSearch").value = '';
      document.getElementById("nameSearch").value = '';
      currentBlockFilter = '';
      
      markers.forEach(m => {
        m.setVisible(true);
      });
      
      updateLocationCounts();
      
      // Reset map to default view
      map.setCenter({ lat: 20.592263, lng: 83.248939 });
      map.setZoom(11);
    });
    
    mapControls.appendChild(showAllButton);
  }

  if (document.readyState === "complete") { 
    initMap(); 
  } else { 
    window.addEventListener("load", initMap); 
  }
})();
