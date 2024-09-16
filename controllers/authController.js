const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbConnection = require('../connection.js');
const config = require('../config.json');
const RecentActivityController = require('./recentActivityController');


class AuthController {
    static register(req, res) {

        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).send({ error: true, message: 'Invalid Data Entered!!!', data: errors.array() });
            }

            const existingUser = dbConnection.query(
                `SELECT * FROM admin_users WHERE 
            LOWER(user_username) = LOWER(?)
            OR LOWER(user_email) = LOWER(?)
            OR LOWER(user_mobile) = LOWER(?);`,
                [req.body.username, req.body.email, req.body.mobile]
            );

            if (existingUser.length) {
                return res.status(409).send({ message: 'This user already exists!' });
            }

            // Username is available, proceed with registration
            const hashedPassword = bcrypt.hash(req.body.password, 10);
            const currentDate = new Date().toLocaleString();

            dbConnection.query(
                `INSERT INTO admin_users (
            user_name, 
            user_email, 
            user_mobile, 
            user_username, 
            user_password, 
            user_role, 
            user_last_login, 
            user_photo,
            user_address,
            created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    req.body.name,
                    req.body.email,
                    req.body.mobile,
                    req.body.username,
                    hashedPassword,
                    req.body.role,
                    currentDate,
                    req.body.photo,
                    req.body.address,
                    req.body.created_by
                ]
            );

            // Log recent activity create
            const activity = {
                admin_user_id: req.body.created_by,
                action_title: 'create',
                action_description: `Admin User ${req.body.username} Created`,
                table_affected: 'admin_user',
                affected_id: result.insertId
            };
            RecentActivityController.logActivity(activity);

            return res.status(201).send({ message: 'New user has been registered with us!' });
        } catch (error) {
            return res.status(500).send({ message: 'Internal server error', error: error.message });
        }

    }

    static login(req, res) {
        console.log('Request:', req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ error: true, message: 'Invalid Data Entered!!!', data: errors.array() });
        }

        dbConnection.query(
            `SELECT * FROM admin_users WHERE user_username = ?;`,
            [req.body.username],
            (error, result) => {
                // Handle database connection error
                if (error) {
                    return res.status(500).send({ message: 'Database connection error!' });
                }

                // User does not exist
                if (!result.length) {
                    return res.status(401).send({ message: 'Username or password is incorrect!' });
                }

                // Check password
                bcrypt.compare(
                    req.body.password,
                    result[0]['user_password'],
                    (bErr, bResult) => {
                        // Wrong password or bcrypt error
                        if (bErr || !bResult) {
                            return res.status(401).send({ message: 'Username or password is incorrect!' });
                        }

                        // Password is correct, generate token and update last login time
                        const expiresIn = 3600; // 1 hour in seconds (token expiration time)
                        const token = jwt.sign({ user_id: result[0].user_id }, config.JWT_SECRET, { expiresIn });
                        const tokenDateTime = new Date(Date.now() + expiresIn * 1000); // Calculate token expiration date
                        const tokenExpiration = tokenDateTime.getTime();

                        dbConnection.query(
                            `UPDATE admin_users SET user_last_login = NOW() WHERE user_id = ?`,
                            [result[0].user_id],
                            (updateErr) => {
                                if (updateErr) {
                                    return res.status(500).send({ message: 'Failed to update last login time!' });
                                }
                                // Log recent activity create
                                const activity = {
                                    admin_user_id: result[0].user_id,
                                    action_title: 'login',
                                    action_description: `Admin User ${result[0].user_username} Logged In`,
                                    table_affected: 'admin_user',
                                    affected_id: result[0].user_id
                                };
                                RecentActivityController.logActivity(activity);
                                return res.status(200).send({
                                    message: 'Logged in!',
                                    token,
                                    tokenExpiration, // Include token expiration details in the response
                                    user: result[0],
                                });
                            }
                        );
                    }
                );
            }
        );
    }
}

module.exports = AuthController;
