const units = { mm: 1, cm: 10, m: 1000, inch: 25.4, ft: 304.8, yard: 914.4 };

// Full Excel Database Restored
const excelData = [
    {'m': 'PSMC-150-5.5', 'd': 40.0, 'l': 605.0}, {'m': 'PSMC-150-7.5', 'd': 40.0, 'l': 680.0}, 
    {'m': 'PSMC-150-10', 'd': 40.0, 'l': 720.0}, {'m': 'PSMC-150-12.5', 'd': 40.0, 'l': 760.0}, 
    {'m': 'PSMC-150-15', 'd': 40.0, 'l': 780.0}, {'m': 'PSMC-150-17.5', 'd': 40.0, 'l': 840.0}, 
    {'m': 'PSMC-150-20', 'd': 40.0, 'l': 880.0}, {'m': 'PSMC-150-25', 'd': 42.0, 'l': 930.0}, 
    {'m': 'PSMC-150-30', 'd': 42.0, 'l': 1005.0}, {'m': 'PSMC-150-35', 'd': 45.0, 'l': 1077.0}, 
    {'m': 'PSMC-150-40', 'd': 45.0, 'l': 1197.0}, {'m': 'PSMC-150-50', 'd': 45.0, 'l': 1297.0}, 
    {'m': 'PSMC-150-60', 'd': 45.0, 'l': 1397.0}, {'m': 'PSMP-150-5.5', 'd': 40.0, 'l': 549.0}, 
    {'m': 'PSMP-150-7.5', 'd': 40.0, 'l': 624.0}, {'m': 'PSMP-150-10', 'd': 40.0, 'l': 654.0},
    {'m': 'PSMP-150-12.5', 'd': 40.0, 'l': 704.0}, {'m': 'PSMP-150-15', 'd': 40.0, 'l': 724.0}, 
    {'m': 'PSMP-150-17.5', 'd': 40.0, 'l': 784.0}, {'m': 'PSMP-150-20', 'd': 40.0, 'l': 824.0},
    {'m': 'PSMP-150-25', 'd': 42.0, 'l': 904.0}, {'m': 'PSMP-150-30', 'd': 42.0, 'l': 979.0}, 
    {'m': 'PSMP-100-0.75', 'd': 32.0, 'l': 469.0}, {'m': 'PSMP-100-3', 'd': 32.0, 'l': 614.0}, 
    {'m': 'PSMP-100-3(s)', 'd': 32.0, 'l': 654.0}, {'m': 'PSMP-100-4', 'd': 32.0, 'l': 654.0}, 
    {'m': 'PSMP-100-5.5', 'd': 32.0, 'l': 714.0}, {'m': 'PSMP-100-7.5', 'd': 32.0, 'l': 754.0}, 
    {'m': 'PSMC-125-5.5', 'd': 38.0, 'l': 674.0}, {'m': 'PSMC-125-7.5', 'd': 38.0, 'l': 714.0}, 
    {'m': 'PSMC-125-10', 'd': 38.0, 'l': 794.0}, {'m': 'PSMP-200-50', 'd': 56.0, 'l': 1131.0},
    {'m': 'PSMP-200-60', 'd': 56.0, 'l': 1181.0}, {'m': 'PSMP-200-75', 'd': 56.0, 'l': 1281.0}, 
    {'m': 'PSMP-200-85', 'd': 56.0, 'l': 1381.0}, {'m': 'PSMP-200-100', 'd': 56.0, 'l': 1456.0},
    {'m': 'PSMC-200-50', 'd': 56.0, 'l': 1225.0}, {'m': 'PSMC-200-60', 'd': 56.0, 'l': 1275.0}, 
    {'m': 'PSMC-200-75', 'd': 56.0, 'l': 1375.0}, {'m': 'PSMC-200-80', 'd': 56.0, 'l': 1475.0}, 
    {'m': 'PSMC-200-85', 'd': 56.0, 'l': 1475.0}, {'m': 'PSMC-200-90', 'd': 56.0, 'l': 1475.0}, 
    {'m': 'PSMC-200-100', 'd': 64.0, 'l': 1550.0}, {'m': 'PSMC-200-125', 'd': 64.0, 'l': 1625.0}
];

