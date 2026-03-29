/**
 * MATCH LIST COMPONENT (The Orchestrator)
 * 
 * DESIGN RATIONALE:
 * This component handles the high-level layout of match results. 
 * Its primary responsibility is to manage the entrance animations (stagger) 
 * and handle "Empty States" gracefully.
 * 
 * @param {Array} props.matches - List of match objects from the API
 * @param {Array} props.studentSkills - Data for the SkillComparison prop-drill
 * @param {boolean} props.isEmployerMode - Context for the MatchCard
 */
export default function MatchList({ matches = [], studentSkills = [], isEmployerMode = false }) {
    
    /**
     * EMPTY STATE VALIDATION:
     * UX BEST PRACTICE: Instead of a blank screen, we show a helpful
     * illustration and "Call to Action" (CTA) to encourage profile completion.
     */
    if (!matches || matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white/50 backdrop-blur-md rounded-3xl border border-dashed border-gray-200 shadow-sm min-h-[400px]">
                <div className="text-gray-400 mb-4 animate-pulse">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Matches Found</h3>
                <p className="text-gray-500 max-w-sm">
                    {isEmployerMode
                        ? "We couldn't find any candidates meeting your specific criteria right now. Check back later as our pool grows."
                        : "We're currently searching our database. Complete your profile and add more skills to improve your match rate!"}
                </p>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-6"
        >
            {/* DATA MAPPING: Converting the array of data into an array of UI components */}
            {matches.map((match, index) => {
                /**
                 * KEY PROP RATIONALE:
                 * We use the _id from MongoDB as the key.
                 * WHY?: This satisfies React's Reconciliation requirements, 
                 * ensuring that if the list re-orders, only the specific 
                 * cards that moved are updated in the DOM.
                 */
                const matchId = match._id || match.internship?._id || match.student?._id || `fallback-${index}`;
                return (
                    <MatchCard
                        key={matchId}
                        match={match}
                        studentSkills={studentSkills}
                        isEmployerMode={isEmployerMode}
                    />
                );
            })}
        </motion.div>
    );
}
