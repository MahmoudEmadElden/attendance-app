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

    document.getElementById('days-present').textContent = presentCount;
    document.getElementById('days-absent').textContent = absentCount;

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
        card.className = 'employee-card'; // Reuse styled card
        card.style.justifyContent = 'flex-start';
        card.innerHTML = `
            <div style="background: ${info.color}; width: 10px; height: 10px; border-radius: 50%; margin-left: 15px;"></div>
            <div class="emp-details">
                <h4 style="color:white">${rec.date}</h4>
                <p>${info.text}</p>
            </div>
        `;
        listContainer.appendChild(card);
    });
});
