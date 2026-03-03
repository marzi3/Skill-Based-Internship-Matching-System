const Application = require('../models/Application');
const Internship = require('../models/Internship');
const Student = require('../models/Student');
const MatchingEngine = require('../services/matchingEngine');

const STATUS_MAP = {
    APPLIED: 'SUBMITTED',
    REVIEWING: 'UNDER_REVIEW',
    INTERVIEWING: 'INTERVIEW',
    SELECTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
    SUBMITTED: 'SUBMITTED',
    UNDER_REVIEW: 'UNDER_REVIEW',
    SHORTLISTED: 'SHORTLISTED',
    INTERVIEW: 'INTERVIEW',
    OFFERED: 'OFFERED',
    ACCEPTED: 'ACCEPTED',
    WITHDRAWN: 'WITHDRAWN'
};

const TERMINAL_STATUSES = new Set(['ACCEPTED', 'REJECTED', 'WITHDRAWN']);

const normalizeStatus = (value) => {
    if (!value || typeof value !== 'string') return 'SUBMITTED';
    const canonical = value.trim().toUpperCase().replace(/\s+/g, '_');
    return STATUS_MAP[canonical] || canonical;
};

const getRefId = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value._id) return value._id.toString();
    if (value.id) return value.id.toString();
    if (typeof value.toString === 'function') return value.toString();
    return null;
};

const isStudentLinkedToApplication = (application, userId) =>
    getRefId(application.student) === getRefId(userId);

const isEmployerLinkedToApplication = (application, userId) =>
    getRefId(application.employer) === getRefId(userId);

const canAccessApplication = (application, user) => {
    if (user.role === 'admin') return true;
    const userId = user.id || user._id;
    return isStudentLinkedToApplication(application, userId) || isEmployerLinkedToApplication(application, userId);
};

const appendStatusHistory = (application, status, changedBy, note = '') => {
    application.statusHistory.push({
        status,
        changedBy,
        note,
        changedAt: new Date()
    });
};

const buildResumeSnapshot = (studentProfile, submittedResume) => {
    if (studentProfile?.resume?.filePath) {
        return {
            fileName: studentProfile.resume.fileName || '',
            filePath: studentProfile.resume.filePath,
            snapshotAt: new Date()
        };
    }

    if (submittedResume && typeof submittedResume === 'string') {
        return {
            fileName: '',
            filePath: submittedResume,
            snapshotAt: new Date()
        };
    }

    return {
        fileName: '',
        filePath: '',
        snapshotAt: new Date()
    };
};

