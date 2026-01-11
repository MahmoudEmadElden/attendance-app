import { getEmployees, addEmployee, getAttendance, saveAttendance } from './db.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Setup UI
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('today-date').textContent = today;

    const listContainer = document.getElementById('employee-list');

    // 2. Load Data
    const employees = await getEmployees();
    const attendanceToday = await getAttendance(today);

    // Update Stats
    document.getElementById('total-employees').textContent = employees.length;
    document.getElementById('present-today').textContent = attendanceToday.filter(a => a.status === 'present').length;
    document.getElementById('absent-today').textContent = attendanceToday.filter(a => a.status === 'absent').length;

    // 3. Render Employee List
    listContainer.innerHTML = '';

    if (employees.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; padding:20px;">لا يوجد موظفين. اضغط على "إضافة موظف".</div>';
    }

    employees.forEach(emp => {
        // Check stored status for today
        const record = attendanceToday.find(r => r.empId === emp.id);
        const currentStatus = record ? record.status : null; // 'present', 'absent', 'late'

        const card = document.createElement('div');
        card.className = 'employee-card';
        card.innerHTML = `
            <div class="emp-details">
                <h4>${emp.name}</h4>
                <p>💼 ${emp.job}</p>
            </div>
            <div class="attendance-actions" data-id="${emp.id}">
                <button class="status-btn btn-present ${currentStatus === 'present' ? 'selected' : ''}" onclick="setStatus('${emp.id}', 'present')">✅</button>
                <button class="status-btn btn-absent ${currentStatus === 'absent' ? 'selected' : ''}" onclick="setStatus('${emp.id}', 'absent')">❌</button>
                <button class="status-btn btn-late ${currentStatus === 'late' ? 'selected' : ''}" onclick="setStatus('${emp.id}', 'late')">🕒</button>
            </div>
        `;
        listContainer.appendChild(card);
    });

    // 4. Handle Add Employee
    document.getElementById('add-employee-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('new-name').value;
        const job = document.getElementById('new-job').value;

        await addEmployee({ name, job, joined: today });
        alert('تمت الإضافة بنجاح');
        location.reload(); // Refresh to see new list
    });

    // Make setStatus global so HTML onclick can see it
    window.setStatus = async (empId, status) => {
        // Visual Update immediate
        const actionDiv = document.querySelector(`.attendance-actions[data-id="${empId}"]`);
        const btns = actionDiv.querySelectorAll('.status-btn');
        btns.forEach(b => b.classList.remove('selected'));

        if (status === 'present') actionDiv.querySelector('.btn-present').classList.add('selected');
        if (status === 'absent') actionDiv.querySelector('.btn-absent').classList.add('selected');
        if (status === 'late') actionDiv.querySelector('.btn-late').classList.add('selected');

        // Save to DB
        await saveAttendance({
            empId,
            date: today,
            status,
            timestamp: new Date().toISOString()
        });
    };
});
