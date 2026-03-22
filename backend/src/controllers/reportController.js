const Report = require('../models/Report');
const logger = require('../utils/logger');

/**
 * @desc    Create a new report
 * @route   POST /api/v1/reports
 * @access  Private
 */
exports.createReport = async (req, res) => {
    try {
        const { reportedEntity, reportedId, reason } = req.body;

        if (!['User', 'Internship'].includes(reportedEntity)) {
            return res.status(400).json({ success: false, message: 'Invalid reported entity type' });
        }

        const report = await Report.create({
            reporterId: req.user.id,
            reportedEntity,
            reportedId,
            reason
        });

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully. Our team will review it shortly.',
            data: report
        });
    } catch (error) {
        logger.error('Error creating report:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * @desc    Get user's own reports (history)
 * @route   GET /api/v1/reports/my-reports
 * @access  Private
 */
exports.getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ reporterId: req.user.id })
            .populate({ path: 'reportedId', select: 'name companyName positionTitle' })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
