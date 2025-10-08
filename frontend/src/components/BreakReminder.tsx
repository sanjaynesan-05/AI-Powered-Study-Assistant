import React, { useState, useEffect } from 'react';

export const BreakReminder: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    // Set start time when component mounts (when user first visits the site)
    if (!startTime) {
      setStartTime(Date.now());
    }

    // Check every 30 seconds if 1 minute has passed
    const interval = setInterval(() => {
      if (startTime && !showPopup) {
        const elapsedTime = Date.now() - startTime;
        const oneMinute = 60 * 1000; // 1 minute in milliseconds

        if (elapsedTime >= oneMinute) {
          setShowPopup(true);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [startTime, showPopup]);

  const closePopup = () => {
    setShowPopup(false);
  };

  const takeBreak = () => {
    setShowPopup(false);
    // Reset timer for next break reminder
    setStartTime(Date.now());
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Time for a Break! 🌟
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You've been studying for over a minute. Taking short breaks helps maintain focus and prevents burnout.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                💡 Quick Tip: Stand up, stretch, and look at something 20 feet away for 20 seconds!
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={closePopup}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md transition-colors"
            >
              Continue Studying
            </button>
            <button
              onClick={takeBreak}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              Take a Break
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};