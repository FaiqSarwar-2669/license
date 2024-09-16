// companyController.js
const dbConnection = require('../connection.js');
const { validationResult } = require('express-validator');
const RecentActivityController = require('./recentActivityController');

class CompanyController {
    static create(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            console.log('request decoded:', req.decoded);
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: true, message: "Invalid data entered", data: errors.array() });
        }

        const { company_name, company_alias, company_address, company_email, company_phone, company_logo, company_status } = req.body;
        const created_by = req.decoded.user_id;
        console.log('created_by :', created_by);
        const query = `INSERT INTO company (company_name, company_alias, company_address, company_email, company_phone, company_logo, company_status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        dbConnection.query(query, [company_name, company_alias, company_address, company_email, company_phone, company_logo, company_status, created_by], (error, result) => {
            if (error) {
                return res.status(501).json({ error: true, message: error.message });
            }
            // Log recent activity
            const activity = {
                admin_user_id: created_by,
                action_title: 'create',
                action_description: `Company ${company_name} Created`,
                table_affected: 'company',
                affected_id: result.insertId
            };
            RecentActivityController.logActivity(activity);
            return res.status(201).json({ error: false, message: 'Company created successfully', data: { company_id: result.insertId } });
        });
    }

    static getAll(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Modified query to include LEFT JOINs for created_by and updated_by
        const query = `
            SELECT 
                company.*, 
                created_user.user_name AS created_by_name, 
                updated_user.user_name AS updated_by_name 
            FROM company
            LEFT JOIN admin_users AS created_user ON company.created_by = created_user.user_id
            LEFT JOIN admin_users AS updated_user ON company.updated_by = updated_user.user_id;
        `;

        dbConnection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, data: results, message: 'All companies retrieved successfully' });
        });
    }

    static getById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Check if user_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide company_id' });
        }

        dbConnection.query(`SELECT * FROM company WHERE company_id = ?`, [req.params.id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: false, data: results[0], message: 'Company details retrieved successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Company not found' });
            }
        });
    }

    static updateById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Check if user_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide company_id' });
        }

        const { company_name, company_address, company_email, company_phone, company_status, company_logo } = req.body;
        const updated_by = req.decoded.user_id;
        const query = `UPDATE company SET company_name = ?, company_address = ?, company_email = ?, company_phone = ?, company_status = ?, company_logo = ?, updated_by = ? WHERE company_id = ?`;

        dbConnection.query(query, [company_name, company_address, company_email, company_phone, company_status, company_logo, updated_by, req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity update
                const activity = {
                    admin_user_id: updated_by,
                    action_title: 'update',
                    action_description: `Company ${company_name} Updated`,
                    table_affected: 'company',
                    affected_id: req.params.id
                };
                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'Company updated successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Company not found' });
            }
        });
    }

    static updateStatusById(req, res) {

        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide company_id' });
        }

        const updateQuery = `UPDATE company SET 
                    company_status = ?, 
                    updated_by = ? 
                    WHERE company_id = ?`;
        const queryParams = [
            req.body.status,
            req.decoded.user_id,
            req.params.id
        ];

        dbConnection.query(updateQuery, queryParams, (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error });
            }
            // Log recent activity  update status
            const activity = {
                admin_user_id: req.decoded.user_id,
                action_title: 'update',
                action_description: `Company Status Updated`,
                table_affected: 'company',
                affected_id: req.params.id
            };
            RecentActivityController.logActivity(activity);
            return res.status(200).json({ error: false, data: result, message: 'Status Updated Successfully.' });
        });
    }

    static deleteById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide company_id' });
        }
        dbConnection.query(`DELETE FROM company WHERE company_id = ?`, [req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity delete
                const activity = {
                    admin_user_id: req.decoded.user_id,
                    action_title: 'delete',
                    action_description: `Company Record Deleted`,
                    table_affected: 'company',
                    affected_id: req.params.id
                };
                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'Company deleted successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Company not found' });
            }
        });
    }
}

module.exports = CompanyController;
