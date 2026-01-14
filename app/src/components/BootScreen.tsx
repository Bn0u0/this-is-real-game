import React, { useEffect, useState } from 'react';

interface BootScreenProps {
    onStart: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onStart }) => {
    const [loaded, setLoaded] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // [INSTANT BOOT]
        // User requested no entrance animation.
        // We trigger completion immediately.
        onStart();
    }, [onStart]);

    return (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-[99999] pointer-events-none font-mono selection:bg-white selection:text-black">
            {/* Terminal Container */}
            <div className="flex flex-col items-center gap-8 w-full max-w-md p-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold text-white tracking-widest uppercase border-b-2 border-white pb-4 mb-4">
                        SYNAPSE OS
                    </h1>
                    <p className="text-sm text-gray-500 tracking-[0.2em] uppercase">
                        v4.0.1 // BOOT SEQUENCE
                    </p>
                </div>

                {/* Progress Bar (Flat) */}
                <div className="w-full space-y-2">
                    <div className="w-full h-4 bg-gray-900 border-2 border-white/20">
                        <div
                            className="h-full bg-white transition-all duration-75 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 font-bold">
                        <span>LOADING CORE...</span>
                        <span>{progress}%</span>
                    </div>
                </div>

                {/* Footer status */}
                <div className="text-xs text-gray-600 mt-8">
                    [ SYSTEMS NOMINAL ]
                </div>
            </div>
        </div>
    );
};
