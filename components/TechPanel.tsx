import React from 'react';

interface TechPanelProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export const TechPanel: React.FC<TechPanelProps> = ({ children, className = '', title }) => {
    return (
        <div className={`relative p-8 bg-[rgba(20,20,30,0.85)] border border-[#00FFFF] backdrop-blur-md shadow-[0_0_20px_rgba(0,255,255,0.2)] overflow-hidden ${className}`}
            style={{
                clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)'
            }}
        >
            {/* Decoration: Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,20,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            {/* Decoration: Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#FF0055]" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#FF0055]" />

            {/* Title */}
            {title && (
                <div className="absolute top-0 left-8 bg-[#00FFFF] text-black px-4 py-1 font-bold tracking-[0.2em] text-xs transform -skew-x-12 origin-top">
                    {title}
                </div>
            )}

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