// @desc    Apply to an internship
// @route   POST /api/applications/apply/:id
// @access  Private (Student)
exports.applyToInternship = async (req, res) => {
    try {
        const internshipId = req.params.id || req.body.internshipId;

        if (!internshipId) {
            return res.status(400).json({ success: false, message: 'Internship ID is required' });
        }

        const internship = await Internship.findById(internshipId).lean();

        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }

        if (internship.status === 'Closed' || internship.isDeleted) {
            return res.status(400).json({ success: false, message: 'Internship is no longer accepting applications' });
        }

        // Check if already applied
        const existing = await Application.findOne({
            student: req.user.id,
            internship: internshipId
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Already applied to this internship' });
        }

        const studentProfile = await Student.findOne({ userId: req.user.id }).lean();
        let matchScore = 0;
        let matchTier = 'UNKNOWN';
        let matchResults = [];

        if (studentProfile) {
            const analysis = MatchingEngine.explainMatch(studentProfile, internship);
            matchScore = Number(analysis?.normalizedScore || 0);
            matchTier = analysis?.tier || 'UNKNOWN';
            matchResults = (analysis?.explanation || []).map((entry) => entry.detail);
        }

        const status = 'SUBMITTED';
        const resumeSnapshot = buildResumeSnapshot(studentProfile, req.body.resume);

        const application = await Application.create({
            student: req.user.id,
            internship: internshipId,
            employer: internship.employer,
            status,
            resume: resumeSnapshot.filePath || req.body.resume || '',
            resumeSnapshot,
            coverLetter: req.body.coverLetter || '',
            answers: Array.isArray(req.body.answers) ? req.body.answers : [],
            matchScore,
            matchTier,
            matchResults,
            statusHistory: [{
                status,
                changedBy: req.user.id,
                note: 'Application submitted',
                changedAt: new Date()
            }]
        });

        // Add student to internship applicants list
        await Internship.findByIdAndUpdate(internshipId, {
            $addToSet: { applicants: req.user.id }
        });

        const populatedApplication = await Application.findById(application._id)
            .populate('internship', 'positionTitle company workEnvironment domain')
            .populate('employer', 'name companyName');

        res.status(201).json({
            success: true,
            data: populatedApplication
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({ success: false, message: 'Already applied to this internship' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit application (body-based API)
// @route   POST /api/applications
// @access  Private (Student)
exports.submitApplication = exports.applyToInternship;

// @desc    Get all applications for current student
// @route   GET /api/applications/me
// @access  Private (Student)
exports.getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ student: req.user.id })
            .populate('internship', 'positionTitle company workEnvironment domain duration stipend')
            .populate('employer', 'name companyName')
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

// @desc    Get single application details
// @route   GET /api/applications/:id
// @access  Private (Student/Employer/Admin for linked application)
exports.getApplicationById = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('student', 'name email profilePicture')
            .populate('employer', 'name email companyName')
            .populate('internship', 'positionTitle company domain workEnvironment duration stipend requiredSkills preferredSkills')
            .populate('messages.sender', 'name role');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (!canAccessApplication(application, req.user)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        res.status(200).json({ success: true, data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get applicant student profile for an application
// @route   GET /api/applications/:id/student-profile
// @access  Private (Student/Employer/Admin for linked application)
exports.getApplicationStudentProfile = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('student', 'name email profilePicture')
            .populate('internship', 'positionTitle company');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (!canAccessApplication(application, req.user)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const studentProfile = await Student.findOne({ userId: getRefId(application.student) })
            .populate('userId', 'name email profilePicture');

        if (!studentProfile) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                application: {
                    _id: application._id,
                    status: application.status,
                    matchScore: application.matchScore,
                    appliedDate: application.appliedDate,
                    internship: application.internship
                },
                student: studentProfile
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Withdraw an application
// @route   PATCH /api/applications/:id/withdraw
// @access  Private (Student)
exports.withdrawApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (!isStudentLinkedToApplication(application, req.user.id)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const currentStatus = normalizeStatus(application.status);
        if (TERMINAL_STATUSES.has(currentStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot withdraw an application with status ${currentStatus}`
            });
        }

        const reason = (req.body.reason || '').trim();
        application.status = 'WITHDRAWN';
        application.withdrawnReason = reason;
        application.withdrawnAt = new Date();

        appendStatusHistory(application, 'WITHDRAWN', req.user.id, reason || 'Application withdrawn by student');

        await application.save();

        res.status(200).json({ success: true, data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Post message in application thread
// @route   POST /api/applications/:id/messages
// @access  Private (Student/Employer/Admin for linked application)
exports.addApplicationMessage = async (req, res) => {
    try {
        const content = (req.body.content || '').trim();
        if (!content) {
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }

        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (!canAccessApplication(application, req.user)) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        application.messages.push({
            sender: req.user.id,
            senderRole: req.user.role,
            content,
            createdAt: new Date()
        });

        await application.save();

        const updated = await Application.findById(req.params.id).populate('messages.sender', 'name role');
        const latestMessage = updated.messages[updated.messages.length - 1];

        res.status(201).json({ success: true, data: latestMessage });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all applications for an employer
// @route   GET /api/applications/employer
// @access  Private (Employer)
exports.getEmployerApplications = async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { employer: req.user.id };

        const applications = await Application.find(query)
            .populate('student', 'name email profilePicture')
            .populate('internship', 'positionTitle domain company')
            .sort({ matchScore: -1, createdAt: -1 });

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
        const status = normalizeStatus(req.body.status);
        const note = (req.body.note || '').trim();
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Auth check
        if (application.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        application.status = status;
        appendStatusHistory(application, status, req.user.id, note);

        if (req.body.interviewDate) {
            application.interview = {
                scheduledAt: new Date(req.body.interviewDate),
                notes: req.body.interviewNotes || ''
            };
        }

        await application.save();

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Schedule interview and notify through status/message trail
// @route   POST /api/applications/:id/interview
// @access  Private (Employer/Admin)
exports.scheduleInterview = async (req, res) => {
    try {
        const { interviewDate, notes } = req.body;
        if (!interviewDate) {
            return res.status(400).json({ success: false, message: 'Interview date is required' });
        }

        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (application.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        application.status = 'INTERVIEW';
        application.interview = {
            scheduledAt: new Date(interviewDate),
            notes: notes || ''
        };

        appendStatusHistory(application, 'INTERVIEW', req.user.id, 'Interview scheduled');

        if (notes) {
            application.messages.push({
                sender: req.user.id,
                senderRole: req.user.role,
                content: `Interview scheduled: ${notes}`,
                createdAt: new Date()
            });
        }

        await application.save();

        res.status(200).json({ success: true, data: application });
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
