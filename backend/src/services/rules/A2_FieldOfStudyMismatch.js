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

        // If the internship doesn't require a specific degree field, this rule doesn't fire
        if (!internship?.requiredDegreeField) {
            return false;
        }

        // If a field is required but the student hasn't provided one
        if (!student?.degreeField) {
            return true; // Mismatch
        }

        // Case-insensitive comparison
        const requiredField = String(internship.requiredDegreeField).trim().toLowerCase();
        const studentField = String(student.degreeField).trim().toLowerCase();

        // We can also handle arrays if the DB allows multiple acceptable fields
        if (Array.isArray(internship.requiredDegreeField)) {
            return !internship.requiredDegreeField.some(f =>
                String(f).trim().toLowerCase() === studentField
            );
        }

        return requiredField !== studentField;
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
