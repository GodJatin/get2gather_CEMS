'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const ScrambleText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState('');
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let loopTimeout: NodeJS.Timeout;
    
    const runAnimation = () => {
      let iteration = 0;
      clearInterval(intervalId);
      
      intervalId = setInterval(() => {
        setDisplayText(
          text
            .split('')
            .map((letter, index) => {
              if (index < iteration) {
                return text[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );

        if (iteration >= text.length) {
          clearInterval(intervalId);
          // Schedule next loop after 4 seconds
          loopTimeout = setTimeout(runAnimation, 4000);
        }

        iteration += 1 / 3;
      }, 30);
    };

    // Initial start
    const startTimeout = setTimeout(runAnimation, delay * 1000);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(loopTimeout);
      clearInterval(intervalId);
    };
  }, [text, delay]);

  return <span>{displayText}</span>;
};

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let typingInterval: NodeJS.Timeout;
    
    const runTypingLoop = () => {
      let currentIndex = isDeleting ? text.length : 0;
      
      typingInterval = setInterval(() => {
        if (!isDeleting) {
          // Typing
          if (currentIndex <= text.length) {
            setDisplayText(text.slice(0, currentIndex));
            currentIndex++;
          } else {
            // Finished typing, wait then delete
            clearInterval(typingInterval);
            timeout = setTimeout(() => {
              setIsDeleting(true);
              runTypingLoop();
            }, 3000); // Wait 3 seconds before deleting
            return;
          }
        } else {
          // Deleting
          if (currentIndex >= 0) {
            setDisplayText(text.slice(0, currentIndex));
            currentIndex--;
          } else {
            // Finished deleting, wait then type
            clearInterval(typingInterval);
            timeout = setTimeout(() => {
              setIsDeleting(false);
              runTypingLoop();
            }, 1000); // Wait 1 second before typing again
            return;
          }
        }
      }, isDeleting ? 30 : 50); // Deleting is faster
    };

    // Initial start
    timeout = setTimeout(() => {
      runTypingLoop();
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(typingInterval);
    };
  }, [text, delay, isDeleting]); // Re-run when isDeleting changes to toggle mode

  return (
    <span>
      {displayText}
      <span className={`inline-block w-0.5 h-5 ml-1 bg-accent align-middle ${showCursor ? 'opacity-100' : 'opacity-0'}`}>&nbsp;</span>
    </span>
  );
};

export default function HeroSubtitle() {
  return (
    <div className="text-xl md:text-2xl text-neutral-400 mb-10 leading-relaxed min-h-[6rem] flex flex-col items-center justify-center">
      {/* Line 1: Typewriter Effect */}
      <div className="mb-2 h-8">
        <TypewriterText text="The ultimate platform for college events." delay={0.5} />
      </div>

      {/* Line 2: Scramble Effect with Gradient */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 2.5 }} // Delay until after typewriter finishes roughly
        className="font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent text-2xl md:text-3xl"
      >
        <ScrambleText text="Connect. Celebrate. Create Memories." delay={3} />
      </motion.p>
    </div>
  );
}
