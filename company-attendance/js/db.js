import firebaseConfig from './firebase-config.js';

// Check if Firebase is configured
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let db = null;
let collection = null;
let addDoc = null;
let getDocs = null;
let query = null;
let where = null;
let updateDoc = null;
let doc = null;

// Initialize Firebase dynamically if configured
if (isFirebaseConfigured) {
    // Import SDKs from CDN
    const app = (await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js')).initializeApp(firebaseConfig);
    const firestore = await import('https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js');

    // Bind functions
    db = firestore.getFirestore(app);
    collection = firestore.collection;
    addDoc = firestore.addDoc;
    getDocs = firestore.getDocs;
    query = firestore.query;
    where = firestore.where;
    updateDoc = firestore.updateDoc;
    doc = firestore.doc;
} else {
    console.warn("⚠️ Running in DEMO MODE (LocalStorage). Add Firebase keys to persist data online.");
}

// ---------------------------------------------------------
// DATA SERVICES (Works for both Demo & Real Mode)
// ---------------------------------------------------------

export async function getEmployees() {
    if (isFirebaseConfigured) {
        const q = query(collection(db, "employees"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
        // DEMO MODE
        return JSON.parse(localStorage.getItem('comp_employees') || "[]");
    }
}

export async function addEmployee(employee) {
    if (isFirebaseConfigured) {
        await addDoc(collection(db, "employees"), employee);
    } else {
        // DEMO MODE
        const list = await getEmployees();
        employee.id = Date.now().toString(); // Simulator ID
        list.push(employee);
        localStorage.setItem('comp_employees', JSON.stringify(list));
    }
}

export async function getAttendance(date) {
    // Format Date YYYY-MM-DD
    if (isFirebaseConfigured) {
        const q = query(collection(db, "attendance"), where("date", "==", date));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
        // DEMO MODE
        const all = JSON.parse(localStorage.getItem('comp_attendance') || "[]");
        return all.filter(r => r.date === date);
    }
}

export async function getEmployeeHistory(empId) {
    if (isFirebaseConfigured) {
        const q = query(collection(db, "attendance"), where("empId", "==", empId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } else {
        // DEMO MODE
        const all = JSON.parse(localStorage.getItem('comp_attendance') || "[]");
        return all.filter(r => r.empId === empId);
    }
}

export async function saveAttendance(record) {
    if (isFirebaseConfigured) {
        // Check if exists update, else add (Simplified: Just add/overwrite for now)
        // In real app we query first. For speed matching demo:
        await addDoc(collection(db, "attendance"), record);
    } else {
        // DEMO MODE
        const all = JSON.parse(localStorage.getItem('comp_attendance') || "[]");
        // Remove existing for same day/person to avoid duplicates
        const filtered = all.filter(r => !(r.empId === record.empId && r.date === record.date));
        filtered.push(record);
        localStorage.setItem('comp_attendance', JSON.stringify(filtered));
    }
}

export const isDemo = !isFirebaseConfigured;
