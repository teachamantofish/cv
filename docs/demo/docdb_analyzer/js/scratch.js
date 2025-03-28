
TODO list

add fake metrics from AA separate file. 

n DataTables, dom: 'lBfrtip' controls the layout and order of the table's control elements. Each letter represents a different UI element:
l = Length changing (show X entries dropdown)
B = Buttons (export, print, etc.)
f = Filtering (search box)
r = pRocessing display
t = Table
i = Information summary
p = Pagination controls

ICONS: https://www.reshot.com/free-svg-icons/tools/


good piechart layout
function initPieChartLive(docCounts) {
    console.log("I am initPieChartLive");
    console.log("hello:" + typeof am5, typeof am5percent);

    Object.keys(docCounts).forEach(key => {
        console.log(`${key}: ${docCounts[key]} (Type: ${typeof docCounts[key]})`);
    });

    am5.ready(function() {

        try {
            let existingRoot = am5.getRoot("chartdiv");
            console.log("Existing Root:", existingRoot);
            if (existingRoot) {
                existingRoot.dispose();
                console.log("Disposed old chart root.");
            }
        } catch (error) {
            console.warn("Error disposing previous AMCharts instance:", error);
        }

        let chartDiv = document.getElementById("chartdiv");
        console.log("Checking chartdiv:", chartDiv);
        if (!chartDiv) {
            console.error("Error: chartdiv does not exist in DOM!");
            return;
        }

        let root = am5.Root.new("chartdiv");
        console.log("Created AMCharts Root:", root);

        root.setThemes([am5themes_Animated.new(root)]);

        // Set max width for the chart container
        root.container.setAll({
            maxWidth: 6
            00
        });

        // Create chart
        let chart = root.container.children.push(
            am5percent.PieChart.new(root, {
                layout: root.horizontalLayout,
                innerRadius: am5.percent(50),
                paddingLeft: 0,
                paddingRight: 0
            })
        );

        // Create series
        let series = chart.series.push(
            am5percent.PieSeries.new(root, {
                valueField: "count",
                categoryField: "category",
                endAngle: 270,
                radius: am5.percent(90)
            })
        );

        // Remove labels
        series.labels.template.set("forceHidden", true);
        series.ticks.template.set("forceHidden", true);

        series.states.create("hidden", {
            endAngle: -90
        });

        // Set data
        series.data.setAll([
            { category: "2 months", count: docCounts.t60Docs },
            { category: "3 months", count: docCounts.t90Docs },
            { category: "6 months", count: docCounts.t180Docs },
            { category: "1 year", count: docCounts.t1yearDocs },
            { category: "2 years", count: docCounts.t2yearDocs }
        ]);

        // Create legend
        let legend = chart.children.push(am5.Legend.new(root, {
            centerY: am5.percent(50),
            y: am5.percent(50),
            layout: root.verticalLayout,
            marginLeft: 0,
            x: 0,
            centerX: 0
        }));

        legend.data.setAll(series.dataItems);

        // Play initial series animation
        series.appear(1000, 100);
    });
}



// Test function to call the field processors individually
testFieldProcessors = function() {
    try {
        // Create a sample row for testing
        const testRow = [
            "/content/help/en/adobe-connect/using/accessibility-features.html", 
            "Accessibility features", 
            "url", 
            true, 
            "2023-05-15", 
            "JohnDoe", 
            "2022-12-01"
        ];
        
        const result0 = processField0_Path(testRow[0]);
        processField1_ArticleTitle(testRow[1]);
        processField2_InternalUrl(testRow[1]);
        processField3_NoIndex(testRow[1]);
        processField5_LastModifiedBy(testRow[5]);
        processField6_PublishedLive(testRow[6]);
        
        return "Test complete - check console for results";
    } catch (error) {
        return "Test failed with error: " + error.message;
    }
};



