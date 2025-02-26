document.addEventListener('DOMContentLoaded', function () {
    // MCB Entry Page Logic
    const productFamilySelect = document.getElementById('product-family');
    const breakingCapacitySelect = document.getElementById('breaking-capacity');
    const polaritySelect = document.getElementById('polarity');
    const ratingSelect = document.getElementById('rating');
    const quantityInput = document.getElementById('quantity');
    const locationInput = document.getElementById('location');
    const entryTableBody = document.getElementById('entry-table')?.querySelector('tbody');
    const previewInventoryFileButton = document.getElementById('preview-inventory-file');
    const generateInventoryFileButton = document.getElementById('generate-inventory-file');
    const addEntryButton = document.getElementById('add-entry'); // Get the correct add button
    let allEntries = [];
    let lastEntry = null;

    const breakingCapacityData = {
        '5SL1': ['3KA'],
        '5SJ': ['6KA'],
        'Mexico': ['4.5/6KA'],
        '5SL6': ['7.5KA'],
        '5SL4': ['10KA'],
        'ELSA-2': ['10kA/15kA/20kA'],
        'ELSA-1': ['6KA'],
        '5SL7': ['15KA'],
        'K': ['15KA'],
        'MB': ['7.5KA/10KA'],
        'MB Europe': ['7.5KA/10KA'],
        '5SL7-K': ['15KA']
    };

    productFamilySelect?.addEventListener('change', updateBreakingCapacityOptions);
    addEntryButton?.addEventListener('click', addEntry);
    previewInventoryFileButton?.addEventListener('click', previewInventoryFile);
    generateInventoryFileButton?.addEventListener('click', generateInventoryFileToGitHub); // Changed to generateInventoryFileToGitHub

    function updateBreakingCapacityOptions() {
        const selectedFamily = productFamilySelect.value;
        const capacities = breakingCapacityData[selectedFamily] || [];
        breakingCapacitySelect.innerHTML = '';
        capacities.forEach(capacity => {
            const option = document.createElement('option');
            option.value = capacity;
            option.textContent = capacity;
            breakingCapacitySelect.appendChild(option);
        });
    }

    function addEntry() {
        const polarity = polaritySelect.value;
        const rating = ratingSelect.value;
        const productFamily = productFamilySelect.value;
        const breakingCapacity = breakingCapacitySelect.value;
        const quantity = quantityInput.value;
        const location = locationInput.value;

        if (!polarity || !rating || !productFamily || !breakingCapacity || !quantity || !location) {
            alert('Please fill all fields before adding entry.');
            return;
        }

        const entry = { polarity, rating, productFamily, breakingCapacity, quantity, location };
        allEntries.push(entry);
        lastEntry = entry;
        displayMcbEntries();  // Call the display function to update the table
        // Reset form fields
        polaritySelect.value = '';
        ratingSelect.value = '';
        productFamilySelect.value = '';
        updateBreakingCapacityOptions();
        quantityInput.value = '';
        locationInput.value = '';
    }

     // Function to display all MCB entries
    function displayMcbEntries() {
        entryTableBody.innerHTML = ''; // Clear the table body
         if (lastEntry) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${lastEntry.polarity}</td>
                <td>${lastEntry.rating}</td>
                <td>${lastEntry.productFamily}</td>
                <td>${lastEntry.breakingCapacity}</td>
                <td>${lastEntry.quantity}</td>
                <td>${lastEntry.location}</td>
                 <td><button class="edit-entry">Edit</button></td>
                `;
            entryTableBody.appendChild(row);
        }
    }

      // Edit entry functionality (add this event listener)
    entryTableBody?.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-entry')) {
            editEntry();
        }
    });

    function editEntry() {
        if (lastEntry) {
            // Populate the form with the last entry's data
            polaritySelect.value = lastEntry.polarity;
            ratingSelect.value = lastEntry.rating;
            productFamilySelect.value = lastEntry.productFamily;

            // Update breaking capacity options based on product family
            updateBreakingCapacityOptions();
            breakingCapacitySelect.value = lastEntry.breakingCapacity;

            quantityInput.value = lastEntry.quantity;
            locationInput.value = lastEntry.location;

            // Remove the last entry from the array and clear the displayed entry
            allEntries = allEntries.filter(entry => entry !== lastEntry);
            lastEntry = null;
            displayMcbEntries();
        }
    }

    function previewInventoryFile() {
        if (allEntries.length === 0) {
            alert('No entries to preview.');
            return;
        }
        generateInventoryFileButton.style.display = 'inline-block';
    }
    // Function to generate and save the file to GitHub
    function generateInventoryFileToGitHub() {
        if (allEntries.length === 0) {
            alert('No entries to generate.');
            return;
        }

        const fileName = prompt("Please enter the file name:", "inventory");
        if (fileName === null || fileName === "") {
            return;
        }

        const csvHeader = "Polarity,Rating,Product Family,Breaking Capacity,Quantity,Location";
        const csvRows = allEntries.map(entry => `${entry.polarity},${entry.rating},${entry.productFamily},${entry.breakingCapacity},${entry.quantity},${entry.location}`);
        const csvContent = `data:text/csv;charset=utf-8,${csvHeader}\n${csvRows.join('\n')}`;
        const contentEncoded = btoa(csvContent);
        const githubToken = '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'; // Replace with your actual token!
        const owner = 'krushnaharde123'; // Your GitHub username
        const repo = 'Inventory-entry'; // Your repository name
        const branch = 'main';
        const filePath = `physical-counting-files/mcb/${fileName}.csv`;
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

        fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add ${fileName}.csv`,
                content: contentEncoded,
                branch: branch
            })
        })
        .then(response => {
            if (!response.ok) {
                console.error('GitHub API Error:', response.status, response.statusText); // Log the status and text
                return response.json().then(errorData => { // Try to parse the error JSON
                    console.error('GitHub API Error Details:', errorData); // Log the error details
                    throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('File saved successfully:', data);
            alert('MCB entries saved to GitHub successfully!');
            // Refresh the file list on the Physical Counting page
            listFiles('mcb', document.querySelector('#mcb-tab tbody'));
        })
        .catch(error => {
            console.error('Error saving file:', error);
            alert('Error saving file to GitHub. See console for details.');
        });
    }

    // Carton Entry Page Logic
    const cartonMasterFileInput = document.getElementById('carton-master-file');
    const materialDescriptionInput = document.getElementById('material-description');
    const materialList = document.getElementById('material-list');
    const materialNumberInput = document.getElementById('material-number');
    const cartonQuantityInput = document.getElementById('carton-quantity');
    const cartonLocationInput = document.getElementById('carton-location');
    const cartonEntryTableBody = document.getElementById('carton-entry-table')?.querySelector('tbody');
    const previewCartonFileButton = document.getElementById('preview-carton-file');
    const saveCartonFileButton = document.getElementById('save-cartonFileButton');
    const addCartonEntryButton = document.getElementById('add-carton-entry');
    let allCartonEntries = [];
    let materialData = []; // Store the material data

    // Event Listeners
    cartonMasterFileInput?.addEventListener('change', handleFileUpload);
    materialDescriptionInput?.addEventListener('input', handleMaterialDescriptionInput);
    addCartonEntryButton?.addEventListener('click', addCartonEntry);
    previewCartonFileButton?.addEventListener('click', previewCartonFile);
    saveCartonFileButton?.addEventListener('click', saveCartonFile);

    // Function to handle file upload
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                materialData = XLSX.utils.sheet_to_json(worksheet);
                populateMaterialList(); // Call populateMaterialList *after* materialData is loaded
            };
            reader.readAsArrayBuffer(file);
        }
    }

    // Function to populate the material list (datalist)
    function populateMaterialList() {
        materialList.innerHTML = ''; // Clear existing options
        materialData.forEach(item => {
            const option = document.createElement('option');
            option.value = item['Material Description']; // Use the correct column name
            materialList.appendChild(option);
        });
    }

    // Function to handle material description input
    function handleMaterialDescriptionInput() {
        const description = materialDescriptionInput.value;
        const material = materialData.find(item => item['Material Description'] === description); // Use the correct column name

        if (material) {
            materialNumberInput.value = material['Material Number']; // Use the correct column name
        } else {
            materialNumberInput.value = '';
        }
    }

    // Function to add a carton entry
    function addCartonEntry() {
        const description = materialDescriptionInput.value;
        const number = materialNumberInput.value;
        const quantity = cartonQuantityInput.value;
        const location = cartonLocationInput.value;

        if (!description || !number || !quantity || !location) {
            alert('Please fill all fields before adding entry.');
            return;
        }

        const entry = { description, number, quantity, location };
        allCartonEntries.push(entry);
        // Display all entries, not just the last one
        displayCartonEntries();

        // Clear the input fields
        materialDescriptionInput.value = '';
        materialNumberInput.value = '';
        cartonQuantityInput.value = '';
        cartonLocationInput.value = '';
    }

    // Function to display all carton entries
    function displayCartonEntries() {
        cartonEntryTableBody.innerHTML = ''; // Clear the table body
        allCartonEntries.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.description}</td>
                <td>${entry.number}</td>
                <td>${entry.quantity}</td>
                <td>${entry.location}</td>
            `;
            cartonEntryTableBody.appendChild(row);
        });
    }


    // Function to preview the carton file
    function previewCartonFile() {
        if (allCartonEntries.length === 0) {
            alert('No entries to preview.');
            return;
        }
        displayCartonEntries(); // Display all entries
        saveCartonFileButton.style.display = 'inline-block';
    }

    // Function to save the carton file
    function saveCartonFile() {
         if (allCartonEntries.length === 0) {
            alert('No entries to generate.');
            return;
        }
        // Ask for the file name
        const fileName = prompt("Please enter the file name:", "carton");
        if (fileName === null || fileName === "") {
            return;
        }

        const csvHeader = "Material Description,Material Number,Quantity,Location";
        const csvRows = allCartonEntries.map(entry => `${entry.description},${entry.number},${entry.quantity},${entry.location}`);
        const csvContent = `data:text/csv;charset=utf-8,${csvHeader}\n${csvRows.join('\n')}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${fileName}.csv`); // Use the user-provided file name
        document.body.appendChild(link);
        link.click();
    }

     // Initialize breaking capacity options on page load for MCB Entry
     if (productFamilySelect) {
        updateBreakingCapacityOptions();
    }

    // Call listFiles() on page load - Physical Counting
    const mcbTab = document.getElementById('mcb-tab');
    const cartonTab = document.getElementById('carton-tab');

    if (mcbTab) {
        const mcbTableBody = mcbTab.querySelector('tbody');
        listFiles('mcb', mcbTableBody);
    }

    if (cartonTab) {
        const cartonTableBody = cartonTab.querySelector('tbody');
        listFiles('carton', cartonTableBody);
    }
     // Function to list files from GitHub repository
    function listFiles(type, tableBody) {
         const githubToken = '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'; // Replace with your actual token!
        const owner = 'krushnaharde123'; // Your GitHub username
        const repo = 'Inventory-entry'; // Your repository name
        const directoryPath = `physical-counting-files/${type}`; // Directory to list files from
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${directoryPath}`;

        document.getElementById('loading-indicator').style.display = 'block'; // Show loading indicator

        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                 console.error('GitHub API Error:', response.status, response.statusText); // Log the status and text
                return response.json().then(errorData => { // Try to parse the error JSON
                    console.error('GitHub API Error Details:', errorData); // Log the error details
                    throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
                });
            }
            return response.json();
        })
        .then(files => {
            displayFiles(files, type, tableBody);
        })
        .catch(error => {
            console.error('Error listing files:', error);
            alert('Error listing files. See console for details.');
        })
        .finally(() => {
            document.getElementById('loading-indicator').style.display = 'none'; // Hide loading indicator
        });
    }

    // Function to display files in the table
    function displayFiles(files, type, tableBody) {
       tableBody.innerHTML = ''; // Clear previous entries
        if (!files || files.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="2">No files found.</td></tr>';
            return;
        }
        files.forEach((file, index) => {
            const row = document.createElement('tr');
            row.classList.add('bold');
            row.innerHTML = `
                <td>${file.name}</td>
                <td>
                    <button class="download-file" data-name="${file.name}" data-type="${type}">Download</button>
                    <button class="delete-file" data-name="${file.name}" data-type="${type}">Delete</button>
                </td>`;
            tableBody.appendChild(row);
        });
    }

    // Function to download a file
    function downloadFile(fileName, type) {
         const githubToken = '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'; // Replace with your actual token!
        const owner = 'krushnaharde123'; // Your GitHub username
        const repo = 'Inventory-entry'; // Your repository name
        const filePath = `physical-counting-files/${type}/${fileName}`; // Path to the file
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                 console.error('GitHub API Error:', response.status, response.statusText); // Log the status and text
                return response.json().then(errorData => { // Try to parse the error JSON
                    console.error('GitHub API Error Details:', errorData); // Log the error details
                    throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
                });
            }
            return response.json();
        })
        .then(fileData => {
            // Decode the content from base64
            const decodedContent = atob(fileData.content);

            // Create a download link
            const downloadLink = document.createElement('a');
            downloadLink.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(decodedContent));
            downloadLink.setAttribute('download', fileName);
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        })
        .catch(error => {
            console.error('Error downloading file:', error);
            alert('Error downloading file. See console for details.');
        });
    }

    // Function to delete a file
    function deleteFile(fileName, type) {
         const githubToken = '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'; // Replace with your actual token!
        const owner = 'krushnaharde123'; // Your GitHub username
        const repo = 'Inventory-entry'; // Your repository name
        const filePath = `physical-counting-files/${type}/${fileName}`; // Path to the file
         // Get the file SHA for deletion
        getFileSha(fileName, type)
            .then(sha => {
                if (!sha) {
                    alert('Could not find file SHA for deletion.');
                    return;
                }
                const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
                fetch(apiUrl, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `token ${githubToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Delete ${fileName}`,
                        sha: sha,
                        branch: 'main'
                    })
                })
                .then(response => {
                    if (!response.ok) {
                         console.error('GitHub API Error:', response.status, response.statusText); // Log the status and text
                        return response.json().then(errorData => { // Try to parse the error JSON
                            console.error('GitHub API Error Details:', errorData); // Log the error details
                            throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
                        });
                    }
                    alert('File deleted successfully!');
                    // After deleting, refresh the file list
                    const tableBody = (type === 'mcb') ? document.querySelector('#mcb-tab tbody') : document.querySelector('#carton-tab tbody');
                    listFiles(type, tableBody); // Refresh the list
                })
                .catch(error => {
                    console.error('Error deleting file:', error);
                    alert('Error deleting file. See console for details.');
                });
            });
    }
    // Helper function to get the file SHA
    function getFileSha(fileName, type) {
         const githubToken = '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'; // Replace with your actual token!
        const owner = 'krushnaharde123'; // Your GitHub username
        const repo = 'Inventory-entry'; // Your repository name
        const filePath = `physical-counting-files/${type}/${fileName}`; // Path to the file
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

        return fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                 console.error('GitHub API Error:', response.status, response.statusText); // Log the status and text
                return response.json().then(errorData => { // Try to parse the error JSON
                    console.error('GitHub API Error Details:', errorData); // Log the error details
                    throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
                });
            }
            return response.json();
        })
        .then(fileData => {
            return fileData.sha;
        })
        .catch(error => {
            console.error('Error getting file SHA:', error);
            return null;
        });
    }

    // Event listener for download and delete buttons - Physical Counting
    document.querySelector('.content')?.addEventListener('click', function (event) {
        if (event.target.classList.contains('download-file')) {
            const fileName = event.target.dataset.name;
            const type = event.target.dataset.type;
            downloadFile(fileName, type);
        } else if (event.target.classList.contains('delete-file')) {
            const fileName = event.target.dataset.name;
            const type = event.target.dataset.type;
            deleteFile(fileName, type);
        }
    });

    // Function to save MCB entries to GitHub (called from Physical Counting page)
     window.saveMcbEntries = function () {
        if (allEntries.length === 0) {
            alert('No MCB entries to save.');
            return;
        }

        const fileName = prompt("Please enter the file name:", "mcb_inventory");
        if (fileName === null || fileName === "") {
            return;
        }

        const csvHeader = "Polarity,Rating,Product Family,Breaking Capacity,Quantity,Location";
        const csvRows = allEntries.map(entry => `${entry.polarity},${entry.rating},${entry.productFamily},${entry.breakingCapacity},${entry.quantity},${entry.location}`);
        const csvContent = `data:text/csv;charset=utf-8,${csvHeader}\n${csvRows.join('\n')}`;
        const contentEncoded = btoa(csvContent);
         const githubToken = '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'; // Replace with your actual token!
        const owner = 'krushnaharde123'; // Your GitHub username
        const repo = 'Inventory-entry'; // Your repository name
        const branch = 'main';
        const filePath = `physical-counting-files/mcb/${fileName}.csv`;
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

        fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add ${fileName}.csv`,
                content: contentEncoded,
                branch: branch
            })
        })
        .then(response => {
            if (!response.ok) {
                 console.error('GitHub API Error:', response.status, response.statusText); // Log the status and text
                return response.json().then(errorData => { // Try to parse the error JSON
                    console.error('GitHub API Error Details:', errorData); // Log the error details
                    throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('File saved successfully:', data);
            alert('MCB entries saved successfully!');
            // Refresh the file list after saving
            const mcbTableBody = document.querySelector('#mcb-tab tbody');
            listFiles('mcb', mcbTableBody);
        })
        .catch(error => {
            console.error('Error saving file:', error);
            alert('Error saving file. See console for details.');
        });
    };
     // Function to save Carton entries to GitHub (called from Physical Counting page)
     window.saveCartonEntries = function () {
        if (allCartonEntries.length === 0) {
            alert('No Carton entries to save.');
            return;
        }

        const fileName = prompt("Please enter the file name:", "carton_inventory");
        if (fileName === null || fileName === "") {
            return;
        }

        const csvHeader = "Material Description,Material Number,Quantity,Location";
        const csvRows = allCartonEntries.map(entry => `${entry.description},${entry.number},${entry.quantity},${entry.location}`);
        const csvContent = `data:text/csv;charset=utf-8,${csvHeader}\n${csvRows.join('\n')}`;
        const contentEncoded = btoa(csvContent);
         const githubToken = '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'; // Replace with your actual token!
        const owner = 'krushnaharde123'; // Your GitHub username
        const repo = 'Inventory-entry'; // Your repository name
        const branch = 'main';
        const filePath = `physical-counting-files/carton/${fileName}.csv`;
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

        fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add ${fileName}.csv`,
                content: contentEncoded,
                branch: branch
            })
        })
        .then(response => {
            if (!response.ok) {
                 console.error('GitHub API Error:', response.status, response.statusText); // Log the status and text
                return response.json().then(errorData => { // Try to parse the error JSON
                    console.error('GitHub API Error Details:', errorData); // Log the error details
                    throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('File saved successfully:', data);
            alert('Carton entries saved successfully!');
            // Refresh the file list after saving
            const cartonTableBody = document.querySelector('#carton-tab tbody');
            listFiles('carton', cartonTableBody);
        })
        .catch(error => {
            console.error('Error saving file:', error);
            alert('Error saving file. See console for details.');
        });
    };
});
