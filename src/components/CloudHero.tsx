import React from 'react';
import { motion } from 'motion/react';

const CloudHero = () => {
  return (
    <div className="relative w-full overflow-hidden bg-sky-gradient pt-16 pb-24">
      {/* Top Clouds */}
      <div className="absolute top-0 left-0 w-full h-32 pointer-events-none opacity-80">
        <svg viewBox="0 0 1440 320" className="w-full h-full preserve-3d" preserveAspectRatio="none">
          <path 
            fill="#f9fafd" 
            d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          {/* Jellybean + Shield Mark */}
          <div className="mb-6 relative">
            <svg width="60" height="60" viewBox="0 0 100 100" className="drop-shadow-lg">
              {/* Jellybean shape */}
              <path 
                d="M30 50 C30 30, 70 30, 70 50 C70 70, 30 70, 30 50" 
                fill="#dd7826" 
                stroke="#1f1b2e" 
                strokeWidth="4"
              />
              {/* Shield overlay */}
              <path 
                d="M40 45 L60 45 L60 55 C60 65, 50 70, 50 70 C50 70, 40 65, 40 55 Z" 
                fill="#f9fafd" 
                stroke="#1f1b2e" 
                strokeWidth="2"
              />
            </svg>
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 bg-[#dd7826] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-[#1f1b2e]"
            >
              Pure Imagination
            </motion.div>
          </div>

          <h1 className="text-6xl md:text-8xl font-display font-bold title-stroke mb-4 tracking-tight">
            MyJellyBean
          </h1>
          
          <p className="text-xl md:text-2xl text-[#1f1b2e] font-medium max-w-2xl mx-auto opacity-90">
            Bite-sized clarity for high-pressure messages.
          </p>
        </motion.div>
      </div>

      {/* Bottom Clouds */}
      <div className="absolute bottom-0 left-0 w-full h-32 pointer-events-none">
        <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
          <path 
            fill="#f9fafd" 
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,149.3C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default CloudHero;
