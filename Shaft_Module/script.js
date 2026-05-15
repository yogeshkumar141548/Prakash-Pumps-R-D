const units = { mm: 1, cm: 10, m: 1000, inch: 25.4, ft: 304.8, yard: 914.4 };

// Full Excel Data Integrated
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

window.onload = function() {
    fillUnits();
    renderTable();
    loadModelDropdown();
    renderRawBarTable();
};

function fillUnits() {
    const u = document.getElementById("uom");
    const b = document.getElementById("barUnit");
    if (!u || !b) return;
    const options = Object.keys(units).map(k => `<option value="${k}">${k}</option>`).join("");
    u.innerHTML = options;
    b.innerHTML = options;
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

// Shaft List Functions
function addData() {
    const m = document.getElementById("model").value.trim();
    const d = parseFloat(document.getElementById("diameter").value);
    const l = parseFloat(document.getElementById("length").value);
    const u = document.getElementById("uom").value;
    const q = parseInt(document.getElementById("qty").value) || 1;

    if (!m || isNaN(l) || isNaN(d)) return alert("Details enter karein.");

    const newData = { model: m, dia: d, length: l, uom: u, qty: q };

    if (editIndex === -1) dataList.push(newData);
    else { dataList[editIndex] = newData; editIndex = -1; }

    localStorage.setItem("models", JSON.stringify(dataList));
    renderTable();
    document.getElementById("model").value = "";
}

function renderTable() {
    const table = document.getElementById("tableData");
    if (!table) return;
    table.innerHTML = dataList.map((item, index) => `
        <tr>
            <td>${item.model}</td>
            <td>${item.dia} mm</td>
            <td>${item.length} ${item.uom}</td>
            <td>${item.uom}</td>
            <td>${item.qty} pcs</td>
            <td><button onclick="dataList.splice(${index},1); renderTable();" style="background:red; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;">Del</button></td>
        </tr>
    `).join("");
}

// Raw Bar Inventory Functions
function addRawBar() {
    const d = parseFloat(document.getElementById("barDia").value);
    const l = parseFloat(document.getElementById("barLength").value);
    const u = document.getElementById("barUnit").value;

    if (isNaN(d) || isNaN(l)) return alert("Bar Dia aur Length sahi bharein.");

    rawBars.push({ 
        dia: d, 
        length: l, 
        uom: u, 
        lengthMM: convert(l, u, "mm") 
    });
    
    renderRawBarTable();
    document.getElementById("barLength").value = "";
}

function renderRawBarTable() {
    const table = document.getElementById("rawBarTable");
    if (!table) return;
    table.innerHTML = rawBars.map((bar, index) => `
        <tr>
            <td><b>${bar.dia} mm</b></td>
            <td>${bar.length}</td>
            <td>${bar.uom}</td>
            <td><button onclick="rawBars.splice(${index},1); renderRawBarTable();" style="color:red; cursor:pointer; background:none; border:none;">Remove</button></td>
        </tr>
    `).join("");
}

// Optimization Logic
function perfectOptimize() {
    const resDiv = document.getElementById("result");
    if (dataList.length === 0 || rawBars.length === 0) return alert("Pehle Shafts aur Raw Bars add karein.");

    const shaftGroups = {};
    dataList.forEach(item => {
        if (!shaftGroups[item.dia]) shaftGroups[item.dia] = [];
        const sizeMM = convert(item.length, item.uom, "mm");
        for(let i=0; i<item.qty; i++) shaftGroups[item.dia].push({ ...item, sizeMM });
    });

    let html = `<h2 style="text-align:center; margin-top:30px; color:#007bff;">Optimized Cutting Report</h2>`;

    Object.keys(shaftGroups).forEach(dia => {
        let shafts = shaftGroups[dia].sort((a, b) => b.sizeMM - a.sizeMM);
        let stock = rawBars.filter(b => b.dia == dia).map(b => ({ ...b, rem: b.lengthMM, cuts: [] }));

        if (stock.length === 0) {
            html += `<p style="color:red; padding:10px; border:1px solid red;">⚠️ Error: ${dia}mm ka stock available nahi hai.</p>`;
            return;
        }

        shafts.forEach(s => {
            let placed = false;
            for (let b of stock) {
                if (b.rem >= s.sizeMM) {
                    b.cuts.push(s);
                    b.rem -= s.sizeMM;
                    placed = true; break;
                }
            }
            if (!placed) html += `<p style="color:orange;">⚠️ Stock limited: ${s.model} fit nahi hua.</p>`;
        });

        html += `<div style="margin-top:20px;"><div style="background:#007bff; color:white; padding:10px; font-weight:bold; border-radius:5px 5px 0 0;">DIAMETER: ${dia} mm</div>`;

        stock.forEach((bar, idx) => {
            if (bar.cuts.length === 0) return;
            let summary = {};
            bar.cuts.forEach(c => { summary[c.model] = (summary[c.model] || 0) + 1; });

            html += `
                <div style="border:1px solid #ddd; padding:15px; background:white; margin-bottom:10px;">
                    <b>Stock Bar #${idx + 1} (${bar.length} ${bar.uom})</b>
                    <ul>${Object.keys(summary).map(m => `<li>${m}: ${summary[m]} pcs</li>`).join("")}</ul>
                    <small>Used: ${(bar.lengthMM - bar.rem).toFixed(2)}mm | Scrap: <span style="color:red;">${bar.rem.toFixed(2)}mm</span></small>
                </div>`;
        });
        html += `</div>`;
    });
    resDiv.innerHTML = html;
}
