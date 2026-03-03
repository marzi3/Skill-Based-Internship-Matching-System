/**
 * Rule A2: FieldOfStudyMismatch
 * Priority: 10 (Hard Disqualification)
 * 
 * IF internship.requiredDegreeField is specified
 * AND student.degreeField does NOT match any accepted field
 * THEN disqualify
 * 
 * @module A2_FieldOfStudyMismatch
 */

const rule = {
    name: "A2_FieldOfStudyMismatch",
    priority: 10,

    /**
     * Evaluates if the student's field of study does not match the internship's requirement.
     * 
     * @param {Object} facts - The facts base containing student and internship data.
     * @param {Object} facts.student - The student profile object.
     * @param {Object} facts.internship - The internship listing object.
     * @returns {boolean} True if there is a mismatch, false otherwise.
     */
    condition: (facts) => {
        const { student, internship } = facts;

        // If the internship doesn't require a specific degree field (or it's an empty array), this rule doesn't fire
        const reqFields = Array.isArray(internship?.requiredDegreeField)
            ? internship.requiredDegreeField
            : [internship?.requiredDegreeField].filter(Boolean);

        if (reqFields.length === 0) {
            return false;
        }

        // Extract student fields from education array
        const studentFields = [];
        if (student?.education && Array.isArray(student.education)) {
            student.education.forEach(edu => {
                if (edu.field) studentFields.push(String(edu.field).trim().toLowerCase());
            });
        }

        // Backwards compatibility
        if (student?.degreeField) {
            studentFields.push(String(student.degreeField).trim().toLowerCase());
        }

        // If a field is required but the student hasn't provided any
        if (studentFields.length === 0) {
            return true; // Mismatch
        }

        // Check if ANY of the student's fields match ANY of the required fields
        return !reqFields.some(req => {
            const reqLower = String(req).trim().toLowerCase();
            return studentFields.some(sField => sField.includes(reqLower) || reqLower.includes(sField));
        });
    },

    /**
     * Action to perform when the condition is met.
     * 
     * @returns {Object} The score adjustment and explanation.
     */
    action: () => {
        return {
            scoreAdjustment: -Infinity,
            explanation: "Degree field mismatch"
        };
    }
};

module.exports = rule;
