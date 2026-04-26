import React from 'react';
import Link from 'next/link';
import { Star, Briefcase, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';

export default function RecommendedInternships({ matches = [] }) {
    if (!matches || matches.length === 0) {
        return (
            <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                <p className="text-gray-500 font-bold">No high-probability matches detected yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {matches.map((match, idx) => (
                <motion.div
                    key={match.internship._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-6 rounded-2xl hover:shadow-xl transition-all border border-gray-100 group flex flex-col justify-between h-full"
                >
                    <div className="space-y-4 flex-1">
                        <div className="flex justify-between items-start">
                            <Avatar 
                                src={match.internship.employer?.profilePicture} 
                                name={match.internship.employer?.companyName} 
                                size="lg"
                                className="rounded-2xl"
                            />
                            <div className="flex flex-col items-end">
                                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-black border border-emerald-100 flex items-center gap-1 shadow-sm">
                                    <Star size={12} fill="currentColor" /> {Math.round(match.score)}% Match
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                                {match.internship.positionTitle}
                            </h3>
                            <p className="text-gray-500 text-sm font-medium line-clamp-1">
                                {match.internship.employer?.companyName || match.internship.company}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {(match.internship.requiredSkills || []).slice(0, 3).map((skill) => (
                                <Badge
                                    key={typeof skill === 'string' ? skill : skill.name}
                                    variant="secondary"
                                    size="sm"
                                >
                                    {typeof skill === 'string' ? skill : skill.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <Link
                        href={`/internships/${match.internship._id}?from=dashboard`}
                        className="w-full mt-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 group/btn text-center"
                    >
                        View <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
