'use client';

export default function StudentProfileCompletionBar({ profileCompletion = 0 }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="font-bold text-lg">Profile Completion</h3>
          <p className="text-sm opacity-90">Complete your profile for better matching results</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{profileCompletion}%</div>
          <div className="text-sm opacity-90">
            +{Math.floor(profileCompletion / 10) * 5} bonus points
          </div>
        </div>
      </div>
      <div className="w-full bg-white/20 rounded-full h-3">
        <div
          className="bg-white h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${profileCompletion}%` }}
        ></div>
      </div>
      <div className="mt-3 text-sm opacity-90">
        {profileCompletion < 60 && '⚠️ Low completion - Add GPA, Portfolio, and Skills for better matches'}
        {profileCompletion >= 60 && profileCompletion < 80 && '📈 Good progress - Add more skills and certifications'}
        {profileCompletion >= 80 && profileCompletion < 95 && '🎯 Almost there - Upload resume for extra points'}
        {profileCompletion >= 95 && '🏆 Excellent! Your profile is optimized for matching'}
      </div>
    </div>
  );
}
