let itemsData = {};
const containers = { 
    "20ft": { w: 235, h: 239, cap: 28.0 }, 
    "40ft": { w: 235, h: 269, cap: 76.4 } 
};

function addAndPack() {
    const m = document.getElementById('mName').value.toUpperCase().trim();
    const l = parseFloat(document.getElementById('pL').value), 
          w = parseFloat(document.getElementById('pW').value), 
          h = parseFloat(document.getElementById('pH').value), 
          q = parseInt(document.getElementById('pQty').value);

    if (!m || isNaN(q)) return;
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
    const tbody = document.getElementById('tableData'), 
          front = document.getElementById('frontView'), 
          top = document.getElementById('topView'), 
          cType = document.getElementById('contType').value, 
          config = containers[cType];
    
    tbody.innerHTML = ''; 
    front.innerHTML = ''; 
    top.innerHTML = '';
    let totalCBM = 0;

    for (let name in itemsData) {
        let itm = itemsData[name];
        let rS = Math.floor(1140/itm.w)||1, 
            cS = Math.floor(780/itm.h)||1, 
            lS = Math.floor(950/itm.l)||1;
        let fullQ = rS * cS * lS;
        let numFull = Math.floor(itm.qty / fullQ), 
            remQ = itm.qty % fullQ;

        const draw = (isR, q, r, c, l, isF) => {
            let cL = (itm.l*l+40)/10, 
                cW = (itm.w*r+40)/10, 
                cH = (itm.h*c+40)/10, 
                vol = (cL*cW*cH)/1000000;
            totalCBM += vol;
            let inch = `${(cL/2.54).toFixed(1)}x${(cW/2.54).toFixed(1)}x${(cH/2.54).toFixed(1)}`;
            
            tbody.innerHTML += `
                <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-6 table-text-model">${name}</td>
                    <td class="p-6 table-text-normal text-black">${inch}"</td>
                    <td class="p-6 text-center"><span class="badge-arrangement">${l}x${r}x${c}</span></td>
                    <td class="p-6 text-center table-text-normal">${q}</td>
                    <td class="p-6 text-right">
                        ${isF ? `
                            <button onclick="editItem('${name}')" class="text-blue-600 font-bold text-[10px] uppercase mr-4">Edit</button>
                            <button onclick="deleteItem('${name}')" class="text-red-400 font-bold text-[10px] uppercase">Del</button>
                        ` : ''}
                    </td>
                </tr>`;
            
            const box = document.createElement('div');
            box.className = `crate-unit ${isR?'residual-unit':''}`;
            box.style.width = '45%'; 
            box.style.height = isR ? '55px' : '90px';
            box.innerHTML = `<span class="uppercase">${name}</span><span class="text-[8px] opacity-60">${q} PCS</span>`;
            front.appendChild(box); 
            top.appendChild(box.cloneNode(true));
        };

        for(let i=0; i<numFull; i++) draw(false, fullQ, rS, cS, lS, i===0);
        if(remQ > 0) draw(true, remQ, rS, Math.ceil(remQ/(rS*lS)), lS, numFull===0);
    }
    document.getElementById('usedCBM').innerText = totalCBM.toFixed(2);
    document.getElementById('freeCBM').innerText = (config.cap - totalCBM).toFixed(2);
    document.getElementById('loadPerc').innerText = (totalCBM / config.cap * 100).toFixed(1) + "%";
}
