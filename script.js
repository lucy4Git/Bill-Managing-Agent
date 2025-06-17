// DOM Elements
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const uploadedFiles = document.getElementById('uploadedFiles');
const resultsSection = document.getElementById('resultsSection');
const totalAmount = document.getElementById('totalAmount');
const categoryList = document.getElementById('categoryList');
const alertsList = document.getElementById('alertsList');
const loadingOverlay = document.getElementById('loadingOverlay');
let expenseChart = null;

// Event Listeners
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    dropZone.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    dropZone.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

// File Processing
function handleFiles(files) {
    if (files.length === 0) return;

    // Clear previous files
    uploadedFiles.innerHTML = '';
    
    // Display selected files
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            showAlert('Please upload only image files.');
            return;
        }
        
        const fileItem = createFileItem(file);
        uploadedFiles.appendChild(fileItem);
    });

    // Process the bills
    processBills(files);
}

function createFileItem(file) {
    const div = document.createElement('div');
    div.className = 'file-item';
    
    const img = document.createElement('img');
    img.src = 'https://cdn-icons-png.flaticon.com/512/1829/1829371.png';
    
    const span = document.createElement('span');
    span.textContent = file.name;
    
    div.appendChild(img);
    div.appendChild(span);
    
    return div;
}

// Bill Processing
async function processBills(files) {
    showLoading(true);
    
    try {
        // Convert files to base64
        const filePromises = Array.from(files).map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        const base64Files = await Promise.all(filePromises);
        
        // Process bills using the Python backend
        const response = await fetch('/process-bills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ images: base64Files })
        });

        if (!response.ok) {
            throw new Error('Failed to process bills');
        }

        const data = await response.json();
        displayResults(data);
    } catch (error) {
        showAlert('Error processing bills: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Results Display
function displayResults(data) {
    resultsSection.style.display = 'block';
    
    // Update total amount
    const total = Object.values(data.category_totals).reduce((a, b) => a + b, 0);
    totalAmount.textContent = `$${total.toFixed(2)}`;
    
    // Update category breakdown
    displayCategories(data.category_totals);
    
    // Update chart
    updateChart(data.category_totals);
    
    // Display alerts
    displayAlerts(data);
}

function displayCategories(categories) {
    categoryList.innerHTML = '';
    
    Object.entries(categories).forEach(([category, amount]) => {
        if (amount > 0) {
            const div = document.createElement('div');
            div.className = 'category-item';
            div.innerHTML = `
                <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                <span>$${amount.toFixed(2)}</span>
            `;
            categoryList.appendChild(div);
        }
    });
}

function updateChart(categories) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    const labels = Object.keys(categories).filter(cat => categories[cat] > 0);
    const data = labels.map(cat => categories[cat]);
    
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.map(label => label.charAt(0).toUpperCase() + label.slice(1)),
            datasets: [{
                data: data,
                backgroundColor: [
                    '#4299e1',
                    '#48bb78',
                    '#ed8936',
                    '#9f7aea',
                    '#f56565',
                    '#718096'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function displayAlerts(data) {
    alertsList.innerHTML = '';
    
    const total = Object.values(data.category_totals).reduce((a, b) => a + b, 0);
    const avg = total / Object.values(data.category_totals).filter(v => v > 0).length;
    
    Object.entries(data.category_totals).forEach(([category, amount]) => {
        if (amount > avg * 3) {
            const alert = document.createElement('div');
            alert.className = 'alert-item';
            alert.textContent = `High spending detected in ${category}`;
            alertsList.appendChild(alert);
        }
    });
    
    if (alertsList.children.length === 0) {
        const noAlert = document.createElement('div');
        noAlert.textContent = 'No unusual spending detected';
        alertsList.appendChild(noAlert);
    }
}

// Utility Functions
function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

function showAlert(message) {
    const alert = document.createElement('div');
    alert.className = 'alert-item';
    alert.textContent = message;
    alertsList.innerHTML = '';
    alertsList.appendChild(alert);
    resultsSection.style.display = 'block';
} 