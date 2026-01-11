document.addEventListener('DOMContentLoaded', () => {
    // 1. Display Current Date
    const curDate = new Date().toLocaleDateString('ar-EG', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    document.getElementById('current-date').textContent = curDate;

    const form = document.getElementById('attendance-form');
    const messageDiv = document.getElementById('message');
    const submitBtn = document.getElementById('submit-btn');

    // 2. Handle Form Submission (Save to LocalStorage)
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').textContent = 'جارٍ الحفظ...';

        const formData = new FormData(form);
        const record = {
            id: Date.now(), // Unique ID
            date: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY
            time: new Date().toLocaleTimeString('en-US'),
            status: formData.get('status'),
            overtime: formData.get('overtime') || "0",
            notes: formData.get('notes') || ""
        };

        try {
            // Get existing data
            let attendanceData = JSON.parse(localStorage.getItem('attendance_data') || "[]");
            attendanceData.push(record);

            // Save back
            localStorage.setItem('attendance_data', JSON.stringify(attendanceData));

            showMessage('✅ تم تسجيل الحضور محلياً بنجاح!', 'success');
            form.reset();
        } catch (error) {
            console.error(error);
            showMessage('❌ حدث خطأ أثناء الحفظ', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').textContent = 'تسجيل';
        }
    });

    // 3. Handle Excel Download (Generate in Browser)
    document.querySelector('.download-link').addEventListener('click', (e) => {
        e.preventDefault();

        const attendanceData = JSON.parse(localStorage.getItem('attendance_data') || "[]");

        if (attendanceData.length === 0) {
            showMessage('⚠️ لا توجد بيانات للتحميل', 'error');
            return;
        }

        // Prepare data for Excel (Rename headers)
        const excelRows = attendanceData.map(item => ({
            "التاريخ": item.date,
            "الوقت": item.time,
            "الحالة": item.status,
            "ساعات إضافية": item.overtime,
            "ملاحظات": item.notes
        }));

        // Create Worksheet
        const ws = XLSX.utils.json_to_sheet(excelRows, { rtl: true });

        // Create Workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");

        // Download File
        XLSX.writeFile(wb, "Attendance_Report.xlsx");
    });

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.classList.remove('hidden');

        setTimeout(() => {
            messageDiv.classList.add('hidden');
        }, 3000);
    }
});
