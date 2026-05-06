let productList = [];
const containerSpecs = {
    '20ft': { l: 5898, w: 2352, h: 2393 },
    '40ft': { l: 12032, w: 2352, h: 2393 }
};

// 1. Add Product to List
document.getElementById('addBtn').addEventListener('click', () => {
    const name = document.getElementById('pName').value;
    const l = parseFloat(document.getElementById('pL').value);
    const w = parseFloat(document.getElementById('pW').value);
    const h = parseFloat(document.getElementById('pH').value);
    const qty = parseInt(document.getElementById('pQty').value);

    if (!name || isNaN(l) || isNaN(qty)) {
        alert("Kripya product ki poori jaankari bharein!");
        return;
    }

    productList.push({ name, l, w, h, qty });
    renderList();
    clearInputs();
    // Jaise hi naya item add ho, purana result hide kar dein
    document.getElementById('resultArea').style.display = 'none';
});

function renderList() {
    const body = document.getElementById('productTableBody');
    body.innerHTML = '';
    productList.forEach((p, i) => {
        body.innerHTML += `<tr>
            <td>${i+1}</td>
            <td>${p.name}</td>
            <td>${p.qty}</td>
            <td>${p.l}x${p.w}x${p.h}</td>
            <td>
                <button onclick="editProd(${i})" style="background:#ffc107; color:#000;">Edit</button>
                <button onclick="removeProd(${i})" style="background:#dc3545;">Remove</button>
            </td>
        </tr>`;
    });
}

// 2. Edit Function: Data wapas boxes mein bhejta hai
function editProd(i) {
    const p = productList[i];
    document.getElementById('pName').value = p.name;
    document.getElementById('pL').value = p.l;
    document.getElementById('pW').value = p.w;
    document.getElementById('pH').value = p.h;
    document.getElementById('pQty').value = p.qty;
    removeProd(i); // Edit ke liye purana item hata dete hain
}

// 3. Remove Function: List se item delete karna[cite: 6]
function removeProd(i) {
    productList.splice(i, 1);
    renderList();
    document.getElementById('resultArea').style.display = 'none'; // List update hone par result hide karein
}

// 4. Calculate Button: Packing logic apply karta hai[cite: 5, 6]
document.getElementById('calcBtn').addEventListener('click', () => {
    if (productList.length === 0) {
        alert("Pehle list mein products add karein!");
        return;
    }

    const selectedContainer = document.getElementById('containerSize').value;
    const container = containerSpecs[selectedContainer];
    const rBody = document.getElementById('resultTableBody');
    
    document.getElementById('resultArea').style.display = 'block';
    rBody.innerHTML = '';

    productList.forEach((p, i) => {
        // Crate Optimization Logic
        let maxL = 1100, maxW = 1100, maxH = 1000;
        let fitsL = Math.floor(maxL / p.l) || 1;
        let fitsW = Math.floor(maxW / p.w) || 1;
        let fitsH = Math.floor(maxH / p.h) || 1;

        let pcsPerCrate = fitsL * fitsW * fitsH;
        let totalCrates = Math.ceil(p.qty / pcsPerCrate);
        
        // Auto-calculating Inner Crate Size
        let innerL = (fitsL * p.l) + 15;
        let innerW = (fitsW * p.w) + 15;
        let innerH = (fitsH * p.h) + 15;

        // Container Status Check
        let status = (innerL <= container.l && innerW <= container.w) ? "green-dot" : "red-dot";

        rBody.innerHTML += `<tr>
            <td>${i+1}</td>
            <td>${p.name}</td>
            <td>${innerL}x${innerW}x${innerH}</td>
            <td>${pcsPerCrate}</td>
            <td>${totalCrates}</td>
            <td><span class="status-dot ${status}"></span></td>
        </tr>`;
    });
});

function clearInputs() {
    document.getElementById('pName').value = '';
    document.getElementById('pL').value = '';
    document.getElementById('pW').value = '';
    document.getElementById('pH').value = '';
    document.getElementById('pQty').value = '';
}