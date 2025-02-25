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
    const allEntries = [];

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
    document.getElementById('add-entry')?.addEventListener('click', addEntry);
    previewInventoryFileButton?.addEventListener('click', previewInventoryFile);
    generateInventoryFileButton?.addEventListener('click', generateInventoryFile);
    document.addEventListener('DOMContentLoaded', renderFiles);

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
        displayEntries();

        polaritySelect.value = '';
        ratingSelect.value = '';
        productFamilySelect.value = '';
        breakingCapacitySelect.innerHTML = '';
        quantityInput.value = '';
        locationInput.value = '';
    }

    function displayEntries() {
        entryTableBody.innerHTML = '';
        allEntries.forEach((entry, index) => {
            const row = document.createElement('tr');
            if (index === allEntries.length - 1) {
                row.classList.add('bold');
            }
            row.innerHTML = `<td>${entry.polarity}</td><td>${entry.rating}</td><td>${entry.productFamily}</td><td>${entry.breakingCapacity}</td><td>${entry.quantity}</td><td>${entry.location}</td>`;
            entryTableBody.appendChild(row);
        });
    }

    function previewInventoryFile() {
        if (allEntries.length === 0) {
            alert('No entries to preview.');
            return;
        }
        displayEntries();
        generateInventoryFileButton.style.display = 'inline-block';
    }

    function generateInventoryFile() {
        const csvHeader = "Polarity,Rating,Product Family,Breaking Capacity,Quantity,Location";
        const csvRows = allEntries.map(entry => `${entry.polarity},${entry.rating},${entry.productFamily},${entry.breakingCapacity},${entry.quantity},${entry.location}`);
        const csvContent = `data:text/csv;charset=utf-8,${csvHeader}\n${csvRows.join('\n')}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        const storedFiles = JSON.parse(localStorage.getItem('generatedFiles')) || [];
        storedFiles.push({ name: `inventory_${new Date().toISOString().split('T')[0]}.csv`, content: csvContent });
        localStorage.setItem('generatedFiles', JSON.stringify(storedFiles));
        renderFiles();
    }

    function renderFiles() {
        const filesTableBody = document.getElementById('files-table')?.querySelector('tbody');
        filesTableBody.innerHTML = '';
        const storedFiles = JSON.parse(localStorage.getItem('generatedFiles')) || [];
        storedFiles.forEach((file, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${file.name}</td><td><button class="download-file" data-index="${index}">Download</button> <button class="delete-file" data-index="${index}">Delete</button></td>`;
            filesTableBody.appendChild(row);
        });
    }

    filesTableBody?.addEventListener('click', (event) => {
        const index = event.target.getAttribute('data-index');
        let storedFiles = JSON.parse(localStorage.getItem('generatedFiles')) || [];
        if (event.target.classList.contains('download-file')) {
            const file = storedFiles[index];
            const link = document.createElement('a');
            link.setAttribute('href', file.content);
            link.setAttribute('download', file.name);
            document.body.appendChild(link);
            link.click();
        } else if (event.target.classList.contains('delete-file')) {
            storedFiles.splice(index, 1);
            localStorage.setItem('generatedFiles', JSON.stringify(storedFiles));
            renderFiles();
        }
    });

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
            option.value = item.Description;
            materialList.appendChild(option);
        });
    }

    function handleMaterialDescriptionInput() {
        const description = materialDescriptionInput.value;
        const material = materialData.find(item => item.Description === description);
        if (material) {
            materialNumberInput.value = material.Number;
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
                <td><button onclick="removeCartonEntry(${index})">Remove</button></td>
            `;
            cartonEntryTableBody.appendChild(row);
        });
    }

    function removeCartonEntry(index) {
        allCartonEntries.splice(index, 1);
        displayCartonEntries();
    }

    function previewCartonFile() {
        if (allCartonEntries.length === 0) {
            alert('No entries to preview.');
            return;
        }
        displayCartonEntries();
        saveCartonFileButton.style.display = 'inline-block';
    }

    function saveCartonFile() {
        const csvHeader = "Material Description,Material Number,Quantity,Location";
        const csvRows = allCartonEntries.map(entry => `${entry.description},${entry.number},${entry.quantity},${entry.location}`);
        const csvContent = `data:text/csv;charset=utf-8,${csvHeader}\n${csvRows.join('\n')}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `carton_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
    }
});
