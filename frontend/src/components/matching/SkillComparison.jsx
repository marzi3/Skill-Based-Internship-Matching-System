'use client';

import React from 'react';
import Badge from '@/components/common/Badge';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function SkillComparison({ requiredSkills = [], candidateSkills = [], matchedSkills = [] }) {
    const normalizeName = (s) => (typeof s === 'string' ? s.toLowerCase() : s?.name?.toLowerCase() || '');

    const matchedNames = new Set(matchedSkills.map(normalizeName));

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2">Skill Comparison</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Required Skills */}
                <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Required by Role</h5>
                    <div className="flex flex-wrap gap-2">
                        {(!requiredSkills || requiredSkills.length === 0) ? <p className="text-sm text-gray-400 italic">None specified</p> : null}
                        {requiredSkills.map((skill, i) => {
                            const name = typeof skill === 'string' ? skill : skill.name;
                            if (!name) return null;
                            const isMatch = matchedNames.has(name.toLowerCase());
                            return (
                                <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${isMatch ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                                    {isMatch ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-gray-300" />}
                                    {name}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Candidate's Skills */}
                <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Possessed Skills</h5>
                    <div className="flex flex-wrap gap-2">
                        {(!candidateSkills || candidateSkills.length === 0) ? <p className="text-sm text-gray-400 italic">No skills listed</p> : null}
                        {candidateSkills.map((skill, i) => {
                            const name = typeof skill === 'string' ? skill : skill.name;
                            if (!name) return null;
                            const isMatch = matchedNames.has(name.toLowerCase());
                            return (
                                <div key={i} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${isMatch ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                                    {name}
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
