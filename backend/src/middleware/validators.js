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

module.exports = {
    validateRegister,
    validateLogin
};
