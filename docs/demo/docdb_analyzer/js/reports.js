// Initialize global docCounts
docCounts = { t60Docs: 0, t90Docs: 0, t180Docs: 0, t1yearDocs: 0, t2yearDocs: 0, t3yearDocs: 0, differentdirectory: 0, notSentenceCase: 0, notIndexed: 0 };

// Make storeAndShowChart globally available
window.storeAndShowChart = function() {
    openModal('chartModal');
    initChartBar(docCounts);
}

function isSentenceCase(str) {
    if (!str) return true;
    
    // Find all capital letters not at the start of the string
    const matches = str.match(/.[A-Z]/g);
    if (!matches) return true;  // No capitals after first char
    
    const allowedTerms = ["Adobe Connect", "Adobe", "Connect Central", "Adobe Connect Central", "FAQs", "API"];
    
    // For each capital letter found
    for (const match of matches) {
        // Get the position of this capital letter (add 1 because match includes preceding char)
        const capitalPos = str.indexOf(match) + 1;
        
        // Check if this capital is part of any allowed term
        const isAllowedCapital = allowedTerms.some(term => {
            // Find all occurrences of this term in the string
            let pos = -1;
            let found = false;
            while ((pos = str.indexOf(term, pos + 1)) !== -1) {
                // Check if our capital letter falls within this term's range
                if (capitalPos >= pos && capitalPos < pos + term.length) {
                    found = true;
                    break;
                }
            }
            return found;
        });
        
        if (!isAllowedCapital) return false;
    }
    
    return true;
}

function reportOnData(table) {
    console.log('reportOnData called with table:', table);
    if (table) {
        // Get all data using DataTables API
        let allData = table.rows().data();
        console.log('Total rows found:', allData.length);

        if (allData.length > 0) {
            docCounts = {
                t60Docs: 0,
                t90Docs: 0,
                t180Docs: 0,
                t1yearDocs: 0,
                t2yearDocs: 0,
                t3yearDocs: 0,
                differentdirectory: 0,
                notSentenceCase: 0,
                notPublished: 0,
                notIndexed: 0
            };

            // Iterate through all data
            allData.each(function (row) {
                let value = Number(row[4]); // Age column (index 4 after checkbox)
                if (value >= 720) {
                    docCounts.t2yearDocs++;
                } else if (value >= 360 && value < 720) {
                    docCounts.t1yearDocs++;
                } else if (value >= 180 && value < 359) {
                    docCounts.t180Docs++;
                } else if (value >= 90 && value < 179) {
                    docCounts.t90Docs++;
                } else if (value >= 60 && value < 89) {
                    docCounts.t60Docs++;
                } else if (value >= 0 && value < 59) {
                    docCounts.t60Docs++;
                }

                // Check title for sentence case
                const title = row[0]; // Title is first column after checkbox
                if (title && !isSentenceCase(title)) {
                    docCounts.notSentenceCase++;
                }
                // Check filename (HTML File Name column)
                const fileName = row[1]; // Filename is second column after checkbox
                if (fileName && fileName.includes('/')) {
                    docCounts.differentdirectory++;
                }

                // Check published status (Live column)
                if (row[3].includes(': No')) { // Last Mod column
                    docCounts.notPublished++;
                }
                // Check if noIndex is set
                if (row[6] === "No") { // Index column
                    docCounts.notIndexed++;
                }
            });
        }
    }

    var resultsDiv = document.querySelector('#report-div');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = generateReportHTML();
}

function generateReportHTML() {
    return `
    <div class="report-container">
        <table class="report-table">
        <tr>
            <th># Files</th>
            <th>Not live</th>
            <th>No Index</th>
            <th>Casing issues</th>
            <th>Different directory</th>
            <th>Docs 6-12m old</th>
            <th>Docs 1-2y old</th>
            <th>Docs 2+y old</th>
            <th>Show graphs</th>
        </tr>
        <tr>
            <td>${modifiedData.length}</td>
            <td>${docCounts.notPublished}</td>
            <td>${docCounts.notIndexed}</td>
            <td>${docCounts.notSentenceCase}</td>
            <td>${docCounts.differentdirectory}</td>
            <td>${docCounts.t180Docs}</td>
            <td>${docCounts.t1yearDocs}</td>
            <td>${docCounts.t2yearDocs}</td>
            <td><button class="dt-button buttons-collection" tabindex="0" aria-controls="example" type="button" onclick="storeAndShowChart()">Graph it!</button></td>
        </tr>
        </table>
    </div>
    `;
}

