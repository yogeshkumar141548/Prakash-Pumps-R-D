const units = { mm: 1, cm: 10, m: 1000, inch: 25.4, ft: 304.8, yard: 914.4 };

// Full Excel Data
const excelData = [
    {'m': 'PSMC-150-5.5', 'd': 40.0, 'l': 605.0},
    {'m': 'PSMC-150-7.5', 'd': 40.0, 'l': 680.0}, 
    {'m': 'PSMC-150-10', 'd': 40.0, 'l': 720.0}, 
    {'m': 'PSMC-150-12.5', 'd': 40.0, 'l': 760.0}, 
    {'m': 'PSMC-150-15', 'd': 40.0, 'l': 780.0}, 
    {'m': 'PSMC-150-17.5', 'd': 40.0, 'l': 840.0}, 
    {'m': 'PSMC-150-20', 'd': 40.0, 'l': 880.0}, 
    {'m': 'PSMC-150-25', 'd': 42.0, 'l': 930.0}, 
    {'m': 'PSMC-150-30', 'd': 42.0, 'l': 1005.0}, 
    {'m': 'PSMC-150-35', 'd': 45.0, 'l': 1077.0}, 
    {'m': 'PSMC-150-40', 'd': 45.0, 'l': 1197.0}, 
    {'m': 'PSMC-150-50', 'd': 45.0, 'l': 1297.0}, 
    {'m': 'PSMC-150-60', 'd': 45.0, 'l': 1397.0},
    {'m': 'PSMP-150-5.5', 'd': 40.0, 'l': 549.0}, 
    {'m': 'PSMP-150-7.5', 'd': 40.0, 'l': 624.0}, 
    {'m': 'PSMP-150-10', 'd': 40.0, 'l': 654.0},
    {'m': 'PSMP-150-12.5', 'd': 40.0, 'l': 704.0}, 
    {'m': 'PSMP-150-15', 'd': 40.0, 'l': 724.0}, 
    {'m': 'PSMP-150-17.5', 'd': 40.0, 'l': 784.0}, 
    {'m': 'PSMP-150-20', 'd': 40.0, 'l': 824.0},
    {'m': 'PSMP-150-25', 'd': 42.0, 'l': 904.0}, 
    {'m': 'PSMP-150-30', 'd': 42.0, 'l': 979.0}, 
    {'m': 'PSMP-100-0.75', 'd': 32.0, 'l': 469.0}, 
    {'m': 'PSMP-100-3', 'd': 32.0, 'l': 614.0}, 
    {'m': 'PSMP-100-3(s)', 'd': 32.0, 'l': 654.0}, 
    {'m': 'PSMP-100-4', 'd': 32.0, 'l': 654.0}, 
    {'m': 'PSMP-100-5.5', 'd': 32.0, 'l': 714.0}, 
    {'m': 'PSMP-100-7.5', 'd': 32.0, 'l': 754.0}, 
    {'m': 'PSMC-125-5.5', 'd': 38.0, 'l': 674.0}, 
    {'m': 'PSMC-125-7.5', 'd': 38.0, 'l': 714.0}, 
    {'m': 'PSMC-125-10', 'd': 38.0, 'l': 794.0}, 
    {'m': 'PSMP-200-50', 'd': 56.0, 'l': 1131.0},
    {'m': 'PSMP-200-60', 'd': 56.0, 'l': 1181.0}, 
    {'m': 'PSMP-200-75', 'd': 56.0, 'l': 1281.0}, 
    {'m': 'PSMP-200-85', 'd': 56.0, 'l': 1381.0}, 
    {'m': 'PSMP-200-100', 'd': 56.0, 'l': 1456.0},
    {'m': 'PSMC-200-50', 'd': 56.0, 'l': 1225.0}, 
    {'m': 'PSMC-200-60', 'd': 56.0, 'l': 1275.0}, 
    {'m': 'PSMC-200-75', 'd': 56.0, 'l': 1375.0}, 
    {'m': 'PSMC-200-80', 'd': 56.0, 'l': 1475.0}, 
    {'m': 'PSMC-200-85', 'd': 56.0, 'l': 1475.0}, 
    {'m': 'PSMC-200-90', 'd': 56.0, 'l': 1475.0}, 
    {'m': 'PSMC-200-100', 'd': 64.0, 'l': 1550.0},
    {'m': 'PSMC-200-125', 'd': 64.0, 'l': 1625.0}
];

let dataList = JSON.parse(localStorage.getItem("models")) || [];
let rawBars = []; 
let editIndex = -1;
let rawEditIndex = -1;

window.onload = function() {
    fillUnits();
    renderTable();
    loadModelDropdown();
    renderRawBarTable();
};

function fillUnits() {
    const options = Object.keys(units).map(k => `<option value="${k}">${k}</option>`).join("");
    if(document.getElementById("uom")) document.getElementById("uom").innerHTML = options;
    if(document.getElementById("barUnit")) document.getElementById("barUnit").innerHTML = options;
}

