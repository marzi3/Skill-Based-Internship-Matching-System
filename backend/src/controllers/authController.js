const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmailRaw = require('../utils/sendEmail');
const { send: sendNotification } = require('../services/notificationService');

// Helper to generate JWT
const generateToken = (id, role, isVerified, verificationStatus) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ id, role, isVerified, verificationStatus }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    logger.info('Register request body:', req.body); // Debug log
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            logger.info('User already exists:', email); // Debug log
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student',
        });

        logger.info('User created:', user._id); // Debug log

        if (user) {
            // Generate Email Verification Token
            const verificationToken = user.getEmailVerificationToken();
            await user.save({ validateBeforeSave: false });

            // Create verification URL
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

            const message = `Welcome to InternMatch! Please verify your email by clicking the following link: \n\n ${verificationUrl}`;

            try {
                await sendNotification({
                    userId: user._id,
                    type: 'WELCOME',
                    message: 'Welcome to InternMatch! Please verify your email to unlock all features.',
                    link: `/verify-email/${verificationToken}`,
                    subject: 'Verify your InternMatch Account'
                });
                logger.info(`Verification email sent to ${user.email}`);
            } catch (err) {
                logger.error('Failed to send verification email:', err);
                if (process.env.NODE_ENV === 'development') {
                    logger.info('DEVELOPMENT OVERRIDE: Email verification link:', verificationUrl);
                }
                user.emailVerificationToken = undefined;
                user.emailVerificationExpire = undefined;
                await user.save({ validateBeforeSave: false });
            }

            const token = generateToken(user._id, user.role, user.isVerified, user.verificationStatus);
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
                companyName: user.companyName,
                positionInCompany: user.positionInCompany,
                token,
            });
        } else {
            logger.info('Invalid user data'); // Debug log
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        logger.error('Registration error:', error); // Debug log
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Email
// @route   GET /api/v1/auth/verifyemail/:token
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        // Get hashed token
        const emailVerificationToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            emailVerificationToken,
            emailVerificationExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
        }

        // Set user to verified
        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email successfully verified'
        });
    } catch (err) {
        logger.error('Email verification error:', err);
        res.status(500).json({ message: 'Server error during email verification' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    logger.info(`Login attempt for: ${email}`);

    try {
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.comparePassword(password))) {
            const token = generateToken(user._id, user.role, user.isVerified, user.verificationStatus);

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
                companyName: user.companyName,
                positionInCompany: user.positionInCompany,
                token,
            });
        } else {
            logger.warn(`Login failed for: ${email} - Invalid credentials`);
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
    const token = generateToken(req.user._id, req.user.role, req.user.isVerified, req.user.verificationStatus);
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}${getRoleDashboard(req.user.role)}`);
};

const linkedinAuthCallback = (req, res) => {
    const token = generateToken(req.user._id, req.user.role, req.user.isVerified, req.user.verificationStatus);
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}${getRoleDashboard(req.user.role)}`);
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    logger.info(`Forgot password request received for: ${email}`);

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
                await sendNotification({
                    userId: user._id,
                    type: 'PASSWORD_RESET',
                    message: 'You requested a password reset. Please click the button below to set a new password.',
                    link: `/reset-password/${resetToken}`,
                    subject: 'Reset your InternMatch Password'
                });

                res.status(200).json({ success: true, data: 'Email sent' });
            } catch (err) {
                logger.error('Failed to send reset email:', err);
                if (process.env.NODE_ENV === 'development') {
                    logger.info('DEVELOPMENT OVERRIDE: Password reset link:', resetUrl);
                    return res.status(200).json({ success: true, data: 'Email sent (Logged to console in Dev)' });
                }
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

        const token = generateToken(user._id, user.role, user.isVerified, user.verificationStatus);

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
        const Student = require('../models/Student');
        const users = await User.find({ role: 'student' }).select('name email profilePicture bio location');

        // Enrich each user with skills from the Student profile
        const enrichedStudents = await Promise.all(
            users.map(async (u) => {
                const studentProfile = await Student.findOne({ userId: u._id }).select('skills personalInfo education gpa fieldOfStudy');
                const plain = u.toObject();
                plain.skills = studentProfile?.skills?.map(s => s.name) || [];
                plain.gpa = studentProfile?.gpa;
                plain.fieldOfStudy = studentProfile?.fieldOfStudy;
                plain.location = plain.location || studentProfile?.personalInfo?.location || '';
                return plain;
            })
        );

        res.status(200).json({
            success: true,
            count: enrichedStudents.length,
            data: enrichedStudents
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
        
        if (req.file) {
            user.profilePicture = req.file.path.replace(/\\/g, '/');
        } else if (req.body.profilePicture) {
            user.profilePicture = req.body.profilePicture;
        }

        if (req.body.companyDescription !== undefined) user.companyDescription = req.body.companyDescription;
        if (req.body.positionInCompany !== undefined) user.positionInCompany = req.body.positionInCompany;
        if (req.body.location !== undefined) user.location = req.body.location;
        if (req.body.industry !== undefined) user.industry = req.body.industry;
        if (req.body.companySize !== undefined) user.companySize = req.body.companySize;
        if (req.body.foundedYear !== undefined) user.foundedYear = req.body.foundedYear;

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
            .select('name companyName website profilePicture companyDescription verificationStatus role location industry companySize foundedYear');

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

// @desc    Get public student profile details
// @route   GET /api/auth/students/:id
// @access  Public
const getStudentPublicProfile = async (req, res) => {
    try {
        const Student = require('../models/Student');
        let user = null;
        let studentDetails = null;

        logger.info(`Fetching profile for ID: ${req.params.id}`);

        // First, try to find by User ID
        user = await User.findById(req.params.id).select('name email profilePicture bio location role').lean();

        if (user && user.role === 'student') {
            logger.info(`Found user by ID, fetching student details for userId: ${user._id}`);
            studentDetails = await Student.findOne({ userId: user._id }).lean();
        } else {
            logger.info(`User not found by ID or not a student, trying as Student ID`);
            studentDetails = await Student.findById(req.params.id).lean();
            if (studentDetails) {
                logger.info(`Found student details, fetching user for userId: ${studentDetails.userId}`);
                user = await User.findById(studentDetails.userId).select('name email profilePicture bio location role').lean();
            }
        }

        if (!user) {
            logger.warn(`No student/user found for ID: ${req.params.id}`);
            return res.status(404).json({ message: 'Student not found' });
        }

        logger.info(`Profile fetch successful for ${user.name}. Student details present: ${!!studentDetails}`);
        if (studentDetails) {
            logger.info(`Skills count: ${studentDetails.skills?.length || 0}`);
            logger.info(`Education count: ${studentDetails.education?.length || 0}`);
        }

        res.status(200).json({
            success: true,
            data: {
                user,
                profile: studentDetails
            }
        });
    } catch (error) {
        logger.error('Error fetching student public profile:', error);
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

        const token = generateToken(user._id, user.role, user.isVerified, user.verificationStatus);
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
    verifyEmail,
    updateProfile,
    updatePassword,
    getStudents,
    getEmployerPublicProfile,
    getStudentPublicProfile
};
