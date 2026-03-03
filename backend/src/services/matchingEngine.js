/**
 * Rule-Based Expert System: Matching Engine
 * 
 * Implements a Forward-Chaining Inference Engine to evaluate student 
 * profiles against internship listings to produce ranked compatibility tiers.
 * 
 * @module matchingEngine
 */

const fs = require('fs');
const path = require('path');

// 1. Initialize Knowledge Base
const RULES_DIR = path.join(__dirname, 'rules');
let knowledgeBase = [];

/**
 * Loads all rule definitions from the rules/ directory.
 * Executes synchronously on module load to cache rules in memory.
 */
function loadRules() {
    try {
        const files = fs.readdirSync(RULES_DIR).filter(file => file.endsWith('.js'));
        knowledgeBase = files.map(file => {
            const rulePath = path.join(RULES_DIR, file);
            const rule = require(rulePath);
            // Validate rule schema
            if (!rule.name || typeof rule.priority !== 'number' || typeof rule.condition !== 'function' || typeof rule.action !== 'function') {
                console.warn(`[MatchingEngine] Skipping invalid rule file: ${file}`);
                return null;
            }
            return rule;
        }).filter(Boolean);

        // Sort knowledge base descending by priority to enforce conflict resolution strategy
        knowledgeBase.sort((a, b) => b.priority - a.priority);

        console.log(`[MatchingEngine] Successfully loaded ${knowledgeBase.length} rules.`);
    } catch (error) {
        console.error('[MatchingEngine] Failed to load rules directory:', error);
        // knowledgeBase remains empty array, engine degrades safely
    }
}

// Bootstrap rules on startup
loadRules();

/**
 * Maximum possible raw score theoretically achievable by the rules geometry.
 * Hardcoded based on rules sum to avoid computationally expensive dynamic evaluation
 * for theoretical max. 
 * Max: B1(+15*n)+B2(+10*n)+B3(+20)+B4(+25)+C1(+5)+C2(+5)+C3(+10)+C4(+8)+D1(+8)+D2(+6)+D3(+7)+D4(+5)+E1(+3)+E2(+4)+E3(+3)+E4(+5)
 * Simplified static normalization scale for dynamic rules: 140 points is considered "Excellent" 100% benchmark.
 */
const MAX_THEORETICAL_SCORE = 140;

/**
 * Normalizes a raw score to a 0-100 scale.
 * 
 * @param {number} rawScore The accumulated raw score points
 * @returns {number} Normalized score 0-100
 */
function normalizeScore(rawScore) {
    if (rawScore <= 0) return 0;
    // Cap at 100% just in case of over-performing bonus rules
    const normalized = (rawScore / MAX_THEORETICAL_SCORE) * 100;
    return Math.min(Math.round(normalized * 10) / 10, 100);
}

/**
 * Maps a normalized score to a tier.
 * 
 * @param {number} normalizedScore The 0-100 score
 * @param {boolean} disqualified Whether a priority 10 rule fired
 * @returns {string} Match tier
 */
function determineTier(normalizedScore, disqualified) {
    if (disqualified) return 'DISQUALIFIED';
    if (normalizedScore >= 80) return 'EXCELLENT';
    if (normalizedScore >= 60) return 'GOOD';
    if (normalizedScore >= 40) return 'FAIR';
    if (normalizedScore >= 20) return 'WEAK';
    return 'POOR';
}

/**
 * Executes the forward-chaining inference loop for a single pair.
 * 
 * @param {Object} student 
 * @param {Object} internship 
 * @returns {Object} Output facts context containing score and explanations
 */
function evaluatePair(student, internship) {
    const facts = { student, internship };

    let rawScore = 0;
    let disqualified = false;
    const explanationLog = [];

    // Forward Chaining Iteration
    for (const rule of knowledgeBase) {
        try {
            if (rule.condition(facts)) {
                const result = rule.action(facts);

                // Handle rule firing output
                rawScore += result.scoreAdjustment;

                // Unpack explanations safely
                const messages = Array.isArray(result.explanation) ? result.explanation : [result.explanation];

                messages.forEach(msg => {
                    explanationLog.push({
                        rule: rule.name,
                        score: result.scoreAdjustment === -Infinity ? -Infinity : (result.scoreAdjustment / messages.length),
                        detail: msg
                    });
                });

                // Hard disqualification signals immediate elimination
                if (result.scoreAdjustment === -Infinity) {
                    disqualified = true;
                    break; // Optimization: Stop executing lower-priority rules
                }
            }
        } catch (error) {
            console.error(`[MatchingEngine] Rule failed to evaluate: ${rule.name}`, error);
            // Suppress individual rule failure and continue processing remaining rules
        }
    }

    const finalScore = disqualified ? -Infinity : rawScore;
    const normalizedScore = disqualified ? 0 : normalizeScore(finalScore);
    const tier = determineTier(normalizedScore, disqualified);

    return {
        rawScore: finalScore,
        normalizedScore,
        tier,
        explanation: explanationLog
    };
}

/**
 * Public API: Match a given student against multiple internships.
 * 
 * @param {Object} student 
 * @param {Array<Object>} internships 
 * @returns {Array<Object>} Ranked matches
 */
function matchInternshipsForStudent(student, internships) {
    const results = internships.map(internship => {
        const evaluation = evaluatePair(student, internship);
        return {
            internshipId: internship._id || internship.id,
            internshipTitle: internship.title || 'Unknown Title',
            internshipCompany: internship.company || 'Unknown Company',
            ...evaluation
        };
    });

    // Sort by score descending
    return results.sort((a, b) => b.rawScore - a.rawScore);
}

/**
 * Public API: Match a given internship against multiple students.
 * 
 * @param {Object} internship 
 * @param {Array<Object>} students 
 * @returns {Array<Object>} Ranked candidates
 */
function matchStudentsForInternship(internship, students) {
    const results = students.map(student => {
        const evaluation = evaluatePair(student, internship);
        return {
            studentId: student._id || student.id,
            studentName: student.name || 'Unknown Student',
            ...evaluation
        };
    });

    // Sort by score descending
    return results.sort((a, b) => b.rawScore - a.rawScore);
}

/**
 * Public API: Detailed explanation map for a specific pair
 * 
 * @param {Object} student 
 * @param {Object} internship 
 * @returns {Object} Full breakdown
 */
function explainMatch(student, internship) {
    return evaluatePair(student, internship);
}

// For unit testing dynamic reloading
function _reloadRulesForTesting() {
    loadRules();
}

/**
 * Retrieves loaded rules (useful for diagnostics)
 */
function getRulesDirectory() {
    return knowledgeBase.map(r => ({ name: r.name, priority: r.priority }));
}

module.exports = {
    matchInternshipsForStudent,
    matchStudentsForInternship,
    explainMatch,
    normalizeScore, // Export for unit tests
    _reloadRulesForTesting,
    getRulesDirectory
};