function loadModelDropdown() {
    const list = document.getElementById("modelList");
    if (list) list.innerHTML = excelData.map(item => `<option value="${item.m}">`).join("");
}

function autoFillDetails() {
    const val = document.getElementById("model").value.trim();
    const found = excelData.find(item => item.m.toLowerCase() === val.toLowerCase());
    if (found) {
        document.getElementById("diameter").value = found.d;
        document.getElementById("length").value = found.l;
        document.getElementById("uom").value = "mm";
    }
}

function convert(val, from, to) { return (val * units[from]) / units[to]; }

// --- Required Shaft Management (Table 1) ---
function addData() {
    const m = document.getElementById("model").value.trim();
    const d = parseFloat(document.getElementById("diameter").value);
    const l = parseFloat(document.getElementById("length").value);
    const u = document.getElementById("uom").value;
    const q = parseInt(document.getElementById("qty").value) || 1;

    if (!m || isNaN(l) || isNaN(d)) return alert("Please enter all shaft details correctly.");

    const newData = { model: m, dia: d, length: l, uom: u, qty: q };

    if (editIndex === -1) {
        dataList.push(newData);
    } else {
        dataList[editIndex] = newData;
        editIndex = -1;
        document.getElementById("addBtn").textContent = "Add Shaft";
    }

    saveAndRefresh();
    clearInputs();
}

function clearInputs() {
    document.getElementById("model").value = "";
    document.getElementById("diameter").value = "";
    document.getElementById("length").value = "";
    document.getElementById("qty").value = "1";
}