let dataList = JSON.parse(localStorage.getItem("models")) || [];
let rawBars = []; 
let editIndex = -1;
let rawEditIndex = -1;

window.onload = function() {
    fillUnits(); renderTable(); loadModelDropdown(); renderRawBarTable();
    cleanupOldHistory(); renderHistory();
};

function fillUnits() {
    const opts = Object.keys(units).map(k => `<option value="${k}">${k}</option>`).join("");
    document.getElementById("uom").innerHTML = opts; document.getElementById("barUnit").innerHTML = opts;
}

function loadModelDropdown() { document.getElementById("modelList").innerHTML = excelData.map(i => `<option value="${i.m}">`).join(""); }

function autoFillDetails() {
    const val = document.getElementById("model").value.trim();
    const found = excelData.find(i => i.m.toLowerCase() === val.toLowerCase());
    if (found) { document.getElementById("diameter").value = found.d; document.getElementById("length").value = found.l; document.getElementById("uom").value = "mm"; }
}

function convert(val, from, to) { return (val * units[from]) / units[to]; }

function getWeight(dia, lengthMM) {
    const density = parseFloat(document.getElementById("materialType").value) || 7.85;
    return ((Math.PI * Math.pow(dia/2, 2) * lengthMM * density) / 1000000).toFixed(3);
}

// --- ADVANCED MULTI-MODEL & COMBINED SCRAP SUGGESTER ---
function getSmartSuggestion(remMM, dia, kerf) {
    const targetDia = parseFloat(dia);
    // 1. Filter all valid models for this diameter that can fit in remaining space
    let validModels = excelData.filter(item => Math.abs(item.d - targetDia) < 0.1 && item.l <= remMM);
    
    if (validModels.length === 0) return "";

    // A. Calculate Individual Options (Single Models that can fit)
    let individualList = validModels.map(item => {
        let maxQty = Math.floor(remMM / (item.l + kerf));
        if (maxQty === 0 && remMM >= item.l) maxQty = 1; // Last piece without kerf loss
        return maxQty > 0 ? `<b>${item.m}</b> (${maxQty} pc${maxQty > 1 ? 's' : ''})` : null;
    }).filter(Boolean);

    // B. Calculate Best Combined Solution (Knapsack Mix)
    // Find combination of different models that minimizes waste
    let bestCombo = [];
    let minimumWaste = remMM;
    
    // Simple greedy approach to find a highly efficient combined cutting mix
    let currentRem = remMM;
    let comboTracker = {};
    let sortedByLength = [...validModels].sort((a, b) => b.l - a.l);

    for (let item of sortedByLength) {
        let spaceNeeded = item.l + kerf;
        while (currentRem >= spaceNeeded || (currentRem >= item.l && currentRem < spaceNeeded)) {
            comboTracker[item.m] = (comboTracker[item.m] || 0) + 1;
            if (currentRem >= spaceNeeded) {
                currentRem -= spaceNeeded;
            } else {
                currentRem -= item.l; // Last element used the absolute end of the bar
            }
        }
    }

    let combinedList = Object.keys(comboTracker).map(m => `<b>${comboTracker[m]}pc</b> of ${m}`);

    // Create the Advanced Dashboard HTML Box for Suggestions
    return `
        <div style="color:#27ae60; font-size:0.85em; text-align:left; margin-top:12px; background:#e9f7ef; padding:12px; border-radius:6px; border-left:4px solid #27ae60; box-shadow: inset 0 0 5px rgba(0,0,0,0.02);">
            <div style="font-weight:bold; margin-bottom:6px; font-size:0.95rem; display:flex; align-items:center; gap:5px;">💡 Smart Scrap Utilization Analysis:</div>
            
            <div style="margin-bottom: 5px;">
                <span style="color:#2c3e50; font-weight:600;">• Standalone Possibilities (Individually):</span> 
                <span style="color:#444;">${individualList.join(" | ")}</span>
            </div>
            
            ${combinedList.length > 0 ? `
            <div>
                <span style="color:#2c3e50; font-weight:600;">• Best Combined Production (Combo Mix):</span> 
                <span style="color:#16a085; font-weight:bold;">${combinedList.join(" + ")}</span> 
                <span style="font-size:0.9em; color:#7f8c8d;">(Leftover after Combo: ${Math.max(0, currentRem).toFixed(1)}mm)</span>
            </div>` : ''}
        </div>`;
}