function initChartBar(counts) {
    am5.ready(function () {
        var root = am5.Root.new("chartdiv1");

        var data = [
            { category: "Over 2 years", value: counts.t2yearDocs },
            { category: "1-2 years", value: counts.t1yearDocs },
            { category: "9-12 months", value: counts.t180Docs },
            { category: "6-9 months", value: counts.t90Docs },
            { category: "3-6 months", value: counts.t60Docs }
        ];

        root.setThemes([
            am5themes_Animated.new(root)
        ]);

        root.container.set("background", am5.Rectangle.new(root, {}));

        var chart = root.container.children.push(am5xy.XYChart.new(root, {
            panX: false,
            panY: false,
            wheelX: "none",
            wheelY: "none",
            paddingTop: 25,
            paddingBottom: 0,
            width: am5.percent(100),
            height: am5.percent(100)
        }));

        var colors = [
            am5.color("#ff6361"),
            am5.color("#eb7d34"),
            am5.color("#c6960d"),
            am5.color("#95ab1e"),
            am5.color("#51b94f")
        ];

        chart.set("colors", am5.ColorSet.new(root, {
            colors: colors
        }));

        chart.zoomOutButton.set("forceHidden", true);

        var yRenderer = am5xy.AxisRendererY.new(root, {
            minGridDistance: 15,
            minorGridEnabled: true
        });

        yRenderer.grid.template.set("location", 1);

        var yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
            maxDeviation: 0,
            categoryField: "category",
            renderer: yRenderer,
            tooltip: am5.Tooltip.new(root, { themeTags: ["axis"] })
        }));

        var xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
            maxDeviation: 0,
            min: 0,
            extraMax: 0.1,
            renderer: am5xy.AxisRendererX.new(root, {
                strokeOpacity: 0.1,
                minGridDistance: 50
            })
        }));

        var series = chart.series.push(am5xy.ColumnSeries.new(root, {
            name: "Files",
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: "value",
            categoryYField: "category",
            tooltip: am5.Tooltip.new(root, {
                pointerOrientation: "left",
                labelText: "{value} files"
            })
        }));

        series.columns.template.setAll({
            cornerRadiusTR: 5,
            cornerRadiusBR: 5,
            strokeOpacity: 0
        });

        // Add value labels inside the bars
        series.bullets.push(function () {
            return am5.Bullet.new(root, {
                locationX: 0.5,
                sprite: am5.Label.new(root, {
                    text: "{value}",
                    fill: am5.color(0xffffff),
                    centerY: am5.p50,
                    centerX: am5.p50,
                    populateText: true,
                    fontWeight: "bold"
                })
            });
        });

        series.columns.template.adapters.add("fill", function (fill, target) {
            return chart.get("colors").getIndex(series.columns.indexOf(target));
        });

        series.columns.template.adapters.add("stroke", function (stroke, target) {
            return chart.get("colors").getIndex(series.columns.indexOf(target));
        });

        yAxis.data.setAll(data);
        series.data.setAll(data);

        series.appear(1000);
        chart.appear(1000, 100);
    });
}

function pageViewsLineChart() {
    am5.ready(function () {
        // Dispose of existing chart if it exists
        am5.array.each(am5.registry.rootElements, function (root) {
            if (root.dom.id === "chartdiv2") {
                root.dispose();
            }
        });

        // Create root element
        var root = am5.Root.new("chartdiv2");

        // Set themes
        root.setThemes([am5themes_Animated.new(root)]);

        // Create chart
        var chart = root.container.children.push(am5xy.XYChart.new(root, {
            panX: true,
            panY: true,
            wheelX: "panX",
            wheelY: "zoomX",
            pinchZoomX: true
        }));

        // Add cursor
        var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
            behavior: "none"
        }));
        cursor.lineY.set("visible", false);

        // Parse CSV data
        Papa.parse("pagemetrics.csv", {
            download: true,
            header: true,
            complete: function(results) {
                // Process data for the chart
                var data = results.data.map(function(row) {
                    return {
                        week: parseInt(row.Week) || 0,
                        pageviews: parseInt(row.PageViews) || 0
                    };
                }).filter(row => row.week > 0);

                // Create axes
                var xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
                    maxDeviation: 0.2,
                    renderer: am5xy.AxisRendererX.new(root, {}),
                    tooltip: am5.Tooltip.new(root, {}),
                    min: 1,
                    max: Math.max(...data.map(d => d.week)),
                    strictMinMax: true
                }));

                xAxis.get("renderer").labels.template.setAll({
                    text: "Week {value}"
                });

                var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
                    renderer: am5xy.AxisRendererY.new(root, {})
                }));

                // Add series
                var series = chart.series.push(am5xy.LineSeries.new(root, {
                    name: "Page Views",
                    xAxis: xAxis,
                    yAxis: yAxis,
                    valueYField: "pageviews",
                    valueXField: "week",
                    tooltip: am5.Tooltip.new(root, {
                        labelText: "Week {valueX}: {valueY} views"
                    })
                }));

                // Add scrollbar
                chart.set("scrollbarX", am5.Scrollbar.new(root, {
                    orientation: "horizontal"
                }));

                // Set data
                series.data.setAll(data);

                // Make stuff animate on load
                series.appear(1000);
                chart.appear(1000, 100);
            },
            error: function(error) {
                console.error("Error loading pagemetrics.csv:", error);
                // Add error message to chart div
                document.getElementById("chartdiv2").innerHTML = "Error loading page metrics data";
            }
        });
    });
}