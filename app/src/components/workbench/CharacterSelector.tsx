import React, { useState } from 'react';
import { CLASSES } from '../../game/phaser/factories/PlayerFactory';
import { PlayerClassID } from '../../types';
import { HapticService } from '../../services/HapticService';
import { languageService } from '../../services/LanguageService';

interface CharacterSelectorProps {
    onSelect: (classId: string) => void;
    initialClass?: string;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({ onSelect, initialClass }) => {
    const classKeys = Object.keys(CLASSES) as PlayerClassID[];
    // Find index of initialClass or default to 0
    const startIdx = initialClass ? classKeys.indexOf(initialClass as PlayerClassID) : 0;
    const [selectedIdx, setSelectedIdx] = useState(startIdx >= 0 ? startIdx : 0);

    const currentClass = CLASSES[classKeys[selectedIdx]];

    const nextClass = () => {
        const newIdx = (selectedIdx + 1) % classKeys.length;
        setSelectedIdx(newIdx);
        HapticService.light();
        onSelect(classKeys[newIdx]);
    };

    const prevClass = () => {
        const newIdx = (selectedIdx - 1 + classKeys.length) % classKeys.length;
        setSelectedIdx(newIdx);
        HapticService.light();
        onSelect(classKeys[newIdx]);
    };

    return (
        <div className="w-full mb-8 flex items-center justify-between bg-black/40 backdrop-blur-md rounded-2xl p-4 border-2 border-white/10 pointer-events-auto">
            <button onClick={prevClass} className="p-4 text-[#00FFFF] text-2xl hover:scale-125 transition-transform">
                ◀
            </button>

            <div className="flex flex-col items-center text-center">
                <h2 className="text-3xl font-black text-white tracking-widest mb-1" style={{ textShadow: `0 0 10px #${currentClass.stats.markColor.toString(16)}`, fontFamily: 'Microsoft JhengHei' }}>
                    {currentClass.name}
                </h2>
                <div className="text-xs text-gray-400 font-mono tracking-widest mb-2">
                    {/* Accessing translation keys would ideally be dynamic here */}
                    {languageService.t('STAT_HP_MAX')}: {currentClass.stats.hp}
                </div>
                {/* Simple Stats Display */}
                <div className="flex gap-2 text-[10px] text-gray-300">
                    <span className="bg-white/10 px-2 py-1 rounded">ATK {currentClass.stats.atk}</span>
                    <span className="bg-white/10 px-2 py-1 rounded">SPD {currentClass.stats.speed}</span>
                </div>
            </div>

            <button onClick={nextClass} className="p-4 text-[#00FFFF] text-2xl hover:scale-125 transition-transform">
                ▶
            </button>
        </div>
    );
};
