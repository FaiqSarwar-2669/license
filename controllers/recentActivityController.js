// recentActivityController.js
const dbConnection = require('../connection.js');
const { validationResult } = require('express-validator');

class RecentActivityController {

    static logActivity(activity) {
        const query = `INSERT INTO recentactivity (admin_user_id, action_title, action_description, table_affected, affected_id) VALUES (?, ?, ?, ?, ?)`;

        dbConnection.query(query, [activity.admin_user_id, activity.action_title, activity.action_description, activity.table_affected, activity.affected_id], (error, result) => {
            if (error) {
                console.error("Failed to log recent activity:", error.message);
            } else {
                console.log(`New Activity logged for ${activity.table_affected}`, result);
            }
        });
    }

    static create(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: true, message: "Invalid data entered", data: errors.array() });
        }

        const { admin_user_id, action_description, table_affected, affected_id } = req.body;
        const query = `INSERT INTO recentactivity (admin_user_id, action_description, table_affected, affected_id) VALUES (?, ?, ?, ?)`;

        dbConnection.query(query, [admin_user_id, action_description, table_affected, affected_id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(201).json({ error: false, message: 'Recent activity logged successfully', data: { activity_id: result.insertId } });
        });
    }

    static getAll(req, res) {
        dbConnection.query(`SELECT ra.*, 
             created_user.user_name AS admin_user_name,
             created_user.user_photo AS admin_photo
            FROM recentactivity ra
            LEFT JOIN admin_users created_user ON ra.admin_user_id = created_user.user_id
            ORDER BY created_at DESC`, (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, data: results, message: 'All recent activities retrieved successfully' });
        });
    }

    // Optionally, if retrieving by ID is needed
    static getById(req, res) {
        dbConnection.query(`SELECT * FROM recentactivity WHERE activity_id = ?`, [req.params.id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: false, data: results[0], message: 'Recent activity details retrieved successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Recent activity not found' });
            }
        });
    }

    static getByAdminUserId(req, res) {
        const adminUserId = req.params.admin_user_id;
        dbConnection.query(`SELECT * FROM recentactivity WHERE admin_user_id = ? ORDER BY created_at DESC`, [adminUserId], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, data: results, message: `Recent activities for admin_user_id ${adminUserId} retrieved successfully` });
        });
    }

    static getByTableAffected(req, res) {
        const tableAffected = req.params.table_affected;
        dbConnection.query(`SELECT * FROM recentactivity WHERE table_affected = ? ORDER BY created_at DESC`, [tableAffected], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, data: results, message: `Recent activities for table '${tableAffected}' retrieved successfully` });
        });
    }

    static getByActionTitle(req, res) {
        const actionTitle = req.params.action_title;
        dbConnection.query(`SELECT * FROM recentactivity WHERE action_title = ? ORDER BY created_at DESC`, [actionTitle], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, data: results, message: `Recent activities for action '${actionTitle}' retrieved successfully` });
        });
    }

}

module.exports = RecentActivityController;
