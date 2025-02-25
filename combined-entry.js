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
    const addEntryButton = document.getElementById('add-entry');
    let allEntries = [];

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
    generateInventoryFileButton?.addEventListener('click', generateInventoryFile);

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
    }

    function previewInventoryFile() {
        if (allEntries.length === 0) {
            alert('No entries to preview.');
            return;
        }
        generateInventoryFileButton.style.display = 'inline-block';
    }

    function generateInventoryFile() {
        if (allEntries.length === 0) {
            alert('No entries to generate.');
            return;
        }

        // Ask for the file name
        const fileName = prompt("Please enter the file name:", "inventory");
        if (fileName === null || fileName === "") {
            // User cancelled or entered an empty name
            return;
        }

        const csvHeader = "Polarity,Rating,Product Family,Breaking Capacity,Quantity,Location";
        const csvRows = allEntries.map(entry => `${entry.polarity},${entry.rating},${entry.productFamily},${entry.breakingCapacity},${entry.quantity},${entry.location}`);
        const csvContent = `data:text/csv;charset=utf-8,${csvHeader}\n${csvRows.join('\n')}`;

        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.setAttribute('href', encodeURI(csvContent));
        downloadLink.setAttribute('download', `${fileName}.csv`);
        downloadLink.style.display = 'none'; // Hide the link

        // Add the link to the document
        document.body.appendChild(downloadLink);

        // Trigger the download
        downloadLink.click();

        // Remove the link from the document
        document.body.removeChild(downloadLink);


        // **WARNING: SECURITY RISK - DO NOT USE IN PRODUCTION**
        const githubToken = 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; // Replace with your actual token!
        const owner = 'krushnaharde123'; // Your GitHub username
        const repo = 'Inventory-entry'; // Your repository name
        const branch = 'main'; // Or your desired branch
        const filePath = `physical-counting-files/mcb/${fileName}.csv`; // Customize path

        // Encode the content
        const contentEncoded = btoa(csvContent);

        // GitHub API endpoint
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
                branch: branch,
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('File saved successfully:', data);
            alert('File saved successfully!');
            listFiles(); // Refresh the file list after saving
        })
        .catch(error => {
            console.error('Error saving file:', error);
            alert('Error saving file. See console for details.');
        });
    }

    // Function to list files from GitHub repository
    function listFiles() {
        const githubToken = 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; // Replace with your actual token!
        const owner = 'krushnaharde123'; // Your GitHub username
        const repo = 'Inventory-entry'; // Your repository name
        const directoryPath = 'physical-counting-files/mcb'; // Directory to list files from
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
                throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
            }
            return response.json();
        })
        .then(files => {
            displayFiles(files);
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
    function displayFiles(files) {
        entryTableBody.innerHTML = ''; // Clear previous entries
        if (files.length === 0) {
            entryTableBody.innerHTML = '<tr><td colspan="2">No files found.</td></tr>';
            return;
        }
        files.forEach((file, index) => {
            const row = document.createElement('tr');
            row.classList.add('bold');
            row.innerHTML = `
                <td>${file.name}</td>
                <td>
                    <button class="download-file" data-name="${file.name}">Download</button>
                    <button class="delete-file" data-name="${file.name}">Delete</button>
                </td>`;
            entryTableBody.appendChild(row);
        });
    }

    // Function to download a file
    function downloadFile(fileName) {
        const githubToken = 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; // Replace with your actual token!
        const owner = 'krushnaharde123'; // Your GitHub username
        const repo = 'Inventory-entry'; // Your repository name
        const filePath = `physical-counting-files/mcb/${fileName}`; // Path to the file
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
                throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
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
    function deleteFile(fileName) {
        if (confirm(`Are you sure you want to delete ${fileName}?`)) {
             const githubToken = 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; // Replace with your actual token!
            const owner = 'krushnaharde123'; // Your GitHub username
            const repo = 'Inventory-entry'; // Your repository name
            const filePath = `physical-counting-files/mcb/${fileName}`; // Path to the file
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

            fetch(apiUrl, {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Delete ${fileName}`,
                    sha: files.find(file => file.name === fileName).sha,  // SHA is required for delete
                    branch: 'main'
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.status} - ${response.statusText}`);
                }
                alert('File deleted successfully!');
                listFiles(); // Refresh the file list after deleting
            })
            .catch(error => {
                console.error('Error deleting file:', error);
                alert('Error deleting file. See console for details.');
            });
        }
    }

    // Event listener for download and delete buttons
    entryTableBody?.addEventListener('click', function (event) {
        if (event.target.classList.contains('download-file')) {
            const fileName = event.target.dataset.name;
            downloadFile(fileName);
        } else if (event.target.classList.contains('delete-file')) {
            const fileName = event.target.dataset.name;
            deleteFile(fileName);
        }
    });

    // Call listFiles() on page load
    listFiles();

    // Carton Entry Page Logic
    const cartonMasterFileInput = document.getElementById('carton-master-file');
    const materialDescriptionInput = document.getElementById('material-description');
    const materialList = document.getElementById('material-list');
    const materialNumberInput = document.getElementById('material-number');
    const cartonQuantityInput = document.getElementById('carton-quantity');
    const cartonLocationInput = document.getElementById('carton-location');
    const cartonEntryTableBody = document.getElementById('carton-entry-table')?.querySelector('tbody');
    const previewCartonFileButton = document.getElementById('preview-carton-file');
    const saveCartonFileButton = document.getElementById('save-carton-file');
    const addCartonEntryButton = document.getElementById('add-carton-entry');
    let allCartonEntries = [];
    let lastCartonEntry = null;
    let materialData = [];

    cartonMasterFileInput?.addEventListener('change', handleFileUpload);
    materialDescriptionInput?.addEventListener('input', handleMaterialDescriptionInput);
    addCartonEntryButton?.addEventListener('click', addCartonEntry);
    previewCartonFileButton?.addEventListener('click', previewCartonFile);
    saveCartonFileButton?.addEventListener('click', saveCartonFile);

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
                populateMaterialList(materialData);
            };
            reader.readAsArrayBuffer(file);
        }
    }

    function populateMaterialList(data) {
        materialList.innerHTML = '';
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item['Material Description']; // Use the correct column name
            materialList.appendChild(option);
        });
    }

    function handleMaterialDescriptionInput() {
        const description = materialDescriptionInput.value;
        const material = materialData.find(item => item['Material Description'] === description); // Use the correct column name
        if (material) {
            materialNumberInput.value = material['Material Number']; // Use the correct column name
        } else {
            materialNumberInput.value = '';
        }
    }

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
        lastCartonEntry = entry;
        displayLastCartonEntry();

        materialDescriptionInput.value = '';
        materialNumberInput.value = '';
        cartonQuantityInput.value = '';
        cartonLocationInput.value = '';
    }

   function displayLastCartonEntry() {
        cartonEntryTableBody.innerHTML = '';
         if (lastCartonEntry) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${lastCartonEntry.description}</td>
                <td>${lastCartonEntry.number}</td>
                <td>${lastCartonEntry.quantity}</td>
                <td>${lastCartonEntry.location}</td>
                <td><button onclick="removeCartonEntry()">Remove</button></td>
            `;
            cartonEntryTableBody.appendChild(row);
        }
    }

    function removeCartonEntry() {
        if (lastCartonEntry) {
            allCartonEntries = allCartonEntries.filter(entry => entry !== lastCartonEntry);
            lastCartonEntry = null;
            displayLastCartonEntry();
        }
    }


    function previewCartonFile() {
        if (allCartonEntries.length === 0) {
            alert('No entries to preview.');
            return;
        }
        displayLastCartonEntry();
        saveCartonFileButton.style.display = 'inline-block';
    }

    function saveCartonFile() {
         if (allCartonEntries.length === 0) {
            alert('No entries to generate.');
            return;
        }
        // Ask for the file name
        const fileName = prompt("Please enter the file name:", "carton");
        if (fileName === null || fileName === "") {
            // User cancelled or entered an empty name
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
});
