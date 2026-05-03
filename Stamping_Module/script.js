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
}

function updateCLDropdown() {
    const filtered = motorData.filter(d => d.Stamping === stampingSel.value);
    clSel.innerHTML = '';
    filtered.forEach(d => clSel.add(new Option(d.CL, d.CL)));
    calculate();
}

function calculate() {
    const row = motorData.find(d => d.Stamping === stampingSel.value && d.CL == clSel.value);
    if(!row) return;

    // Display Weights
    if(editMode) {
        document.getElementById('statorUnit').innerHTML = `<input type="number" step="0.01" class="edit-input" value="${row.StatorWt}" onchange="updateValue('StatorWt', this.value)"> kg`;
        document.getElementById('rotorUnit').innerHTML = `<input type="number" step="0.01" class="edit-input" value="${row.RotorWt}" onchange="updateValue('RotorWt', this.value)"> kg`;
    } else {
        document.getElementById('statorUnit').textContent = row.StatorWt + " kg";
        document.getElementById('rotorUnit').textContent = row.RotorWt + " kg";
    }

    const totalS = (row.StatorWt * sQty.value).toFixed(2);
    const totalR = (row.RotorWt * rQty.value).toFixed(2);

    document.getElementById('statorTotal').textContent = totalS;
    document.getElementById('rotorTotal').textContent = totalR;
    document.getElementById('grandTotal').textContent = (parseFloat(totalS) + parseFloat(totalR)).toFixed(2);
}

function updateValue(key, val) {
    const index = motorData.findIndex(d => d.Stamping === stampingSel.value && d.CL == clSel.value);
    if(index !== -1) {
        motorData[index][key] = parseFloat(val) || 0;
        localStorage.setItem('motorDB', JSON.stringify(motorData));
    }
}

function toggleEditMode() {
    editMode = !editMode;
    const btn = document.getElementById('editBtn');
    btn.textContent = editMode ? "Save & Lock Data" : "Enable Edit Mode";
    btn.style.background = editMode ? "#27ae60" : "#3498db";
    calculate();
}

function resetToDefault() {
    if(confirm("Kya aap saara data reset karke Excel wali purani values wapas lana chahte hain?")) {
        localStorage.removeItem('motorDB');
        motorData = [...defaultData];
        init();
    }
}

stampingSel.addEventListener('change', updateCLDropdown);
clSel.addEventListener('change', calculate);
sQty.addEventListener('input', calculate);
rQty.addEventListener('input', calculate);

init();
