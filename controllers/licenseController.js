// licensesController.js
const dbConnection = require('../connection.js');
const { validationResult } = require('express-validator');
const RecentActivityController = require('./recentActivityController');

class LicensesController {
    static create(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: true, message: "Invalid data entered", data: errors.array() });
        }

        const { license_name, category_alias, manufacturer_id, license_details, license_agents, start_date, expiry_date, company_alias, customer_uuid, license_key, is_active, notes } = req.body;
        const created_by = req.decoded.user_id;
        const query = `INSERT INTO licenses (license_name, category_alias, manufacturer_id, license_details, license_agents, start_date, expiry_date, company_alias, customer_uuid, license_key, is_active, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        dbConnection.query(query, [license_name, category_alias, manufacturer_id, license_details, license_agents, start_date, expiry_date, company_alias, customer_uuid, license_key, is_active, notes, created_by], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            // Log recent activity create
            const activity = {
                admin_user_id: created_by,
                action_title: 'create',
                action_description: `New License ${license_name} Created`,
                table_affected: 'license',
                affected_id: result.insertId
            };
            RecentActivityController.logActivity(activity);
            return res.status(201).json({ error: false, message: 'License created successfully', data: { license_id: result.insertId } });
        });
    }

    static getAll(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        const query = `
            SELECT 
                l.*,
                c.category_name AS license_category, 
                m.manufacturer_name AS license_manufacturer, 
                CONCAT(cu.customer_firstname, ' ', cu.customer_lastname) AS license_customer,
                cu.customer_email, cu.customer_mobile,
                co.company_name, co.company_email, co.company_phone, co.company_logo,
                created_user.user_name AS created_by_user_name,
                updated_user.user_name AS updated_by_user_name 
            FROM licenses l
            LEFT JOIN category c ON l.category_alias = c.category_alias
            LEFT JOIN licensemanufacturers m ON l.manufacturer_id = m.manufacturer_id
            LEFT JOIN customer cu ON l.customer_uuid = cu.customer_uuid
            LEFT JOIN company co ON l.company_alias = co.company_alias
            LEFT JOIN admin_users created_user ON l.created_by = created_user.user_id
            LEFT JOIN admin_users updated_user ON l.updated_by = updated_user.user_id; 
        `;

        dbConnection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, data: results, message: 'All licenses retrieved successfully' });
        });
    }

    static getById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Check if license_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide license_id' });
        }
        const query = `
            SELECT 
                l.*, 
                c.category_name AS license_category, 
                m.manufacturer_name AS license_manufacturer, 
                CONCAT(cu.customer_firstname, ' ', cu.customer_lastname) AS license_customer,
                cu.customer_email, cu.customer_mobile,
                co.company_name, co.company_email, co.company_phone, co.company_logo,
                aduser.user_name
            FROM licenses l
            LEFT JOIN category c ON l.category_alias = c.category_alias
            LEFT JOIN licensemanufacturers m ON l.manufacturer_id = m.manufacturer_id
            LEFT JOIN customer cu ON l.customer_uuid = cu.customer_uuid
            LEFT JOIN company co ON l.company_alias = co.company_alias
            LEFT JOIN  admin_users aduser ON aduser.user_id = l.created_by
            WHERE l.license_id=?
        `;
        dbConnection.query(query, [req.params.id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: false, data: results[0], message: 'License details retrieved successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'License not found' });
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
                l.*, 
                aduser.user_name
            FROM licenses_files l
            LEFT JOIN  admin_users aduser ON aduser.user_id = l.created_by
            WHERE l.license_id=?
        `;
        dbConnection.query(query, [req.params.id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: false, data: results[0], message: 'License files retrieved successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'License not found' });
            }
        });
    }

    static updateById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Check if user_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide license_id' });
        }

        const { license_name, category_alias, manufacturer_id, license_details, license_agents, start_date, expiry_date, company_alias, customer_uuid, license_key, is_active, notes } = req.body;
        const updated_by = req.decoded.user_id;
        const query = `UPDATE licenses SET license_name = ?, category_alias = ?, manufacturer_id = ?, license_details = ?, license_agents = ?, start_date = ?,  expiry_date = ?, company_alias = ?, customer_uuid = ?, license_key = ?, is_active = ?, notes = ?, updated_by = ? WHERE license_id = ?`;

        dbConnection.query(query, [license_name, category_alias, manufacturer_id, license_details, license_agents, start_date, expiry_date, company_alias, customer_uuid, license_key, is_active, notes, updated_by, req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity update
                const activity = {
                    admin_user_id: updated_by,
                    action_title: 'update',
                    action_description: `License ${license_name} Updated`,
                    table_affected: 'license',
                    affected_id: req.params.id
                };

                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'License updated successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'License not found' });
            }
        });
    }

    static deleteById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Check if user_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide license_id' });
        }
        dbConnection.query(`DELETE FROM licenses WHERE license_id = ?`, [req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity delete
                const activity = {
                    admin_user_id: req.decoded.user_id,
                    action_title: 'delete',
                    action_description: `License Record Deleted`,
                    table_affected: 'license',
                    affected_id: req.params.id
                };
                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'License deleted successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'License not found' });
            }
        });
    }
}

module.exports = LicensesController;
