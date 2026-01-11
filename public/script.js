document.addEventListener('DOMContentLoaded', () => {
    const curDate = new Date().toLocaleDateString('ar-EG', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    document.getElementById('current-date').textContent = curDate;

    const form = document.getElementById('attendance-form');
    const messageDiv = document.getElementById('message');
    const submitBtn = document.getElementById('submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // UI Loading State
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').textContent = 'جارٍ الحفظ...';

        const formData = new FormData(form);
        const data = {
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            status: formData.get('status'),
            overtime: formData.get('overtime'),
            notes: formData.get('notes')
        };

        try {
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                showMessage(result.message, 'success');
                form.reset();
            } else {
                showMessage('حدث خطأ: ' + result.message, 'error');
            }
        } catch (error) {
            showMessage('فشل الاتصال بالسيرفر', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').textContent = 'تسجيل';
        }
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