function renderTable() {
    const table = document.getElementById("tableData");
    if (!table) return;

    if (dataList.length === 0) {
        table.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#888; padding:20px;">No shafts added yet.</td></tr>`;
        return;
    }

    table.innerHTML = dataList.map((item, index) => `
        <tr>
            <td style="font-weight:bold; color:#2c3e50;">${item.model}</td>
            <td>${item.dia} mm</td>
            <td>${item.length}</td>
            <td><span style="background:#e9f2ff; padding:2px 8px; border-radius:4px; border:1px solid #cce0ff; font-size:13px;">${item.uom}</span></td>
            <td>${item.qty} pcs</td>
            <td>
                <div style="display:flex; gap:8px;">
                    <button onclick="editData(${index})" style="background:#ffc107; color:#000; padding:5px 10px; border-radius:4px; font-size:12px; border:none; cursor:pointer; font-weight:bold;">Edit</button>
                    <button onclick="deleteData(${index})" style="background:#dc3545; color:#fff; padding:5px 10px; border-radius:4px; font-size:12px; border:none; cursor:pointer; font-weight:bold;">Del</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function editData(index) {
    const item = dataList[index];
    document.getElementById("model").value = item.model;
    document.getElementById("diameter").value = item.dia;
    document.getElementById("length").value = item.length;
    document.getElementById("uom").value = item.uom;
    document.getElementById("qty").value = item.qty;
    editIndex = index;
    document.getElementById("addBtn").textContent = "Update Shaft";
}

function deleteData(i) { 
    if(confirm("Are you sure you want to delete this shaft?")) { 
        dataList.splice(i, 1); 
        saveAndRefresh(); 
    } 
}

function saveAndRefresh() {
    localStorage.setItem("models", JSON.stringify(dataList));
    renderTable();
}

// --- Raw Stock Management (Table 2) ---
function addRawBar() {
    const d = parseFloat(document.getElementById("barDia").value);
    const l = parseFloat(document.getElementById("barLength").value);
    const u = document.getElementById("barUnit").value;

    if (isNaN(d) || isNaN(l)) return alert("Please enter valid Round Bar Diameter and Length.");

    const newRawData = { dia: d, length: l, uom: u, lengthMM: convert(l, u, "mm") };

    if (rawEditIndex === -1) {
        rawBars.push(newRawData);
    } else {
        rawBars[rawEditIndex] = newRawData;
        rawEditIndex = -1;
        document.getElementById("addBarBtn").textContent = "Add to Stock";
        document.getElementById("addBarBtn").style.background = "#28a745";
    }
    
    renderRawBarTable();
    document.getElementById("barDia").value = "";
    document.getElementById("barLength").value = "";
}

function renderRawBarTable() {
    const table = document.getElementById("rawBarTable");
    if (!table) return;

    if (rawBars.length === 0) {
        table.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888; padding:15px;">No stock available.</td></tr>`;
        return;
    }

    table.innerHTML = rawBars.map((bar, index) => `
        <tr>
            <td style="font-weight:bold; color:#2c3e50;">${bar.dia} mm</td>
            <td>${bar.length}</td>
            <td><span style="background:#f1f2f6; padding:2px 8px; border-radius:4px; font-size:13px;">${bar.uom}</span></td>
            <td>
                <div style="display:flex; gap:8px;">
                    <button onclick="editRawBar(${index})" style="background:#ffc107; color:#000; padding:5px 10px; border-radius:4px; font-size:11px; border:none; cursor:pointer; font-weight:bold;">Edit</button>
                    <button onclick="rawBars.splice(${index},1); renderRawBarTable();" style="background:#dc3545; color:#fff; padding:5px 10px; border-radius:4px; font-size:11px; border:none; cursor:pointer; font-weight:bold;">Del</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function editRawBar(index) {
    const bar = rawBars[index];
    document.getElementById("barDia").value = bar.dia;
    document.getElementById("barLength").value = bar.length;
    document.getElementById("barUnit").value = bar.uom;
    rawEditIndex = index;
    const btn = document.getElementById("addBarBtn");
    btn.textContent = "Update Bar";
    btn.style.background = "#f39c12"; // Orange for update
}

// --- Optimization & Technical Report ---
function perfectOptimize() {
    const resDiv = document.getElementById("result");
    if (dataList.length === 0 || rawBars.length === 0) return alert("Please add Shafts and Stock first.");

    const shaftGroups = {};
    dataList.forEach(item => {
        if (!shaftGroups[item.dia]) shaftGroups[item.dia] = [];
        const sizeMM = convert(item.length, item.uom, "mm");
        for(let i=0; i<item.qty; i++) shaftGroups[item.dia].push({ ...item, sizeMM });
    });

    let html = `
        <div style="text-align:center; border-bottom: 2px solid #333; padding-bottom:15px; margin-bottom:20px;">
            <h1 style="margin:0; font-size: 24px; color: #2c3e50;">PRAKASH PUMPS - R&D CENTER</h1>
            <p style="margin:5px 0; font-size: 14px;">Shaft Cutting Optimization Technical Report</p>
            <p style="font-size:12px; color: #666;">Generated on: ${new Date().toLocaleDateString()} | ${new Date().toLocaleTimeString()}</p>
        </div>`;

    let foundMatch = false;

    Object.keys(shaftGroups).forEach(dia => {
        let shafts = shaftGroups[dia].sort((a, b) => b.sizeMM - a.sizeMM);
        let stock = rawBars
            .filter(b => b.dia == dia)
            .map(b => ({ ...b, remMM: b.lengthMM, cuts: [] }));

        if (stock.length === 0) return; 
        foundMatch = true;

        shafts.forEach(shaft => {
            let placed = false;
            for (let bar of stock) {
                if (bar.remMM >= shaft.sizeMM) {
                    bar.cuts.push(shaft);
                    bar.remMM -= shaft.sizeMM;
                    placed = true;
                    break;
                }
            }
            if (!placed) html += `<p style="color:orange; font-weight:bold; margin-bottom:10px;">⚠️ Warning: Stock exhausted for ${dia}mm shaft (${shaft.model}).</p>`;
        });

        html += `<h3 style="background:#2c3e50; color:#fff; padding:10px 15px; margin-top:25px; border-radius:5px;">MATERIAL: ROUND BAR - DIA ${dia}MM</h3>`;

        stock.forEach((bar, idx) => {
            if (bar.cuts.length === 0) return;
            
            let summary = {};
            bar.cuts.forEach(c => {
                let key = `${c.model} [${c.length}${c.uom}]`;
                summary[key] = (summary[key] || 0) + 1;
            });

            html += `
                <div style="margin-bottom: 25px; border:1px solid #ccc; padding:15px; border-radius:8px; background:#fff;">
                    <p style="margin-bottom:10px; font-size:16px;"><strong>STOCK BAR #${idx + 1}</strong> (Total: ${bar.length}${bar.uom})</p>
                    <table style="width:100%; border-collapse: collapse; border: 1px solid #333;">
                        <thead>
                            <tr style="background:#f4f7f8;">
                                <th style="border:1px solid #333; padding:8px; text-align:left;">Model & Size</th>
                                <th style="border:1px solid #333; padding:8px; text-align:center; width:100px;">Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.keys(summary).map(key => `
                                <tr>
                                    <td style="border:1px solid #333; padding:8px;">${key}</td>
                                    <td style="border:1px solid #333; padding:8px; text-align:center;">${summary[key]}</td>
                                </tr>`).join("")}
                        </tbody>
                        <tfoot>
                            <tr style="background:#fdfdfd;">
                                <td style="border:1px solid #333; padding:8px; text-align:right;"><b>Used:</b></td>
                                <td style="border:1px solid #333; padding:8px; text-align:center;"><b>${(bar.lengthMM - bar.remMM).toFixed(1)} mm</b></td>
                            </tr>
                            <tr style="background:#fff5f5;">
                                <td style="border:1px solid #333; padding:8px; text-align:right;"><b>Scrap:</b></td>
                                <td style="border:1px solid #333; padding:8px; text-align:center; color:#d9534f; font-weight:bold;">${bar.remMM.toFixed(1)} mm</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>`;
        });
    });

    if(!foundMatch) {
        resDiv.innerHTML = `<p style="color:#d9534f; text-align:center; padding:20px; border:2px dashed #d9534f; border-radius:8px;">⚠️ Error: Raw stock diameter does not match required shafts!</p>`;
    } else {
        resDiv.innerHTML = html;
    }
}
