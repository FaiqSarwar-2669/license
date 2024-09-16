// categoryController.js
const dbConnection = require('../connection.js');
const { validationResult } = require('express-validator');
const RecentActivityController = require('./recentActivityController'); 

class CategoryController {
    static create(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: true, message: "Invalid data entered", data: errors.array() });
        }

        const { category_name, category_alias, category_description, category_status } = req.body;
        const created_by = req.decoded.user_id;
        const query = `INSERT INTO category (category_name, category_alias, category_description, category_status, created_by) VALUES (?, ?, ?, ?, ?)`;

        dbConnection.query(query, [category_name, category_alias, category_description, category_status, created_by], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            // Log recent activity
            const activity = {
                admin_user_id: created_by,
                action_title: 'create',
                action_description: `Category ${category_name} Created`,
                table_affected: 'category',
                affected_id: result.insertId
            };
            RecentActivityController.logActivity(activity);
            return res.status(201).json({ error: false, message: 'Category created successfully', data: { category_id: result.insertId } });
        });
    }

    static getAll(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Adjusted query to include JOINs with the admin_users table for created_by and updated_by
        const query = `
            SELECT 
                category.*,
                created_user.user_name AS created_by_name, 
                updated_user.user_name AS updated_by_name
            FROM category
            LEFT JOIN admin_users AS created_user ON category.created_by = created_user.user_id
            LEFT JOIN admin_users AS updated_user ON category.updated_by = updated_user.user_id;
        `;

        dbConnection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, data: results, message: 'All categories retrieved successfully' });
        });
    }

    static getById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Check if user_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide category_id' });
        }

        dbConnection.query(`SELECT * FROM category WHERE category_id = ?`, [req.params.id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: false, data: results[0], message: 'Category details retrieved successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Category not found' });
            }
        });
    }

    static updateById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Check if user_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide category_id' });
        }

        const { category_name, category_description, category_status } = req.body;
        const updated_by = req.decoded.user_id;
        const query = `UPDATE category SET category_name = ?, category_description = ?, category_status = ?, updated_by = ? WHERE category_id = ?`;

        dbConnection.query(query, [category_name, category_description, category_status, updated_by, req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity
                const activity = {
                    admin_user_id: updated_by,
                    action_title: 'update',
                    action_description: `Category ${category_name} Updated`,
                    table_affected: 'category',
                    affected_id: req.params.id
                };
                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'Category updated successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Category not found' });
            }
        });
    }

    static updateStatusById(req, res) {

        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide category_id' });
        }

        const updateQuery = `UPDATE category SET 
                    category_status = ?, 
                    updated_by = ? 
                    WHERE category_id = ?`;
        const queryParams = [
            req.body.status,
            req.decoded.user_id,
            req.params.id
        ];

        dbConnection.query(updateQuery, queryParams, (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error });
            }
            // Log recent activity
            const activity = {
                admin_user_id: req.decoded.user_id,
                action_title: 'update',
                action_description: `Category Status Updated`,
                table_affected: 'category',
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
            return res.status(400).json({ error: true, message: 'Please provide category_id' });
        }
        dbConnection.query(`DELETE FROM category WHERE category_id = ?`, [req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity
                const activity = {
                    admin_user_id: req.decoded.user_id,
                    action_title: 'delete',
                    action_description: `Category Record Deleted`,
                    table_affected: 'category',
                    affected_id: req.params.id
                };
                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'Category deleted successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Category not found' });
            }
        });
    }
}

module.exports = CategoryController;
