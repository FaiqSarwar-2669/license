// permissionsController.js
const dbConnection = require('../connection.js');
const { validationResult } = require('express-validator');
const RecentActivityController = require('./recentActivityController');

class PermissionsController {
    static create(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: true, message: "Invalid data entered", data: errors.array() });
        }

        const { permission_name, read_permission, write_permission, delete_permission } = req.body;
        const created_by = req.decoded.user_id;
        const query = `INSERT INTO permissions (permission_name, read_permission, write_permission, delete_permission, created_by) VALUES (?, ?, ?, ?, ?)`;

        dbConnection.query(query, [permission_name, read_permission, write_permission, delete_permission, created_by], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            // Log recent activity create
            const activity = {
                admin_user_id: created_by,
                action_title: 'create',
                action_description: `Permission ${permission_name} Created`,
                table_affected: 'permission',
                affected_id: result.insertId
            };
            RecentActivityController.logActivity(activity);
            return res.status(201).json({ error: false, message: 'Permission created successfully', data: { permission_id: result.insertId } });
        });
    }

    static getAll(req, res) {
        // Adjusted query to include JOINs for created_by and updated_by
        const query = `
            SELECT 
                permissions.*,
                created_user.user_name AS created_by_name,
                updated_user.user_name AS updated_by_name 
            FROM permissions
            LEFT JOIN admin_users AS created_user ON permissions.created_by = created_user.user_id
            LEFT JOIN admin_users AS updated_user ON permissions.updated_by = updated_user.user_id;
        `;

        dbConnection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, data: results, message: 'All permissions retrieved successfully' });
        });
    }

    static getById(req, res) {
        dbConnection.query(`SELECT * FROM permissions WHERE permission_id = ?`, [req.params.id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: false, data: results[0], message: 'Permission details retrieved successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Permission not found' });
            }
        });
    }

    static updateById(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: true, message: "Invalid data entered", data: errors.array() });
        }

        const { permission_name, read_permission, write_permission, delete_permission } = req.body;
        const updated_by = req.decoded.user_id;
        const query = `UPDATE permissions SET permission_name = ?, read_permission = ?, write_permission = ?, delete_permission = ?, updated_by = ? WHERE permission_id = ?`;

        dbConnection.query(query, [permission_name, read_permission, write_permission, delete_permission, updated_by, req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity update
                const activity = {
                    admin_user_id: updated_by,
                    action_title: 'update',
                    action_description: `Permission ${permission_name} Updated`,
                    table_affected: 'permission',
                    affected_id: req.params.id
                };

                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'Permission updated successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Permission not found' });
            }
        });
    }

    static deleteById(req, res) {
        dbConnection.query(`DELETE FROM permissions WHERE permission_id = ?`, [req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity delete
                const activity = {
                    admin_user_id: req.decoded.user_id,
                    action_title: 'delete',
                    action_description: `Permission Record Deleted`,
                    table_affected: 'permission',
                    affected_id: req.params.id
                };
                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'Permission deleted successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Permission not found' });
            }
        });
    }

    // Additional API: Check a user's permission for a specific table
    static checkUserPermission(req, res) {
        const { user_id, table_name } = req.query; // Assuming these are passed as query parameters
        dbConnection.query(`SELECT * FROM permissions WHERE user_id = ? AND table_name = ?`, [user_id, table_name], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: false, data: results[0], message: 'Permission check completed successfully' });
            } else {
                return res.status(404).json({ error: false, message: 'No permissions found for this user on the specified table' });
            }
        });
    }
}

module.exports = PermissionsController;
