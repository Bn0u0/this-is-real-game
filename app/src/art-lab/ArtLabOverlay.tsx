import React, { useState } from 'react';
import { EventBus } from '../services/EventBus';
import { ArtLabState, DEFAULT_LAB_CONFIG } from './ArtLabConfig';

export const ArtLabOverlay: React.FC = () => {
    const [config, setConfig] = useState<ArtLabState>(DEFAULT_LAB_CONFIG);

    const handleUpdate = (key: keyof ArtLabState, value: number | string) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        // Dispatch to Phaser
        EventBus.emit('ART_LAB_UPDATE', newConfig);
    };

    const handleSave = () => {
        console.log("💾 [Art Lab] Config Saved:", config);
        alert(`Config Logged to Console:\n${JSON.stringify(config, null, 2)}`);
    };

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-end">
            {/* Control Panel */}
            <div className="w-full bg-black/80 p-4 pointer-events-auto border-t-2 border-white/20 text-white font-mono text-sm">
                <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                    <h2 className="text-xl text-[#39ff14] font-bold">🧪 ART LAB (STANDALONE)</h2>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {/* 1. RENDER */}
                    <div className="space-y-2">
                        <h3 className="text-[#39ff14] font-bold">PIXELATION (RES)</h3>
                        <div className="flex items-center space-x-2">
                            <span>1x</span>
                            <input
                                type="range" min="1" max="10" step="1"
                                value={config.pixelation}
                                onChange={(e) => handleUpdate('pixelation', parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span>{config.pixelation}x</span>
                        </div>
                    </div>

                    {/* 2. WOBBLE */}
                    <div className="space-y-2">
                        <h3 className="text-[#39ff14] font-bold">WOBBLE (VIBE)</h3>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs w-12">SPEED</span>
                            <input
                                type="range" min="0" max="5" step="0.1"
                                value={config.wobbleSpeed}
                                onChange={(e) => handleUpdate('wobbleSpeed', parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs w-8">{config.wobbleSpeed}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs w-12">AMP</span>
                            <input
                                type="range" min="0" max="5" step="0.1"
                                value={config.wobbleAmp}
                                onChange={(e) => handleUpdate('wobbleAmp', parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs w-8">{config.wobbleAmp}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-between">
                    <div className="space-x-2">
                        {['CHARACTER', 'WEAPON', 'ENVIRONMENT'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => handleUpdate('activeMode', mode)}
                                className={`px-2 py-1 border ${config.activeMode === mode ? 'bg-[#39ff14] text-black border-transparent' : 'border-gray-500 text-gray-500'}`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleSave}
                        className="px-4 py-1 bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/40"
                    >
                        SAVE CONFIG
                    </button>
                </div>
            </div>
        </div>
    );
};
