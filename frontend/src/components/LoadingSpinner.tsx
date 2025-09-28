import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'purple' | 'green' | 'rainbow';
  emoji?: string;
  text?: string;
  type?: 'thinking' | 'learning' | 'analyzing' | 'generating' | 'processing' | 'default';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'blue',
  emoji,
  text,
  type = 'default'
}) => {
  const sizes = {
    sm: { container: 'w-8 h-8', emoji: 'text-xs', text: 'text-xs', particles: 'w-1 h-1' },
    md: { container: 'w-12 h-12', emoji: 'text-sm', text: 'text-sm', particles: 'w-1.5 h-1.5' },
    lg: { container: 'w-16 h-16', emoji: 'text-base', text: 'text-base', particles: 'w-2 h-2' }
  };

  const gradients = {
    blue: 'from-blue-400 via-blue-500 to-purple-500',
    purple: 'from-purple-400 via-purple-500 to-pink-500',
    green: 'from-green-400 via-emerald-500 to-teal-500',
    rainbow: 'from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400'
  };

  // Study-themed content based on type
  const studyThemes = {
    thinking: {
      emojis: ['🧠', '💭', '🤔', '💡', '⚡'],
      texts: ['Deep thinking...', 'Processing thoughts...', 'Analyzing...', 'Pondering...'],
      color: 'blue' as const
    },
    learning: {
      emojis: ['📚', '🎓', '📖', '✏️', '📝'],
      texts: ['Learning in progress...', 'Absorbing knowledge...', 'Studying hard...', 'Growing smarter...'],
      color: 'green' as const
    },
    analyzing: {
      emojis: ['🔍', '📊', '📈', '�', '�'],
      texts: ['Analyzing data...', 'Breaking it down...', 'Finding patterns...', 'Investigating...'],
      color: 'purple' as const
    },
    generating: {
      emojis: ['🚀', '✨', '🎨', '⚡', '🔥'],
      texts: ['Creating magic...', 'Generating ideas...', 'Crafting response...', 'Building something great...'],
      color: 'rainbow' as const
    },
    processing: {
      emojis: ['⚙️', '🔄', '💾', '🖥️', '🤖'],
      texts: ['Processing request...', 'Computing...', 'Working hard...', 'Almost there...'],
      color: 'blue' as const
    },
    default: {
      emojis: ['🎯', '�', '🌟', '🎪', '🎭'],
      texts: ['Loading...', 'Please wait...', 'Getting ready...', 'Preparing...'],
      color: 'blue' as const
    }
  };

  const currentTheme = studyThemes[type];
  const themeColor = color || currentTheme.color;
  const currentEmoji = emoji || currentTheme.emojis[Math.floor(Date.now() / 800) % currentTheme.emojis.length];
  const currentText = text || currentTheme.texts[Math.floor(Date.now() / 2000) % currentTheme.texts.length];

  // Floating particles animation
  const particles = Array.from({ length: 6 }, (_, i) => (
    <motion.div
      key={i}
      className={`absolute ${sizes[size].particles} rounded-full bg-gradient-to-r ${gradients[themeColor]} opacity-60`}
      animate={{
        x: [0, Math.cos(i * Math.PI / 3) * 20, 0],
        y: [0, Math.sin(i * Math.PI / 3) * 20, 0],
        scale: [0.5, 1, 0.5],
        opacity: [0.3, 0.8, 0.3]
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: i * 0.2
      }}
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)'
      }}
    />
  ));

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      {/* Main Spinner Container with floating particles */}
      <div className="relative">
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {particles}
        </div>
        
        {/* Outer rotating gradient ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className={`${sizes[size].container} rounded-full bg-gradient-to-r ${gradients[themeColor]} p-1 shadow-lg`}
        >
          <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full" />
        </motion.div>
        
        {/* Inner counter-rotating ring with dynamic segments */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className={`absolute inset-0 ${sizes[size].container} rounded-full bg-gradient-to-r ${gradients[themeColor]} opacity-70`}
          style={{ clipPath: 'polygon(50% 0%, 100% 0%, 100% 50%, 50% 50%)' }}
        />
        
        {/* Pulsing middle ring */}
        <motion.div
          animate={{ 
            scale: [0.8, 1, 0.8],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute inset-2 rounded-full bg-gradient-to-r ${gradients[themeColor]} opacity-40`}
        />
        
        {/* Center emoji with enhanced animations */}
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 15, -15, 0],
            y: [0, -2, 0]
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: 'easeInOut',
            times: [0, 0.5, 1]
          }}
          className={`absolute inset-0 flex items-center justify-center ${sizes[size].emoji} z-10`}
        >
          <motion.span 
            animate={{ 
              filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)']
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="drop-shadow-lg"
          >
            {currentEmoji}
          </motion.span>
        </motion.div>
        
        {/* Multiple glowing effects */}
        <div className={`absolute inset-0 ${sizes[size].container} rounded-full bg-gradient-to-r ${gradients[themeColor]} opacity-15 blur-lg animate-pulse`} />
        <div className={`absolute inset-0 ${sizes[size].container} rounded-full bg-gradient-to-r ${gradients[themeColor]} opacity-10 blur-xl animate-pulse`} style={{ animationDelay: '0.5s' }} />
      </div>
      
      {/* Dynamic loading text with typing effect */}
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="text-center space-y-1"
      >
        <p className={`text-gray-700 dark:text-gray-300 font-medium ${sizes[size].text} tracking-wide`}>
          {currentText}
        </p>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut'
              }}
              className={`w-1 h-1 rounded-full bg-gradient-to-r ${gradients[themeColor]}`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};