(function() {
    "use strict";

    // ------- CONFIGURATION --------
    const CSV_URL = "https://docs.google.com/spreadsheets/d/1mLh8E5JEHP-HCrBgs42pVpiY4ZpP7LG-O__3Av2-MgY/export?format=csv&gid=884226509";
    const GOVT_CALENDARS_URL = "https://raw.githubusercontent.com/saratoffice/office/main/calendars.html";
    const ALL_FILES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTagonyub0K84Tg9xZVxeLhQ8rfb417bTqKwSP3xzhkQ5mbnZY6mOFFdB6kK8Hl0EZtYY7t3e8qd-kO/pub?gid=51131841&single=true&output=csv';
    
    let parsedRows = [];
    let allFilesDataTable = null;

    // ---------- LOAD CSV DATA FOR OTHER TABS ----------
    function loadAllCSVTables() {
      updateAllPlaceholders('⏳ Loading documents...');
      
      fetch(CSV_URL)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(csvText => {
          const parsed = Papa.parse(csvText, { header: false });
          const rows = parsed.data.slice(1);
          parsedRows = rows.filter(row => row && row.length > 1);
          
          if (parsedRows.length === 0) {
            throw new Error('No data found in CSV');
          }
          
          populateTableForCategory('Act');
          populateTableForCategory('Rules');
          populateTableForCategory('Order');
          populateTableForCategory('MSP');
          populateTableForCategory('Procurement');
          populateTableForCategory('Food');
          populateTableForCategory('Misc');
        })
        .catch(err => {
          console.error("CSV Load Error:", err);
          showErrorMessage(err.message);
        });
    }
    
    function updateAllPlaceholders(message) {
      const categories = ['Act', 'Rules', 'Order', 'MSP', 'Procurement', 'Food', 'Misc'];
      categories.forEach(cat => {
        const tabDiv = document.getElementById(`tab-${cat}`);
        if (tabDiv) {
          const placeholder = tabDiv.querySelector('.csv-table-placeholder');
          if (placeholder) placeholder.innerHTML = message;
        }
      });
    }
    
    function showErrorMessage(errorText) {
      const categories = ['Act', 'Rules', 'Order', 'MSP', 'Procurement', 'Food', 'Misc'];
      categories.forEach(cat => {
        const tabDiv = document.getElementById(`tab-${cat}`);
        if (tabDiv) {
          const placeholder = tabDiv.querySelector('.csv-table-placeholder');
          if (placeholder) {
            placeholder.innerHTML = `
              <div style="text-align: center; padding: 40px; background: #fff3f3; border-radius: 8px;">
                <h3 style="color: #d32f2f; margin-bottom: 15px;">⚠️ Error Loading Documents</h3>
                <p style="color: #666;">${errorText}</p>
                <p style="color: #999; margin-top: 20px;">Please try refreshing the page or contact support.</p>
              </div>
            `;
          }
        }
      });
    }

    function buildTableHTML(category) {
      const filtered = parsedRows.filter(row => row[1] && row[1].trim() === category);
      if (filtered.length === 0) {
        return `<table class="csv-table"><thead><tr><th>S.No.</th><th>Subject</th><th>Download</th><th>Share</th></tr></thead><tbody><tr><td colspan="4" style="text-align:center; padding:40px;">📁 No documents for ${category}</td></tr></tbody></table>`;
      }

      const rowsHtml = filtered.map((row, idx) => {
        let subject = (row[2] || "").replace(/_/g, " ").replace(/\.pdf$/i, "").trim() || "Untitled";
        const link = row[5] ? row[5].trim() : "#";
        const safeLink = (link.startsWith("http") || link.startsWith("/")) ? link : "#";
        const encodedSubject = encodeURIComponent("📄 " + subject + "\n🔗 " + safeLink);
        return `<tr>
          <td>${idx + 1}</td>
          <td>${subject}</td>
          <td><a href="${safeLink}" target="_blank" rel="noopener noreferrer"><button class="download-btn">Download</button></a></td>
          <td><a href="https://wa.me/?text=${encodedSubject}" target="_blank" rel="noopener noreferrer"><button class="share-btn">Share</button></a></td>
        </tr>`;
      }).join("");

      return `<table class="csv-table">
        <thead><tr><th>S.No.</th><th>Subject</th><th>Download</th><th>Share</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>`;
    }

    function populateTableForCategory(category) {
      const tabDiv = document.getElementById(`tab-${category}`);
      if (!tabDiv) return;
      const placeholder = tabDiv.querySelector('.csv-table-placeholder');
      if (!placeholder) return;
      if (parsedRows.length === 0) {
        placeholder.innerHTML = '⏳ Loading...';
        return;
      }
      placeholder.innerHTML = buildTableHTML(category);
    }

    // ---------- LOAD GOVT. CALENDARS ----------
    function loadGovtCalendars() {
      const calendarContainer = document.getElementById('tab-Govt Calendars');
      if (!calendarContainer) return;
      
      const placeholder = calendarContainer.querySelector('.csv-table-placeholder');
      if (!placeholder) return;
      
      placeholder.innerHTML = '<div style="text-align: center; padding: 40px;">📅 Loading Government Calendars...</div>';
      
      fetch(GOVT_CALENDARS_URL)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.text();
        })
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const calendarSection = doc.querySelector('.govt-calendars-section');
          
          if (calendarSection) {
            placeholder.innerHTML = calendarSection.outerHTML;
          } else {
            placeholder.innerHTML = html;
          }
        })
        .catch(error => {
          console.error('Error loading Govt. Calendars:', error);
          placeholder.innerHTML = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
              <h2 style="color: #0083ed; font-size: 28pt; margin-bottom: 20px;">GOVT. CALENDARS</h2>
              <p style="color: #666; font-size: 18px;">⚠️ Unable to load calendars. Please try again later.</p>
              <p style="color: #999; margin-top: 20px;">Error: ${error.message}</p>
            </div>
          `;
        });
    }

    // ---------- LOAD ALL FILES TAB (using provided code) ----------
    function loadAllFilesTab() {
      const container = document.getElementById('tab-AllFiles');
      if (!container) return;
      
      const placeholder = container.querySelector('.csv-table-placeholder');
      if (!placeholder) return;

      placeholder.innerHTML = '<div style="text-align: center; padding: 40px;">⏳ Loading All Files...</div>';

      // Destroy existing DataTable if it exists
      if (allFilesDataTable) {
        allFilesDataTable.destroy();
        allFilesDataTable = null;
      }

      // Create the table structure
      const tableContainer = document.createElement('div');
      tableContainer.className = 'sara-table-container-v2';
      tableContainer.innerHTML = `
        <table id="saraCsvTableV2" class="display nowrap">
          <thead>
            <tr>
              <th>Index</th>
              <th>Letter No.</th>
              <th>Date</th>
              <th>Subject</th>
              <th>Download</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      `;
      
      placeholder.innerHTML = '';
      placeholder.appendChild(tableContainer);

      // Parse CSV using PapaParse with the provided code
      Papa.parse(ALL_FILES_CSV_URL, {
        download: true,
        header: true,
        complete: function (results) {
          let data = results.data;

          // Process data: clean subject and format date
          data = data.map((row, index) => {
            row["Subject"] = (row["Subject"] || "").replace(/_/g, " ").replace(/\.pdf$/i, "").trim();
            const rawDate = (row["Date"] || "").trim();
            const parts = rawDate.split("/");
            if (parts.length === 3) {
              let [dd, mm, yyyy] = parts;
              dd = dd.padStart(2, '0');
              mm = mm.padStart(2, '0');
              if (yyyy.length === 4) {
                row["SortDate"] = `${yyyy}-${mm}-${dd}`;
                row["Date"] = `${dd}-${mm}-${yyyy}`;
              } else {
                row["SortDate"] = null;
              }
            } else {
              row["SortDate"] = null;
            }
            return row;
          });

          // Sort by date first (latest first)
          data.sort((a, b) => {
            if (!a.SortDate && !b.SortDate) return 0;
            if (!a.SortDate) return 1;
            if (!b.SortDate) return -1;
            return new Date(b.SortDate) - new Date(a.SortDate);
          });

          // Add sequential S.N. after sorting
          data.forEach((row, index) => {
            row["S.N."] = index + 1;
          });

          const tbody = $('#saraCsvTableV2 tbody');
          tbody.empty();

          data.forEach(row => {
            // Handle download button - check if Button column exists or create from Link
            let downloadButton = row["Button"] || "";
            if (!downloadButton && row["Link"]) {
              downloadButton = `<a href="${row["Link"]}" target="_blank" rel="noopener noreferrer"><button class="sara-download-btn">Download</button></a>`;
            }
            
            const tableRow = `
              <tr>
                <td data-label="S.N.">${row["S.N."]}</td>
                <td data-label="Letter No.">${row["Letter No."] || ""}</td>
                <td data-label="Date" data-sort="${row["SortDate"] || ''}">${row["Date"] || ""}</td>
                <td data-label="Subject">${row["Subject"] || ""}</td>
                <td data-label="Download">${downloadButton}</td>
                <td data-label="File Size">${row["File Size (MB)"] || "—"}</td>
              </tr>`;
            tbody.append(tableRow);
          });

          // Initialize DataTable
          allFilesDataTable = $('#saraCsvTableV2').DataTable({
            responsive: true,
            pageLength: 10,
            lengthMenu: [[5, 10, 25, 50, 100, -1], [5, 10, 25, 50, 100, "All"]],
            autoWidth: false,
            order: [[2, 'desc']], // Keep default sorting by date
            columnDefs: [
              {
                targets: 0, // S.N. column
                orderable: false // Disable sorting on this column
              }
            ],
            language: {
              search: "Search:",
              lengthMenu: "Show _MENU_ entries",
              info: "Showing _START_ to _END_ of _TOTAL_ entries",
              infoEmpty: "No records available",
              infoFiltered: "(filtered from _MAX_ total entries)",
              paginate: {
                first: "First",
                last: "Last",
                next: "Next",
                previous: "Previous"
              }
            },
            drawCallback: function(settings) {
              // Re-number the S.N. column after each draw (sort/filter/page)
              const api = this.api();
              api.column(0, {page: 'current'}).nodes().each(function(cell, i) {
                cell.innerHTML = i + 1 + (api.page() * api.page.len());
              });
            }
          });
        },
        error: function (err) {
          console.error('CSV Load Error:', err);
          placeholder.innerHTML = `
            <div style="text-align: center; padding: 50px; background: white; border-radius: 12px;">
              <h2 style="color: #0083ed;">ALL FILES</h2>
              <p style="color: #666;">Failed to load data. Please try again later.</p>
              <p style="color: #999; margin-top: 20px;">Error: ${err.message}</p>
            </div>
          `;
        }
      });
    }

    // ---------- TAB CLICK HANDLER ----------
    function initTabs() {
      const tabStrip = document.querySelector('.sarat-docs .tab-strip');
      if (!tabStrip) return;
      const tabButtons = tabStrip.querySelectorAll('.tab-item');
      
      const containers = {
        AllFiles: document.getElementById('tab-AllFiles'),
        Act: document.getElementById('tab-Act'),
        Rules: document.getElementById('tab-Rules'),
        Order: document.getElementById('tab-Order'),
        MSP: document.getElementById('tab-MSP'),
        Procurement: document.getElementById('tab-Procurement'),
        Food: document.getElementById('tab-Food'),
        Misc: document.getElementById('tab-Misc'),
        'Govt Calendars': document.getElementById('tab-Govt Calendars')
      };

      function activateTab(category) {
        // Update active class
        tabButtons.forEach(btn => {
          const btnCat = btn.getAttribute('data-category');
          btn.classList.toggle('active', btnCat === category);
        });

        // Show/hide containers
        Object.keys(containers).forEach(key => {
          if (containers[key]) {
            containers[key].style.display = key === category ? 'block' : 'none';
          }
        });

        // Load data if needed
        if (category === 'AllFiles') {
          loadAllFilesTab();
        } else if (category === 'Govt Calendars') {
          loadGovtCalendars();
        } else if (parsedRows.length > 0) {
          const target = containers[category];
          if (target) {
            const placeholder = target.querySelector('.csv-table-placeholder');
            if (placeholder && placeholder.innerHTML.includes('Loading')) {
              placeholder.innerHTML = buildTableHTML(category);
            }
          }
        }
      }

      tabButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          const category = this.getAttribute('data-category');
          activateTab(category);
        });
      });

      // Initial active tab: AllFiles
      activateTab('AllFiles');
    }

    // ---------- INITIALIZE EVERYTHING ----------
    document.addEventListener('DOMContentLoaded', function() {
      initTabs();
      loadAllCSVTables(); // Load CSV data for other tabs
    });

  })();
