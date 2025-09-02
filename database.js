// database.js - Better SQLite3 implementation for Render deployment
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class CVDatabase {
    constructor() {
        const dbPath = path.join(__dirname, 'cvs.db');
        console.log(`📊 Database path: ${dbPath}`);
        
        try {
            this.db = new Database(dbPath);
            this.db.pragma('journal_mode = WAL');
            console.log('📊 Connected to SQLite database');
            this.initializeTables();
        } catch (err) {
            console.error('❌ Error opening database:', err);
            process.exit(1);
        }
    }

    initializeTables() {
        const createTableSQL = `CREATE TABLE IF NOT EXISTS cvs (
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
        )`;

        try {
            this.db.exec(createTableSQL);
            console.log('✅ CVs table ready');
        } catch (err) {
            console.error('❌ Error creating table:', err);
        }
    }

    saveCV(cvData) {
        const stmt = this.db.prepare(`
            INSERT INTO cvs (
                filename, name, email, phone, address, linkedin, github, website,
                professional_specialty, primary_experience_years, secondary_experience_fields,
                total_years_experience, highest_university_degree, university_name,
                courses_completed, summary, experience_data, education_data, skills_data,
                projects_data, awards_data, volunteer_work_data, metadata_data, original_language
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        try {
            const result = stmt.run(
                cvData.metadata?.filename || 'Unknown',
                cvData.name,
                cvData.email,
                cvData.phone,
                cvData.address,
                cvData.linkedin,
                cvData.github,
                cvData.website,
                cvData.professional_specialty,
                cvData.primary_experience_years || 0,
                JSON.stringify(cvData.secondary_experience_fields || {}),
                cvData.total_years_experience || 0,
                cvData.highest_university_degree,
                cvData.university_name,
                JSON.stringify(cvData.courses_completed || []),
                cvData.summary,
                JSON.stringify(cvData.experience || []),
                JSON.stringify(cvData.education || []),
                JSON.stringify(cvData.skills || {}),
                JSON.stringify(cvData.projects || []),
                JSON.stringify(cvData.awards || []),
                JSON.stringify(cvData.volunteer_work || []),
                JSON.stringify(cvData.metadata || {}),
                cvData.original_language || 'English'
            );
            
            console.log(`✅ CV saved to database with ID: ${result.lastInsertRowid}`);
            return result.lastInsertRowid;
        } catch (err) {
            console.error('❌ Database save error:', err.message);
            throw err;
        }
    }

    getAllCVs() {
        try {
            const stmt = this.db.prepare("SELECT * FROM cvs ORDER BY created_at DESC");
            const rows = stmt.all();
            
            console.log(`📊 Retrieved ${rows.length} CVs from database`);
            
            return rows.map(row => {
                try {
                    return {
                        id: row.id,
                        filename: row.filename,
                        name: row.name,
                        email: row.email,
                        phone: row.phone,
                        address: row.address,
                        linkedin: row.linkedin,
                        github: row.github,
                        website: row.website,
                        professional_specialty: row.professional_specialty,
                        primary_experience_years: row.primary_experience_years || 0,
                        secondary_experience_fields: JSON.parse(row.secondary_experience_fields || '{}'),
                        total_years_experience: row.total_years_experience || 0,
                        highest_university_degree: row.highest_university_degree,
                        university_name: row.university_name,
                        courses_completed: JSON.parse(row.courses_completed || '[]'),
                        summary: row.summary,
                        experience: JSON.parse(row.experience_data || '[]'),
                        education: JSON.parse(row.education_data || '[]'),
                        skills: JSON.parse(row.skills_data || '{}'),
                        projects: JSON.parse(row.projects_data || '[]'),
                        awards: JSON.parse(row.awards_data || '[]'),
                        volunteer_work: JSON.parse(row.volunteer_work_data || '[]'),
                        original_language: row.original_language || 'English',
                        metadata: JSON.parse(row.metadata_data || '{}'),
                        created_at: row.created_at,
                        updated_at: row.updated_at
                    };
                } catch (parseError) {
                    console.error(`❌ Error parsing CV data for ID ${row.id}:`, parseError.message);
                    return null;
                }
            }).filter(cv => cv !== null);
        } catch (err) {
            console.error('❌ Database query error:', err.message);
            throw err;
        }
    }

    getCVById(id) {
        try {
            const stmt = this.db.prepare("SELECT * FROM cvs WHERE id = ?");
            const row = stmt.get(id);
            
            if (!row) return null;
            
            return {
                id: row.id,
                filename: row.filename,
                name: row.name,
                email: row.email,
                phone: row.phone,
                address: row.address,
                linkedin: row.linkedin,
                github: row.github,
                website: row.website,
                professional_specialty: row.professional_specialty,
                primary_experience_years: row.primary_experience_years || 0,
                secondary_experience_fields: JSON.parse(row.secondary_experience_fields || '{}'),
                total_years_experience: row.total_years_experience || 0,
                highest_university_degree: row.highest_university_degree,
                university_name: row.university_name,
                courses_completed: JSON.parse(row.courses_completed || '[]'),
                summary: row.summary,
                experience: JSON.parse(row.experience_data || '[]'),
                education: JSON.parse(row.education_data || '[]'),
                skills: JSON.parse(row.skills_data || '{}'),
                projects: JSON.parse(row.projects_data || '[]'),
                awards: JSON.parse(row.awards_data || '[]'),
                volunteer_work: JSON.parse(row.volunteer_work_data || '[]'),
                original_language: row.original_language || 'English',
                metadata: JSON.parse(row.metadata_data || '{}'),
                created_at: row.created_at,
                updated_at: row.updated_at
            };
        } catch (err) {
            console.error('❌ Get CV details error:', err.message);
            throw err;
        }
    }

    deleteCV(id) {
        try {
            const stmt = this.db.prepare("DELETE FROM cvs WHERE id = ?");
            const result = stmt.run(id);
            return result.changes > 0;
        } catch (err) {
            console.error('❌ Delete CV error:', err.message);
            throw err;
        }
    }

    clearAllCVs() {
        try {
            const deleteStmt = this.db.prepare("DELETE FROM cvs");
            const result = deleteStmt.run();
            
            // Reset AUTOINCREMENT sequence
            this.db.exec("DELETE FROM sqlite_sequence WHERE name='cvs'");
            this.db.exec("VACUUM");
            
            return result.changes;
        } catch (err) {
            console.error('❌ Clear CVs error:', err.message);
            throw err;
        }
    }

    close() {
        if (this.db) {
            this.db.close();
            console.log('📊 Database connection closed.');
        }
    }
}

module.exports = CVDatabase;
