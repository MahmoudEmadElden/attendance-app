import { getEmployees, addEmployee, getAttendance, saveAttendance, getEmployeeHistory } from './db.js';

let allEmployees = [];
let todayAttendance = [];
const today = new Date().toISOString().split('T')[0];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Setup UI
    document.getElementById('today-date').textContent = today;

    // 2. Load Data
    await loadData();

    // 3. Event Listeners
    document.getElementById('search-input').addEventListener('input', (e) => {
        renderList(e.target.value);
    });

    document.getElementById('select-all').addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.emp-checkbox');
        checkboxes.forEach(cb => cb.checked = e.target.checked);
    });

    document.getElementById('add-employee-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('new-name').value;
        const job = document.getElementById('new-job').value;

        await addEmployee({ name, job, joined: today });
        alert('تمت الإضافة بنجاح');
        closeAddModal();
        await loadData();
    });

    // Make functions global
    window.setStatus = setStatus;
    window.markSelected = markSelected;
    window.openAddModal = () => document.getElementById('add-modal').classList.remove('hidden');
    window.closeAddModal = () => document.getElementById('add-modal').classList.add('hidden');
    window.openHistoryModal = openHistoryModal;
    window.closeHistoryModal = () => document.getElementById('history-modal').classList.add('hidden');
    window.updateHistoryRecord = updateHistoryRecord; // For editing inside modal
});

async function loadData() {
    allEmployees = await getEmployees();
    todayAttendance = await getAttendance(today);
    updateStats();
    renderList();
}

function updateStats() {
    document.getElementById('total-employees').textContent = allEmployees.length;
    document.getElementById('present-today').textContent = todayAttendance.filter(a => a.status === 'present').length;
    document.getElementById('absent-today').textContent = todayAttendance.filter(a => a.status === 'absent').length;
}

