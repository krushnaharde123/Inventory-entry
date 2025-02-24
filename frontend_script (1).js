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

const productFamilySelect = document.getElementById('product-family');
const breakingCapacitySelect = document.getElementById('breaking-capacity');
const polaritySelect = document.getElementById('polarity');
const ratingSelect = document.getElementById('rating');
const quantityInput = document.getElementById('quantity');
const locationInput = document.getElementById('location');
const entryTableBody = document.getElementById('entry-table').querySelector('tbody');
const filesTableBody = document.getElementById('files-table').querySelector('tbody');
const previewInventoryFileButton = document.getElementById('preview-inventory-file');
const generateInventoryFileButton = document.getElementById('generate-inventory-file');
const allEntries = [];
let trolleyCount = 0;

// Update breaking capacity options based on selected product family
productFamilySelect.addEventListener('change', () => {
    const selectedFamily = productFamilySelect.value;
    const capacities = breakingCapacityData[selectedFamily] || [];
    breakingCapacitySelect.innerHTML = '';
    capacities.forEach(capacity => {
        const option = document.createElement('option');
        option.value = capacity;
        option.textContent = capacity;
        breakingCapacitySelect.appendChild(option);
    });
});

document.getElementById('add-entry').addEventListener('click', () => {
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
});

function displayEntries() {
    entryTableBody.innerHTML = '';
    allEntries.forEach((entry, index) => {
        const row = document.createElement('tr');
        if (index === allEntries.length - 1) {
            row.classList.add('bold');
        }
        row.innerHTML = `<td>${entry.polarity}</td><td>${entry.rating}</td><td>${entry.productFamily}</td><td>${entry.breakingCapacity}</td><td>${entry.quantity}</td><td>${entry.location}</td><td><button class="edit-entry" style="background-color: #FFC107;">Edit</button></td>`;
        entryTableBody.appendChild(row);
    });
}

entryTableBody.addEventListener('click', (event) => {
    if (event.target.classList.contains('edit-entry')) {
        const row = event.target.closest('tr');
        const polarity = row.cells[0].innerText;
        const rating = row.cells[1].innerText;
        const productFamily = row.cells[2].innerText;
        const breakingCapacity = row.cells[3].innerText;
        const quantity = row.cells[4].innerText;
        const location = row.cells[5].innerText;

        polaritySelect.value = polarity;
        ratingSelect.value = rating;
        productFamilySelect.value = productFamily;
        breakingCapacitySelect.value = breakingCapacity;
        quantityInput.value = quantity;
        locationInput.value = location;

        allEntries.pop();
        row.remove();
    }
});

previewInventoryFileButton.addEventListener('click', () => {
    if (allEntries.length === 0) {
        alert('No entries to preview.');
        return;
    }
    displayEntries();
    generateInventoryFileButton.style.display = 'inline-block';
});

generateInventoryFileButton.addEventListener('click', () => {
    const csvHeader = "Polarity,Rating,Product Family,Breaking Capacity,Quantity,Location";
    const csvRows = allEntries.map(entry => `${entry.polarity},${entry.rating},${entry.productFamily},${entry.breakingCapacity},${entry.quantity},${entry.location}`);
    const csvContent = `data:text/csv;charset=utf-8,${csvHeader}\n${csvRows.join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    saveFileToServer(`inventory_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
});

function saveFileToServer(fileName, fileContent) {
    fetch('http://localhost:3000/inventory/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName, fileContent }),
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
        renderFiles();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function renderFiles() {
    filesTableBody.innerHTML = '';
    fetch('http://localhost:3000/inventory/files')
        .then(response => response.json())
        .then(files => {
            files.forEach((file, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${file}</td><td><button class="download-file" data-index="${index}">Download</button> <button class="delete-file" data-index="${index}">Delete</button></td>`;
                filesTableBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

filesTableBody.addEventListener('click', (event) => {
    const fileName = event.target.closest('tr').cells[0].innerText;
    if (event.target.classList.contains('download-file')) {
        fetch(`http://localhost:3000/inventory/files/${fileName}`)
            .then(response => response.text())
            .then(fileContent => {
                const link = document.createElement('a');
                link.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURI(fileContent)}`);
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    } else if (event.target.classList.contains('delete-file')) {
        deleteFileFromServer(fileName);
    }
});

function deleteFileFromServer(fileName) {
    fetch(`http://localhost:3000/inventory/files/${fileName}`, {
        method: 'DELETE',
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
        renderFiles();
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderFiles();
});