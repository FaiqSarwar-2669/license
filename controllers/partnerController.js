const dbConnection = require('../connection.js');
const { validationResult } = require('express-validator');
const RecentActivityController = require('./recentActivityController'); 

class PartnerController {
    static create(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: true, message: "Invalid data entered", data: errors.array() });
        }

        const { partner_name, partner_alias, partner_address, partner_email, partner_phone, partner_logo, partner_status } = req.body;
        const created_by = req.decoded.user_id;
        const query = `INSERT INTO partner (partner_name, partner_alias, partner_address, partner_email, partner_phone, partner_logo, partner_status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        dbConnection.query(query, [partner_name, partner_alias, partner_address, partner_email, partner_phone, partner_logo, partner_status, created_by], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            // Log recent activity
            const activity = {
                admin_user_id: created_by,
                action_title: 'create',
                action_description: `Partner ${partner_name} Created`,
                table_affected: 'partner',
                affected_id: result.insertId
            };
            RecentActivityController.logActivity(activity);
            return res.status(201).json({ error: false, message: 'Partner created successfully', data: { partner_id: result.insertId } });
        });
    }

    static getAll(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        const query = `
            SELECT 
                partner.*, 
                created_user.user_name AS created_by_name, 
                updated_user.user_name AS updated_by_name
            FROM partner
            LEFT JOIN admin_users AS created_user ON partner.created_by = created_user.user_id
            LEFT JOIN admin_users AS updated_user ON partner.updated_by = updated_user.user_id;
        `;

        dbConnection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, data: results, message: 'All partners retrieved successfully' });
        });
    }

    static getById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide partner_id' });
        }

        dbConnection.query(`SELECT * FROM partner WHERE partner_id = ?`, [req.params.id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: false, data: results[0], message: 'Partner details retrieved successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Partner not found' });
            }
        });
    }

    static updateById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide partner_id' });
        }

        const { partner_name, partner_alias, partner_address, partner_email, partner_phone, partner_logo, partner_status } = req.body;
        const updated_by = req.decoded.user_id;
        const query = `UPDATE partner SET partner_name = ?, partner_alias = ?, partner_address = ?, partner_email = ?, partner_phone = ?, partner_logo = ?, partner_status = ?, updated_by = ? WHERE partner_id = ?`;

        dbConnection.query(query, [partner_name, partner_alias, partner_address, partner_email, partner_phone, partner_logo, partner_status, updated_by, req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity
                const activity = {
                    admin_user_id: updated_by,
                    action_title: 'update',
                    action_description: `Partner ${partner_name} Updated`,
                    table_affected: 'partner',
                    affected_id: req.params.id
                };
                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'Partner updated successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Partner not found' });
            }
        });
    }

    static updateStatusById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide partner_id' });
        }

        const updateQuery = `UPDATE partner SET partner_status = ?, updated_by = ? WHERE partner_id = ?`;
        const queryParams = [
            req.body.status,
            req.decoded.user_id,
            req.params.id
        ];

        dbConnection.query(updateQuery, queryParams, (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            // Log recent activity
            const activity = {
                admin_user_id: req.decoded.user_id,
                action_title: 'update',
                action_description: `Partner Status Updated`,
                table_affected: 'partner',
                affected_id: req.params.id
            };
            RecentActivityController.logActivity(activity);
            return res.status(200).json({ error: false, message: 'Status updated successfully' });
        });
    }

    static deleteById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide partner_id' });
        }

        dbConnection.query(`DELETE FROM partner WHERE partner_id = ?`, [req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity
                const activity = {
                    admin_user_id: req.decoded.user_id,
                    action_title: 'delete',
                    action_description: `Partner Deleted`,
                    table_affected: 'partner',
                    affected_id: req.params.id
                };
                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'Partner deleted successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Partner not found' });
            }
        });
    }
}

module.exports = PartnerController;