// Export/Import Architecture
function exportData() {
    const backup = { models: dataList, history: JSON.parse(localStorage.getItem("prakash_cutting_history")) || [] };
    const blob = new Blob([JSON.stringify(backup)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Prakash_Backup_${new Date().toLocaleDateString()}.json`;
    a.click();
}

function importData(event) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (confirm("Importing backup will replace current data. Continue?")) {
                localStorage.setItem("models", JSON.stringify(imported.models || []));
                localStorage.setItem("prakash_cutting_history", JSON.stringify(imported.history || []));
                location.reload();
            }
        } catch(err) { alert("Invalid Backup File Format."); }
    };
    reader.readAsText(event.target.files[0]);
}

function importCSV() {
    const file = document.getElementById('csvFile').files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        e.target.result.split("\n").forEach((row, i) => {
            const cols = row.split(",");
            if (i > 0 && cols.length >= 4) dataList.push({ model: cols[0].trim(), dia: parseFloat(cols[1]), length: parseFloat(cols[2]), uom: cols[3].trim().toLowerCase(), qty: parseInt(cols[4]) || 1 });
        });
        localStorage.setItem("models", JSON.stringify(dataList)); renderTable();
    };
    reader.readAsText(file);
}

// Form Operations
function addData() {
    const m = document.getElementById("model").value.trim(), d = parseFloat(document.getElementById("diameter").value), l = parseFloat(document.getElementById("length").value), u = document.getElementById("uom").value, q = parseInt(document.getElementById("qty").value) || 1;
    if (!m || isNaN(l) || isNaN(d)) return alert("Please fill details correctly.");
    const newData = { model: m, dia: d, length: l, uom: u, qty: q };
    if (editIndex === -1) dataList.push(newData); else { dataList[editIndex] = newData; editIndex = -1; document.getElementById("addBtn").textContent = "Add Shaft"; }
    localStorage.setItem("models", JSON.stringify(dataList)); renderTable();
    clearInputs();
}

function renderTable() {
    document.getElementById("tableData").innerHTML = dataList.map((item, i) => `<tr><td>${item.model}</td><td>${item.dia}mm</td><td>${item.length} ${item.uom}</td><td>${item.uom}</td><td>${item.qty}</td><td><button onclick="editData(${i})" style="background:var(--warning)">Edit</button><button onclick="dataList.splice(${i},1);renderTable();" style="background:var(--danger);color:white">Del</button></td></tr>`).join("");
}

function editData(i) {
    const itm = dataList[i]; document.getElementById("model").value = itm.model; document.getElementById("diameter").value = itm.dia; document.getElementById("length").value = itm.length; document.getElementById("uom").value = itm.uom; document.getElementById("qty").value = itm.qty; editIndex = i; document.getElementById("addBtn").textContent = "Update Shaft";
}

function clearInputs() { document.getElementById("model").value = ""; document.getElementById("diameter").value = ""; document.getElementById("length").value = ""; }

function addRawBar() {
    const d = parseFloat(document.getElementById("barDia").value), l = parseFloat(document.getElementById("barLength").value), u = document.getElementById("barUnit").value;
    if (isNaN(d) || isNaN(l)) return alert("Enter valid stock.");
    if (rawEditIndex === -1) rawBars.push({ dia: d, length: l, uom: u, lengthMM: convert(l, u, "mm") }); else { rawBars[rawEditIndex] = { dia: d, length: l, uom: u, lengthMM: convert(l, u, "mm") }; rawEditIndex = -1; document.getElementById("addBarBtn").textContent = "Add to Stock"; }
    renderRawBarTable();
}

function renderRawBarTable() {
    document.getElementById("rawBarTable").innerHTML = rawBars.map((bar, i) => `<tr><td><b>${bar.dia}mm</b></td><td>${bar.length}</td><td>${bar.uom}</td><td><button onclick="editRawBar(${i})" style="background:var(--warning)">Edit</button><button onclick="rawBars.splice(${i},1);renderRawBarTable();" style="background:var(--danger);color:white">Del</button></td></tr>`).join("");
}

function editRawBar(i) {
    const b = rawBars[i]; document.getElementById("barDia").value = b.dia; document.getElementById("barLength").value = b.length; document.getElementById("barUnit").value = b.uom; rawEditIndex = i; document.getElementById("addBarBtn").textContent = "Update Bar";
}

// Unified History Sync Tracking
function saveToHistory(html) {
    let hist = JSON.parse(localStorage.getItem("prakash_cutting_history")) || [];
    hist.unshift({ id: Date.now(), date: new Date().toLocaleString(), timestamp: Date.now(), data: html });
    localStorage.setItem("prakash_cutting_history", JSON.stringify(hist)); renderHistory();
}

function renderHistory() {
    const hist = JSON.parse(localStorage.getItem("prakash_cutting_history")) || [];
    document.getElementById("historyList").innerHTML = hist.length ? hist.map(i => `<div style="background:#fff;padding:10px;margin-bottom:8px;border:1px solid #ddd;display:flex;justify-content:space-between;align-items:center;border-radius:6px;"><div><b>${i.date}</b></div><div><button onclick="viewHistory(${i.id})" style="background:var(--success);color:white;margin-right:5px;">View</button><button onclick="deleteHistory(${i.id})" style="background:var(--danger);color:white">Del</button></div></div>`).join("") : "<p style='text-align:center;color:#888;'>No calculation history.</p>";
}

function viewHistory(id) { const hist = JSON.parse(localStorage.getItem("prakash_cutting_history")) || [], item = hist.find(i => i.id === id); if (item) { document.getElementById("result").innerHTML = item.data; document.getElementById("result").scrollIntoView({ behavior: 'smooth' }); } }
function deleteHistory(id) { if (confirm("Delete this report entry?")) { let hist = JSON.parse(localStorage.getItem("prakash_cutting_history")) || []; hist = hist.filter(i => i.id !== id); localStorage.setItem("prakash_cutting_history", JSON.stringify(hist)); renderHistory(); } }
function clearAllHistory() { if (confirm("Warning: Delete ALL saved history?")) { localStorage.removeItem("prakash_cutting_history"); renderHistory(); } }
function cleanupOldHistory() {
    let hist = JSON.parse(localStorage.getItem("prakash_cutting_history")) || [];
    const now = Date.now(), filtered = hist.filter(i => (now - i.timestamp) < (30 * 86400000));
    localStorage.setItem("prakash_cutting_history", JSON.stringify(filtered));
}

// Master Optimization Algorithm (Format Fully Restored)
function perfectOptimize() {
    const resDiv = document.getElementById("result"), kerf = parseFloat(document.getElementById("kerf").value) || 0;
    if (!dataList.length || !rawBars.length) return alert("Please add requirements and stock first.");
    
    const groups = {};
    dataList.forEach(it => { if (!groups[it.dia]) groups[it.dia] = []; const sMM = convert(it.length, it.uom, "mm"); for(let i=0; i<it.qty; i++) groups[it.dia].push({ ...it, sMM }); });
    
    let html = `<div style="text-align:center;border-bottom:2px solid #333;padding-bottom:10px;margin-bottom:20px;"><h2>PRAKASH PUMPS - R&D REPORT</h2><p>Blade Kerf: ${kerf}mm</p></div>`, found = false;
    
    Object.keys(groups).forEach(dia => {
        let shafts = groups[dia].sort((a,b) => b.sMM - a.sMM), stock = rawBars.filter(b => b.dia == dia).map(b => ({ ...b, rem: b.lengthMM, cuts: [] }));
        if (!stock.length) return; found = true;
        
        shafts.forEach(s => { for (let b of stock) { if (b.rem >= (s.sMM + kerf)) { b.cuts.push(s); b.rem -= (s.sMM + kerf); return; } } });
        
        html += `<h3 style="background:var(--primary);color:white;padding:10px;border-radius:4px;margin-top:25px;">DIAMETER: ${dia}MM</h3>`;
        
        stock.forEach((b, idx) => {
            if (!b.cuts.length) return;
            let vis = `<div class="visual-bar">`, sum = {}, barW = getWeight(dia, b.lengthMM);
            
            b.cuts.forEach(c => { 
                sum[c.model] = (sum[c.model] || 0) + 1; 
                let w = (c.sMM/b.lengthMM)*100, kw = (kerf/b.lengthMM)*100; 
                vis += `<div class="cut-segment" style="width:${w}%;background:hsl(${(idx*60+200)%360},65%,45%)">${c.sMM}</div>`; 
                if(kerf>0) vis += `<div class="kerf-segment" style="width:${kw}%"></div>`; 
            });
            vis += `</div>`;
            
            const barTotalWeight = getWeight(dia, b.lengthMM);
            const usedMM = b.lengthMM - b.rem;
            const usedWeight = getWeight(dia, usedMM);
            const scrapWeight = (barTotalWeight - usedWeight).toFixed(3);

            html += `<div style="border:1px solid #ddd;padding:15px;margin-bottom:20px;background:#fff;page-break-inside:avoid;border-radius:8px;box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                        <p style="margin:0 0 5px 0;font-size:1.05rem;"><b>BAR #${idx+1}</b> (${b.length} ${b.uom})</p>
                        <p style="font-size:0.85em; color:#666; margin:0 0 12px 0;">Total Bar Weight: ${barTotalWeight} Kg | Used: ${usedWeight} Kg | Scrap: ${scrapWeight} Kg</p>
                        ${vis}
                        <table style="width:100%;border-collapse:collapse;margin-top:10px;">
                            <thead>
                                <tr style="background:#f4f6f7;"><th style="border:1px solid #ddd;padding:10px;">Model Name</th><th style="border:1px solid #ddd;padding:10px;">Quantity</th><th style="border:1px solid #ddd;padding:10px;">Total Weight</th></tr>
                            </thead>
                            <tbody>
                            ${Object.keys(sum).map(k => {
                                const matchingShaft = b.cuts.find(c => c.model === k);
                                const sWeight = (getWeight(dia, matchingShaft.sMM) * sum[k]).toFixed(3);
                                return `<tr><td style="border:1px solid #ddd;padding:10px;">${k}</td><td style="border:1px solid #ddd;padding:10px;">${sum[k]} pcs</td><td style="border:1px solid #ddd;padding:10px;">${sWeight} Kg</td></tr>`;
                            }).join("")}
                            <tr style="background:#fff5f5;">
                                <td colspan="2" style="border:1px solid #ddd;padding:10px;text-align:right;"><b>Remaining Scrap (Length):</b></td>
                                <td style="border:1px solid #ddd;padding:10px;color:red;font-weight:bold;">${b.rem.toFixed(1)} mm</td>
                            </tr>
                            </tbody>
                        </table>
                        ${getSmartSuggestion(b.rem, dia, kerf)}
                    </div>`;
        });
    });
    
    if (!found) {
        resDiv.innerHTML = "<p style='color:red;text-align:center;font-weight:bold;'>⚠️ Stock Mismatch: Input bars diameter matching with requirement not found.</p>";
    } else {
        resDiv.innerHTML = html;
        saveToHistory(html);
    }
}
