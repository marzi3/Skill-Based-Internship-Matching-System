/**
 * MATCH SCORE COMPONENT (The Gauge)
 * 
 * DESIGN RATIONALE:
 * We use an SVG-based circular progress ring to visualize the 
 * match percentage. This provides immediate "Gamified" feedback 
 * to the student about their compatibility.
 * 
 * @param {number} props.score - The 0-100 normalized match score
 * @param {number} props.size - pixel width/height of the gauge
 * @param {number} props.strokeWidth - thickness of the ring
 */
export default function MatchScore({ score = 0, size = 100, strokeWidth = 8, label = 'Match Score' }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // DATA SANITIZATION: Clamping ensures the SVG doesn't break if 
    // the backend sends an out-of-bounds number (e.g., 105 or -5).
    const normalizedScore = Math.max(0, Math.min(100, score));
    
    // SVG MATH: The stroke-dashoffset determines how much of the ring is "filled"
    const offset = circumference - (normalizedScore / 100) * circumference;

    /**
     * DYNAMIC COLORING:
     * We use semantic colors to provide psychological cues:
     * - Emerald (Success/Perfect)
     * - Blue (Good/Stable)
     * - Amber (Fair/Developing)
     * - Rose (Poor/Mismatch)
     */
    const getColorClass = (s) => {
        if (s >= 90) return 'text-emerald-500';
        if (s >= 70) return 'text-blue-500';
        if (s >= 50) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getGlowClass = (s) => {
        if (s >= 90) return 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]';
        if (s >= 70) return 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]';
        if (s >= 50) return 'drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]';
        return 'drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]';
    };

    return (
        <div className="relative flex flex-col items-center justify-center p-2" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90 absolute">
                {/* Background Track: Stays gray to show the total 100% capacity */}
                <circle
                    className="text-gray-100"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />

                {/* ANIMATED PROGRESS: Powered by Framer Motion for a "Premium" feel */}
                <motion.circle
                    className={`${getColorClass(normalizedScore)} ${getGlowClass(normalizedScore)}`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
                <span className={`text-2xl font-black tabular-nums tracking-tighter ${getColorClass(normalizedScore)}`}>
                    {Math.round(normalizedScore)}%
                </span>
                {label && <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mt-0.5">{label}</span>}
            </div>
        </div>
    );
}
