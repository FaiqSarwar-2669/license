const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const dbConnection = require('../connection.js');
const RecentActivityController = require('./recentActivityController');

class UserController {
    static create(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Validate request data
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ error: true, message: "Invalid data entered!!!", data: errors.array() });
        }

        // Check if user data already exists
        new Promise((resolve, reject) => {
            dbConnection.query(
                `SELECT * FROM admin_users WHERE LOWER(user_username) = LOWER(?);`,
                [req.body.username],
                (error, results) => {
                    if (error) reject(error);
                    else resolve(results);
                }
            );
        })
            .then(result => {
                if (result.length) {
                    throw new Error('User Data already exists!');
                } else {
                    return bcrypt.hash(req.body.password, 10);
                }
            })
            .then(hash => {
                return new Promise((resolve, reject) => {
                    dbConnection.query(
                        `INSERT INTO admin_users (
                        user_name, 
                        user_email, 
                        user_mobile, 
                        user_username, 
                        user_password, 
                        user_role,
                        user_photo,
                        user_address,
                        created_by
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            req.body.name,
                            req.body.email,
                            req.body.mobile,
                            req.body.username,
                            hash,
                            req.body.role,
                            req.body.photo,
                            req.body.address,
                            req.decoded.user_id
                        ],
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                });
            })
            .then((result) => {
                // Log recent activity create
                const activity = {
                    admin_user_id: req.decoded.user_id,
                    action_title: 'create',
                    action_description: `New User ${req.body.username} Created`,
                    table_affected: 'admin_user',
                    affected_id: result.insertId
                };
                RecentActivityController.logActivity(activity);
                return res.status(201).json({ error: false, message: 'New user created successfully!' });
            })
            .catch(error => {
                // Ensure that no further processing is done if an error is caught
                if (!res.headersSent) {
                    return res.status(500).json({ error: true, message: error.message });
                }
            });
    }

    static getAll(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Modified query to include self-joins for created_by and updated_by
        const query = `
            SELECT 
            au.*,
            creator.user_name AS created_by_name,
            updater.user_name AS updated_by_name,
            p.permission_name AS user_role_name
        FROM admin_users au
        LEFT JOIN admin_users AS creator ON au.created_by = creator.user_id
        LEFT JOIN admin_users AS updater ON au.updated_by = updater.user_id
        LEFT JOIN permissions p ON au.user_role = p.permission_id;
        `;

        dbConnection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, data: results, message: 'All Users Details.' });
        });
    }

    static getById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Check if user_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide user_id' });
        }

        // Retrieve user by id from the database
        dbConnection.query(`SELECT * FROM admin_users WHERE user_id = ${dbConnection.escape(req.params.id)}`, (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error });
            }

            if (result.length) {
                return res.status(200).json({ error: false, data: result[0], message: `User Details are as follows` });
            } else {
                return res.status(404).json({ error: true, message: 'User not found' });
            }
        });
    }

    static updatePassword(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Check if user_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide user_id' });
        }

        // Hash the new password
        bcrypt.hash(req.body.password, 10, (error, hash) => {
            if (error) {
                return res.status(500).json({ error: true, message: error });
            }

            // Update user password in the database
            dbConnection.query(
                `UPDATE admin_users SET 
                 user_password = ${dbConnection.escape(hash)}, 
                 updated_by = ${dbConnection.escape(req.decoded.user_id)} 
                 WHERE user_id = ${dbConnection.escape(req.params.id)}`,
                (error, result) => {
                    if (error) {
                        return res.status(500).json({ error: true, message: error });
                    }

                    if (result.affectedRows > 0) {
                        // Log recent activity update
                        const activity = {
                            admin_user_id: req.decoded.user_id,
                            action_title: 'update',
                            action_description: `Admin User Password Updated`,
                            table_affected: 'admin_user',
                            affected_id: req.params.id
                        };

                        RecentActivityController.logActivity(activity);
                        return res.status(200).json({ error: false, message: 'Password Updated Successfully.' });
                    } else {
                        return res.status(404).json({ error: true, message: 'User not found' });
                    }
                }
            );
        });
    }

    static updateById(req, res) {
        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        // Check if user_id parameter is provided
        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide user_id' });
        }

        // Directly proceed to update logic
        console.log('Proceeding to update user ID:', req.params.id);
        if (req.body.password) {
            bcrypt.hash(req.body.password, 10, (error, hash) => {
                if (error) {
                    return res.status(500).json({ error: true, message: error });
                }
                req.body.password = hash; // Update the password with hashed value
                executeUpdate(); // Proceed with the rest of the update operation
            });
        } else {
            executeUpdate(); // If there's no password to hash, proceed directly
        }

        function executeUpdate() {
            let updateData = {
                user_name: req.body.name,
                user_email: req.body.email,
                user_mobile: req.body.mobile,
                user_role: req.body.role,
                user_status: req.body.status,
                user_photo: req.body.photo,
                user_address: req.body.address,
                updated_by: req.decoded.user_id
            };

            // Build the update query dynamically based on provided fields
            let query = 'UPDATE admin_users SET ';
            query += Object.keys(updateData).filter(key => updateData[key] !== undefined)
                .map(key => `${key} = ${dbConnection.escape(updateData[key])}`).join(', ');
            query += ` WHERE user_id = ${dbConnection.escape(req.params.id)}`;

            // Execute the update query
            dbConnection.query(query, (error, result) => {
                if (error) {
                    return res.status(500).json({ error: true, message: error.message });
                }

                if (result.affectedRows > 0) {
                    // Log recent activity update
                    const activity = {
                        admin_user_id: req.decoded.user_id,
                        action_title: 'update',
                        action_description: `Admin User ${req.body.name} Updated`,
                        table_affected: 'admin_user',
                        affected_id: req.params.id
                    };

                    RecentActivityController.logActivity(activity);
                    return res.status(200).json({ error: false, message: 'User Updated Successfully.' });
                } else {
                    return res.status(404).json({ error: true, message: 'User not found' });
                }
            });
        }
    }

    static updateStatusById(req, res) {

        if (!req.decoded || !req.decoded.user_id) {
            return res.status(422).json({ error: true, message: "Invalid user information in token" });
        }

        if (!req.params.id) {
            return res.status(400).json({ error: true, message: 'Please provide user_id' });
        }

        const updateQuery = `UPDATE admin_users SET 
                    user_status = ?, 
                    updated_by = ? 
                    WHERE user_id = ?`;
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
                action_description: `Admin User Status Updated`,
                table_affected: 'admin_user',
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
            return res.status(400).json({ error: true, message: 'Please provide user_id' });
        }

        // Delete user by id from the database
        dbConnection.query(`DELETE FROM admin_users WHERE user_id = ${dbConnection.escape(req.params.id)};`, (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error });
            }

            if (result.affectedRows > 0) {
                // Log recent activity delete
                const activity = {
                    admin_user_id: req.decoded.user_id,
                    action_title: 'delete',
                    action_description: `Admin User Record Deleted`,
                    table_affected: 'admin_user',
                    affected_id: req.params.id
                };
                RecentActivityController.logActivity(activity);
                return res.status(200).json({ error: false, message: 'User has been deleted successfully.' });
            } else {
                return res.status(404).json({ error: true, message: 'User not found' });
            }
        });
    }
}

module.exports = UserController;
