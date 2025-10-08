import React, { useRef, useEffect, useState } from 'react';
import WellnessService, { WellnessResult } from '../services/wellnessService';

const WellnessAnalysis: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<WellnessResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }
        } catch (err) {
            setError('Failed to access camera');
            console.error('Error accessing camera:', err);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    const captureFrame = (): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            if (!videoRef.current || !canvasRef.current) {
                reject(new Error('Video or canvas not initialized'));
                return;
            }

            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            ctx.drawImage(video, 0, 0);
            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Failed to create blob'));
                },
                'image/jpeg',
                0.95
            );
        });
    };

    const analyzeFrame = async () => {
        try {
            setAnalyzing(true);
            setError(null);
            
            const blob = await captureFrame();
            const imageFile = new File([blob], 'frame.jpg', { type: 'image/jpeg' });
            
            const wellnessService = WellnessService.getInstance();
            const analysis = await wellnessService.analyzeWellness(imageFile);
            
            setResult(analysis);
        } catch (err) {
            setError('Failed to analyze frame');
            console.error('Error analyzing frame:', err);
        } finally {
            setAnalyzing(false);
        }
    };

    const getStressLevelColor = (level: number): string => {
        if (level < 30) return 'text-green-500';
        if (level < 60) return 'text-yellow-500';
        if (level < 80) return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Wellness Analysis</h1>
            
            <div className="relative mb-4">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-w-2xl border rounded"
                />
                <canvas ref={canvasRef} className="hidden" />
            </div>

            <button
                onClick={analyzeFrame}
                disabled={analyzing}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
                {analyzing ? 'Analyzing...' : 'Analyze Now'}
            </button>

            {error && (
                <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {result && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <h2 className="text-xl font-semibold mb-2">Analysis Results</h2>
                    <div className="space-y-2">
                        <p>
                            <span className="font-medium">Emotion:</span>{' '}
                            {result.emotion} ({(result.confidence * 100).toFixed(1)}% confidence)
                        </p>
                        <p>
                            <span className="font-medium">Stress Level:</span>{' '}
                            <span className={getStressLevelColor(result.stressLevel)}>
                                {result.stressLevel.toFixed(1)}%
                            </span>
                        </p>
                        <p>
                            <span className="font-medium">Category:</span>{' '}
                            {result.category}
                        </p>
                        {result.mockData && (
                            <p className="text-gray-500 text-sm italic">
                                Note: Using simulated data for testing
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WellnessAnalysis;