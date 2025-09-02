// fix-server.js - Script to fix server.js for Render deployment
const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
let serverContent = fs.readFileSync(serverPath, 'utf8');

// Replace sqlite3 import with CVDatabase import
serverContent = serverContent.replace(
    "const sqlite3 = require('sqlite3').verbose();",
    "const CVDatabase = require('./database');"
);

// Replace database initialization
const oldDbInit = `const dbPath = path.join(__dirname, 'cvs.db');
console.log(\`📊 Database path: \${dbPath}\`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err);
        process.exit(1);
    }
    console.log('📊 Connected to SQLite database');
});`;

const newDbInit = `// Initialize database
const database = new CVDatabase();`;

serverContent = serverContent.replace(oldDbInit, newDbInit);

// Replace database table creation
const oldTableCreation = `// Create tables with enhanced structure
db.serialize(() => {
    db.run(\`CREATE TABLE IF NOT EXISTS cvs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        name TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        linkedin TEXT,
        github TEXT,
        website TEXT,
        professional_specialty TEXT,
        primary_experience_years REAL,
        secondary_experience_fields TEXT,
        total_years_experience REAL,
        highest_university_degree TEXT,
        university_name TEXT,
        courses_completed TEXT,
        summary TEXT,
        experience_data TEXT,
        education_data TEXT,
        skills_data TEXT,
        projects_data TEXT,
        awards_data TEXT,
        volunteer_work_data TEXT,
        metadata_data TEXT,
        original_language TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )\`, (err) => {
        if (err) {
            console.error('❌ Error creating table:', err);
        } else {
            console.log('✅ CVs table ready');
        }
    });
});`;

serverContent = serverContent.replace(oldTableCreation, '// Database tables are initialized in CVDatabase constructor');

// Replace saveCVToDatabase function calls
serverContent = serverContent.replace(/saveCVToDatabase\(/g, 'database.saveCV(');
serverContent = serverContent.replace(/getAllCVsFromDatabase\(\)/g, 'database.getAllCVs()');

// Replace database operations in routes
serverContent = serverContent.replace(/db\.run\(/g, 'database.db.prepare(').replace(/db\.all\(/g, 'database.db.prepare(').replace(/db\.get\(/g, 'database.db.prepare(');

// Remove problematic dependencies
serverContent = serverContent.replace(/let transformers;[\s\S]*?} catch \(e\) {[\s\S]*?}\n/g, '');
serverContent = serverContent.replace(/let pdfjsLib;[\s\S]*?}\n/g, '');
serverContent = serverContent.replace(/const { spawn } = require\('child_process'\);/g, '');

// Remove Python link extraction function
serverContent = serverContent.replace(/async function extractLinksWithPython[\s\S]*?}\n/g, '');

// Write the fixed content back
fs.writeFileSync(serverPath, serverContent);

console.log('✅ Server.js has been fixed for Render deployment');
console.log('🔧 Changes made:');
console.log('  - Replaced sqlite3 with CVDatabase');
console.log('  - Removed problematic dependencies');
console.log('  - Updated database operations');
console.log('  - Removed Python subprocess calls');
