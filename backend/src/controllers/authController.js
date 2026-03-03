const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    console.log('Register request body:', req.body); // Debug log
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('User already exists:', email); // Debug log
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student',
        });

        console.log('User created:', user._id); // Debug log

        if (user) {
            const token = generateToken(user._id);
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });

            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                token,
            });
        } else {
            console.log('Invalid user data'); // Debug log
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration error:', error); // Debug log
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.comparePassword(password))) {
            const token = generateToken(user._id);

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                verificationStatus: user.verificationStatus,
                token,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper: get the correct dashboard path for a given role
const getRoleDashboard = (role) => {
    switch (role) {
        case 'employer': return '/employer/dashboard';
        case 'admin': return '/admin/admin-dashboard';
        case 'student':
        default: return '/student-dashboard';
    }
};

// @desc    Google OAuth Callback
// @route   GET /api/auth/google/callback
const googleAuthCallback = (req, res) => {
    const token = generateToken(req.user._id);
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}${getRoleDashboard(req.user.role)}`);
};

const linkedinAuthCallback = (req, res) => {
    const token = generateToken(req.user._id);
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}${getRoleDashboard(req.user.role)}`);
};

const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message,
                html: `
          <h1>You requested a password reset</h1>
          <p>Please go to this link to reset your password:</p>
          <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
        `
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.log(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get all students
// @route   GET /api/auth/students
// @access  Private (Employer/Admin)
const getStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('name email profilePicture bio skills location');
        res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = req.body.name || user.name;
        user.companyName = req.body.companyName || user.companyName;
        user.businessRegistrationNumber = req.body.businessRegistrationNumber || user.businessRegistrationNumber;
        user.website = req.body.website || user.website;
        user.profilePicture = req.body.profilePicture || user.profilePicture;
        if (req.body.companyDescription !== undefined) user.companyDescription = req.body.companyDescription;
        if (req.body.positionInCompany !== undefined) user.positionInCompany = req.body.positionInCompany;

        const updatedUser = await user.save();
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get public employer profile details
// @route   GET /api/auth/employers/:id
// @access  Public
const getEmployerPublicProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('name companyName website profilePicture companyDescription verificationStatus role');

        if (!user || user.role !== 'employer') {
            return res.status(404).json({ message: 'Employer not found' });
        }

        const Internship = require('../models/Internship');
        const activeInternships = await Internship.find({
            employer: user._id,
            status: 'Hiring',
            isDeleted: { $ne: true }
        }).select('positionTitle locationType location duration createdAt requiredSkills domain');

        res.status(200).json({
            success: true,
            data: {
                employer: user,
                internships: activeInternships
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!(await user.comparePassword(req.body.currentPassword))) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        user.password = req.body.newPassword;
        await user.save();

        const token = generateToken(user._id);
        res.status(200).json({ success: true, message: 'Password updated successfully', token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe,
    googleAuthCallback,
    linkedinAuthCallback,
    forgotPassword,
    resetPassword,
    updateProfile,
    updatePassword,
    getStudents,
    getEmployerPublicProfile
};
