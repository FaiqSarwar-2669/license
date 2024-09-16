// licensesNewController.js
const dbConnection = require('../connection.js');
const { validationResult } = require('express-validator');

class LicensesNewController {
    static create(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: true, message: "Invalid data entered", data: errors.array() });
        }

        // Add all necessary fields according to the `licenses_new` table schema
        const { license_name, category_id, manufacturer_id, validation_details, customer_id, activation_key, is_active, notes, software_details, category_details, product_key, company_details, license_provider_company_details, software_manufacturer_details, licensed_to_name, licensed_to_email, reassignable, supplier, order_number, purchase_cost, expiry_date, termination_date, purchase_order_number, depreciation, maintained, extra_notes } = req.body;

        const query = `INSERT INTO licenses_new (license_name, category_id, manufacturer_id, validation_details, customer_id, activation_key, is_active, notes, software_details, category_details, product_key, company_details, license_provider_company_details, software_manufacturer_details, licensed_to_name, licensed_to_email, reassignable, supplier, order_number, purchase_cost, expiry_date, termination_date, purchase_order_number, depreciation, maintained, extra_notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

        dbConnection.query(query, [license_name, category_id, manufacturer_id, validation_details, customer_id, activation_key, is_active, notes, software_details, category_details, product_key, company_details, license_provider_company_details, software_manufacturer_details, licensed_to_name, licensed_to_email, reassignable, supplier, order_number, purchase_cost, expiry_date, termination_date, purchase_order_number, depreciation, maintained, extra_notes], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(201).json({ error: false, message: 'New license created successfully', data: { license_id: result.insertId } });
        });
    }

    static getAll(req, res) {
        dbConnection.query(`SELECT * FROM licenses_new`, (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, data: results, message: 'All new licenses retrieved successfully' });
        });
    }

    static getById(req, res) {
        dbConnection.query(`SELECT * FROM licenses_new WHERE license_id = ?`, [req.params.id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: false, data: results[0], message: 'New license details retrieved successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'New license not found' });
            }
        });
    }

    static updateById(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: true, message: "Invalid data entered", data: errors.array() });
        }

        // Ensure to include all fields for update
        const updateFields = [license_name, category_id, manufacturer_id, validation_details, customer_id, activation_key, is_active, notes, software_details, category_details, product_key, company_details, license_provider_company_details, software_manufacturer_details, licensed_to_name, licensed_to_email, reassignable, supplier, order_number, purchase_cost, expiry_date, termination_date, purchase_order_number, depreciation, maintained, extra_notes, req.params.id];
        const query = `UPDATE licenses_new SET license_name = ?, category_id = ?, manufacturer_id = ?, validation_details = ?, customer_id = ?, activation_key = ?, is_active = ?, notes = ?, software_details = ?, category_details = ?, product_key = ?, company_details = ?, license_provider_company_details = ?, software_manufacturer_details = ?, licensed_to_name = ?, licensed_to_email = ?, reassignable = ?, supplier = ?, order_number = ?, purchase_cost = ?, expiry_date = ?, termination_date = ?, purchase_order_number = ?, depreciation = ?, maintained = ?, extra_notes = ?, updated_at = NOW() WHERE license_id = ?`;

        dbConnection.query(query, updateFields, (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                return res.status(200).json({ error: false, message: 'New license updated successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'New license not found' });
            }
        });
    }

    static deleteById(req, res) {
        dbConnection.query(`DELETE FROM licenses_new WHERE license_id = ?`, [req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                return res.status(200).json({ error: false, message: 'New license deleted successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'New license not found' });
            }
        });
    }
}

module.exports = LicensesNewController;
