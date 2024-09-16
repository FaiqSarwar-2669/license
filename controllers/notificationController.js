// recentActivityController.js
const axios = require('axios');
const dbConnection = require('../connection.js');
const __config = require('../config.json');

class NotificationController {

    // Generate notifications for expiring licenses and contracts
    static generateNotifications(req, res) {
        const query = 'CALL generate_notifications()';

        dbConnection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, message: 'Notifications generated successfully' });
        });
    }

    // Get all notifications
    static getAllNotifications(req, res) {
        const query = `
            SELECT n.*
            FROM notifications n
            INNER JOIN (
                SELECT COALESCE(license_id, contract_id) AS id, MAX(created_at) AS max_created_at
                FROM notifications
                GROUP BY id
            ) latest
            ON COALESCE(n.license_id, n.contract_id) = latest.id
            AND n.created_at = latest.max_created_at
            ORDER BY n.created_at DESC;
        `;

        dbConnection.query(query, (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, data: results, message: 'All notifications retrieved successfully' });
        });
    }

    static getSummaryCount(req, res) {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM licenses) AS total_licenses,
                (SELECT SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) FROM licenses) AS active_licenses,
                (SELECT SUM(CASE WHEN expiry_date < CURDATE() THEN 1 ELSE 0 END) FROM licenses) AS expired_licenses,
                (SELECT SUM(CASE WHEN expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) FROM licenses) AS expiring_soon_licenses,
                (SELECT COUNT(*) FROM maintenancecontracts) AS total_contracts,
                (SELECT SUM(CASE WHEN end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) FROM maintenancecontracts) AS expiring_soon_contracts,
                (SELECT SUM(CASE WHEN end_date < CURDATE() THEN 1 ELSE 0 END) FROM maintenancecontracts) AS expired_contracts;
        `;
    
        dbConnection.query(query, (error, results) => {
            if (error) {
                console.error('Database query error:', error);  // Log the error for debugging purposes
                return res.status(500).json({ error: true, message: 'An error occurred while fetching summary counts.' });
            }
    
            // Check if the results contain data
            if (results && results.length > 0) {
                return res.status(200).json({ error: false, data: results[0], message: 'All Summary Counts' });
            } else {
                return res.status(404).json({ error: true, message: 'Summary data not found.' });
            }
        });
    }    

    static getNotificationsForWebhook(req, res) {
        const query = `
            SELECT n.*
            FROM notifications n
            INNER JOIN (
                SELECT COALESCE(license_id, contract_id) AS id, MAX(created_at) AS max_created_at
                FROM notifications
                GROUP BY id
            ) latest
            ON COALESCE(n.license_id, n.contract_id) = latest.id
            AND n.created_at = latest.max_created_at
            ORDER BY n.created_at DESC;
        `;

        dbConnection.query(query, async (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }

            if (results.length === 0) {
                console.log('No new notifications to push.');
                return res.status(200).json({ error: false, message: 'No notifications to push to Google Chat.' });
            }

            // const webhookUrl = __config.WEBHOOK_URL;
            // const messagePayload = {
            //     "cards": [{
            //         "header": {
            //             "title": "Recent Licenses Expiry Status"
            //         },
            //         "sections": [{
            //             "widgets": results.map(notification => ({
            //                 "textParagraph": {
            //                     "text": `Notification: ${notification.notification_message || 'No Message'}\n 
            //                     Expiry: ${new Date(notification.expiry_date).toLocaleString()}\n
            //                     Created At: ${new Date(notification.created_at).toLocaleString()}\n
            //                     Read Status: ${notification.is_read ? 'Read' : 'Not Read'}\n
            //                     Read At: ${notification.read_at ? new Date(notification.read_at).toLocaleString() : 'N/A'}\n
            //                     For Details: https://resourcevault.expertflow.com/#/license-detail/${notification.license_id}`
            //                 }
            //             }))
            //         }]
            //     }]
            // };

            // Prepare the message payload for Google Chat Webhook
            const webhookUrl = __config.WEBHOOK_URL;

            // Construct the formatted text for each notification
            const formattedText = results.map(notification =>
                `Notification: ${notification.notification_message || 'No Message'}\nExpiry: ${new Date(notification.expiry_date).toLocaleString()}\nCreated At: ${new Date(notification.created_at).toLocaleString()}\nRead Status: ${notification.is_read ? 'Read' : 'Not Read'}\nRead At: ${notification.read_at ? new Date(notification.read_at).toLocaleString() : 'N/A'}\nFor Details: <https://resourcevault.expertflow.com/#/license-detail/${notification.license_id}|Click here>`
            ).join('\n--------------------\n'); // Join with double newlines between entries

            const messagePayload = {
                "text": formattedText
            };

            const maxRetries = 3;
            let attempts = 0;
            let success = false;

            while (attempts < maxRetries && !success) {
                try {
                    await axios.post(webhookUrl, messagePayload);
                    console.log('Data successfully pushed to Google Workspace webhook chat');
                    success = true;
                } catch (webhookError) {
                    attempts++;
                    console.error(`Failed to push data to Google Workspace webhook chat (Attempt ${attempts}):`, webhookError.message);

                    if (webhookError.response) {
                        console.error('Error Response Data:', webhookError.response.data);
                        console.error('Error Response Headers:', webhookError.response.headers);
                    }

                    if (attempts >= maxRetries) {
                        console.error('Max retries reached. Failed to push data to Google Workspace webhook chat.');
                        return res.status(500).json({ error: true, message: 'Failed to push data to Google Chat after multiple attempts.' });
                    }

                    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds delay
                }
            }

            return res.status(200).json({ error: false, message: 'All notifications retrieved and pushed successfully' });
        });
    }

    // Get notification by ID
    static getNotificationById(req, res) {
        const query = 'SELECT * FROM notifications WHERE notification_id = ?';

        dbConnection.query(query, [req.params.id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            if (results.length > 0) {
                return res.status(200).json({ error: false, data: results[0], message: 'Notification details retrieved successfully' });
            } else {
                return res.status(404).json({ error: true, message: 'Notification not found' });
            }
        });
    }

    // Mark notification as read
    static markAsRead(req, res) {
        const query = 'UPDATE notifications SET is_read = TRUE, admin_user_id = ? WHERE notification_id = ?';

        dbConnection.query(query, [req.body.admin_user_id, req.params.id], (error, results) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            return res.status(200).json({ error: false, message: 'Notification marked as read' });
        });
    }

}

module.exports = NotificationController;
