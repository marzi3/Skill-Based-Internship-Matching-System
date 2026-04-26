/**
 * MATCH EXPLANATION (Engine Traceability)
 * 
 * DESIGN RATIONALE:
 * This component implements "Explainable AI". Instead of just showing 
 * a score, we reveal the internal reasoning (Fact Traces) of the 
 * engine so the user knows exactly why they matched or failed.
 * 
 * @param {Array} props.explanations - Raw rule trace logs from the backend
 */
export default function MatchExplanation({ explanations = [] }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!explanations || explanations.length === 0) return null;

    /**
     * INFERENCE FILTERING:
     * We separate the "Bad News" from the "Good News".
     * - Disqualifications (Score -Infinity) are top priority.
     * - Valid Rules (Bonuses) follow.
     */
    const disqualifications = explanations.filter(e => e.score === -Infinity);
    const validRules = explanations.filter(e => e.score !== -Infinity);

    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden bg-white/60 backdrop-blur-md shadow-sm">
            {/* ACCORDION TRIGGER: Keeps the UI clean by default */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/40 transition-colors"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2">
                    <Info size={16} className="text-primary-600" />
                    <span className="font-bold text-sm text-gray-900">Why did I match?</span>
                    <span className="bg-primary-50 border border-primary-100 text-primary-700 text-[10px] px-2 py-0.5 rounded-full font-bold ml-2">
                        {explanations.length} Rules Evaluated
                    </span>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-100"
                    >
                        <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                            
                            {/* CRITICAL FAILURES: Highlighted in Rose (Red) to signal urgency */}
                            {disqualifications.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    <h5 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                                        <AlertCircle size={14} /> Critical Fails (Disqualified)
                                    </h5>
                                    {disqualifications.map((item, idx) => (
                                        <div key={`dq-${idx}`} className="flex items-start gap-2 text-sm bg-rose-50 text-rose-700 p-3 rounded-lg border border-rose-100">
                                            <XCircle size={16} className="mt-0.5 shrink-0" />
                                            <div>
                                                <span className="font-bold block">{item.rule.replace(/_/g, ' ')}</span>
                                                <span className="text-rose-600/80 text-xs">{item.detail}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* SCORING BREAKDOWN: Verified positive matches */}
                            {validRules.length > 0 && (
                                <div className="space-y-3">
                                    <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">A.I. Scoring Breakdown</h5>
                                    <div className="space-y-1">
                                        {validRules.map((item, idx) => {
                                            const isPositive = item.score > 0;
                                            return (
                                                <div key={`rule-${idx}`} className="flex justify-between items-start gap-4 p-2.5 hover:bg-gray-50/50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                                    <div className="flex items-start gap-2.5">
                                                        {isPositive ? (
                                                            <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                                        ) : (
                                                            <div className="w-4 h-4 rounded-full border border-gray-300 mt-0.5 shrink-0" />
                                                        )}
                                                        <div>
                                                            <span className="font-bold text-sm text-gray-900 block">{item.rule.replace(/_/g, ' ')}</span>
                                                            <span className="text-gray-500 text-xs">{item.detail}</span>
                                                        </div>
                                                    </div>
                                                    {/* SCORE BADGE: Visual validation of point magnitude */}
                                                    <div className={`text-xs font-bold shrink-0 px-2 py-1 rounded border ${isPositive ? 'text-emerald-700 border-emerald-200 bg-emerald-50' : 'text-gray-500 border-gray-200 bg-gray-50'}`}>
                                                        {isPositive ? '+' : ''}{Math.round(item.score)} pts
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
