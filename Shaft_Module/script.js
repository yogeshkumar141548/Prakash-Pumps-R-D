const units = { mm: 1, cm: 10, m: 1000, inch: 25.4, ft: 304.8, yard: 914.4 };
let dataList = JSON.parse(localStorage.getItem("models")) || [];
let editIndex = -1;

window.onload = function() {
    fillUnits();
    renderTable();
};

function fillUnits() {
    const u = document.getElementById("uom");
    const b = document.getElementById("barUnit");
    if (!u || !b) return;
    const options = Object.keys(units).map(k => `<option value="${k}">${k}</option>`).join("");
    u.innerHTML = options;
    b.innerHTML = options;
}

function convert(val, from, to) {
    return (val * units[from]) / units[to];
}

function addData() {
    const m = document.getElementById("model").value.trim();
    const l = parseFloat(document.getElementById("length").value);
    const u = document.getElementById("uom").value;
    const q = parseInt(document.getElementById("qty").value) || 1;

    if (!m || isNaN(l) || l <= 0) {
        alert("Sahi Model Name aur Length bharein.");
        return;
    }

    const newData = { model: m, length: l, uom: u, qty: q };

    if (editIndex === -1) {
        const existingIdx = dataList.findIndex(item => item.model.toLowerCase() === m.toLowerCase());
        if (existingIdx !== -1) {
            if (confirm("Model pehle se hai. Update karein?")) {
                dataList[existingIdx] = newData;
            } else { return; }
        } else {
            dataList.push(newData);
        }
    } else {
        dataList[editIndex] = newData;
        editIndex = -1;
        document.getElementById("addBtn").textContent = 'Add / Update';
    }

    saveAndRefresh();
    document.getElementById("model").value = "";
    document.getElementById("length").value = "";
    document.getElementById("qty").value = "1";
}

function renderTable() {
    const table = document.getElementById("tableData");
    if (!table) return;
    table.innerHTML = dataList.map((item, index) => `
        <tr>
            <td><strong>${item.model}</strong></td>
            <td>${item.length}</td>
            <td>${item.uom}</td>
            <td>${item.qty} pcs</td>
            <td>
                <button onclick="editData(${index})" class="btn-sm btn-warning">Edit</button>
                <button onclick="deleteData(${index})" class="btn-sm btn-danger">Del</button>
            </td>
        </tr>
    `).join("");
}

function editData(index) {
    const item = dataList[index];
    document.getElementById("model").value = item.model;
    document.getElementById("length").value = item.length;
    document.getElementById("uom").value = item.uom;
    document.getElementById("qty").value = item.qty;
    editIndex = index;
    document.getElementById("addBtn").textContent = 'Update Model';
}

function deleteData(index) {
    if(confirm("Delete karein?")) {
        dataList.splice(index, 1);
        saveAndRefresh();
    }
}

function saveAndRefresh() {
    localStorage.setItem("models", JSON.stringify(dataList));
    renderTable();
}

// Optimization Logic with Table Format Result
function perfectOptimize() {
    const barInput = parseFloat(document.getElementById("barLength").value);
    const barUnit = document.getElementById("barUnit").value;
    const resDiv = document.getElementById("result");

    if (isNaN(barInput) || barInput <= 0 || dataList.length === 0) {
        alert("Pehle Raw Bar ki length daalein aur Models add karein.");
        return;
    }

    const barMM = convert(barInput, barUnit, "mm");
    let itemsToProcess = [];

    dataList.forEach(item => {
        const sizeMM = convert(item.length, item.uom, "mm");
        if (sizeMM > barMM) {
            alert(`Error: ${item.model} raw bar se bada hai!`);
            return;
        }
        for(let i=0; i < item.qty; i++) {
            itemsToProcess.push({ 
                name: item.model, 
                size: sizeMM, 
                originalLen: item.length, 
                uom: item.uom 
            });
        }
    });

    // Step 1: Sorting (FFD Algorithm)
    itemsToProcess.sort((a, b) => b.size - a.size);

    // Step 2: Bin Packing
    let barsUsed = [];
    itemsToProcess.forEach(item => {
        let placed = false;
        for (let bar of barsUsed) {
            if (bar.remaining >= item.size) {
                bar.cuts.push(item);
                bar.remaining -= item.size;
                placed = true;
                break;
            }
        }
        if (!placed) {
            barsUsed.push({ total: barMM, remaining: barMM - item.size, cuts: [item] });
        }
    });

    const totalScrap = barsUsed.reduce((sum, b) => sum + b.remaining, 0);

    // Step 3: Detailed Table UI
    let html = `<h3 style="margin-top:30px; color:var(--primary);">📊 Optimization Report</h3>
        <div style="background:#fff; padding:15px; border-radius:8px; border:1px solid #ddd; margin-bottom:25px;">
            <p>Total Raw Bars Needed: <strong>${barsUsed.length}</strong></p>
            <p>Total Scrap: <strong class="waste-text">${totalScrap.toFixed(1)} mm</strong></p>
        </div>
        <h4>Detailed Cutting Plan (Table View)</h4>`;

    barsUsed.forEach((bar, idx) => {
        const usedMM = bar.total - bar.remaining;
        const usedPercent = ((usedMM / bar.total) * 100).toFixed(1);
        const scrapPercent = (100 - usedPercent).toFixed(1);

        let barSummary = {};
        bar.cuts.forEach(c => {
            let key = `${c.name}|${c.originalLen}|${c.uom}`;
            if(!barSummary[key]) {
                barSummary[key] = { name: c.name, len: c.originalLen, unit: c.uom, qty: 0 };
            }
            barSummary[key].qty++;
        });

        let totalItemsInBar = bar.cuts.length;

        html += `
            <div style="margin-bottom: 30px; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #ccc;">
                <div style="background: var(--primary); color: white; padding: 10px 15px; font-weight: bold;">
                    RAW BAR #${idx + 1} (Total: ${convert(bar.total, 'mm', barUnit).toFixed(1)} ${barUnit})
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f2f2f2;">
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Model Name</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Length</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Unit</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Qty</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Total Items</th>
                        </tr>
                    </thead>
                    <tbody>`;

        let summaryKeys = Object.keys(barSummary);
        summaryKeys.forEach((key, sIdx) => {
            const item = barSummary[key];
            html += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.len}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.unit}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.qty}</td>
                    ${sIdx === 0 ? `<td rowspan="${summaryKeys.length}" style="padding: 10px; border: 1px solid #ddd; text-align: center; font-weight: bold; background: #fafafa; vertical-align: middle;">${totalItemsInBar}</td>` : ''}
                </tr>`;
        });

        html += `
                    </tbody>
                    <tfoot>
                        <tr style="background: #f9f9f9; font-size: 0.85rem;">
                            <td colspan="5" style="padding: 12px; border: 1px solid #ddd;">
                                <strong>Efficiency:</strong> ${usedPercent}% | 
                                <strong>Scrap:</strong> <span class="waste-text">${bar.remaining.toFixed(1)} mm</span> (${scrapPercent}%)
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>`;
    });

    resDiv.innerHTML = html;
}