/**
 * Rule B3: PartialSkillCoverage
 * Priority: 9 (Core Skill Matching)
 * 
 * Compute: coverageRatio = matchedSkills.length / internship.requiredSkills.length
 * IF coverageRatio >= 0.75 → +20 points (Strong Coverage)
 * IF coverageRatio >= 0.50 → +10 points (Moderate Coverage)
 * IF coverageRatio >= 0.25 → +5 points (Partial Coverage)
 * 
 * @module B3_PartialSkillCoverage
 */

const rule = {
    name: "B3_PartialSkillCoverage",
    priority: 9,

    /**
     * Computes ratio and matches for both condition and action
     * @param {Object} facts Facts base
     * @returns {Object} Data about the coverage
     */
    _getCoverageData: (facts) => {
        const { student, internship } = facts;

        const requiredSkills = internship?.requiredSkills || [];
        const studentSkills = student?.skills || [];

        // Avoid division by zero
        if (requiredSkills.length === 0) {
            return { ratio: 0, matchedCount: 0, totalCount: 0 };
        }

        const studentSkillNames = studentSkills.map(s =>
            (typeof s === 'string' ? s : s.name).toLowerCase()
        );

        let matchedCount = 0;

        requiredSkills.forEach(req => {
            const reqName = typeof req === 'string' ? req : req.name;
            if (studentSkillNames.includes(reqName.toLowerCase())) {
                matchedCount++;
            }
        });

        return {
            ratio: matchedCount / requiredSkills.length,
            matchedCount: matchedCount,
            totalCount: requiredSkills.length
        };
    },

    /**
     * Evaluates if skill coverage is >= 25%.
     * 
     * @param {Object} facts - The facts base containing student and internship data.
     * @returns {boolean} True if coverage >= 0.25
     */
    condition: (facts) => {
        return rule._getCoverageData(facts).ratio >= 0.25;
    },

    /**
     * Calculates specific coverage bonus block.
     * 
     * @param {Object} facts - The facts base containing student and internship data.
     * @returns {Object} The score adjustment and explanation.
     */
    action: (facts) => {
        const { ratio, matchedCount, totalCount } = rule._getCoverageData(facts);

        let points = 0;
        let rank = "";

        if (ratio >= 0.75) {
            points = 20;
        } else if (ratio >= 0.50) {
            points = 10;
        } else if (ratio >= 0.25) {
            points = 5;
        }

        const ratioPercentage = Math.round(ratio * 100);

        return {
            scoreAdjustment: points,
            explanation: `Skill coverage: ${ratioPercentage}% (${matchedCount} of ${totalCount} skills)`
        };
    }
};

module.exports = rule;
