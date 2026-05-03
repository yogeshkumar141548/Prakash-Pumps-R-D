const units = { mm: 1, cm: 10, m: 1000, inch: 25.4, ft: 304.8, yard: 914.4 };

// Excel Data[cite: 1]
const excelData = [
    {'m': 'PSMC-150-5.5', 'd': 40.0, 'l': 125.0}, {'m': 'PSMC-150-7.5', 'd': 40.0, 'l': 200.0}, {'m': 'PSMC-150-10', 'd': 40.0, 'l': 240.0}, {'m': 'PSMC-150-12.5', 'd': 40.0, 'l': 280.0}, {'m': 'PSMC-150-15', 'd': 40.0, 'l': 300.0}, {'m': 'PSMC-150-17.5', 'd': 40.0, 'l': 360.0}, {'m': 'PSMC-150-20', 'd': 40.0, 'l': 400.0}, {'m': 'PSMC-150-25', 'd': 42.0, 'l': 450.0}, {'m': 'PSMC-150-30', 'd': 42.0, 'l': 525.0}, {'m': 'PSMC-150-35', 'd': 45.0, 'l': 580.0}, {'m': 'PSMC-150-40', 'd': 45.0, 'l': 700.0}, {'m': 'PSMC-150-50', 'd': 45.0, 'l': 800.0}, {'m': 'PSMC-150-60', 'd': 45.0, 'l': 900.0}, {'m': 'PSMP-150-5.5', 'd': 40.0, 'l': 125.0}, {'m': 'PSMP-150-7.5', 'd': 40.0, 'l': 200.0}, {'m': 'PSMP-150-10', 'd': 40.0, 'l': 230.0}, {'m': 'PSMP-150-12.5', 'd': 40.0, 'l': 280.0}, {'m': 'PSMP-150-15', 'd': 40.0, 'l': 300.0}, {'m': 'PSMP-150-17.5', 'd': 40.0, 'l': 360.0}, {'m': 'PSMP-150-20', 'd': 40.0, 'l': 400.0}, {'m': 'PSMP-150-25', 'd': 42.0, 'l': 450.0}, {'m': 'PSMP-150-30', 'd': 42.0, 'l': 525.0}, {'m': 'PSMP-100-0.75', 'd': 32.0, 'l': 135.0}, {'m': 'PSMP-100-3', 'd': 32.0, 'l': 280.0}, {'m': 'PSMP-100-3(s)', 'd': 32.0, 'l': 320.0}, {'m': 'PSMP-100-4', 'd': 32.0, 'l': 320.0}, {'m': 'PSMP-100-5.5', 'd': 32.0, 'l': 380.0}, {'m': 'PSMP-100-7.5', 'd': 32.0, 'l': 420.0}, {'m': 'PSMC-125-5.5', 'd': 38.0, 'l': 280.0}, {'m': 'PSMC-125-7.5', 'd': 38.0, 'l': 320.0}, {'m': 'PSMC-125-10', 'd': 38.0, 'l': 400.0}, {'m': 'PSMP-200-50', 'd': 56.0, 'l': 550.0}, {'m': 'PSMP-200-60', 'd': 56.0, 'l': 600.0}, {'m': 'PSMP-200-75', 'd': 56.0, 'l': 700.0}, {'m': 'PSMP-200-85', 'd': 56.0, 'l': 800.0}, {'m': 'PSMP-200-100', 'd': 56.0, 'l': 875.0}, {'m': 'PSMC-200-50', 'd': 56.0, 'l': 550.0}, {'m': 'PSMC-200-60', 'd': 56.0, 'l': 600.0}, {'m': 'PSMC-200-75', 'd': 56.0, 'l': 700.0}, {'m': 'PSMC-200-80', 'd': 56.0, 'l': 800.0}, {'m': 'PSMC-200-85', 'd': 56.0, 'l': 800.0}, {'m': 'PSMC-200-90', 'd': 56.0, 'l': 800.0}, {'m': 'PSMC-200-100', 'd': 56.0, 'l': 875.0}, {'m': 'PSMC-200-125', 'd': 56.0, 'l': 950.0}
];

let dataList = JSON.parse(localStorage.getItem("models")) || [];
let editIndex = -1;

