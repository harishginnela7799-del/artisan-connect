const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const bcrypt = require('bcryptjs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '/')));

// Database Setup
const db = new sqlite3.Database('./database.sqlite');

// Initialize Schema
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (user_id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255), email VARCHAR(255) UNIQUE, phone VARCHAR(50), password_hash VARCHAR(255), role VARCHAR(50) DEFAULT 'user', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS professionals (professional_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, company_name VARCHAR(255), service_type VARCHAR(100), location VARCHAR(255), verification_status VARCHAR(50) DEFAULT 'pending', portfolio_images TEXT, portfolio_video VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(user_id))`);
    db.run(`CREATE TABLE IF NOT EXISTS locations (location_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, professional_id INTEGER, address VARCHAR(255), city VARCHAR(100), state VARCHAR(100), country VARCHAR(100) DEFAULT 'India', zip_code VARCHAR(20))`);
});

// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: './images/uploads/',
    filename: (req, file, cb) => {
        cb(null, 'port_' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ============================================
// ROUTES
// ============================================

// 1. Signup Route
app.post('/api/auth/signup', (req, res) => {
    const { name, email, phone, password, role, location } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    
    db.run(`INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)`, 
    [name, email, phone, hash, role], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        const user_id = this.lastID;
        
        if (role === 'professional') {
            db.run(`INSERT INTO professionals (user_id, company_name, service_type, location, portfolio_images) VALUES (?, ?, ?, ?, '[]')`, 
            [user_id, name, null, location], function(err2) {
                if(err2) return res.status(400).json({ error: err2.message });
                return res.json({ success: true, user_id, professional_id: this.lastID });
            });
        } else {
            return res.json({ success: true, user_id });
        }
    });
});

// 2. Login Route
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
        if (err || !row) return res.status(400).json({ error: 'User not found' });
        if (!bcrypt.compareSync(password, row.password_hash)) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        const { password_hash, ...safeUser } = row;
        res.json({ success: true, user: safeUser });
    });
});

// 3. Complete Professional Profile (Linking IDs)
app.post('/api/professional/profile', (req, res) => {
    const { user_id, company_name, service_type } = req.body;
    db.run(`UPDATE professionals SET company_name = ?, service_type = ? WHERE user_id = ?`,
    [company_name, service_type, user_id], (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ success: true });
    });
});

// 4. File Upload (Images/Videos)
app.post('/api/upload', upload.array('portfolio_files', 5), (req, res) => {
    const filePaths = req.files.map(file => 'images/uploads/' + file.filename);
    res.json({ success: true, paths: filePaths });
});

// 5. Fetch Approved Providers (For Homepage)
app.get('/api/providers/active', (req, res) => {
    const query = `
        SELECT p.*, u.email, u.phone 
        FROM professionals p 
        JOIN users u ON p.user_id = u.user_id 
        WHERE p.verification_status = 'approved'
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const mapped = rows.map(r => ({
            id: r.professional_id,
            name: r.company_name,
            type: r.service_type || 'builder',
            city: r.location,
            status: 'active',
            email: r.email,
            phone: r.phone,
            img: JSON.parse(r.portfolio_images || '[]')[0] || 'images/modern.png'
        }));
        res.json({ success: true, data: mapped });
    });
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running dynamically on http://localhost:${PORT}`);
});
