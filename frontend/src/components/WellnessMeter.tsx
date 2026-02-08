import React from 'react';
import { motion } from 'framer-motion';

interface WellnessMeterProps {
    fatigueLevel: number;
    stressLevel: number;
    emotionalState: string;
    burnoutRisk: string;
    recommendations: Array<{
        type: string;
        priority: string;
        title: string;
        description: string;
        action: string;
    }>;
}

export const WellnessMeter: React.FC<WellnessMeterProps> = ({
    fatigueLevel,
    stressLevel,
    emotionalState,
    burnoutRisk,
    recommendations
}) => {
    const getEmotionEmoji = (emotion: string) => {
        const emojiMap: Record<string, string> = {
            'energized': '⚡',
            'excited': '🤩',
            'neutral': '😐',
            'tired': '😴',
            'frustrated': '😤',
            'stressed': '😰',
            'overwhelmed': '😵',
        };
        return emojiMap[emotion] || '😊';
    };

    const getRiskColor = (risk: string) => {
        return risk === 'high' ? 'text-red-600' :
            risk === 'medium' ? 'text-yellow-600' : 'text-green-600';
    };

    const getLevelColor = (level: number) => {
        return level > 0.7 ? 'bg-red-500' :
            level > 0.4 ? 'bg-yellow-500' : 'bg-green-500';
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">🌿</span>
                Wellness Monitor
            </h3>

            {/* Emotional State */}
            <div className="mb-6 text-center">
                <div className="text-6xl mb-2">{getEmotionEmoji(emotionalState)}</div>
                <p className="text-lg font-medium capitalize">{emotionalState}</p>
                <p className={`text-sm font-bold ${getRiskColor(burnoutRisk)}`}>
                    Burnout Risk: {burnoutRisk.toUpperCase()}
                </p>
            </div>

            {/* Meters */}
            <div className="space-y-4 mb-6">
                {/* Fatigue */}
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Fatigue Level</span>
                        <span className="text-sm text-gray-600">{Math.round(fatigueLevel * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${fatigueLevel * 100}%` }}
                            className={`h-3 rounded-full ${getLevelColor(fatigueLevel)}`}
                        />
                    </div>
                </div>

                {/* Stress */}
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Stress Level</span>
                        <span className="text-sm text-gray-600">{Math.round(stressLevel * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stressLevel * 100}%` }}
                            className={`h-3 rounded-full ${getLevelColor(stressLevel)}`}
                        />
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-3">Wellness Recommendations</h4>
                    <div className="space-y-2">
                        {recommendations.slice(0, 3).map((rec, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg border-l-4 ${rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                                        rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                                            'border-green-500 bg-green-50'
                                    }`}
                            >
                                <p className="font-medium text-sm">{rec.title}</p>
                                <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                                <p className="text-xs text-blue-600 mt-1 font-medium">→ {rec.action}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
