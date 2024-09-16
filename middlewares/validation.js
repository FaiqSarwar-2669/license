const { check, validationResult } = require('express-validator');

const validate = validations => {
    return async (req, res, next) => {
        for (let validation of validations) {
            const result = await validation.run(req);
            if (result.errors.length) break;
        }

        const errors = validationResult(req);
        console.log('Request Body:', req.body);
        console.log('Validation Errors:', errors);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        next();
    };
};

exports.signupValidation = validate([
    check('name', 'User name is required').not().isEmpty(),
    check('role', 'No Role Assigned.').not().isEmpty(),
    check('username', 'Username is invalid, Enter a valid User Id.').not().isEmpty(),
    check('password', 'Password must be 8 or more characters').isLength({ min: 8 })
]);

exports.loginValidation = validate([
    check('username', 'Please provide a valid Username').not().isEmpty(),
    check('password', 'Password must be 8 or more characters').isLength({ min: 8 }).not().isEmpty()
]);

exports.categoryValidation = [
    check('category_name').not().isEmpty().withMessage('Category name is required'),
    check('category_alias').not().isEmpty().withMessage('Category alias is required'),
    // Optionally validate 'category_description' and 'category_status' based on your requirements
    check('category_status').isInt({ min: 0, max: 1 }).withMessage('Category status must be either 0 or 1'),
];

exports.companyValidation = [
    check('company_name').not().isEmpty().withMessage('Company name is required'),
    check('company_alias').not().isEmpty().withMessage('Company alias is required'),
    check('company_status').not().isEmpty().withMessage('Company status is required'),
    // Ensure 'created_by' is validated based on your auth system requirements
];

exports.customerValidation = [
    check('customer_firstname').not().isEmpty().withMessage('First name is required'),
    check('company_alias').not().isEmpty().withMessage('Company is required'),
    check('customer_uuid').not().isEmpty().withMessage('Customer UUID is required'),
    // check('customer_mobile').not().isEmpty().withMessage('Mobile number is required'),
    // Add more validations as per your schema requirements
];

exports.permissionsValidation = [
    check('permission_name').not().isEmpty().withMessage('Permission name is required'),
    // Add checks for read_permission, write_permission, delete_permission as boolean if needed
];

exports.recentActivityValidation = [
    check('admin_user_id').isInt().withMessage('Admin user ID must be a valid integer'),
    check('action_description').not().isEmpty().withMessage('Action description is required'),
    check('table_affected').not().isEmpty().withMessage('Table affected is required'),
    check('affected_id').isInt().withMessage('Affected ID must be a valid integer'),
    // Additional validations as needed
];

exports.dashboardUpdatesValidation = [
    check('update_description').not().isEmpty().withMessage('Update description is required'),
];

exports.licenseManufacturersValidation = [
    check('name').not().isEmpty().withMessage('Manufacturer name is required'),
    // check('contact_person').not().isEmpty().withMessage('Contact person is required'),
    // check('email').isEmail().withMessage('A valid email is required'),
    // check('phone').not().isEmpty().withMessage('Phone number is required'),
    // check('address').not().isEmpty().withMessage('Address is required'),
];

exports.maintenanceContractsValidation = [
    check('contract_type').not().isEmpty().withMessage('Contract type is required'),
    check('start_date').isISO8601().withMessage('Start date must be a valid date'),
    check('end_date').isISO8601().withMessage('End date must be a valid date'),
    check('license_id').isInt().withMessage('License ID must be a valid integer'),
    check('amount').isFloat({ min: 0 }).withMessage('Amount must be a valid number'),
    // Notes field validation can be optional
];

exports.licensesNewValidation = [
    check('license_name').not().isEmpty().withMessage('License name is required'),
    // Include checks for other fields based on the `licenses_new` schema
    // Ensure all required fields are validated
];

exports.licensesValidation = [
    check('license_name').not().isEmpty().withMessage('License name is required'),
    check('category_alias').not().isEmpty().withMessage('Category must be a valid value'),
    check('manufacturer_id').isInt().withMessage('Manufacturer ID must be a valid integer'),
    // Add more validations as per your schema requirements
];

exports.licenseFileValidation = [
    check('license_id').not().isEmpty().withMessage('License Id is required'),
];