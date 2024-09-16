// licenseManufacturersController.js
const dbConnection = require('../connection.js');
const { validationResult } = require('express-validator');
const RecentActivityController = require('./recentActivityController');

class LicenseManufacturersController {
    static create(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: true, message: "Invalid data entered", data: errors.array() });
        }

        const { name, email, phone, address, status } = req.body;
        const created_by = req.decoded.user_id;
        const query = `INSERT INTO licensemanufacturers (manufacturer_name, manufacturer_email, manufacturer_phone, manufacturer_address, manufacturer_status, created_by) VALUES (?, ?, ?, ?, ?, ?)`;

        dbConnection.query(query, [name, email, phone, address, status, created_by], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            // Log recent activity create
            const activity = {
                admin_user_id: created_by,
                action_title: 'create',
                action_description: `License Manufacturer ${name} Created`,
                table_affected: 'license_manufacturer',
                affected_id: result.insertId
            };
            RecentActivityController.logActivity(activity);
            return res.status(201).json({ error: false, message: 'Manufacturer created successfully', data: { manufacturer_id: result.insertId } });
        });
    }

    static getAll(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        const query = `
            SELECT 
                lm.*,
                created_user.user_name AS created_by_name,
                updated_user.user_name AS updated_by_name 
            FROM licensemanufacturers lm
            LEFT JOIN admin_users AS created_user ON lm.created_by = created_user.user_id
            LEFT JOIN admin_users AS updated_user ON lm.updated_by = updated_user.user_id;
        `;

        dbConnection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, data: results, message: 'All manufacturers retrieved successfully' });
        });
    }

    static getById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Check if user_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide manufacturer_id' });
        }
        dbConnection.query(`SELECT * FROM licensemanufacturers WHERE manufacturer_id = ?`, [req.params.id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: false, data: results[0], message: 'Manufacturer details retrieved successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Manufacturer not found' });
            }
        });
    }

    static updateById(req, res) {

        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Check if user_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide manufacturer_id' });
        }

        const { name, email, phone, address, status } = req.body;
        const updated_by = req.decoded.user_id;
        const query = `UPDATE licensemanufacturers SET manufacturer_name = ?, manufacturer_email = ?, manufacturer_phone = ?, manufacturer_address = ?, manufacturer_status = ?, updated_by = ? WHERE manufacturer_id = ?`;

        dbConnection.query(query, [name, email, phone, address, status, updated_by, req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity update
                const activity = {
                    admin_user_id: updated_by,
                    action_title: 'update',
                    action_description: `License Manufacturer ${name} Updated`,
                    table_affected: 'license_manufacturer',
                    affected_id: req.params.id
                };

                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'Manufacturer updated successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Manufacturer not found' });
            }
        });
    }

    static updateStatusById(req, res) {

        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide manufacturer_id' });
        }

        const updateQuery = `UPDATE licensemanufacturers SET 
                    manufacturer_status = ?, 
                    updated_by = ? 
                    WHERE manufacturer_id = ?`;
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
                action_description: `License Manufacturer Status Updated`,
                table_affected: 'license_manufacturer',
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
            return res.status(400).json({ error: true, message: 'Please provide manufacturer_id' });
        }
        dbConnection.query(`DELETE FROM licensemanufacturers WHERE manufacturer_id = ?`, [req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity delete
                const activity = {
                    admin_user_id: req.decoded.user_id,
                    action_title: 'delete',
                    action_description: `License Manufacturer Record Deleted`,
                    table_affected: 'license_manufacturer',
                    affected_id: req.params.id
                };
                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'Manufacturer deleted successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Manufacturer not found' });
            }
        });
    }
}

module.exports = LicenseManufacturersController;
