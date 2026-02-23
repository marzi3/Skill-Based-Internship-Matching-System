/**
 * Rule D1: LocationPreferenceMatch
 * Priority: 5 (Contextual Preference)
 * 
 * IF student.preferredLocation matches internship.location OR internship is remote
 * THEN +8 points
 * 
 * @module D1_LocationPreferenceMatch
 */

const rule = {
    name: "D1_LocationPreferenceMatch",
    priority: 5,

    /**
     * Evaluates if the internship location aligns with student preferences or is remote.
     * 
     * @param {Object} facts - The facts base
     * @returns {boolean} True if remote or location matches exactly (case-insensitive).
     */
    condition: (facts) => {
        const { student, internship } = facts;

        if (!internship) return false;

        // Inherently matches if remote
        if (internship.isRemote) {
            return true;
        }

        if (!student?.preferredLocation || !internship.location) {
            return false;
        }

        // Case-insensitive direct comparison
        const prefLoc = String(student.preferredLocation).trim().toLowerCase();
        const intLoc = String(internship.location).trim().toLowerCase();

        return prefLoc === intLoc;
    },

    /**
     * Yields points for location affinity.
     * 
     * @returns {Object} The score adjustment and explanation.
     */
    action: () => {
        return {
            scoreAdjustment: 8,
            explanation: "Location preference satisfied"
        };
    }
};

module.exports = rule;
