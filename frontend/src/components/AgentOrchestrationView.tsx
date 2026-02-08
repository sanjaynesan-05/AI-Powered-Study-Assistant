import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AgentActivity {
    name: string;
    status: 'pending' | 'active' | 'complete' | 'error';
    output?: any;
    confidence?: number;
    duration?: number;
}

interface AgentOrchestrationProps {
    executionPath: string[];
    agentOutputs: Record<string, any>;
    confidenceScores: Record<string, number>;
}

export const AgentOrchestrationView: React.FC<AgentOrchestrationProps> = ({
    executionPath,
    agentOutputs,
    confidenceScores
}) => {
    const allAgents = [
        { id: 'intent_detection', name: 'Intent Detection', icon: '🎯' },
        { id: 'emotion_analysis', name: 'Emotion Analysis', icon: '😊' },
        { id: 'personalization', name: 'Personalization', icon: '🎨' },
        { id: 'skill_graph', name: 'Skill Graph Reasoning', icon: '🧠' },
        { id: 'learning_resource', name: 'Learning Resources', icon: '📚' },
        { id: 'assessment', name: 'Assessment', icon: '📝' },
        { id: 'wellness', name: 'Wellness Check', icon: '🌿' },
        { id: 'scheduler', name: 'Schedule Planning', icon: '📅' },
        { id: 'reflection', name: 'Reflection', icon: '🔍' },
        { id: 'motivation', name: 'Motivation', icon: '💪' },
        { id: 'explainability', name: 'Explainability', icon: '🪄' },
    ];

    const getAgentStatus = (agentId: string): AgentActivity['status'] => {
        if (executionPath.includes(agentId)) return 'complete';
        if (executionPath.length > 0 &&
            allAgents.findIndex(a => a.id === agentId) === executionPath.length) {
            return 'active';
        }
        return 'pending';
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">🤖</span>
                AI Agent Orchestration
                <span className="ml-auto text-sm text-gray-500">
                    {executionPath.length}/{allAgents.length} Complete
                </span>
            </h3>

            <div className="space-y-3">
                {allAgents.map((agent, index) => {
                    const status = getAgentStatus(agent.id);
                    const confidence = confidenceScores[agent.id];
                    const output = agentOutputs[agent.id];

                    return (
                        <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-lg border-l-4 transition-all ${status === 'complete' ? 'border-green-500 bg-green-50' :
                                    status === 'active' ? 'border-blue-500 bg-blue-50 animate-pulse' :
                                        status === 'error' ? 'border-red-500 bg-red-50' :
                                            'border-gray-300 bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{agent.icon}</span>

                                    {status === 'complete' && <span className="text-green-600 text-xl">✓</span>}
                                    {status === 'active' && (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                    )}
                                    {status === 'pending' && <span className="text-gray-400 text-xl">○</span>}

                                    <span className={`font-medium ${status === 'complete' ? 'text-green-700' :
                                            status === 'active' ? 'text-blue-700' :
                                                'text-gray-500'
                                        }`}>
                                        {agent.name}
                                    </span>
                                </div>

                                {confidence && (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full transition-all"
                                                style={{ width: `${confidence * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {Math.round(confidence * 100)}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            {output && status === 'complete' && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="mt-3 text-sm text-gray-600 bg-white p-3 rounded"
                                >
                                    {typeof output === 'string' ? output : JSON.stringify(output, null, 2).substring(0, 150) + '...'}
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
