const Application = require('../models/Application');
const Internship = require('../models/Internship');
const User = require('../models/User');
const Matching = require('../models/Match'); // Assuming Match scores are stored here

/**
 * @desc    Get stats for employer dashboard (Match distribution)
 * @route   GET /api/analytics/employer/matches
 * @access  Private (Employer)
 */
exports.getEmployerMatchStats = async (req, res) => {
    try {
        const internships = await Internship.find({ employer: req.user.id });
        const internshipIds = internships.map(i => i._id);

        // Group matches by tier for the distribution chart
        const matches = await Matching.aggregate([
            { $match: { internship: { $in: internshipIds } } },
            {
                $bucket: {
                    groupBy: "$normalizedScore",
                    boundaries: [0, 40, 70, 90, 101],
                    default: "Other",
                    output: {
                        count: { $sum: 1 }
                    }
                }
            }
        ]);

        // Map buckets to human-readable tiers
        const tierMapping = {
            0: "Poor",
            40: "Fair",
            70: "Good",
            90: "Excellent"
        };

        const data = matches.map(m => ({
            tier: tierMapping[m._id] || "Other",
            count: m.count
        }));

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get stats for student dashboard (Application funnel)
 * @route   GET /api/analytics/student/applications
 * @access  Private (Student)
 */
exports.getStudentApplicationStats = async (req, res) => {
    try {
        const stats = await Application.aggregate([
            { $match: { student: req.user.id } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const data = stats.map(s => ({
            status: s._id,
            count: s.count
        }));

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
