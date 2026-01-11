document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('attendance-date');
    const form = document.getElementById('attendance-form');
    const messageDiv = document.getElementById('message');
    const submitBtn = document.getElementById('submit-btn');
    const historyTableBody = document.querySelector('#history-table tbody');
    const csvInput = document.getElementById('csv-upload');

    // 1. Initialize Date Picker (Today's Date)
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;

    // Load Initial Data
    loadHistoryTable();

    // 2. Handle Form Submission (Save to LocalStorage)
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').textContent = 'جارٍ الحفظ...';

        const formData = new FormData(form);
        const selectedDate = dateInput.value;

        // Basic Validation
        if (!selectedDate) {
            showMessage('⚠️ يرجى اختيار التاريخ', 'error');
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').textContent = 'تسجيل';
            return;
        }

        const record = {
            id: Date.now(), // Unique ID
            date: selectedDate, // YYYY-MM-DD
            time: new Date().toLocaleTimeString('en-US'),
            status: formData.get('status'),
            overtime: formData.get('overtime') || "0",
            notes: formData.get('notes') || ""
        };

        try {
            saveRecord(record);
            showMessage('✅ تم تسجيل الحضور بنجاح!', 'success');
            form.reset();
            // Reset date to today after reset (form.reset clears inputs)
            setTimeout(() => dateInput.value = today, 0);
            loadHistoryTable();
        } catch (error) {
            console.error(error);
            showMessage('❌ حدث خطأ أثناء الحفظ', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').textContent = 'تسجيل';
        }
    });

    // 3. Handle CSV Import
    csvInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const csvData = event.target.result;
            // Use SheetJS to parse CSV easily
            const workbook = XLSX.read(csvData, { type: 'string' });
            const sheetName = workbook.SheetNames[0];
            const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            if (jsonData.length > 0) {
                // Map old CSV fields to new format if needed
                // Assuming old CSV has columns like: Date, Status, Overtime Hours, Notes
                let importedCount = 0;

                jsonData.forEach(row => {
                    // Try to map keys (case insensitive search)
                    const keys = Object.keys(row);
                    const getDate = k => row[keys.find(key => key.toLowerCase().includes('date'))];
                    const getStatus = k => row[keys.find(key => key.toLowerCase().includes('status'))] || row[keys.find(key => key.includes('الحالة'))];
                    const getOvertime = k => row[keys.find(key => key.toLowerCase().includes('overtime'))] || row[keys.find(key => key.includes('إضافي'))];
                    const getNotes = k => row[keys.find(key => key.toLowerCase().includes('notes'))] || row[keys.find(key => key.includes('ملاحظات'))];

                    const record = {
                        id: Date.now() + Math.random(), // Unique ID simulation
                        date: getDate() || new Date().toISOString().split('T')[0],
                        time: "Imported",
                        status: getStatus() || "حضور",
                        overtime: getOvertime() || "0",
                        notes: getNotes() || ""
                    };
                    saveRecord(record);
                    importedCount++;
                });

                showMessage(`✅ تم استيراد ${importedCount} سجل بنجاح!`, 'success');
                loadHistoryTable();
            }
        };
        reader.readAsText(file);
        // Clear input so same file can be selected again
        e.target.value = '';
    });

    // 4. Handle Excel Download
    document.querySelector('.download-link').addEventListener('click', (e) => {
        e.preventDefault();
        const attendanceData = getStoredData();

        if (attendanceData.length === 0) {
            showMessage('⚠️ لا توجد بيانات للتحميل', 'error');
            return;
        }

        const excelRows = attendanceData.map(item => ({
            "التاريخ": item.date,
            "الوقت": item.time,
            "الحالة": item.status,
            "ساعات إضافية": item.overtime,
            "ملاحظات": item.notes
        }));

        const ws = XLSX.utils.json_to_sheet(excelRows, { rtl: true });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        XLSX.writeFile(wb, "Attendance_Report.xlsx");
    });

    // Helper Functions
    function getStoredData() {
        return JSON.parse(localStorage.getItem('attendance_data') || "[]");
    }

    function saveRecord(record) {
        const data = getStoredData();
        data.push(record);
        // Sort by date (descending)
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem('attendance_data', JSON.stringify(data));
    }

    function deleteRecord(id) {
        if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
        let data = getStoredData();
        data = data.filter(item => item.id !== id);
        localStorage.setItem('attendance_data', JSON.stringify(data));
        loadHistoryTable();
    }

    function loadHistoryTable() {
        historyTableBody.innerHTML = '';
        const data = getStoredData();

        if (data.length === 0) {
            historyTableBody.innerHTML = '<tr><td colspan="5">لا توجد سجلات بعد</td></tr>';
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.date} <br> <small style="color:#777">${item.time}</small></td>
                <td>${item.status}</td>
                <td>${item.overtime}</td>
                <td>${item.notes}</td>
                <td><button class="delete-btn" onclick="window.removeRow(${item.id})">🗑️</button></td>
            `;
            historyTableBody.appendChild(row);
        });
    }

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.classList.remove('hidden');
        setTimeout(() => messageDiv.classList.add('hidden'), 3000);
    }

    // Expose delete function to window so onclick works
    window.removeRow = deleteRecord;
});
