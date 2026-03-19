const { check, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

const validateRegister = [
    check('name', 'Name is required').not().isEmpty().trim().escape(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    validateRequest
];

const validateLogin = [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required').exists(),
    validateRequest
];

const validateInternship = [
    check('positionTitle', 'Position title is required').not().isEmpty().trim().escape(),
    check('domain', 'Domain is required').not().isEmpty().trim().escape(),
    check('duration', 'Duration is required').not().isEmpty(),
    check('expiryDate', 'Valid expiry date is required').isISO8601().toDate(),
    check('description', 'Description must be at least 20 characters').isLength({ min: 20 }),
    check('company', 'Company name is required').not().isEmpty().trim().escape(),
    check('minimumGPA', 'GPA must be between 0 and 4.0').optional().isFloat({ min: 0, max: 4.0 }),
    validateRequest
];

const validateStudentProfile = [
    check('personalInfo.phone', 'Valid phone number is required').optional().isMobilePhone(),
    check('personalInfo.gpa', 'GPA must be roughly between 0 and 4.0').optional().isFloat({ min: 0, max: 4.3 }),
    check('personalInfo.location', 'Location is required').optional().trim().escape(),
    check('education.*.institution', 'Institution is required').optional().not().isEmpty().trim().escape(),
    validateRequest
];

module.exports = {
    validateRegister,
    validateLogin,
    validateInternship,
    validateStudentProfile
};
