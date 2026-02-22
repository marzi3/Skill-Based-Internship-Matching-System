const Student = require('../models/Student');
const Internship = require('../models/Internship');
const MatchingEngine = require('../services/matchingEngine');

/**
 * Executes a batch matching of a single student against all active internships.
 */
exports.matchInternshipsForStudent = async (req, res) => {
    try {
        const { studentId, limit, tier } = req.body;

        if (!studentId) {
            return res.status(400).json({ success: false, message: 'Student ID is required' });
        }

        // 1. Load the student profile (facts base slice)
        const student = await Student.findById(studentId).lean();
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student profile not found' });
        }

        // 2. Load internships (we could filter active only depending on schema, e.g., status: 'OPEN')
        const internships = await Internship.find({}).lean();

        // 3. Inference Engine invocation
        let matches = MatchingEngine.matchInternshipsForStudent(student, internships);

        // 4. Post-processing filters
        // Remove disqualified pairs unless explicitly asked otherwise 
        // (Implementation note: requirement says 'excluding DISQUALIFIED entries unless explicitly requested by admin')
        // We assume standard request excludes them.
        matches = matches.filter(m => m.tier !== 'DISQUALIFIED');

        if (tier) {
            matches = matches.filter(m => m.tier === tier.toUpperCase());
        }

        if (limit) {
            matches = matches.slice(0, Number(limit));
        }

        return res.status(200).json({
            success: true,
            studentId: student._id,
            matches
        });

    } catch (error) {
        console.error('Error matching internships', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process match',
            error: error.message
        });
    }
};

/**
 * Executes a batch matching of all students against a single internship (Candidate search).
 */
exports.matchStudentsForInternship = async (req, res) => {
    try {
        const { internshipId, limit } = req.body;

        if (!internshipId) {
            return res.status(400).json({ success: false, message: 'Internship ID is required' });
        }

        const internship = await Internship.findById(internshipId).lean();
        if (!internship) {
            return res.status(404).json({ success: false, message: 'Internship listing not found' });
        }

        // We only want students who have at least partially completed profiles or are looking.
        const students = await Student.find({}).lean();

        let candidates = MatchingEngine.matchStudentsForInternship(internship, students);

        // Filter out explicit disqualifications
        candidates = candidates.filter(c => c.tier !== 'DISQUALIFIED');

        if (limit) {
            candidates = candidates.slice(0, Number(limit));
        }

        return res.status(200).json({
            success: true,
            internshipId: internship._id,
            candidates
        });

    } catch (error) {
        console.error('Error generating candidate matches', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate candidates',
            error: error.message
        });
    }
};

/**
 * Explains exactly why a match achieved its score.
 */
exports.explainMatch = async (req, res) => {
    try {
        const { studentId, internshipId } = req.params;

        const student = await Student.findById(studentId).lean();
        const internship = await Internship.findById(internshipId).lean();

        if (!student || !internship) {
            return res.status(404).json({ success: false, message: 'Fact base entities missing' });
        }

        const analysis = MatchingEngine.explainMatch(student, internship);

        return res.status(200).json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error('Error generating match explanation', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to explain match',
            error: error.message
        });
    }
};
