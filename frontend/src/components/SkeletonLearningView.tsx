import React from 'react';

const SkeletonLearningView: React.FC = () => {
  return (
    <div className="space-y-8 w-full animate-pulse">
      {/* Analytics Header Skeleton */}
      <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 flex items-center justify-between h-14">
        <div className="flex space-x-3">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>

      {/* Course Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="h-32 bg-gray-100 p-6 space-y-3">
          <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
          <div className="flex space-x-2">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </div>
              <div className="h-3 w-5/6 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Mock Test Skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm opacity-50">
        <div className="h-20 bg-gray-50 p-6 flex items-center justify-between">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
          <div className="h-10 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="p-6 space-y-6">
           {[1, 2].map((i) => (
              <div key={i} className="space-y-4">
                 <div className="h-5 w-full bg-gray-100 rounded"></div>
                 <div className="space-y-2 pl-6">
                    <div className="h-4 w-3/4 bg-gray-50 rounded"></div>
                    <div className="h-4 w-2/3 bg-gray-50 rounded"></div>
                 </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonLearningView;
