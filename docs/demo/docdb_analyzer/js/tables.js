document.addEventListener('DOMContentLoaded', function () {
  // Remove Tippy initialization from here since table isn't ready yet
  
  // Add custom date sorting to DataTables
  $.fn.dataTable.ext.type.order['date-mm-dd-yyyy-pre'] = function(data) {
    // Return lowest value for "No" so it appears last in ascending order
    if (data === "No") {
      return -Number.MAX_VALUE;
    }
    
    // Skip empty values or non-string values
    if (!data || typeof data !== 'string') {
      return 0;
    }
    
    // Try to parse date in format MM/DD/YYYY
    if (data.includes('/')) {
      const parts = data.split('/');
      if (parts.length === 3) {
        // Format as YYYY/MM/DD for proper sorting
        const year = parts[2];
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        
        // Convert to a sortable number (YYYYMMDD)
        return parseInt(year + month + day, 10);
      }
    }
    
    // If we can't parse it, just return 0
    return 0;
  };

  // Add custom date sorting to DataTables for "MMM DD, YYYY" format (abbreviated months)
  $.fn.dataTable.ext.type.order['date-monthname-pre'] = function(data) {
    console.log("FULL RAW DATA:", data);  // Log the full raw data
    
    // Return lowest value for "No" so it appears last in ascending order
    if (data === "No") {
      return -Number.MAX_VALUE;
    }
    
    // Skip empty values or non-string values
    if (!data || typeof data !== 'string') {
      return 0;
    }
    
    // Extract date text from HTML links if present
    let dateText = data;
    if (data.includes('<a')) {
      // Try multiple regex patterns to extract the date
      let extracted = false;
      
      // Pattern 1: Between > and <
      const match1 = data.match(/>([^<]+)</);
      if (match1 && match1[1]) {
        dateText = match1[1].trim();
        console.log("Extraction method 1:", dateText);
        extracted = true;
      }
      
      // Pattern 2: Try to extract anything that looks like a date
      if (!extracted) {
        const match2 = data.match(/([A-Za-z]{3}\s+\d{1,2},\s*\d{4})/);
        if (match2 && match2[1]) {
          dateText = match2[1].trim();
          console.log("Extraction method 2:", dateText);
          extracted = true;
        }
      }
      
      // Pattern 3: Last resort - just get text content
      if (!extracted) {
        // Create a dummy element and set its HTML to extract text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data;
        dateText = tempDiv.textContent.trim();
        console.log("Extraction method 3:", dateText);
      }
    }
    
    // For "MMM DD, YYYY" format (e.g., "Aug 07, 2019")
    const months = {
      'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
      'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    };
    
    try {
      // Lower case for comparison
      const ldata = dateText.toLowerCase();
      
      // Find month by abbreviation
      let month = 0;
      for (const monthAbbr in months) {
        if (ldata.indexOf(monthAbbr) === 0) { // Check if it starts with month abbreviation
          month = months[monthAbbr];
          break;
        }
      }
      
      // Extract day and year using regex
      const match = ldata.match(/[a-z]{3}\s+(\d+),\s*(\d{4})/i);
      if (match && month > 0) {
        const day = parseInt(match[1], 10);
        const year = parseInt(match[2], 10);
        
        // Return as YYYYMMDD for proper sorting
        const sortValue = year * 10000 + month * 100 + day;
        console.log(`Parsed "${dateText}" → Month: ${month}, Day: ${day}, Year: ${year}, Sort value: ${sortValue}`);
        return sortValue;
      } else {
        console.log(`Failed to parse date: "${dateText}", raw data was: "${data}"`);
      }
    } catch (e) {
      console.log("Error parsing date:", dateText, e);
    }
    
    // If we can't parse it, just return 0
    return 0;
  };

  // Call displayTable function with updated data
  if (window.modifiedData) {
    // Ensure table structure exists
    const table = document.querySelector('#example');
    if (!table.querySelector('tbody')) {
      const tbody = document.createElement('tbody');
      tbody.id = 'tableBody';
      table.appendChild(tbody);
    }
    initDataTable();
  }
});

function initDataTable() {
  return new Promise((resolve) => {
    $(document).ready(function () {
      const table = $('#example').DataTable({
        data: window.modifiedData,
        destroy: false,
        retrieve: true,
        autoWidth: true,
        responsive: false,
        scrollY: '900px',
        scrollCollapse: true,
        scrollX: false,
        fixedColumns: {
          left: 1,
          rightColumns: 0
        },
        paging: true,
        pageLength: 50,
        lengthChange: false,
        searching: true,
        ordering: true,
        info: true,
        lengthMenu: [25, 50, 100, 200, 400],
        language: {
            search: "Search (case sensitive, regex OK):",
            info: "Showing _START_ to _END_ of _TOTAL_",  // Changes "Showing X to Y of Z entries"
        },
        search: {
          regex: true,
          caseInsensitive: false
        },
        dom: '<"top"<"row1"Blfip><"row2">>t',
        buttons: [
          { extend: 'pageLength', attr: { 'data-row': '1' } },
          { extend: 'colvis', text: 'Show columns', attr: { 'data-row': '1' } },
          { extend: 'print', attr: { 'data-row': '2' } },
          { extend: 'excel', text: 'Excel Export', attr: { 'data-row': '2' } },
          {
            extend: 'collection',
            text: 'Open selected in browser',
            attr: { 'data-row': '2' },
            buttons: [
              { text: 'Author view', action: function() { openAuthorTabs(); } },
              { text: 'Preview mode', action: function () { openPreviewTabs() } },
              { text: 'Live pages', action: function () { openLiveTabs() } }
            ]
          },
          {
            extend: 'collection',
            text: 'Email page list',
            attr: { 'data-row': '2' },
            buttons: [
              { text: 'Email preview links', action: function() { sendForReview(); } },
              { text: 'Email to web team', action: function () { sendToWebProd() } },
              { text: 'Email live links', action: function () { sendLiveLinks() } }
            ]
          },
          {
            extend: 'collection',
            text: 'Export batch files',
            attr: { 'data-row': '2' },
            buttons: [
              { text: 'GO URL batch file', action: function() { exportGoUrlBatch(); } },
              { text: 'Redirect batch file', action: function () { exportRedirectBatch(); } },
              { text: 'Create TOC data', action: function () { exportToc(); } }
            ]
          },
        ],
        columns: [
          {
            title: '<input type="checkbox" id="select-all">',
            data: null,
            defaultContent: '<input type="checkbox" class="row-checkbox">',
            orderable: false,
          },
          { 
            data: function (row) { return row[0]; }, 
            title: '<span data-tippy-content="The customer-facing article title. Titles should use sentence casing. Potential issues are colored. Note also that product names probably do not belong in titles.">Content title</span>'
          },
          {  // the index number identifies the index of the data we are using.
            data: function (row) { return row[1]; }, 
            title: '<span data-tippy-content="The file name used in the URL and the URL ID in AEM. Files which reside in a different directory are colored.">File name and URL ID </span>'
          },
          { 
            data: function (row) { return row[2]; }, 
            title: '<span data-tippy-content="Link to the author page and preview page (if any)">Links</span>'
          },
          { 
            data: function (row) { 
              return row[3]; // Use original data
            }, 
            title: '<span data-tippy-content="Live link  and the last modified date. Pages in red without links are NOT LIVE.">Last Mod</span>', 
            orderSequence: ['asc', 'desc']
          },
          { 
            data: function (row) { return row[4]; }, 
            title: '<span data-tippy-content="Days since last modification">Age</span>'
          },
          { 
            data: function (row) { return row[5]; }, 
            title: '<span data-tippy-content="Last modified by">Who?</span>'
          },
          { 
            data: function (row) { return row[6]; }, 
            title: '<span data-tippy-content="Index status: NO means it is not indexed and search engines will not find it.">Index</span>'
          },
          {
            data: null,
            title: '<span data-tippy-content="Dummy Adobe Analytics metrics which could be integrated here.">AA</span>',
            defaultContent: '<img src="images/chartcolor.svg" class="chart-icon" alt="View metrics chart">',
            orderable: false
          }
        ],
        columnDefs: [
          {
            targets: 0,
            orderable: false,
            className: 'dt-center dt-compact',
            width: '20px'
          },
          {
            targets: 1,
            className: 'dt-nowrap dt-compact',

          },
          {
            targets: 2,
            className: 'dt-nowrap dt-compact',

          },
          {
            targets: [3,4],
            className: 'dt-nowrap dt-compact dt-center',
            width: '1%'
          },
          {
            targets: 4,
            className: 'dt-nowrap dt-compact dt-center',
            width: '1%',
            render: function(data, type, row) {
                if (type === 'sort') {
                    let textContent = data;
                    if (typeof data === 'string' && data.includes('<')) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = data;
                        textContent = tempDiv.textContent.trim();
                    }
                    if (textContent.includes(": No")) {
                        return 1900;
                    }
                    const yearMatch = textContent.match(/\b(20\d{2})\b/);
                    if (yearMatch) {
                        return parseInt(yearMatch[1]);
                    }
                    return 2000;
                }
                return data;  // For display and filter, just return the data as is
            }
          },
          {
            targets: 5,
            className: 'dt-nowrap dt-compact dt-center',
            width: '40px'
          },
          {
            targets: 6,
            className: 'dt-compact dt-center',
            width: '70px',
            render: function(data, type, row) {
                if (type === 'sort') {
                    return row[6] ? row[6].toString().toLowerCase() : '';
                }
                return data;
            }
          },
          {
            targets: 7,
            type: 'numeric',
            className: 'dt-compact dt-center',
            width: '50px',
            render: function(data, type, row) {
              if (type === 'sort') {
                  return row[6] ? row[6].toString().toLowerCase() : '';
              }
              return data;
            }
          },
          {
            targets: 8,
            className: 'dt-compact dt-center',
            width: '40px',
            createdCell: function(td, cellData, rowData, row, col) {
              $(td).find('img').on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                pageViewsLineChart();
                openModal('pageMetricsModal');
              });
            }
          }
        ],
        order: [[1, 'asc']],
        createdRow: function (row, data, dataIndex) {
          const cells = $(row).find('td');

          // Adjust all indexes by +1 to account for checkbox column
          if (!isSentenceCase(data[0])) $(cells[1]).addClass('casing');
          if (data[1].includes('/')) $(cells[2]).addClass('differentdirectory');
          // Simple check for "No"
          //if (data[5] === "no data") $(cells[6]).addClass('not-localized');
          const daysAgo = parseInt(data[4], 10);
          if (daysAgo > 360) $(cells[5]).addClass('old');
          if (data[3].includes(': No')) $(cells[4]).addClass('not-live');
          if (data[6] === "No") $(cells[7]).addClass('later');
        },
        initComplete: function() {
            $('#main').show();

            if ($('.row1 .dt-buttons').length === 0) {
              $('.row1').prepend('<div class="dt-buttons"></div>');
            }
            if ($('.row2 .dt-buttons').length === 0) {
              $('.row2').prepend('<div class="dt-buttons"></div>');
            }

            $('.dt-buttons button[data-row="1"]').appendTo('.row1 .dt-buttons');
            $('.dt-buttons button[data-row="2"]').appendTo('.row2 .dt-buttons');
            
            // Initialize Tippy.js after table is ready
            tippy('[data-tippy-content]', {
              placement: 'top',
              arrow: true,
              theme: 'custom'
            });
        }
      });

      // Generate the report after table is fully initialized
      reportOnData(table);

      // Reinitialize tooltips when table is redrawn (sorting, filtering, etc)
      table.on('draw', function() {
        tippy('[data-tippy-content]', {
          placement: 'top',
          arrow: true,
          theme: 'custom'
        });
      });

      // Handle "Select All" functionality
      $('#select-all').on('click', function () {
        const checked = this.checked;
        $('.row-checkbox').prop('checked', checked);
      });

      resolve(table);
    });
  });
}
