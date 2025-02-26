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
    generateInventoryFileButton?.addEventListener('click', generateInventoryFileLocal);

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
        displayMcbEntries(); // Call display function to update the table with all entries
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

        allEntries.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.polarity}</td>
                <td>${entry.rating}</td>
                <td>${entry.productFamily}</td>
                <td>${entry.breakingCapacity}</td>
                <td>${entry.quantity}</td>
                <td>${entry.location}</td>
                <td><button class="edit-entry" data-index="${index}">Edit</button></td>
            `;
            entryTableBody.appendChild(row);
        });
    }

    // Edit entry functionality
    entryTableBody?.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-entry')) {
            const index = event.target.dataset.index;
            editEntry(index);
        }
    });

    function editEntry(index) {
        const entry = allEntries[index];
        if (entry) {
            // Populate the form with the entry's data
            polaritySelect.value = entry.polarity;
            ratingSelect.value = entry.rating;
            productFamilySelect.value = entry.productFamily;
            updateBreakingCapacityOptions();
            breakingCapacitySelect.value = entry.breakingCapacity;
            quantityInput.value = entry.quantity;
            locationInput.value = entry.location;

            // Remove the entry from the array
            allEntries.splice(index, 1);
            displayMcbEntries(); // Refresh the table
        }
    }

    function previewInventoryFile() {
        if (allEntries.length === 0) {
            alert('No entries to preview.');
            return;
        }
        generateInventoryFileButton.style.display = 'inline-block';
    }

    // Save all entries to a single file in localStorage.
    function generateInventoryFileLocal() {
        if (allEntries.length === 0) {
            alert('No entries to generate.');
            return;
        }

        const fileName = prompt("Please enter the file name:", "inventory");
        if (fileName === null || fileName === "") {
            return;
        }

        const csvHeader = "Polarity,Rating,Product Family,Breaking Capacity,Quantity,Location";
        const csvRows = allEntries.map(entry => `${entry.polarity},${entry.rating},${entry.productFamily},${entry.breakingCapacity},${entry.quantity},${entry.location}`).join('\n');
        const csvContent = `${csvHeader}\n${csvRows}`;

        // Save file content in localStorage under "mcbFiles".
        let mcbFiles = JSON.parse(localStorage.getItem('mcbFiles') || '[]');
        mcbFiles.push({ fileName: `${fileName}.csv`, content: csvContent, createdAt: new Date().toISOString() });
        localStorage.setItem('mcbFiles', JSON.stringify(mcbFiles));

        alert('MCB entries saved to local storage successfully!');
        listFiles('mcb', document.querySelector('#mcb-tab tbody'));
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
    const saveCartonFileButton = document.getElementById('save-carton-file');
    const addCartonEntryButton = document.getElementById('add-carton-entry');
    let allCartonEntries = [];
    let materialData = [];

    cartonMasterFileInput?.addEventListener('change', handleFileUpload);
    materialDescriptionInput?.addEventListener('input', handleMaterialDescriptionInput);
    addCartonEntryButton?.addEventListener('click', addCartonEntry);
    previewCartonFileButton?.addEventListener('click', previewCartonFile);
    saveCartonFileButton?.addEventListener('click', saveCartonFileLocal);

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
                populateMaterialList();
            };
            reader.readAsArrayBuffer(file);
        }
    }

    function populateMaterialList() {
        materialList.innerHTML = '';
        materialData.forEach(item => {
            const option = document.createElement('option');
            option.value = item['Material Description'];
            materialList.appendChild(option);
        });
    }

    function handleMaterialDescriptionInput() {
        const description = materialDescriptionInput.value;
        const material = materialData.find(item => item['Material Description'] === description);
        if (material) {
            materialNumberInput.value = material['Material Number'];
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
        displayCartonEntries();

        materialDescriptionInput.value = '';
        materialNumberInput.value = '';
        cartonQuantityInput.value = '';
        cartonLocationInput.value = '';
    }

    function displayCartonEntries() {
        cartonEntryTableBody.innerHTML = '';
        allCartonEntries.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.description}</td>
                <td>${entry.number}</td>
                <td>${entry.quantity}</td>
                <td>${entry.location}</td>
                <td><button class="edit-carton-entry" data-index="${index}">Edit</button></td>
            `;
            cartonEntryTableBody.appendChild(row);
        });
    }

    // Edit carton entry functionality
    cartonEntryTableBody?.addEventListener('click', function(event) {
        if (event.target.classList.contains('edit-carton-entry')) {
            const index = event.target.dataset.index;
            editCartonEntry(index);
        }
    });

    function editCartonEntry(index) {
        const entry = allCartonEntries[index];
        if (entry) {
            materialDescriptionInput.value = entry.description;
            materialNumberInput.value = entry.number;
            cartonQuantityInput.value = entry.quantity;
            cartonLocationInput.value = entry.location;

            allCartonEntries.splice(index, 1);
            displayCartonEntries();
        }
    }

    function previewCartonFile() {
        if (allCartonEntries.length === 0) {
            alert('No entries to preview.');
            return;
        }
        displayCartonEntries();
        saveCartonFileButton.style.display = 'inline-block';
    }

    // Save the Carton file in localStorage
    function saveCartonFileLocal() {
        if (allCartonEntries.length === 0) {
            alert('No entries to generate.');
            return;
        }
        const fileName = prompt("Please enter the file name:", "carton");
        if (fileName === null || fileName === "") {
            return;
        }

        const csvHeader = "Material Description,Material Number,Quantity,Location";
        const csvRows = allCartonEntries.map(entry => `${entry.description},${entry.number},${entry.quantity},${entry.location}`).join('\n');
        const csvContent = `${csvHeader}\n${csvRows}`;

        let cartonFiles = JSON.parse(localStorage.getItem('cartonFiles') || '[]');
        cartonFiles.push({ fileName: `${fileName}.csv`, content: csvContent, createdAt: new Date().toISOString() });
        localStorage.setItem('cartonFiles', JSON.stringify(cartonFiles));

        alert('Carton entries saved to local storage successfully!');
        listFiles('carton', document.querySelector('#carton-tab tbody'));
    }

    // Listing files from localStorage on the Physical Counting page
    function listFiles(type, tableBody) {
        tableBody.innerHTML = '';
        let files = [];
        if (type === 'mcb') {
            files = JSON.parse(localStorage.getItem('mcbFiles') || '[]');
        } else if (type === 'carton') {
            files = JSON.parse(localStorage.getItem('cartonFiles') || '[]');
        }
        if (!files || files.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="2">No files found.</td></tr>';
            return;
        }
        files.forEach((file, index) => {
            const row = document.createElement('tr');
            row.classList.add('bold');
            row.innerHTML = `
                <td>${file.fileName}</td>
                <td>
                    <button class="download-file" data-index="${index}" data-type="${type}">Download</button>
                    <button class="delete-file" data-index="${index}" data-type="${type}">Delete</button>
                </td>`;
            tableBody.appendChild(row);
        });
    }

    // Download file from localStorage
    function downloadFileLocal(index, type) {
        let files = [];
        if (type === 'mcb') {
            files = JSON.parse(localStorage.getItem('mcbFiles') || '[]');
        } else if (type === 'carton') {
            files = JSON.parse(localStorage.getItem('cartonFiles') || '[]');
        }
        const file = files[index];
        if (file) {
            const downloadLink = document.createElement('a');
            downloadLink.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(file.content));
            downloadLink.setAttribute('download', file.fileName);
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    }

    // Delete file from localStorage
    function deleteFileLocal(index, type) {
        let files = [];
        if (type === 'mcb') {
            files = JSON.parse(localStorage.getItem('mcbFiles') || '[]');
        } else if (type === 'carton') {
            files = JSON.parse(localStorage.getItem('cartonFiles') || '[]');
        }
        files.splice(index, 1);
        if (type === 'mcb') {
            localStorage.setItem('mcbFiles', JSON.stringify(files));
        } else if (type === 'carton') {
            localStorage.setItem('cartonFiles', JSON.stringify(files));
        }
        alert('File deleted successfully!');
        const tableBody = (type === 'mcb')
            ? document.querySelector('#mcb-tab tbody')
            : document.querySelector('#carton-tab tbody');
        listFiles(type, tableBody);
    }

    // Global event listener for download and delete buttons on Physical Counting page
    document.querySelector('.content')?.addEventListener('click', function (event) {
        if (event.target.classList.contains('download-file')) {
            const index = parseInt(event.target.dataset.index);
            const type = event.target.dataset.type;
            downloadFileLocal(index, type);
        } else if (event.target.classList.contains('delete-file')) {
            const index = parseInt(event.target.dataset.index);
            const type = event.target.dataset.type;
            deleteFileLocal(index, type);
        }
    });

    // Initialize breaking capacity options on page load for MCB Entry
    if (productFamilySelect) {
        updateBreakingCapacityOptions();
    }

    // Load file lists on page load for Physical Counting
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
     // Function to save MCB entries to localStorage (called from Physical Counting page)
     window.saveMcbEntries = function () {
        if (allEntries.length === 0) {
            alert('No MCB entries to save.');
            return;
        }

        const fileName = prompt("Please enter the file name:", "inventory");
        if (fileName === null || fileName === "") {
            return;
        }

        const csvHeader = "Polarity,Rating,Product Family,Breaking Capacity,Quantity,Location";
        const csvRows = allEntries.map(entry => `${entry.polarity},${entry.rating},${entry.productFamily},${entry.breakingCapacity},${entry.quantity},${entry.location}`).join('\n');
        const csvContent = `${csvHeader}\n${csvRows}`;

        // Save file content in localStorage under "mcbFiles".
        let mcbFiles = JSON.parse(localStorage.getItem('mcbFiles') || '[]');
        mcbFiles.push({ fileName: `${fileName}.csv`, content: csvContent, createdAt: new Date().toISOString() });
        localStorage.setItem('mcbFiles', JSON.stringify(mcbFiles));

        alert('MCB entries saved to local storage successfully!');
        // Clear all entries after saving
        allEntries = [];
        displayMcbEntries(); // Clear the table
        listFiles('mcb', document.querySelector('#mcb-tab tbody'));
    };
     // Function to save Carton entries to localStorage (called from Physical Counting page)
     window.saveCartonEntries = function () {
          if (allCartonEntries.length === 0) {
            alert('No entries to generate.');
            return;
        }
        const fileName = prompt("Please enter the file name:", "carton");
        if (fileName === null || fileName === "") {
            return;
        }

        const csvHeader = "Material Description,Material Number,Quantity,Location";
        const csvRows = allCartonEntries.map(entry => `${entry.description},${entry.number},${entry.quantity},${entry.location}`).join('\n');
        const csvContent = `${csvHeader}\n${csvRows}`;

        let cartonFiles = JSON.parse(localStorage.getItem('cartonFiles') || '[]');
        cartonFiles.push({ fileName: `${fileName}.csv`, content: csvContent, createdAt: new Date().toISOString() });
        localStorage.setItem('cartonFiles', JSON.stringify(cartonFiles));

        alert('Carton entries saved to local storage successfully!');
        listFiles('carton', document.querySelector('#carton-tab tbody'));
    };
});