// Function to check URLs and log 404s to console
async function checkLiveUrls() {
    console.log('Starting URL check...');
    
    for (const row of parsedCSVData) {
        // Process the path to get dir1, dir2, and filename
        processField0_Path(row['Path']);
        
        if (dir1 && dir2 && filename) {
            const url = liveUrlFragment + dir1 + dir2 + filename;
            try {
                const response = await fetch(url, { method: 'HEAD' });
                console.log(`${filename}: ${response.status}`);
            } catch (error) {
                // Extract status code from error message
                const statusMatch = error.message.match(/Status code: (\d+)/);
                if (statusMatch) {
                    console.log(`${filename}: ${statusMatch[1]}`);
                }
            }
        }
    }
    console.log('URL check complete');
}



///////////////////////////////////////////////////
///////////////////////////////////////////////////

function addBlankFields(data) {
    return data.map(row => {
        const keys = Object.keys(row);
        const values = Object.values(row);

        // Insert "Author" at position 3
        keys.splice(2, 0, 'Author');
        values.splice(2, 0, '');

        // Insert "Preview" at position 4
        keys.splice(3, 0, 'Preview');
        values.splice(3, 0, '');

        return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
    });
}

function modifyData(data) {
    // Convert dates in index 4 and index 5 to the format "%b %d, %Y"

    return data.map(row => {
        const values = Object.values(row);
        var lastSubdirectory = '';

        // Assuming the date columns are at index 2 and 4
        const dateColumns = [4];
        dateColumns.forEach(index => {
            if (values[index]) {
                const date = new Date(values[index]);
                if (!isNaN(date)) {
                    values[index] = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
                }
            }
        });

        // Perform different search and replace operations for each column
        if (values[1]) {
            const match = values[1].match(/\/content\/help\/en\/adobe-connect\/([^/]+)\//);
            if (match) {
                lastSubdirectory = match[1];
            }
            values[1] = values[1].replace(/\/content\/help\/en\/adobe-connect\/[^/]+\//, '') + '.html';
        }
        // Replace the value at index 2 with a link to the author page
        values[2] = '<a href="https://chl-author.corp.adobe.com/editor.html/content/help/en/adobe-connect/' + lastSubdirectory + '/' + values[1] + '" target="blank">Auth</a>' 
            + ' (' + (values[3] === true ? '<a href="https://helpx-internal.corp.adobe.com/content/help/en/adobe-connect/' + lastSubdirectory + '/' + values[1] + '" target="blank">P</a>' : 'xxx') + ')';

        // Replace the value at index 3 with a link to the preview page
        values[3] = '';

        // Replace the value at index 4 with a link to the live page; else print "No"
        if (!values[4]) {  // This will catch null, undefined, empty string, and other falsy values
            values[4] = 'No';
        } else {
            values[4] = '<a href="https://helpx.adobe.com/adobe-connect/' + lastSubdirectory + '/' + values[1] + '" target="blank">' + values[4] + '</a>';
        }

        //console.log('Row values:', values);

        if (!values[5]) {  // This catches null, undefined, and empty strings
            values[5] = 'Never';
        }

        if (values[6]) {
            const date = new Date(values[6]);
            if (!isNaN(date)) {
                const today = new Date();
                const daysAgo = Math.floor((today - date) / (1000 * 60 * 60 * 24));
                values[6] = daysAgo.toString();
            }
        } else {
            console.log('Missing or null values[6] at row:', data.indexOf(row));
        }

        return values;  // Here we return an array instead of an object
    });
}


clearData = function() {
    // Clear all global variables
    parsedCSVData = null;
    originalData = null;
    csvHeaderRow = null;
    csvContent = null;
    modifiedData = null;

    // Clear the table
    if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().clear().destroy();
    }

    // Clear the report div
    document.getElementById('report-div').innerHTML = '';

    // Reset the table header visibility
    document.getElementById('main').setAttribute('id', 'main');

    // Now reload the page
    location.reload();
}