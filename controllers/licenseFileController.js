// licensesController.js
const dbConnection = require('../connection.js');
const { validationResult } = require('express-validator');
const RecentActivityController = require('./recentActivityController');

const imageUploaderController = require('./imageUploaderController.js');

class LicenseFileController {

    static create(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        const errors = validationResult(req.body);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: true, message: "Invalid data entered", data: errors.array() });
        }
        console.log('License File Request: ', req.file);

        const { license_id, notes } = req.body;
        const response = imageUploaderController.saveImage(req.file);
        if (response.error) {
            console.log('License File Response Error :', response);
            return res.status(422).json(response);
        } else {
            console.log('License File Response Success :', response);
            const created_by = req.decoded.user_id;
            const query = `INSERT INTO license_files (license_id, file_name, file_path, file_size, file_type, file_notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`;

            dbConnection.query(query, [license_id, response.data.file_name, response.data.file_path, response.data.file_size, response.data.file_type, notes, created_by], (error, result) => {
                if (error) {
                    return res.status(500).json({ error: true, message: error.message });
                }
                // Log recent activity create
                const activity = {
                    admin_user_id: created_by,
                    action_title: 'create',
                    action_description: `License File Record Created Against License ID: ${license_id}`,
                    table_affected: 'license_file',
                    affected_id: result.insertId
                };
                RecentActivityController.logActivity(activity);
                return res.status(201).json({ error: false, message: 'License file uploaded successfully', data: { file_id: result.insertId } });
            });
        }

    }

    static getAll(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        const query = `
            SELECT 
                lf.file_id, lf.file_name, lf.file_path, lf.file_notes, lf.file_size, lf.file_type, lf.created_at, lf.updated_at,
                l.license_name, 
                created_user.user_name AS created_by_user_name, 
                updated_user.user_name AS updated_by_user_name 
            FROM license_files lf
            LEFT JOIN licenses l ON lf.license_id = l.license_id
            LEFT JOIN admin_users created_user ON lf.created_by = created_user.user_id
            LEFT JOIN admin_users updated_user ON lf.updated_by = updated_user.user_id 
        `;

        dbConnection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, data: results, message: 'All license files retrieved successfully' });
        });
    }

    static getById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Check if license_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide file_id' });
        }
        const query = `
            SELECT 
                lf.file_id, lf.file_name, lf.file_path, lf.file_notes, lf.file_size, lf.file_type, lf.created_at, lf.updated_at,
                l.license_name, 
                created_user.user_name AS created_by_user_name, 
                updated_user.user_name AS updated_by_user_name 
            FROM license_files lf
            LEFT JOIN licenses l ON lf.license_id = l.license_id
            LEFT JOIN admin_users created_user ON lf.created_by = created_user.user_id
            LEFT JOIN admin_users updated_user ON lf.updated_by = updated_user.user_id 
            WHERE lf.file_id=?
        `;
        dbConnection.query(query, [req.params.id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: false, data: results[0], message: 'License file details retrieved successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'License file not found' });
            }
        });
    }

    static getFileByLicenseId(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }
    
        // Check if license_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide license_id' });
        }
        
        const query = `
            SELECT 
                lf.file_id, lf.file_name, lf.file_path, lf.file_notes, lf.file_size, lf.file_type, lf.created_at, lf.updated_at,
                l.license_name, 
                created_user.user_name AS created_by_user_name, 
                updated_user.user_name AS updated_by_user_name 
            FROM license_files lf
            LEFT JOIN licenses l ON lf.license_id = l.license_id
            LEFT JOIN admin_users created_user ON lf.created_by = created_user.user_id
            LEFT JOIN admin_users updated_user ON lf.updated_by = updated_user.user_id 
            WHERE lf.license_id=?
        `;
        
        dbConnection.query(query, [req.params.id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: false, data: results, message: 'License file details retrieved successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'License file not found' });
            }
        });
    }    

    static updateById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Check if user_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide file_id' });
        }

        const { license_id, notes } = req.body;
        const updated_by = req.decoded.user_id;

        let query = `UPDATE license_files SET license_id = ?, file_notes = ?, updated_by = ? WHERE file_id = ?`;
        let queryParams = [license_id, notes, updated_by, req.params.id];

        // Check if a file is included in the request
        if (req.file) {
            const response = imageUploaderController.saveImage(req.file);
            if (response.error) {
                console.log('No file to update:', response);
                // return res.status(422).json(response);
            } else {
                console.log('License File Response Success:', response);
                query = `UPDATE license_files SET license_id = ?, file_name = ?, file_path = ?, file_size = ?, file_type = ?, file_notes = ?, updated_by = ? WHERE file_id = ?`;
                queryParams = [license_id, response.data.file_name, response.data.file_path, response.data.file_size, response.data.file_type, notes, updated_by, req.params.id];
            }
        }

        dbConnection.query(query, queryParams, (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity update
                const activity = {
                    admin_user_id: updated_by,
                    action_title: 'update',
                    action_description: `License File Record Updated Against License ID: ${license_id}`,
                    table_affected: 'license_file',
                    affected_id: req.params.id
                };

                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'License file details updated successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'License file details not found' });
            }
        });
    }

    static deleteById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Check if user_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide file_id' });
        }
        dbConnection.query(`DELETE FROM license_files WHERE file_id = ?`, [req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity delete
                const activity = {
                    admin_user_id: req.decoded.user_id,
                    action_title: 'delete',
                    action_description: `License File Record Deleted`,
                    table_affected: 'license_file',
                    affected_id: req.params.id
                };
                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'License file deleted successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'License file not found' });
            }
        });
    }
}

module.exports = LicenseFileController;
