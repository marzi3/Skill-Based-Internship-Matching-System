'use client';

import React from 'react';
import { motion } from 'framer-motion';
import MatchScore from './MatchScore';
import SkillComparison from './SkillComparison';
import MatchExplanation from './MatchExplanation';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import { Briefcase, MapPin, Search } from 'lucide-react';
import Link from 'next/link';

/**
 * MATCH CARD COMPONENT
 * 
 * DESIGN RATIONALE:
 * This is a "Polymorphic" component. It renders differently depending on 
 * whether the viewer is a Student or an Employer.
 * It serves as the primary "Explainability Hub", collecting and 
 * displaying individual match reasons from the backend.
 * 
 * @param {Object} props.match - The match record from the database
 * @param {Array} props.studentSkills - Full skill list for comparison
 * @param {boolean} props.isEmployerMode - Toggle for Role-Based rendering
 */
export default function MatchCard({ match, studentSkills = [], isEmployerMode = false }) {
    if (!match) return null;

    /**
     * DATA NORMALIZATION:
     * Depending on who is looking, the 'target' of the card changes.
     * Employer looks at a Student; Student looks at an Internship.
     */
    const target = isEmployerMode ? match.student : match.internship;
    const title = target?.positionTitle || target?.name || 'Unknown Position';
    const subtitle = target?.employer?.companyName || target?.company || target?.fieldOfStudy || 'Unknown Details';
    const avatarName = subtitle;

    /**
     * REGEX-BASED TRACEABILITY:
     * WHY?: The backend sends raw text reasons. We use Regex to "mine" 
     * specific skill names out of those strings so we can highlight them 
     * in the UI without needing a complex joined query.
     */
    const matchedSkillsFromExplanation = (match.explanationData || match.explanations || [])
        .filter(e => e.rule === 'B1_ExactSkillMatch' || e.rule === 'B3_PartialSkillCoverage')
        .map(e => {
            const m = e.detail.match(/(?:skill|matched):\s*([^.]+)/i);
            return m && m[1] ? m[1].trim() : null;
        })
        .filter(Boolean);

    // UNIQUE SET: Ensure we don't list the same skill twice if multiple rules fired
    const matchedSkills = [...new Set(matchedSkillsFromExplanation)];

    return (
        <motion.div
            layout // Framer Motion: Re-animates smoothly when items are added/removed
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="group relative bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1"
        >
            <div className="flex flex-col md:flex-row gap-6 items-start">

                {/* VISUAL FEEDBACK: The MatchScore dial gives immediate emotional context */}
                <div className="shrink-0 flex self-center md:self-start">
                    <MatchScore score={match.score} size={110} strokeWidth={6} label="Match" />
                </div>

                <div className="flex-1 space-y-4 w-full">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">{title}</h3>
                            <div className="flex items-center gap-2 mt-1 text-gray-500 font-medium">
                                <Avatar name={avatarName} size="xs" />
                                <span>{subtitle}</span>
                                {target?.location && (
                                    <>
                                        <span className="text-gray-300">•</span>
                                        <span className="flex items-center gap-1 text-sm"><MapPin size={14} /> {target.location}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        {/* TIER BADGE: Qualitative validation of the numeric score */}
                        {match.tier && (
                            <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${match.tier === 'EXCELLENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    match.tier === 'GOOD' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        match.tier === 'FAIR' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-gray-50 text-gray-500 border-gray-200'
                                }`}>
                                {match.tier} TIER
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {target?.workType && <Badge variant="secondary" size="sm"><Briefcase size={12} className="inline mr-1" /> {target.workType}</Badge>}
                        {(target?.requiredSkills || []).slice(0, 3).map((skill, i) => (
                            <Badge key={i} variant="secondary" size="sm">{typeof skill === 'string' ? skill : skill.name}</Badge>
                        ))}
                        {(target?.requiredSkills?.length > 3) && <Badge variant="secondary" size="sm">+{target.requiredSkills.length - 3} more</Badge>}
                    </div>

                    {/* DEEP-DIVE ANALYSIS SECTION */}
                    <div className="space-y-4 pt-4 border-t border-gray-100/60">
                        {/* SKILL COMPARISON: Provides a visual "Delta" between Student and Requirement */}
                        {!isEmployerMode && target?.requiredSkills && (
                            <SkillComparison
                                requiredSkills={target.requiredSkills}
                                candidateSkills={studentSkills}
                                matchedSkills={matchedSkills}
                            />
                        )}

                        {/* MATCH EXPLANATION: Hidden in an accordion to keep the UI clean but accessible */}
                        {(match.explanationData || match.explanations) && (
                            <MatchExplanation explanations={match.explanationData || match.explanations} />
                        )}
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Link href={isEmployerMode ? `/student/${target?._id}` : `/internships/${target?._id}`}>
                            <button className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm">
                                <Search size={16} /> View Details
                            </button>
                        </Link>
                        {!isEmployerMode && (
                            <Link href={`/internships/${target?._id}`}>
                                <button className="px-6 py-2.5 rounded-xl font-bold bg-gray-900 text-white hover:bg-black transition-all shadow-md hover:shadow-lg text-sm">
                                    Apply Now
                                </button>
                            </Link>
                        )}
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
