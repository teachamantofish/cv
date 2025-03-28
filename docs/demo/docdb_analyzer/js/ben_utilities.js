function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "block";
        if (modalId === 'chartModal') {
            initChartBar(docCounts);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

function setupModals() {
    // Get all modals
    const modals = document.querySelectorAll('.modal');
    
    // Add click handlers to each modal's close button
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = function() {
                closeModal(modal.id);
            }
        }
    });
    
    // Single window click handler for all modals
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
}

// Initialize modals when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load modal content if it's in a separate file
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        fetch('modals.html')
            .then(response => response.text())
            .then(html => {
                modalContainer.innerHTML = html;
                setupModals();
            })
            .catch(error => console.error('Error loading modal content:', error));
    } else {
        // If modals are already in the page
        setupModals();
    }
});

function getSelectedRowsData() {
    const selectedData = [];
    $('.row-checkbox:checked').each(function() {
        // Get the row data from the parent tr
        const row = $(this).closest('tr');
        const rowData = $('#example').DataTable().row(row).data();
        selectedData.push(rowData);
    });
    console.log('Selected rows:', selectedData);
    return selectedData;
}

function openAuthorTabs() {
    const urls = [];
    $('.row-checkbox:checked').each(function() {
        const row = $(this).closest('tr');
        const rowData = $('#example').DataTable().row(row).data();
        const temp = document.createElement('div');
        temp.innerHTML = rowData[2];
        const link = temp.querySelector('a');
        if (link) {
            urls.push(link.href);
        }
    });

    if (urls.length === 0) {
        alert("No valid author links found in selected rows.");
        return;
    }

    // Try to open first window
    const firstWindow = window.open(urls[0], '_blank');
    if (!firstWindow) {
        alert("Please disable popup blocking to open multiple pages. Selected pages: " + urls.length);
    }
    
    // Try to open rest of windows
    urls.slice(1).forEach(url => {
        window.open(url, '_blank');
    });
}

function openPreviewTabs() {
    const previewUrls = [];
    $('.row-checkbox:checked').each(function() {
        const row = $(this).closest('tr');
        const linksCell = $(row).find('td:eq(3)').html(); // Links column
        if (linksCell && linksCell.includes('(P)')) {
            // Extract the preview URL from the (P) link
            const match = linksCell.match(/href="([^"]+)"\s+target="_blank">\(P\)/);
            if (match && match[1]) {
                previewUrls.push(match[1]);
            }
        }
    });

    if (previewUrls.length === 0) {
        alert("No preview links found in selected rows");
        return;
    }

    // Try to open first window
    const firstWindow = window.open(previewUrls[0], '_blank');
    if (!firstWindow) {
        alert("Please disable popup blocking to open multiple pages. Selected pages: " + previewUrls.length);
        return;
    }
    
    // Open rest of windows
    previewUrls.slice(1).forEach(url => window.open(url, '_blank'));
}

function openLiveTabs() {
    const urls = [];
    $('.row-checkbox:checked').each(function() {
        const row = $(this).closest('tr');
        const rowData = $('#example').DataTable().row(row).data();
        const temp = document.createElement('div');
        temp.innerHTML = rowData[3];
        const link = temp.querySelector('a');
        if (link) {
            urls.push(link.href);
        }
    });

    if (urls.length === 0) {
        alert("No valid live links found in selected rows.");
        return;
    }

    // Try to open first window
    const firstWindow = window.open(urls[0], '_blank');
    if (!firstWindow) {
        alert("Please disable popup blocking to open multiple pages. Selected pages: " + urls.length);
    }
    
    // Try to open rest of windows
    urls.slice(1).forEach(url => {
        window.open(url, '_blank');
    });
}

