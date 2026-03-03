const Application = require('../models/Application');
const Internship = require('../models/Internship');
const User = require('../models/User');
const { send: sendNotification } = require('../services/notificationService');

// @desc    Apply to an internship
// @route   POST /api/applications/apply/:id
// @access  Private (Student)
exports.applyToInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }

        if (internship.status === 'Closed' || internship.isDeleted) {
            return res.status(400).json({ success: false, message: 'Internship is no longer accepting applications' });
        }

        // Check if already applied
        const existing = await Application.findOne({
            student: req.user.id,
            internship: req.params.id
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Already applied to this internship' });
        }

        const application = await Application.create({
            student: req.user.id,
            internship: req.params.id,
            employer: internship.employer,
            resume: req.body.resume,
            answers: req.body.answers
        });

        // Add student to internship applicants list
        internship.applicants.push(req.user.id);
        await internship.save();

        // Notify Employer
        try {
            await sendNotification({
                userId: internship.employer,
                type: 'APPLICATION_RECEIVED',
                message: `You have received a new application for ${internship.positionTitle}.`,
                link: '/employer/applications' // Or specific URL
            });
        } catch (err) { console.error('Notification failed', err); }

        res.status(201).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all applications for an employer
// @route   GET /api/applications/employer
// @access  Private (Employer)
exports.getEmployerApplications = async (req, res) => {
    try {
        const applications = await Application.find({ employer: req.user.id })
            .populate('student', 'name email profilePicture')
            .populate('internship', 'positionTitle domain');

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Employer)
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Auth check
        if (application.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        application.status = status;
        await application.save();

        // Notify Student
        try {
            await application.populate('internship', 'positionTitle');
            const type = status === 'Interview' ? 'INTERVIEW_SCHEDULED' : 'APPLICATION_STATUS';
            await sendNotification({
                userId: application.student,
                type,
                message: `Your application status for ${application.internship.positionTitle} has been updated to: ${status}.`,
                link: '/student/applications'
            });
        } catch (err) { console.error('Notification failed', err); }

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Get student dashboard stats
// @route   GET /api/applications/student/stats
// @access  Private (Student)
exports.getStudentStats = async (req, res) => {
    try {
        const applicationsCount = await Application.countDocuments({ student: req.user.id });
        // Mocking skill matches and verification points for now since it's complex, 
        // but applicationsCount is real.
        res.status(200).json({
            success: true,
            data: {
                applicationsCount,
                skillMatches: 0,
                verificationPoints: 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all applications for a student
// @route   GET /api/applications/student
// @access  Private (Student)
exports.getStudentApplications = async (req, res) => {
    try {
        const applications = await Application.find({ student: req.user.id })
            .populate('employer', 'companyName profilePicture')
            .populate('internship', 'positionTitle company location')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
