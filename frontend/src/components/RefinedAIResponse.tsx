import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

interface RefinedAIResponseProps {
  content: string;
  isTyping?: boolean;
}

/**
 * Enhanced AI Response Component with typewriter effect and clean rendering
 */
export const RefinedAIResponse: React.FC<RefinedAIResponseProps> = ({ content, isTyping = true }) => {
  const [copied, setCopied] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTypewriterComplete, setIsTypewriterComplete] = useState(false);

  // Typewriter effect
  useEffect(() => {
    if (!isTyping) {
      setDisplayedContent(content);
      setIsTypewriterComplete(true);
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTypewriterComplete(true);
      }
    }, 10); // Increased speed: 10ms per character (was 20ms)

    return () => clearInterval(interval);
  }, [content, isTyping]);

  // Copy the entire response
  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Clean content by removing markdown syntax
  const cleanContent = (text: string) => {
    return text
      // Remove markdown headers (### text)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove markdown bold (**text**)
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      // Remove markdown italic (*text*)
      .replace(/\*([^*]+)\*/g, '$1')
      // Remove markdown bullet points (- text)
      .replace(/^[-*+]\s+/gm, '• ')
      // Remove numbered lists formatting but keep the content
      .replace(/^\d+\.\s+/gm, '')
      // Remove code block markers
      .replace(/```[\s\S]*?```/g, (match) => {
        return match.replace(/```\w*\n?/g, '').replace(/```/g, '');
      })
      // Remove inline code markers
      .replace(/`([^`]+)`/g, '$1')
      // Clean up extra whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  };

  // Format the content into paragraphs
  const formatContent = (text: string) => {
    const cleanedText = cleanContent(text);
    const paragraphs = cleanedText.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      const lines = paragraph.split('\n').filter(line => line.trim());
      
      return (
        <div key={index} className="mb-4 last:mb-0">
          {lines.map((line, lineIndex) => {
            const trimmedLine = line.trim();
            
            // Handle bullet points
            if (trimmedLine.startsWith('•')) {
              return (
                <div key={lineIndex} className="flex items-start gap-2 sm:gap-3 mb-2">
                  <span className="text-blue-500 mt-1 text-sm flex-shrink-0">•</span>
                  <span className="flex-1 leading-relaxed text-sm sm:text-base">{trimmedLine.substring(1).trim()}</span>
                </div>
              );
            }
            
            // Handle numbered items (if any remain)
            const numberedMatch = trimmedLine.match(/^(\d+)\.\s*(.*)$/);
            if (numberedMatch) {
              return (
                <div key={lineIndex} className="flex items-start gap-2 sm:gap-3 mb-2">
                  <span className="text-blue-600 font-medium mt-0.5 text-sm min-w-[20px] flex-shrink-0">
                    {numberedMatch[1]}.
                  </span>
                  <span className="flex-1 leading-relaxed text-sm sm:text-base">{numberedMatch[2]}</span>
                </div>
              );
            }
            
            // Regular line
            return (
              <div key={lineIndex} className="leading-relaxed mb-1 last:mb-0 text-sm sm:text-base">
                {trimmedLine}
              </div>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="group relative">
      {/* Main content with typewriter effect */}
      <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
        {formatContent(displayedContent)}
        {isTyping && !isTypewriterComplete && (
          <span className="inline-block w-0.5 h-4 sm:h-5 bg-blue-500 ml-1 animate-pulse" />
        )}
      </div>
      
      {/* Copy button - only show when typewriter is complete */}
      {isTypewriterComplete && (
        <div className="flex justify-end mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleCopyResponse}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs text-gray-600 dark:text-gray-400 
                     hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 
                     rounded-md transition-colors duration-200 opacity-0 group-hover:opacity-100"
            title="Copy response"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500" />
                <span className="text-green-600 dark:text-green-400 text-xs">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default RefinedAIResponse;