function sendForReview() {
    const selectedData = [];
    
    $('.row-checkbox:checked').each(function() {
        const row = $(this).closest('tr');
        const linksCell = $(row).find('td:eq(3)').html(); // Links column
        if (linksCell) {
            const temp = document.createElement('div');
            temp.innerHTML = linksCell;
            const links = temp.querySelectorAll('a');
            const rowLinks = [];
            
            // Get both Auth and Preview links if they exist
            links.forEach(link => {
                rowLinks.push(link.href);
            });
            
            if (rowLinks.length > 0) {
                selectedData.push(rowLinks.join('\r\n'));
            }
        }
    });

    if (selectedData.length === 0) {
        alert("No valid links found in selected rows.");
        return;
    }

    const body = `Hi,\r\n\r\nThese files are ready for review. If a file has been published in Preview mode, I include both the AEM authoring link as well as the preview link. Preview mode shows the associated TOC (if any): \r\n\r\n${selectedData.join('\r\n\r\n')}`;
    window.location.href = `mailto:somebody@adobe.com?subject=Please review these files&body=${encodeURIComponent(body)}`;
}

function sendToWebProd() {
    const selectedData = [];
    
    $('.row-checkbox:checked').each(function() {
        const row = $(this).closest('tr');
        const dataIndex = $('#example').DataTable().row(row).index();
        const baseurl = originalData[dataIndex][0];
        if (baseurl) {
            selectedData.push(`${baseurl}.html`);
        }
    });

    if (selectedData.length === 0) {
        alert("No valid URLs found in selected rows.");
        return;
    }

    const emailBody = selectedData.join('\n');
    window.location.href = `mailto:cpuri@adobe.com?subject=Please help with these files&body=Hi,%0D%0A%0D%0AWe need to do the following with these files: Delete|Move|Other %0D%0A %0D%0A${encodeURIComponent(emailBody)}`;
}

function sendLiveLinks() {
    const selectedData = [];
    
    $('.row-checkbox:checked').each(function() {
        const row = $(this).closest('tr');
        const dataIndex = $('#example').DataTable().row(row).index();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modifiedData[dataIndex][3];
        const link = tempDiv.querySelector('a');
        if (link) {
            selectedData.push(link.href);
        }
    });

    if (selectedData.length === 0) {
        alert("No valid live links found in selected rows.");
        return;
    }

    const emailBody = selectedData.join('\n');
    window.location.href = `mailto:somebody@adobe.com?subject=These files are now live&body=Hi,%0D%0A%0D%0AHere's a list of live files: %0D%0A %0D%0A${encodeURIComponent(emailBody)}`;
}

function exportGoUrlBatch() {
    const selectedData = [];
    
    $('.row-checkbox:checked').each(function() {
        const row = $(this).closest('tr');
        const dataIndex = $('#example').DataTable().row(row).index();
        const filename = modifiedData[dataIndex][1].replace('.html', '');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modifiedData[dataIndex][3];
        const link = tempDiv.querySelector('a');
        if (link) {
            selectedData.push(`/go/${filename}, ${link.href}, optional comment field which the go url tool ignores`);
        }
    });

    // Create CSV content
    const csvContent = "GO URL,Target URL,Comment\n" + selectedData.join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'go_url_batchfile_export.csv';
    
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function exportRedirectBatch() {
    const selectedData = [];
    
    $('.row-checkbox:checked').each(function() {
        const row = $(this).closest('tr');
        const dataIndex = $('#example').DataTable().row(row).index();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modifiedData[dataIndex][3];
        const link = tempDiv.querySelector('a');
        if (link) {
            selectedData.push(`${link.href}, insert new url here`);
        }
    });
    
    if (selectedData.length === 0) {
        alert("No valid live links found in selected rows.");
        return;
    }

    // Create CSV content
    const csvContent = "Old URL,New URL\n" + selectedData.join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'redirect_batchfile_export.csv';
    
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function exportToc() {
    const selectedData = [];
    
    $('.row-checkbox:checked').each(function() {
        const row = $(this).closest('tr');
        const dataIndex = $('#example').DataTable().row(row).index();
        const title = originalData[dataIndex][1];
        const baseurl = originalData[dataIndex][0];
        selectedData.push(`${title},${baseurl}`);
    });

    if (selectedData.length === 0) {
        alert("No rows selected.");
        return;
    }

    // Create and download CSV
    const csvContent = selectedData.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toc_export.csv';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function toggleByClass(className) {
    const element = document.querySelector('.' + className);
    toggleVisibility(element);
}

