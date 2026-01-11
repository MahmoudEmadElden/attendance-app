const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;
const FILE_PATH = path.join(__dirname, 'attendance.xlsx');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve frontend files

// Initialize Excel file if not exists
if (!fs.existsSync(FILE_PATH)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    // Add headers manually if empty
    XLSX.utils.sheet_add_aoa(ws, [['Date', 'Status', 'Overtime', 'Notes']], { origin: 'A1' });
    XLSX.writeFile(wb, FILE_PATH);
    console.log('Created new attendance.xlsx');
}

// API: Record Attendance
app.post('/api/attendance', (req, res) => {
    try {
        const { date, status, overtime, notes } = req.body;

        if (!date || !status) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Read existing file
        const wb = XLSX.readFile(FILE_PATH);
        const ws = wb.Sheets['Attendance'];
        
        // Convert current sheet to JSON to append
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Add new record
        data.push({
            Date: date,
            Status: status,
            Overtime: overtime || 0,
            Notes: notes || ''
        });

        // Write back to file
        const newWs = XLSX.utils.json_to_sheet(data);
        const newWb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWb, newWs, 'Attendance');
        XLSX.writeFile(newWb, FILE_PATH);

        res.json({ success: true, message: 'Attendance recorded successfully!' });
    } catch (error) {
        console.error('Error saving attendance:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// API: Download Excel
app.get('/api/download', (req, res) => {
    if (fs.existsSync(FILE_PATH)) {
        res.download(FILE_PATH, 'attendance.xlsx');
    } else {
        res.status(404).send('File not found');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
