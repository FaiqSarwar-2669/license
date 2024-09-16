// dashboardUpdatesController.js
const dbConnection = require('../connection.js');
const { validationResult } = require('express-validator');

class DashboardUpdatesController {
    static create(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: true, message: "Invalid data entered", data: errors.array() });
        }

        const { update_description } = req.body;
        const query = `INSERT INTO dashboardupdates (update_description) VALUES (?)`;

        dbConnection.query(query, [update_description], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(201).json({ error: false, message: 'Dashboard update created successfully', data: { update_id: result.insertId } });
        });
    }

    static getAll(req, res) {
        dbConnection.query(`SELECT * FROM dashboardupdates`, (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, data: results, message: 'All dashboard updates retrieved successfully' });
        });
    }

    static getById(req, res) {
        dbConnection.query(`SELECT * FROM dashboardupdates WHERE update_id = ?`, [req.params.id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: false, data: results[0], message: 'Dashboard update details retrieved successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Dashboard update not found' });
            }
        });
    }

    static updateById(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: true, message: "Invalid data entered", data: errors.array() });
        }

        const { update_description } = req.body;
        const query = `UPDATE dashboardupdates SET update_description = ? WHERE update_id = ?`;

        dbConnection.query(query, [update_description, req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                return res.status(200).json({ error: false, message: 'Dashboard update updated successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Dashboard update not found' });
            }
        });
    }

    static deleteById(req, res) {
        dbConnection.query(`DELETE FROM dashboardupdates WHERE update_id = ?`, [req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                return res.status(200).json({ error: false, message: 'Dashboard update deleted successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Dashboard update not found' });
            }
        });
    }
}

module.exports = DashboardUpdatesController;
