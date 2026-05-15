// Database extracted from 'Stator and Rotor weight N.xlsx'
const defaultData = [
    {"Stamping":"180X90X52","CL":550.0,"StatorWt":56.56,"RotorWt":12.18},
    {"Stamping":"180X90X52","CL":600.0,"StatorWt":61.7,"RotorWt":13.28},
    {"Stamping":"180X90X52","CL":700.0,"StatorWt":71.99,"RotorWt":15.5},
    {"Stamping":"180X90X52","CL":800.0,"StatorWt":82.27,"RotorWt":17.71},
    {"Stamping":"180X90X52","CL":875.0,"StatorWt":89.98,"RotorWt":19.37},
    {"Stamping":"180X90X56","CL":950.0,"StatorWt":97.7,"RotorWt":18.52},
    {"Stamping":"140X70X38.5","CL":125.0,"StatorWt":7.67,"RotorWt":1.88},
    {"Stamping":"140X70X38.5","CL":200.0,"StatorWt":12.27,"RotorWt":3.0},
    {"Stamping":"140X70X38.5","CL":240.0,"StatorWt":14.72,"RotorWt":3.6},
    {"Stamping":"140X70X38.5","CL":280.0,"StatorWt":17.18,"RotorWt":4.21},
    {"Stamping":"140X70X38.5","CL":300.0,"StatorWt":18.4,"RotorWt":4.51},
    {"Stamping":"140X70X38.5","CL":360.0,"StatorWt":22.08,"RotorWt":5.41},
    {"Stamping":"140X70X38.5","CL":400.0,"StatorWt":24.54,"RotorWt":6.01},
    {"Stamping":"140X70X38.5","CL":450.0,"StatorWt":27.6,"RotorWt":6.76},
    {"Stamping":"140X70X38.5","CL":525.0,"StatorWt":32.2,"RotorWt":7.89},
    {"Stamping":"138X72X42","CL":580.0,"StatorWt":31.03,"RotorWt":7.91},
    {"Stamping":"138X72X42","CL":700.0,"StatorWt":37.45,"RotorWt":9.55},
    {"Stamping":"138X72X42","CL":800.0,"StatorWt":42.8,"RotorWt":10.91},
    {"Stamping":"138X72X42","CL":900.0,"StatorWt":48.15,"RotorWt":12.28},
    {"Stamping":"138X72X38.5","CL":125.0,"StatorWt":6.69,"RotorWt":1.92},
    {"Stamping":"138X72X38.5","CL":200.0,"StatorWt":10.7,"RotorWt":3.06},
    {"Stamping":"138X72X38.5","CL":230.0,"StatorWt":12.3,"RotorWt":3.52},
    {"Stamping":"138X72X38.5","CL":280.0,"StatorWt":14.98,"RotorWt":4.29},
    {"Stamping":"138X72X38.5","CL":300.0,"StatorWt":16.05,"RotorWt":4.6},
    {"Stamping":"138X72X38.5","CL":360.0,"StatorWt":19.26,"RotorWt":5.52},
    {"Stamping":"138X72X38.5","CL":400.0,"StatorWt":21.4,"RotorWt":6.13},
    {"Stamping":"138X72X38.5","CL":450.0,"StatorWt":24.08,"RotorWt":6.89},
    {"Stamping":"138X72X38.5","CL":525.0,"StatorWt":28.09,"RotorWt":8.04},
    {"Stamping":"112X60X35","CL":280.0,"StatorWt":9.58,"RotorWt":2.93},
    {"Stamping":"112X60X35","CL":320.0,"StatorWt":10.94,"RotorWt":3.35},
    {"Stamping":"112X60X35","CL":400.0,"StatorWt":13.68,"RotorWt":4.19}
];

let motorData = JSON.parse(localStorage.getItem('motorDB')) || defaultData;
let selectedItems = JSON.parse(localStorage.getItem('selectedItems')) || [];
let editMode = false;

const stampingSel = document.getElementById('stamping');
const clSel = document.getElementById('cl');
const sQty = document.getElementById('statorQty');
const rQty = document.getElementById('rotorQty');

function init() {
    const models = [...new Set(motorData.map(d => d.Stamping))];
    stampingSel.innerHTML = '';
    models.forEach(m => stampingSel.add(new Option(m, m)));
    updateCLDropdown();
    renderTable(); 
}

function updateCLDropdown() {
    const filtered = motorData.filter(d => d.Stamping === stampingSel.value);
    clSel.innerHTML = '';
    filtered.forEach(d => clSel.add(new Option(d.CL, d.CL)));
    
    renderUnitWeights(); 
    calculateLiveCard();
}

