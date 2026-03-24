import React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Avatar from '@/components/common/Avatar';

const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
};

export default function RecommendedCandidates({ candidates = [] }) {
    if (!candidates || candidates.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 text-sm bg-white rounded-xl border border-dashed border-gray-200">
                No matched candidates yet. Create a posting to get matches.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {candidates.map((c, idx) => (
                <motion.div
                    key={c.studentId || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all group backdrop-blur-sm bg-white/50"
                >
                    <div className="flex items-start gap-4">
                        <Avatar
                            src={c.profilePicture}
                            name={c.studentName || 'Candidate'}
                            size="lg"
                        />
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                        {c.studentName || 'Unknown Student'}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {c.fieldOfStudy || 'Student'} • GPA: {c.gpa || 'N/A'}
                                    </p>
                                </div>
                                <span className={`text-sm font-black px-3 py-1.5 rounded-full border flex items-center gap-1 ${getScoreColor(c.finalScore || 0)}`}>
                                    <Star size={12} fill="currentColor" />
                                    {Math.round(c.finalScore || 0)}%
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {(c.matchedSkills || []).slice(0, 4).map((skill, si) => (
                                    <span
                                        key={si}
                                        className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md border border-indigo-100"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                        <Link href={`/students/${c.studentId}`} className="flex-1">
                            <button className="w-full py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                                View Profile
                            </button>
                        </Link>
                        <Link href="/employer/messages" className="flex-1">
                            <button className="w-full py-2 text-sm font-bold border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                                Message
                            </button>
                        </Link>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
