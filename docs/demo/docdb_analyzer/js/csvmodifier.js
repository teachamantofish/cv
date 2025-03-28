// Global variables
parsedCSVData = null;  // Store parsed CSV data
originalData = null;   // For export functions
aemDataPath = null;   // Store the header row separately
csvContent = null;     // Store the raw CSV content
modifiedData = null;   // Store modified data used in the DataTable
dir1 = null;          // Store directory 1 from path
dir2 = null;          // Store directory 2 from path
filename = null;       // Store filename from path
authorUrl = null;      // Store author URL
internalUrl = null;    // Store internal URL
articleTitle = null;   // Store article title   
indexed = null;        // Store indexed status (Yes/No)
previewUrl = null;     // Store preview URL
lastChanged = null;    // Store last modified date
age = null;            // Store age calculated from lastModified date
liveUrl = null;       // Store URL input

// Global function declarations
loadCSV = null;
parseForRawData = null;
parseForDataTable = null;
processDataForDisplay = null;
processField_Path = null;
processField_ArticleTitle = null;
processField_InternalUrl = null;
processField_NoIndex = null;
processField_LastModifiedBy = null;
processField_PublishedLive = null;
clearData = null;
testFieldProcessors = null;

//Constants
authorUrlFragment = 'https://chl-author.corp.adobe.com/editor.html/content/help/en/';
liveUrlFragment = 'https://helpx.adobe.com/';

// Define loadCSV function immediately
loadCSV = function() {
    var fileInput = document.getElementById('csvFileInput');
    var file = fileInput.files[0];

    // Remove the class that hides the thead
    document.getElementById('main').removeAttribute('id');

    if (!file) {
        alert("Please select a CSV file.");
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        csvContent = e.target.result.replace(/\r\n$/, '');
        
        // Parse CSV first to get originalData without header
        parseForRawData();
        // Then use originalData for the DataTable
        parseForDataTable();
    };
    reader.readAsText(file);
};

parseForRawData = function() {
    const rawData = Papa.parse(csvContent, {
        header: false,
        dynamicTyping: true,
        skipEmptyLines: true
    });
    
    // Store the header row
    aemDataPath = [rawData.data[1][0]];
    document.getElementById('pathDisplay').textContent = aemDataPath;
    // Remove the header row because we define that in tables.js
    originalData = rawData.data.slice(1);  // Store everything except header
};

parseForDataTable = function() {
    // Use originalData which already has header row removed
    Papa.parse(csvContent, {
        header: true,  // Create object format for DataTable
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            parsedCSVData = results.data.slice(1); // Remove the first row
            processDataForDisplay(parsedCSVData);
        }
    });
};

processDataForDisplay = function(data) {
    // Process each row individually
    const processedData = data.map(row => {
        // Process path to get directory structure
        const pathResult = processField_Path(row['Path']);
        dir1 = pathResult.dir1;
        dir2 = pathResult.dir2;
        filename = pathResult.filename;

        // Process other fields
        title = processField_ArticleTitle(row['Article Title']);
        liveUrl = processField_LiveUrl(row['External Url']);
        internalUrl = processField_InternalUrl(row['Internal Url']);
        indexed = processField_NoIndex(row['No Index']);
        const dateResult = processField_LastModified(row['Last Modified']);
        lastChanged = dateResult.lastChanged;
        age = dateResult.age;
        author = processField_LastModifiedBy(row['Last Modified By']);

        /*
        console.log('Row values:', {
            title,
            filename,
            internalUrl,
            lastChanged,
            age,
            author,
            indexed,
        });
        */
        // Return array for DataTable
        return [
            title,
            filename,
            '<a href="' + authorUrlFragment + dir1 + dir2 + filename + '" target="_blank">Auth</a> ' + internalUrl,
            lastChanged,
            age,
            '<a href="mailto:' + author + '@adobe.com" target="_blank">' + author + '</a>',
            indexed
        ];
    });

    // console.log('Processed data:', processedData);

    // Store in global variable for DataTable
    modifiedData = processedData;
    
    // Initialize DataTable
    initDataTable();
};

// Process title field
processField_Path = function(inputPath) {
    if (!inputPath) {
        return { dir1: '', dir2: '', filename: '' };
    } 
    const match = inputPath.match(/\/content\/help\/en\/([^\/]*\/)([^\/]*\/)(.*)/); 
    
    if (!match) {
        return { dir1: '', dir2: '', filename: inputPath };
    }
    
    return {
        dir1: match[1],
        dir2: match[2],
        filename: match[3] + '.html'
    };
}

// Process file name field
processField_ArticleTitle = function(articleTitle) {
    return articleTitle || '';
}

processField_LiveUrl = function(urlInput) {
    liveUrl = urlInput || ''; // Store in global variable
    return liveUrl; // Return the value
}

processField_InternalUrl = function(urlInput) {
    return urlInput ? '<a href="' + urlInput + '" target="_blank">(P)</a>' : '';
}

processField_NoIndex = function(noIndex) {
    return noIndex === true ? "No" : "Yes";
}

processField_LastModified = function(lastModified) {
    if (!lastModified) {
        return { lastChanged: '', age: '' };
    }
    
    const date = new Date(lastModified);
    if (!isNaN(date)) {
        // Calculate age in days
        const today = new Date();
        const age = Math.floor((today - date) / (1000 * 60 * 60 * 24)).toString();
        const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
        
        return {
            lastChanged: liveUrl ? `<a href="${liveUrl}" target="_blank">${formattedDate}</a>` : `${formattedDate}: No`,
            age: age
        };
    }
    
    console.log('Invalid date, returning empty values');
    return { lastChanged: '', age: '' };
}

processField_LastModifiedBy = function(lastModifiedBy) {
    return lastModifiedBy || '';
}


