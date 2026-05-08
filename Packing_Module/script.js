let itemsData = {};
const containers = {
    "20ft": { w: 235, h: 239, cap: 33.2 },
    "40ft": { w: 235, h: 269, cap: 76.4 }
};

function addAndPack() {
    const m = document.getElementById('mName').value.toUpperCase().trim();
    const l = parseFloat(document.getElementById('pL').value);
    const w = parseFloat(document.getElementById('pW').value);
    const h = parseFloat(document.getElementById('pH').value);
    const q = parseInt(document.getElementById('pQty').value);

    if (!m || isNaN(q) || isNaN(l)) {
        alert("Enter all details correctly!");
        return;
    }

    itemsData[m] = { l, w, h, qty: q };
    runOptimization();
    document.getElementById('pQty').value = '';
    document.getElementById('mName').focus();
}

function editItem(name) {
    const itm = itemsData[name];
    document.getElementById('mName').value = name;
    document.getElementById('pL').value = itm.l;
    document.getElementById('pW').value = itm.w;
    document.getElementById('pH').value = itm.h;
    document.getElementById('pQty').value = itm.qty;
}

function deleteItem(name) {
    if(confirm(`Remove ${name}?`)) {
        delete itemsData[name];
        runOptimization();
    }
}

function runOptimization() {
    const tbody = document.getElementById('tableData');
    const front = document.getElementById('frontView');
    const top = document.getElementById('topView');
    const cType = document.getElementById('contType').value;
    const config = containers[cType];
    
    tbody.innerHTML = ''; front.innerHTML = ''; top.innerHTML = '';
    let totalUsedCBM = 0;

    for (let name in itemsData) {
        let itm = itemsData[name];
        
        let rStd = Math.floor(1140 / itm.w) || 1; 
        let cStd = Math.floor(780 / itm.h) || 1;
        let lStd = Math.floor(950 / itm.l) || 1;
        let fullQtyPerCrate = rStd * cStd * lStd;

        let numFullCrates = Math.floor(itm.qty / fullQtyPerCrate);
        let remainingQty = itm.qty % fullQtyPerCrate;

        const createRow = (isRes, q, row, col, lay, isFirst) => {
            let crateL = ((itm.l * lay) + 40) / 10;
            let crateW = ((itm.w * row) + 40) / 10;
            let crateH = ((itm.h * col) + 40) / 10;
            let vol = (crateL * crateW * crateH) / 1000000;
            totalUsedCBM += vol;

            let oversize = (crateW > config.w || crateH > config.h);
            let inch = `${(crateL/2.54).toFixed(1)}"x${(crateW/2.54).toFixed(1)}"x${(crateH/2.54).toFixed(1)}"`;

            tbody.innerHTML += `
                <tr class="bg-white">
                    <td class="p-5">
                        <div class="model-name">${name}</div>
                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            ${isRes ? '⚠️ Residual Crate' : '✅ Standard Crate'}
                        </div>
                    </td>
                    <td class="p-5 text-center">
                        <div class="inch-text font-mono">${inch}</div>
                    </td>
                    <td class="p-5 text-center">
                        <div class="arrangement-badge">${lay} x ${row} x ${col}</div>
                    </td>
                    <td class="p-5 text-center">
                        <div class="text-xl font-black text-slate-700">${q}</div>
                        <div class="text-[9px] font-bold text-slate-400">PIECES</div>
                    </td>
                    <td class="p-5 text-right">
                        ${isFirst ? `
                            <button onclick="editItem('${name}')" class="btn-action edit-btn mr-2">EDIT</button>
                            <button onclick="deleteItem('${name}')" class="btn-action del-btn">DEL</button>
                        ` : ''}
                    </td>
                </tr>
            `;

            // Boxes for Visualizer
            const b = document.createElement('div');
            b.className = `crate-unit ${isRes ? 'residual-unit' : ''} ${oversize ? 'oversize-unit' : ''}`;
            b.style.width = '45%'; b.style.height = isRes ? '40px' : '70px';
            b.innerHTML = `<span>${name}</span><span>${q} PCS</span>`;
            front.appendChild(b);
            top.appendChild(b.cloneNode(true));
        };

        for(let i=0; i<numFullCrates; i++) createRow(false, fullQtyPerCrate, rStd, cStd, lStd, i===0);
        if(remainingQty > 0) {
            let resC = Math.ceil(remainingQty / (rStd * lStd));
            if (resC > cStd) resC = cStd;
            createRow(true, remainingQty, rStd, resC, lStd, numFullCrates===0);
        }
    }

    // Update Stats
    document.getElementById('usedCBM').innerText = totalUsedCBM.toFixed(2);
    document.getElementById('freeCBM').innerText = (config.cap - totalUsedCBM).toFixed(2);
    let p = (totalUsedCBM / config.cap * 100).toFixed(1);
    document.getElementById('loadPerc').innerText = p + "%";
    document.getElementById('percBox').className = p > 90 ? "bg-red-900 p-5 rounded-2xl border-b-4 border-red-500 shadow-sm" : "bg-slate-900 p-5 rounded-2xl border-b-4 border-green-500 shadow-sm text-white";
}

function resetData() { 
    if(confirm("Confirm Delete All?")) { itemsData = {}; runOptimization(); }
}
