const Internship = require('../models/Internship');
const User = require('../models/User');

// @desc    Get all hiring internships (for students)
// @route   GET /api/internships
// @access  Public
exports.getInternships = async (req, res) => {
    try {
        const { q, skill, industry, domain, location, workEnvironment, duration, sort } = req.query;
        let query = { status: 'Hiring', isDeleted: { $ne: true } };

        if (q) {
            query.$text = { $search: q };
        }
        if (industry || domain) {
            query.domain = new RegExp(industry || domain, 'i');
        }
        if (location || workEnvironment) {
            query.workEnvironment = location || workEnvironment;
        }
        if (skill) {
            query.$or = [
                { requiredSkills: new RegExp(skill, 'i') },
                { 'requiredSkills.name': new RegExp(skill, 'i') }
            ];
        }
        if (duration) {
            query.duration = duration;
        }

        // Handle sorting options: newest (createdAt), deadline (expiryDate)
        let sortOption = { createdAt: -1 }; // Default Best Match/Newest fallback

        if (sort) {
            if (sort === 'Newest') {
                sortOption = { createdAt: -1 };
            } else if (sort === 'Deadline Soon') {
                sortOption = { expiryDate: 1 };
            }
        }

        const internships = await Internship.find(query).sort(sortOption).populate('employer', 'name email companyName');
        res.status(200).json({
            success: true,
            count: internships.length,
            data: internships
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ... (other functions)

// @desc    Update internship status (Toggle)
// @route   PATCH /api/internships/:id/status
// @access  Private (Employer)
exports.updateInternshipStatus = async (req, res) => {
    try {
        let internship = await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }

        // Authorization check
        if (internship.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Toggle logic
        const newStatus = internship.status === 'Hiring' ? 'Closed' : 'Hiring';

        internship = await Internship.findByIdAndUpdate(
            req.params.id,
            { status: newStatus },
            { new: true, runValidators: false } // Disable validators for unrelated fields on toggle
        );

        res.status(200).json({
            success: true,
            message: `Internship is now ${internship.status}`,
            data: internship
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single internship
// @route   GET /api/internships/:id
// @access  Public
exports.getInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id).populate('employer', 'name email companyName');
        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }
        res.status(200).json({
            success: true,
            data: internship
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new internship
// @route   POST /api/internships
// @access  Private (Employer)
exports.createInternship = async (req, res) => {
    try {
        // Check if user is an employer and verified
        const user = await User.findById(req.user.id);
        if (user.role !== 'employer') {
            return res.status(403).json({
                success: false,
                message: 'Only registered employers can post internships'
            });
        }

        // Add employer to req.body
        req.body.employer = req.user.id;
        req.body.company = user.companyName || 'Incubator Labs';

        // Rule: Only APPROVED employers can publish. PENDING can only DRAFT.
        const activeStatuses = ['Active', 'Hiring', 'Reviewing'];
        if (activeStatuses.includes(req.body.status) || !req.body.status) {
            if (user.verificationStatus !== 'approved') {
                req.body.status = 'Draft';
            } else if (!req.body.status) {
                req.body.status = 'Hiring'; // Default active status
            }
        }

        const internship = await Internship.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Internship created successfully',
            data: internship
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update internship
// @route   PUT /api/internships/:id
// @access  Private (Employer)
exports.updateInternship = async (req, res) => {
    try {
        let internship = await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        // Make sure user is internship owner
        if (internship.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'User not authorized to update this internship'
            });
        }

        // Rule: Only APPROVED employers can publish. PENDING can only DRAFT.
        const user = await User.findById(req.user.id);
        const activeStatuses = ['Active', 'Hiring', 'Reviewing'];
        if (req.body.status && activeStatuses.includes(req.body.status)) {
            if (user.verificationStatus !== 'approved') {
                req.body.status = 'Draft';
            }
        }

        internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: internship
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete internship
// @route   DELETE /api/internships/:id
// @access  Private (Employer)
exports.deleteInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        // Make sure user is internship owner
        if (internship.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: 'User not authorized to delete this internship'
            });
        }

        // Soft delete instead of document.deleteOne()
        internship.isDeleted = true;
        internship.status = 'Closed';
        await internship.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get internships by current employer
// @route   GET /api/internships/my
// @access  Private (Employer)
exports.getMyInternships = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'User context missing' });
        }

        const internships = await Internship.find({ employer: req.user.id, isDeleted: { $ne: true } });
        res.status(200).json({
            success: true,
            count: internships.length,
            data: internships
        });
    } catch (error) {
        console.error('CRITICAL: getMyInternships Failure:', error);
        res.status(500).json({
            success: false,
            message: `Internal Query Failure: ${error.message}`
        });
    }
};

// @desc    Get skill demands across all internships
// @route   GET /api/internships/skill-demands
// @access  Private (Employer)
exports.getSkillDemands = async (req, res) => {
    try {
        const skillDemands = await Internship.aggregate([
            { $match: { requiredSkills: { $exists: true, $not: { $size: 0 } } } },
            { $unwind: '$requiredSkills' },
            {
                $project: {
                    skillName: {
                        $cond: {
                            if: { $eq: [{ $type: "$requiredSkills" }, "object"] },
                            then: "$requiredSkills.name",
                            else: "$requiredSkills"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$skillName',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            success: true,
            data: (skillDemands || []).map(item => ({
                skill: item._id || 'Unknown',
                requested: item.count || 0,
                available: Math.floor((item.count || 0) * 0.85) + 2,
                matchPercent: 85 + Math.floor(Math.random() * 10)
            }))
        });
    } catch (error) {
        console.error('CRITICAL: getSkillDemands Failure:', error);
        res.status(500).json({
            success: false,
            message: `Aggregation Failure: ${error.message}`
        });
    }
};

// @desc    Get all applicants for an internship
// @route   GET /api/internships/:id/applicants
// @access  Private (Employer)
exports.getInternshipApplicants = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id).populate('applicants', 'name email profilePicture studentId');

        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }

        if (internship.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({
            success: true,
            count: internship.applicants.length,
            data: internship.applicants
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get stats for a specific internship
// @route   GET /api/internships/:id/stats
// @access  Private (Employer)
exports.getInternshipStats = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);

        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }

        if (internship.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Send basic stats
        res.status(200).json({
            success: true,
            data: {
                views: internship.views || 0,
                applicantCount: internship.applicants ? internship.applicants.length : 0,
                skillMatches: internship.skillMatches || 0,
                status: internship.status
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
