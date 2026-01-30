 let dataTable = [];

    async function loadCSVData(url) {
      const response = await fetch(url);
      const csvText = await response.text();

      const rows = csvText.trim().split("\n").map(row =>
        row.split(",").map(cell => {
          const num = parseFloat(cell);
          return isNaN(num) ? cell : num;
        })
      );

      dataTable = rows;
      console.log("CSV loaded", dataTable);
    }

    function findClosestIndex(arr, value) {
      let closestIndex = 0;
      let closestDiff = Infinity;
      for (let i = 0; i < arr.length; i++) {
        const diff = Math.abs(arr[i] - value);
        if (diff < closestDiff) {
          closestDiff = diff;
          closestIndex = i;
        }
      }
      return closestIndex;
    }

    // Original calculation
    function calculateDensity() {
      const tempInput = parseFloat(document.getElementById("temp-input").value);
      const densityInput = parseFloat(document.getElementById("density-input").value);
      const resultSpan = document.querySelector("#density-result span");

      if (isNaN(tempInput) || isNaN(densityInput)) {
        resultSpan.textContent = "Invalid input";
        return;
      }

      const headerRow = dataTable[0].slice(1);
      const tempRows = dataTable.slice(1);

      const temps = tempRows.map(row => row[0]);
      const tempIndex = findClosestIndex(temps, tempInput);
      const densityIndex = findClosestIndex(headerRow, densityInput);

      const value = tempRows[tempIndex][densityIndex + 1];
      resultSpan.textContent = value.toFixed(4);
    }

    // Reverse calculation
    function calculateObservedDensity() {
      const tempInput = parseFloat(document.getElementById("temp-input-reverse").value);
      const density15Input = parseFloat(document.getElementById("density15-input").value);
      const resultSpan = document.querySelector("#observed-density-result span");

      if (isNaN(tempInput) || isNaN(density15Input)) {
        resultSpan.textContent = "Invalid input";
        return;
      }

      const headerRow = dataTable[0].slice(1);
      const tempRows = dataTable.slice(1);

      const temps = tempRows.map(row => row[0]);
      const tempIndex = findClosestIndex(temps, tempInput);
      
      const densityValues = tempRows[tempIndex].slice(1);
      const densityIndex = findClosestIndex(densityValues, density15Input);

      const observedDensity = headerRow[densityIndex];
      resultSpan.textContent = observedDensity.toFixed(4);
    }

    loadCSVData("https://docs.google.com/spreadsheets/d/e/2PACX-1vSZXROIZYLulozrdO81ZxdWQXzCxxsGwyvWkZFSozk6rQbuFKLjLuSpnCTFY7dxHWdFvb5Akp8zgl4F/pub?output=csv");
