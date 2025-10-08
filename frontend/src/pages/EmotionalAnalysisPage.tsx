import React, { useState, useRef, useEffect } from 'react';
import { emotionalAnalysisService } from '../services/emotionalAnalysisService';

interface EmotionalAnalysisProps {}

interface EmotionData {
  emotion: string;
  confidence: number;
  stressLevel?: number;
  category?: string;
  mockData?: boolean;
}

export const EmotionalAnalysisPage: React.FC<EmotionalAnalysisProps> = () => {
  // Main component for handling emotional analysis with camera
  const [analysis, setAnalysis] = useState<EmotionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup: stop camera when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setIsCameraActive(true);
      setError(null);
    } catch (err) {
      setError('Failed to access camera. Please make sure camera permissions are granted.');
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const captureFrame = async (): Promise<File | null> => {
    if (!videoRef.current) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoRef.current, 0, 0);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.95);
    });
  };

  const analyzeFrame = async () => {
    if (!isCameraActive) return;
    
    setIsLoading(true);
    setError(null);
    setAnalysis(null); // Clear previous results
    
    try {
      const imageFile = await captureFrame();
      if (!imageFile) {
        throw new Error('Failed to capture frame');
      }
      
      // Add a small delay to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = await emotionalAnalysisService.analyzeImage(imageFile);
      setAnalysis(result);
    } catch (err) {
      console.error('Error analyzing frame:', err);
      setError('Failed to analyze image. Please try again.');
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Emotional Analysis
      </h1>

      {/* Camera Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Live Camera Analysis
        </h2>

        <div className="mb-4">
          <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isCameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                <p className="text-white text-center">
                  Camera is currently inactive
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4 mb-4">
            <button
              onClick={isCameraActive ? stopCamera : startCamera}
              className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                ${isCameraActive 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'} 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isCameraActive ? 'Stop Camera' : 'Start Camera'}
            </button>

            <button
              onClick={analyzeFrame}
              disabled={!isCameraActive || isLoading}
              className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                ${!isCameraActive || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'} 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isLoading ? 'Analyzing...' : 'Analyze Frame'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Analysis Results */}
      {(analysis || isLoading) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Analysis Results
          </h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Analyzing emotions...</span>
            </div>
          ) : analysis && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Primary Emotion</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                    {analysis.emotion}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Confidence</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {(analysis.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                {analysis.stressLevel !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Stress Level</p>
                    <p className={`text-lg font-medium ${
                      analysis.stressLevel < 30 ? 'text-green-600' :
                      analysis.stressLevel < 60 ? 'text-yellow-600' :
                      analysis.stressLevel < 80 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {analysis.stressLevel.toFixed(1)}%
                    </p>
                  </div>
                )}
                {analysis.category && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {analysis.category}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};