let globalPaperFingerprints = [];

function syncAll() {
    const fieldMap = {
        'acadYear': 'v-acadyear',
        'regulation': 'v-regulation',
        'branch': 'v-branch',
        'yearSem': 'v-yearsem',
        'subjNameCode': 'v-subj',
        'midTerm': 'v-midterm',
        'maxMarks': 'v-maxmarks',
        'duration': 'v-duration',
        'qpSet': 'v-qpset',
        'partAInst': 'v-partAInst',
        'partAMarks': 'v-partAMarks',
        'partBInst': 'v-partBInst',
        'partBMarks': 'v-partBMarks'
    };

    for (let inputId in fieldMap) {
        const input = document.getElementById(inputId);
        const target = document.getElementById(fieldMap[inputId]);
        if (input && target) {
            let val = input.value;
            if (inputId.includes('Marks') && !inputId.includes('max') && val) {
                target.innerText = "Marks " + val;
            } else {
                target.innerText = val || '---';
            }
        }
    }
}

function addQuestion() {
    const text = document.getElementById('qText').value.trim();
    const num = document.getElementById('qNum').value;
    const co = document.getElementById('co').value;
    const l = document.getElementById('blooms').value;
    const m = document.getElementById('marks').value;
    const tableId = document.getElementById('partSelect').value;

    if (!text || !num) return;

    // Tokenize for redundancy check
    const noise = ["what", "are", "is", "the", "give", "details", "about", "variety", "different", "of", "and", "with", "write", "explain", "define", "various"];
    let tokens = text.toLowerCase().replace(/[?!.,]/g, "").split(/\s+/).filter(word => !noise.includes(word) && word.length > 1).map(word => word.replace(/s\b/g, "")); 
    const currentFingerprint = tokens.sort().join(" ");

    if (globalPaperFingerprints.includes(currentFingerprint)) {
        document.getElementById('alert-message').innerText = `STRICT REJECTION: Topic "${tokens.join(" ").toUpperCase()}" already exists!`;
        document.getElementById('modal-overlay').style.display = 'flex';
        return;
    }

    globalPaperFingerprints.push(currentFingerprint);
    
    const tbody = document.getElementById(tableId);
    const row = document.createElement('tr');
    row.dataset.fingerprint = currentFingerprint;
    
    row.innerHTML = `
        <td style="text-align:center">${num}</td>
        <td>${text} <button class="no-print dlt-btn" onclick="deleteRow(this)">Delete</button></td>
        <td style="text-align:center">${co}</td>
        <td style="text-align:center">${l}</td>
        <td style="text-align:center">${m}</td>
    `;
    
    tbody.appendChild(row);
    updateTopicList();
    document.getElementById('qText').value = "";
}

function deleteRow(btn) {
    const row = btn.closest('tr');
    const fingerprint = row.dataset.fingerprint;
    globalPaperFingerprints = globalPaperFingerprints.filter(f => f !== fingerprint);
    row.remove();
    updateTopicList();
}

function updateTopicList() {
    const list = document.getElementById('used-topics');
    list.innerHTML = "";
    globalPaperFingerprints.forEach(f => {
        const li = document.createElement('li');
        li.innerText = `• ${f.toUpperCase()}`;
        list.appendChild(li);
    });
}

function addOrRow() {
    const row = `<tr><td colspan="5" style="text-align:center; font-weight:bold; height:30px; background:#f9f9f9;">(Or) <button class="no-print dlt-btn" onclick="this.closest('tr').remove()">Delete</button></td></tr>`;
    document.getElementById('part-b-body').innerHTML += row;
}

function clearAll() {
    if(confirm("Wipe the entire paper clean?")) {
        document.getElementById('part-a-body').innerHTML = "";
        document.getElementById('part-b-body').innerHTML = "";
        globalPaperFingerprints = [];
        updateTopicList();
    }
}

function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }

async function downloadPDF() {
    const dltBtns = document.querySelectorAll('.no-print');
    dltBtns.forEach(b => b.style.visibility = 'hidden');

    const canvas = await html2canvas(document.getElementById('print-area'), { scale: 2 });
    const pdf = new jspdf.jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
    pdf.save("VIET_Official_Paper.pdf");

    dltBtns.forEach(b => b.style.visibility = 'visible');
}
