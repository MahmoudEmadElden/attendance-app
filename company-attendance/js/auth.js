import { getEmployees, isDemo } from './db.js';

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('login-form');
    const select = document.getElementById('employee-select');
    const adminInput = document.getElementById('admin-input');

    // Load employees into select dropdown
    const employees = await getEmployees();

    if (employees.length === 0) {
        const option = document.createElement('option');
        option.text = "لا يوجد موظفين (سجل كمدير أولاً)";
        select.add(option);
    } else {
        employees.forEach(emp => {
            const option = document.createElement('option');
            option.value = emp.id;
            option.text = `${emp.name} - ${emp.job}`;
            select.add(option);
        });
    }

    if (isDemo) {
        // Auto-select demo if empty
        if (employees.length === 0) {
            const option = document.createElement('option');
            option.value = "demo_user";
            option.text = "مستخدم تجريبي";
            select.add(option);
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Check active mode
        if (!adminInput.classList.contains('hidden')) {
            // Admin Login
            const pass = document.getElementById('admin-password').value;
            if (pass === '1234' || pass === 'admin') { // Simple pass for demo
                localStorage.setItem('userRole', 'admin');
                window.location.href = 'admin.html';
            } else {
                alert('كلمة المرور خاطئة (جرب 1234)');
            }
        } else {
            // Employee Login
            const empId = select.value;
            const empName = select.options[select.selectedIndex].text;

            if (!empId) {
                alert('يرجى اختيار اسم');
                return;
            }

            localStorage.setItem('currentUser', JSON.stringify({ id: empId, name: empName }));
            window.location.href = 'employee.html';
        }
    });
});
