// customerController.js
const dbConnection = require('../connection.js');
const { validationResult } = require('express-validator');
const RecentActivityController = require('./recentActivityController');

class CustomerController {
    static create(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: true, message: "Invalid data entered", data: errors.array() });
        }

        const { customer_uuid, company_alias, customer_firstname, customer_lastname, customer_email, customer_mobile, customer_address, customer_city, customer_state, customer_country, customer_zipcode, customer_photo, customer_status } = req.body;
        const created_by = req.decoded.user_id;
        const query = `INSERT INTO customer (customer_uuid, company_alias, customer_firstname, customer_lastname, customer_email, customer_mobile, customer_address, customer_city, customer_state, customer_country, customer_zipcode, customer_photo, customer_status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        dbConnection.query(query, [customer_uuid, company_alias, customer_firstname, customer_lastname, customer_email, customer_mobile, customer_address, customer_city, customer_state, customer_country, customer_zipcode, customer_photo, customer_status, created_by], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
             // Log recent activity create
             const activity = {
                admin_user_id: created_by,
                action_title: 'create',
                action_description: `Customer ${customer_firstname} ${customer_lastname} Created`,
                table_affected: 'customer',
                affected_id: result.insertId
            };
            RecentActivityController.logActivity(activity);
            return res.status(201).json({ error: false, message: 'Customer created successfully', data: { customer_id: result.insertId } });
        });
    }

    static getAll(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }
    
        // Modified query to include LEFT JOINs for created_by and updated_by
        const query = `
            SELECT 
                customer.*, 
                created_user.user_name AS created_by_name,
                updated_user.user_name AS updated_by_name 
            FROM customer
            LEFT JOIN admin_users AS created_user ON customer.created_by = created_user.user_id
            LEFT JOIN admin_users AS updated_user ON customer.updated_by = updated_user.user_id;
        `;
    
        dbConnection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, data: results, message: 'All customers retrieved successfully' });
        });
    }    

    static getById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Check if user_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide customer_id' });
        }

        dbConnection.query(`SELECT * FROM customer WHERE customer_id = ?`, [req.params.id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: false, data: results[0], message: 'Customer details retrieved successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Customer not found' });
            }
        });
    }

    static updateById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Check if user_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide customer_id' });
        }

        const { company_alias, customer_firstname, customer_lastname, customer_email, customer_mobile, customer_address, customer_city, customer_state, customer_country, customer_zipcode, customer_photo, customer_status } = req.body;
        const updated_by = req.decoded.user_id;
        const query = `UPDATE customer SET company_alias = ?, customer_firstname = ?, customer_lastname = ?, customer_email = ?, customer_mobile = ?, customer_address = ?, customer_city = ?, customer_state = ?, customer_country = ?, customer_zipcode = ?, customer_photo = ?, customer_status = ?, updated_by= ? WHERE customer_id = ?`;

        dbConnection.query(query, [company_alias, customer_firstname, customer_lastname, customer_email, customer_mobile, customer_address, customer_city, customer_state, customer_country, customer_zipcode, customer_photo, customer_status, updated_by, req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity update
                const activity = {
                    admin_user_id: updated_by,
                    action_title: 'update',
                    action_description: `Customer ${customer_firstname} ${customer_lastname} Updated`,
                    table_affected: 'customer',
                    affected_id: req.params.id
                };
                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'Customer updated successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Customer not found' });
            }
        });
    }

    static updateStatusById(req, res) {

        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide customer_id' });
        }

        const updateQuery = `UPDATE customer SET 
                    customer_status = ?, 
                    updated_by = ? 
                    WHERE customer_id = ?`;
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
                action_description: `Customer Status Updated`,
                table_affected: 'customer',
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

        // Check if user_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide customer_id' });
        }

        dbConnection.query(`DELETE FROM customer WHERE customer_id = ?`, [req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity delete
                const activity = {
                    admin_user_id: req.decoded.user_id,
                    action_title: 'delete',
                    action_description: `Customer Record Deleted`,
                    table_affected: 'customer',
                    affected_id: req.params.id
                };
                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'Customer deleted successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Customer not found' });
            }
        });
    }
}

module.exports = CustomerController;