window.onload = function() {
    fillUnits();
    renderTable();
    loadModelDropdown();
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

function addData() {
    const m = document.getElementById("model").value.trim();
    const d = parseFloat(document.getElementById("diameter").value);
    const l = parseFloat(document.getElementById("length").value);
    const u = document.getElementById("uom").value;
    const q = parseInt(document.getElementById("qty").value) || 1;

    if (!m || isNaN(l) || isNaN(d)) return alert("Saari details bharein.");

    const newData = { model: m, dia: d, length: l, uom: u, qty: q };

    if (editIndex === -1) dataList.push(newData);
    else { dataList[editIndex] = newData; editIndex = -1; document.getElementById("addBtn").textContent = "Add / Update"; }

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
    table.innerHTML = dataList.map((item, index) => `
        <tr>
            <td><strong>${item.model}</strong></td>
            <td>${item.dia} mm</td>
            <td>${item.length}</td>
            <td>${item.uom}</td>
            <td>${item.qty} pcs</td>
            <td>
                <button onclick="editData(${index})" class="btn-sm btn-warning" style="background:#ffc107; padding:5px 10px; border:none; border-radius:4px;">Edit</button>
                <button onclick="deleteData(${index})" class="btn-sm btn-danger" style="background:#dc3545; color:white; padding:5px 10px; border:none; border-radius:4px;">Del</button>
            </td>
        </tr>
    `).join("");
}

function editData(i) {
    const item = dataList[i];
    document.getElementById("model").value = item.model;
    document.getElementById("diameter").value = item.dia;
    document.getElementById("length").value = item.length;
    document.getElementById("uom").value = item.uom;
    document.getElementById("qty").value = item.qty;
    editIndex = i;
    document.getElementById("addBtn").textContent = "Update Model";
}

function deleteData(i) { if(confirm("Delete?")) { dataList.splice(i, 1); saveAndRefresh(); } }

function saveAndRefresh() {
    localStorage.setItem("models", JSON.stringify(dataList));
    renderTable();
}

// Final Diameter-wise Table Optimization Logic
function perfectOptimize() {
    const barIn = parseFloat(document.getElementById("barLength").value);
    const barU = document.getElementById("barUnit").value;
    const resDiv = document.getElementById("result");

    if (isNaN(barIn) || dataList.length === 0) return alert("Bar length aur models check karein.");

    const barMM = convert(barIn, barU, "mm");
    
    // Grouping by Diameter
    const groups = {};
    dataList.forEach(item => {
        if (!groups[item.dia]) groups[item.dia] = [];
        const sizeMM = convert(item.length, item.uom, "mm");
        for(let i=0; i<item.qty; i++) groups[item.dia].push({ ...item, sizeMM });
    });

    let html = `<h3 style="margin-top:30px; color:var(--primary); text-align:center;">📊 Optimized Cutting Plan (Diameter Wise)</h3>`;

    Object.keys(groups).forEach(dia => {
        let items = groups[dia].sort((a, b) => b.sizeMM - a.sizeMM);
        let bars = [];

        items.forEach(item => {
            let placed = false;
            for (let b of bars) {
                if (b.rem >= item.sizeMM) {
                    b.cuts.push(item);
                    b.rem -= item.sizeMM;
                    placed = true; break;
                }
            }
            if (!placed) bars.push({ total: barMM, rem: barMM - item.sizeMM, cuts: [item] });
        });

        html += `
            <div style="margin-top:40px;">
                <div style="background:#007bff; color:white; padding:10px 15px; border-radius:8px 8px 0 0; font-weight:bold;">
                    🔵 FOR ROUND BAR DIAMETER: ${dia} mm
                </div>
                <div style="background:#f1f1f1; padding:10px; border:1px solid #007bff; border-top:none;">
                    Total Bars Required for ${dia}mm: <strong>${bars.length}</strong>
                </div>`;

        bars.forEach((bar, idx) => {
            let barSummary = {};
            bar.cuts.forEach(c => {
                let key = `${c.model}|${c.length}|${c.uom}`;
                barSummary[key] = (barSummary[key] || 0) + 1;
            });

            html += `
                <div style="margin-bottom: 25px; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; margin-top:15px;">
                    <div style="background: #343a40; color: white; padding: 8px 15px; font-weight: bold;">
                        RAW BAR #${idx + 1} (${dia}mm)
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="padding: 10px; border: 1px solid #ddd;">Model Name</th>
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Shaft Dia</th>
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Length</th>
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Qty</th>
                            </tr>
                        </thead>
                        <tbody>`;

            Object.keys(barSummary).forEach(k => {
                const [mName, mLen, mUom] = k.split('|');
                html += `
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">${mName}</td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${dia} mm</td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${mLen} ${mUom}</td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${barSummary[k]} pcs</td>
                    </tr>`;
            });

            const usedPercent = (((bar.total - bar.rem) / bar.total) * 100).toFixed(1);

            html += `
                        </tbody>
                        <tfoot>
                            <tr style="background: #fafafa;">
                                <td colspan="4" style="padding: 12px; border: 1px solid #ddd;">
                                    <strong>Used:</strong> ${(bar.total - bar.rem).toFixed(1)}mm (${usedPercent}%) | 
                                    <strong>Scrap:</strong> <span style="color:#dc3545; font-weight:bold;">${bar.rem.toFixed(1)} mm</span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>`;
        });
        html += `</div>`;
    });

    resDiv.innerHTML = html;
}