function renderList(searchTerm = "") {
    const listContainer = document.getElementById('employee-list');
    listContainer.innerHTML = '';

    const filtered = allEmployees.filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filtered.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; padding:20px;">لا يوجد نتائج.</div>';
        return;
    }

    filtered.forEach(emp => {
        // Check stored status for today
        const record = todayAttendance.find(r => r.empId === emp.id);
        const currentStatus = record ? record.status : null;

        // Pre-fill inputs if record exists
        const noteVal = record ? record.notes : "";
        const overtimeVal = record ? record.overtime : "";

        const card = document.createElement('div');
        card.className = 'employee-card';
        card.style.alignItems = "flex-start"; // Align top for better layout
        card.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; width:100%; margin-bottom:10px;">
                <input type="checkbox" class="emp-checkbox" value="${emp.id}" style="width:20px; margin:0;">
                <div class="emp-details">
                    <h4 style="margin:0;">${emp.name}</h4>
                    <p style="margin:0; font-size:0.8rem;">💼 ${emp.job}</p>
                </div>
                <button class="secondary" onclick="openHistoryModal('${emp.id}', '${emp.name}')" style="margin-right:auto; padding:5px 10px; font-size:0.8rem; width:auto;">📋 السجل</button>
            </div>

            <div class="inputs-row" style="display:flex; gap:10px; width:100%; margin-bottom:10px;">
                <input type="number" id="overtime-${emp.id}" placeholder="إضافي (ساعة)" value="${overtimeVal}" style="flex:1; margin:0; padding:8px; font-size:0.9rem;">
                <input type="text" id="notes-${emp.id}" placeholder="ملاحظات..." value="${noteVal}" style="flex:2; margin:0; padding:8px; font-size:0.9rem;">
            </div>

            <div class="attendance-actions" data-id="${emp.id}" style="width:100%; justify-content:center; gap:15px;">
                <button class="status-btn btn-present ${currentStatus === 'present' ? 'selected' : ''}" onclick="setStatus('${emp.id}', 'present')">✅ حضور</button>
                <button class="status-btn btn-absent ${currentStatus === 'absent' ? 'selected' : ''}" onclick="setStatus('${emp.id}', 'absent')">❌ غياب</button>
                <button class="status-btn btn-late ${currentStatus === 'late' ? 'selected' : ''}" onclick="setStatus('${emp.id}', 'late')">🕒 تأخير</button>
            </div>
        `;
        listContainer.appendChild(card);
    });
}

async function setStatus(empId, status) {
    const overtime = document.getElementById(`overtime-${empId}`).value || "0";
    const notes = document.getElementById(`notes-${empId}`).value || "";

    // Visual Update immediate
    const actionDiv = document.querySelector(`.attendance-actions[data-id="${empId}"]`);
    if (actionDiv) {
        const btns = actionDiv.querySelectorAll('.status-btn');
        btns.forEach(b => b.classList.remove('selected'));
        if (status === 'present') actionDiv.querySelector('.btn-present').classList.add('selected');
        if (status === 'absent') actionDiv.querySelector('.btn-absent').classList.add('selected');
        if (status === 'late') actionDiv.querySelector('.btn-late').classList.add('selected');
    }

    // Save to DB
    await saveAttendance({
        empId,
        date: today,
        status,
        overtime,
        notes,
        timestamp: new Date().toISOString()
    });

    // Determine tone based on status
    let msg = 'تم الحفظ';
    if (status === 'absent') msg = 'تم تسجيل الغياب';

    // Refresh local data copy to keep stats strict
    todayAttendance = await getAttendance(today);
    updateStats();
}

async function markSelected(status) {
    const checkedBoxes = document.querySelectorAll('.emp-checkbox:checked');
    if (checkedBoxes.length === 0) {
        alert('اختر موظفين أولاً');
        return;
    }

    if (!confirm(`هل أنت متأكد من تسجيل ${status === 'present' ? 'حضور' : 'غياب'} لـ ${checkedBoxes.length} موظف؟`)) return;

    for (const box of checkedBoxes) {
        await setStatus(box.value, status);
    }
    alert('تم التنفيذ بنجاح ✅');
}

async function openHistoryModal(empId, empName) {
    document.getElementById('history-emp-name').textContent = `سجل: ${empName}`;
    document.getElementById('history-modal').classList.remove('hidden');

    const container = document.getElementById('history-content');
    container.innerHTML = 'جارٍ التحميل...';

    const history = await getEmployeeHistory(empId);
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = '';
    if (history.length === 0) {
        container.innerHTML = '<p>لا يوجد سجلات.</p>';
        return;
    }

    history.forEach(rec => {
        const isToday = rec.date === today;
        const row = document.createElement('div');
        row.style.background = 'rgba(255,255,255,0.05)';
        row.style.padding = '10px';
        row.style.borderRadius = '8px';
        row.style.border = '1px solid var(--border)';

        row.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <strong>${rec.date}</strong>
                <span class="${rec.status === 'present' ? 'text-success' : 'text-danger'}">${rec.status === 'present' ? '✅' : (rec.status === 'absent' ? '❌' : '🕒')}</span>
            </div>
            <div style="display:flex; gap:5px;">
                <input type="number" id="edit-overtime-${rec.date}" value="${rec.overtime || 0}" style="width:60px; padding:5px; margin:0;" ${isToday ? 'disabled' : ''}>
                <input type="text" id="edit-notes-${rec.date}" value="${rec.notes || ''}" placeholder="ملاحظات" style="flex:1; padding:5px; margin:0;" ${isToday ? 'disabled' : ''}>
                ${!isToday ? `<button onclick="updateHistoryRecord('${empId}', '${rec.date}')" style="width:auto; padding:5px;">حفظ</button>` : '<small>عدل من القائمة الرئيسية</small>'}
            </div>
        `;
        container.appendChild(row);
    });
}

async function updateHistoryRecord(empId, date) {
    const overtime = document.getElementById(`edit-overtime-${date}`).value;
    const notes = document.getElementById(`edit-notes-${date}`).value;

    // We need to keep the old status (or add a status dropdown to edit it too). 
    // For now user asked to edit "Details" essentially. 
    // To do it right, we fetch the record logic again or trust UI.
    // Let's assume we just update these fields. To do that securely we should get current status.
    // Since we are inside the modal, we can find the status from the UI or just re-save.
    // Simpler approach: We just update the fields.

    // 1. Get existing to preserve status
    const allHistory = await getEmployeeHistory(empId);
    const rec = allHistory.find(r => r.date === date);
    if (!rec) return;

    await saveAttendance({
        ...rec, // Keep status and other fields
        overtime,
        notes,
        timestamp: new Date().toISOString()
    });

    alert('تم تعديل السجل ✅');
}

// Ensure CSS classes are available for dynamic elements
const style = document.createElement('style');
style.innerHTML = `
    .text-success { color: var(--success); }
    .text-danger { color: var(--danger); }
    .status-btn { width: auto !important; padding: 8px 20px !important; border-radius: 8px !important; }
`;
document.head.appendChild(style);
