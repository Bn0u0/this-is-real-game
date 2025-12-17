import React, { useEffect, useState } from 'react';

interface BootScreenProps {
    onStart: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onStart }) => {
    const [text, setText] = useState('');
    const fullText = "神經網絡連結中...";

    // Typewriter effect
    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setText(fullText.substring(0, i + 1));
            i++;
            if (i >= fullText.length) clearInterval(interval);
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const handleClick = () => {
        // Simple glitch out
        const audio = new AudioContext(); // Init Audio Context on click
        audio.resume();

        onStart();
    };

    return (
        <div
            onClick={handleClick}
            className="fixed inset-0 bg-black flex flex-col items-center justify-center cursor-pointer select-none"
        >
            <div className="relative">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#00FFFF] animate-pulse">
                    {text}
                    <span className="animate-blink">_</span>
                </h1>

                {/* Glitch Shadows */}
                <h1 className="absolute top-0 left-0 text-6xl md:text-8xl font-black tracking-tighter text-[#FF0055] opacity-50 translate-x-[2px] animate-[glitch_2s_infinite]">
                    {text}
                </h1>
            </div>

            <div className="mt-8 text-gray-500 tracking-[0.5em] text-xs animate-bounce">
                點擊螢幕以初始化
            </div>
        </div>
    );
};
