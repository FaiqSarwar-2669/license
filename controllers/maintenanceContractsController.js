// maintenanceContractsController.js
const dbConnection = require('../connection.js');
const { validationResult } = require('express-validator');
const RecentActivityController = require('./recentActivityController');

class MaintenanceContractsController {
    static create(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: true, message: "Invalid data entered", data: errors.array() });
        }

        const { contract_type, start_date, end_date, license_id, amount, notes } = req.body;
        const created_by = req.decoded.user_id;
        const query = `INSERT INTO maintenancecontracts (contract_type, start_date, end_date, license_id, amount, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`;

        dbConnection.query(query, [contract_type, start_date, end_date, license_id, amount, notes, created_by], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            // Log recent activity create
            const activity = {
                admin_user_id: created_by,
                action_title: 'create',
                action_description: `Maintenance Contract ${contract_type} Created against License ID: ${license_id}`,
                table_affected: 'maintenance_contract',
                affected_id: result.insertId
            };
            RecentActivityController.logActivity(activity);
            return res.status(201).json({ error: false, message: 'Maintenance contract created successfully', data: { contract_id: result.insertId } });
        });
    }

    // static getAll(req, res) {
    //     if (!req.decoded || !req.decoded.user_id) {
    //         return res.status(422).json({ error: true, message: "Invalid user information in token" });
    //     }

    //     const query = `SELECT * FROM maintenancecontracts`;

    //     dbConnection.query(query, (error, results) => {
    //         if (error) {
    //             return res.status(500).json({ error: true, message: error.message });
    //         }
    //         return res.status(200).json({ error: false, data: results, message: 'All maintenance contracts retrieved successfully' });
    //     });
    // }

    static getAll(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Adjusted query to include JOINs for license and admin_users tables
        // and to replace license_id with license_name, and created_by and updated_by with user names
        const query = `
            SELECT 
                mc.contract_id, 
                mc.contract_type, 
                mc.start_date, 
                mc.end_date,
                mc.license_id, 
                l.license_name,
                mc.amount, 
                mc.notes, 
                mc.created_at, 
                cu1.user_name AS created_by_name,
                cu2.user_name AS updated_by_name,
                mc.updated_at
            FROM maintenancecontracts mc
            LEFT JOIN licenses l ON mc.license_id = l.license_id
            LEFT JOIN admin_users cu1 ON mc.created_by = cu1.user_id
            LEFT JOIN admin_users cu2 ON mc.updated_by = cu2.user_id
        `;

        dbConnection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            // Modify the results to handle null values for updated_by_name, if necessary
            // This step might be redundant if it's acceptable to have null values in the response
            const modifiedResults = results.map(result => ({
                ...result,
                updated_by_name: result.updated_by_name || 'N/A' // Or any default value you prefer
            }));
            return res.status(200).json({ error: false, data: modifiedResults, message: 'All maintenance contracts retrieved successfully' });
        });
    }


    static getById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide contract_id' });
        }
        const query = `SELECT * FROM maintenancecontracts WHERE contract_id=?`;

        dbConnection.query(query, [req.params.id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: false, data: results[0], message: 'Maintenance contract details retrieved successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Maintenance contract not found' });
            }
        });
    }

    static updateById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide contract_id' });
        }

        const { contract_type, start_date, end_date, license_id, amount, notes } = req.body;
        const updated_by = req.decoded.user_id;
        const query = `UPDATE maintenancecontracts SET contract_type = ?, start_date = ?, end_date = ?, license_id = ?, amount = ?, notes = ?, updated_by = ? WHERE contract_id = ?`;

        dbConnection.query(query, [contract_type, start_date, end_date, license_id, amount, notes, updated_by, req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity update
                const activity = {
                    admin_user_id: updated_by,
                    action_title: 'update',
                    action_description: `Maintenance Contract ${contract_type} Updated against License ID: ${license_id}`,
                    table_affected: 'maintenance_contract',
                    affected_id: req.params.id
                };

                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'Maintenance contract updated successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Maintenance contract not found' });
            }
        });
    }

    static deleteById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide contract_id' });
        }
        dbConnection.query(`DELETE FROM maintenancecontracts WHERE contract_id = ?`, [req.params.id], (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (result.affectedRows > 0) {
                // Log recent activity delete
                const activity = {
                    admin_user_id: req.decoded.user_id,
                    action_title: 'delete',
                    action_description: `Maintenance Contract Record Deleted`,
                    table_affected: 'maintenance_contract',
                    affected_id: req.params.id
                };
                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'Maintenance contract deleted successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Maintenance contract not found' });
            }
        });
    }
}

module.exports = MaintenanceContractsController;
