import React from 'react';

const Loader = () => {
    return (
        <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00F0FF] animate-[bounce_1s_infinite_0ms]"></div>
            <div className="w-3 h-3 rounded-full bg-[#00FF94] animate-[bounce_1s_infinite_200ms]"></div>
            <div className="w-3 h-3 rounded-full bg-purple-500 animate-[bounce_1s_infinite_400ms]"></div>
        </div>
    );
};

export default Loader;
