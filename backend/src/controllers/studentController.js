const User = require('../models/User');
const Internship = require('../models/Internship');

// @desc    Get user's saved/bookmarked internships
// @route   GET /api/students/bookmarks
// @access  Private (Student)
exports.getSavedInternships = async (req, res) => {
    try {
        const student = await User.findById(req.user.id).populate('savedInternships');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({
            success: true,
            count: student.savedInternships.length,
            data: student.savedInternships
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Bookmark an internship
// @route   POST /api/students/bookmarks/:id
// @access  Private (Student)
exports.bookmarkInternship = async (req, res) => {
    try {
        const internshipId = req.params.id;
        const internship = await Internship.findById(internshipId);

        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship not found' });
        }

        // Add to savedInternships if not already present
        const student = await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { savedInternships: internshipId } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Internship bookmarked successfully',
            data: student.savedInternships
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Remove an internship from bookmarks
// @route   DELETE /api/students/bookmarks/:id
// @access  Private (Student)
exports.unbookmarkInternship = async (req, res) => {
    try {
        const internshipId = req.params.id;

        // Remove from savedInternships
        const student = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { savedInternships: internshipId } },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Internship removed from bookmarks',
            data: student.savedInternships
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
