import React from 'react';

const Loader = () => {
    return (
        <div className="flex items-center justify-center gap-2 relative">
             <div className="absolute inset-0 bg-blue-500/20 blur-xl animate-pulse"></div>
            <div className="w-4 h-4 rounded-full bg-[#00F0FF] animate-[bounce_1s_infinite_0ms] shadow-[0_0_10px_#00F0FF]"></div>
            <div className="w-4 h-4 rounded-full bg-[#00FF94] animate-[bounce_1s_infinite_200ms] shadow-[0_0_10px_#00FF94]"></div>
            <div className="w-4 h-4 rounded-full bg-purple-500 animate-[bounce_1s_infinite_400ms] shadow-[0_0_10px_#a855f7]"></div>
        </div>
    );
};

export default Loader;