function renderUnitWeights() {
    const row = motorData.find(d => d.Stamping === stampingSel.value && d.CL == clSel.value);
    if(!row) return;

    if(editMode) {
        if (!document.querySelector('.stator-edit-input')) {
            document.getElementById('statorUnit').innerHTML = `<input type="number" step="0.01" class="edit-input stator-edit-input" value="${row.StatorWt}" oninput="updateValue('StatorWt', this.value)"> kg`;
            document.getElementById('rotorUnit').innerHTML = `<input type="number" step="0.01" class="edit-input rotor-edit-input" value="${row.RotorWt}" oninput="updateValue('RotorWt', this.value)"> kg`;
        }
    } else {
        document.getElementById('statorUnit').textContent = row.StatorWt + " kg";
        document.getElementById('rotorUnit').textContent = row.RotorWt + " kg";
    }
}

function calculateLiveCard() {
    const row = motorData.find(d => d.Stamping === stampingSel.value && d.CL == clSel.value);
    if(!row) return;

    const statorWt = editMode ? (parseFloat(document.querySelector('.stator-edit-input')?.value) || 0) : row.StatorWt;
    const rotorWt = editMode ? (parseFloat(document.querySelector('.rotor-edit-input')?.value) || 0) : row.RotorWt;

    const totalS = (statorWt * (parseFloat(sQty.value) || 0)).toFixed(2);
    const totalR = (rotorWt * (parseFloat(rQty.value) || 0)).toFixed(2);

    document.getElementById('statorTotal').textContent = totalS;
    document.getElementById('rotorTotal').textContent = totalR;
}

function addItemToTable() {
    const stamping = stampingSel.value;
    const cl = parseFloat(clSel.value);
    const sqtyVal = parseInt(sQty.value) || 0;
    const rqtyVal = parseInt(rQty.value) || 0;

    if(sqtyVal <= 0 && rqtyVal <= 0) {
        alert("Kripya Stator ya Rotor me se kisi ek ki Quantity zaroor bharein!");
        return;
    }

    const dbRow = motorData.find(d => d.Stamping === stamping && d.CL == cl);
    if(!dbRow) return;

    // Check Duplicate Item (Same Size + Same CL)
    const existingItemIndex = selectedItems.findIndex(item => item.stamping === stamping && item.cl === cl);

    if (existingItemIndex !== -1) {
        // Quantity badha do agar same size and CL hai
        selectedItems[existingItemIndex].statorQty += sqtyVal;
        selectedItems[existingItemIndex].rotorQty += rqtyVal;
        
        selectedItems[existingItemIndex].statorTotalWt = parseFloat((selectedItems[existingItemIndex].statorQty * dbRow.StatorWt).toFixed(2));
        selectedItems[existingItemIndex].rotorTotalWt = parseFloat((selectedItems[existingItemIndex].rotorQty * dbRow.RotorWt).toFixed(2));
        selectedItems[existingItemIndex].itemGrandTotal = parseFloat((selectedItems[existingItemIndex].statorTotalWt + selectedItems[existingItemIndex].rotorTotalWt).toFixed(2));
    } else {
        // Nayi row entry detail save karo
        const statorTotalWt = parseFloat((sqtyVal * dbRow.StatorWt).toFixed(2));
        const rotorTotalWt = parseFloat((rqtyVal * dbRow.RotorWt).toFixed(2));
        const itemGrandTotal = parseFloat((statorTotalWt + rotorTotalWt).toFixed(2));

        selectedItems.push({
            stamping,
            cl,
            statorQty: sqtyVal,
            statorTotalWt,
            rotorQty: rqtyVal,
            rotorTotalWt,
            itemGrandTotal
        });
    }

    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    renderTable();

    sQty.value = 1;
    rQty.value = 1;
    calculateLiveCard();
}

