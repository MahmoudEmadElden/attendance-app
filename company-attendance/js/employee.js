import { getEmployeeHistory } from './db.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Get Logged User
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'index.html';
        return;
    }
    const user = JSON.parse(userStr);
    document.getElementById('emp-name').textContent = user.name;

    // 2. Load History
    const history = await getEmployeeHistory(user.id);
    const listContainer = document.getElementById('history-list');

    // Stats
    const presentCount = history.filter(h => h.status === 'present').length;
    const absentCount = history.filter(h => h.status === 'absent').length;
    // Calculate total overtime
    const totalOvertime = history.reduce((sum, h) => sum + (parseInt(h.overtime) || 0), 0);

    document.getElementById('days-present').textContent = presentCount;
    document.getElementById('days-absent').textContent = absentCount;
    document.getElementById('vacation-balance').textContent = totalOvertime + " س"; // Changed generic label to Overtime Hours
    document.querySelector('.stat-label:last-child').textContent = "ساعات إضافية"; // Update label dynamically

    // 3. Render List
    listContainer.innerHTML = '';

    if (history.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; padding:20px;">لا يوجد سجل حضور بعد.</div>';
    }

    // Sort newest first
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    const statusMap = {
        'present': { text: 'حضور', color: 'var(--success)' },
        'absent': { text: 'غياب', color: 'var(--danger)' },
        'late': { text: 'تأخير', color: 'var(--warning)' }
    };

    history.forEach(rec => {
        const info = statusMap[rec.status] || { text: rec.status, color: '#fff' };

        const card = document.createElement('div');
        card.className = 'employee-card';
        card.style.justifyContent = 'space-between'; // Changed layout
        card.innerHTML = `
            <div style="display:flex; align-items:center;">
                <div style="background: ${info.color}; width: 10px; height: 10px; border-radius: 50%; margin-left: 15px;"></div>
                <div class="emp-details">
                    <h4 style="color:white">${rec.date}</h4>
                    <p>${info.text}</p>
                </div>
            </div>
            
            <div style="text-align: left; font-size: 0.9rem; color: #ccc;">
                ${rec.overtime > 0 ? `<div style="color: var(--warning)">+${rec.overtime}h إضافي</div>` : ''}
                ${rec.notes ? `<div style="max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">📝 ${rec.notes}</div>` : ''}
            </div>
        `;
        listContainer.appendChild(card);
    });
});
