import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExplainabilityPanelProps {
    explanations: Record<string, string>;
    reasoningChain: string[];
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
    explanations,
    reasoningChain
}) => {
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
    const [showReasoning, setShowReasoning] = useState(false);

    return (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">🪄</span>
                Why did the AI choose this?
            </h3>

            {/* Explanations Q&A */}
            <div className="space-y-3 mb-6">
                {Object.entries(explanations).map(([question, answer]) => (
                    <div key={question} className="bg-white rounded-lg p-4 shadow">
                        <button
                            onClick={() => setExpandedQuestion(
                                expandedQuestion === question ? null : question
                            )}
                            className="w-full text-left flex items-center justify-between hover:text-blue-600 transition-colors"
                        >
                            <span className="font-medium text-gray-800">{question}</span>
                            <span className="text-gray-400 text-xl">
                                {expandedQuestion === question ? '▼' : '▶'}
                            </span>
                        </button>

                        <AnimatePresence>
                            {expandedQuestion === question && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-3 text-gray-600 text-sm leading-relaxed overflow-hidden"
                                >
                                    {answer}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Reasoning Chain */}
            <div className="border-t border-purple-200 pt-4">
                <button
                    onClick={() => setShowReasoning(!showReasoning)}
                    className="flex items-center space-x-2 text-purple-700 hover:text-purple-900 font-medium"
                >
                    <span>{showReasoning ? '▼' : '▶'}</span>
                    <span>View AI Reasoning Chain ({reasoningChain.length} steps)</span>
                </button>

                <AnimatePresence>
                    {showReasoning && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 space-y-2 overflow-hidden"
                        >
                            {reasoningChain.map((step, index) => (
                                <div key={index} className="flex items-start space-x-3 bg-white p-3 rounded">
                                    <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                        {index + 1}
                                    </span>
                                    <span className="text-sm text-gray-700">{step}</span>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