// --- CORE FIX: DOUBLE TABLE RENDERING ENGINE WITH SIZE GROUPING ---
function renderTable() {
    const tbody = document.getElementById('tableBody');
    const summaryTbody = document.getElementById('summaryTableBody');
    
    tbody.innerHTML = '';
    summaryTbody.innerHTML = '';
    
    let finalGrandTotal = 0;
    let finalStatorTotal = 0;
    let finalRotorTotal = 0;

    // Grouping Map Object for Table 2 (Stamping Size Wise)
    const sizeSummaryMap = {};

    selectedItems.forEach((item, index) => {
        finalGrandTotal += item.itemGrandTotal;
        finalStatorTotal += item.statorTotalWt;
        finalRotorTotal += item.rotorTotalWt;

        // Grouping logic: check dynamic stamping sizes
        if (!sizeSummaryMap[item.stamping]) {
            sizeSummaryMap[item.stamping] = {
                statorWt: 0,
                rotorWt: 0,
                combined: 0
            };
        }
        sizeSummaryMap[item.stamping].statorWt += item.statorTotalWt;
        sizeSummaryMap[item.stamping].rotorWt += item.rotorTotalWt;
        sizeSummaryMap[item.stamping].combined += item.itemGrandTotal;

        // Table 1 Data Render (Detailed Record)
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.stamping}</strong></td>
            <td>${item.cl} mm</td>
            <td>${item.statorQty}</td>
            <td>${item.statorTotalWt.toFixed(2)}</td>
            <td>${item.rotorQty}</td>
            <td>${item.rotorTotalWt.toFixed(2)}</td>
            <td style="color:#e74c3c; font-weight:bold;">${item.itemGrandTotal.toFixed(2)}</td>
            <td><button class="btn btn-delete" onclick="deleteItem(${index})">❌ Delete</button></td>
        `;
        tbody.appendChild(row);
    });

    // Table 2 Data Render (Size Wise Grouped Aggregation)
    for (const sizeKey in sizeSummaryMap) {
        const summaryData = sizeSummaryMap[sizeKey];
        const sRow = document.createElement('tr');
        sRow.innerHTML = `
            <td><strong>${sizeKey}</strong></td>
            <td style="color:var(--stator-color); font-weight:600;">${summaryData.statorWt.toFixed(2)}</td>
            <td style="color:var(--rotor-color); font-weight:600;">${summaryData.rotorWt.toFixed(2)}</td>
            <td style="color:var(--primary); font-weight:bold; background:#f4f7f9;">${summaryData.combined.toFixed(2)}</td>
        `;
        summaryTbody.appendChild(sRow);
    }

    // Dynamic split content injection in Grand Total section
    document.getElementById('grandTotalContainer').innerHTML = `
        <div class="grand-split-grid">
            <span>Total Stator Weight: <strong>${finalStatorTotal.toFixed(2)} kg</strong></span>
            <span>|</span>
            <span>Total Rotor Weight: <strong>${finalRotorTotal.toFixed(2)} kg</strong></span>
        </div>
        <div class="grand-main-title">
            Final Total Weight: ${finalGrandTotal.toFixed(2)} kg
        </div>
    `;
}

function deleteItem(index) {
    selectedItems.splice(index, 1);
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    renderTable();
}

function updateValue(key, val) {
    const index = motorData.findIndex(d => d.Stamping === stampingSel.value && d.CL == clSel.value);
    if(index !== -1) {
        motorData[index][key] = parseFloat(val) || 0;
        localStorage.setItem('motorDB', JSON.stringify(motorData));
        calculateLiveCard();
    }
}

function toggleEditMode() {
    editMode = !editMode;
    const btn = document.getElementById('editBtn');
    
    if(!editMode) {
        document.getElementById('statorUnit').innerHTML = '';
        document.getElementById('rotorUnit').innerHTML = '';
    }

    btn.textContent = editMode ? "Save & Lock Data" : "Enable Edit Mode";
    btn.style.background = editMode ? "#27ae60" : "#3498db";
    
    renderUnitWeights();
    calculateLiveCard();
}

function resetToDefault() {
    if(confirm("Kya aap data reset karna chahte hain? Isse aapki current selected table list bhi clear ho jayegi.")) {
        localStorage.removeItem('motorDB');
        localStorage.removeItem('selectedItems');
        motorData = JSON.parse(JSON.stringify(defaultData));
        selectedItems = [];
        editMode = false;
        
        const btn = document.getElementById('editBtn');
        btn.textContent = "Enable Edit Mode";
        btn.style.background = "#3498db";
        
        document.getElementById('statorUnit').innerHTML = '';
        document.getElementById('rotorUnit').innerHTML = '';
        
        init();
    }
}

stampingSel.addEventListener('change', updateCLDropdown);
clSel.addEventListener('change', () => {
    document.getElementById('statorUnit').innerHTML = '';
    document.getElementById('rotorUnit').innerHTML = '';
    renderUnitWeights();
    calculateLiveCard();
});
sQty.addEventListener('input', calculateLiveCard);
rQty.addEventListener('input', calculateLiveCard);

init();
