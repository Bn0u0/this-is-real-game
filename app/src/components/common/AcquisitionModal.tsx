import React, { useEffect, useState } from 'react';
import { ItemInstance, ItemRarity } from '../../types';

interface Props {
    item: ItemInstance;
    onAccept: () => void;
    title?: string;
    subtitle?: string;
    flavorText?: string;
}

export const AcquisitionModal: React.FC<Props> = ({ item, onAccept, title, subtitle, flavorText }) => {
    // 根據稀有度決定霓虹光顏色
    // ItemInstance now has 'rarity' field (COMMON, RARE, EPIC, LEGENDARY, MYTHIC)
    const getRarityColor = () => {
        if (!item.rarity) return '#ffffff';
        switch (item.rarity) {
            case ItemRarity.COMMON: return '#ffffff';
            case ItemRarity.RARE: return '#0070dd'; // Blue
            case ItemRarity.EPIC: return '#a335ee'; // Purple
            case ItemRarity.LEGENDARY: return '#ff8000'; // Orange
            case ItemRarity.GLITCH: return '#ff0055'; // Pink/Red
            case ItemRarity.MYTHIC: return '#ff0000'; // Red
            default: return '#FFD700';
        }
    };

    // If item has a prefix with visual overrides, use them. Otherwise default to Rarity/Amber style.
    const glowColor = (item.prefix?.visuals?.glowColor || getRarityColor()) as string;
    const borderColor = (item.prefix?.visuals?.textColor || '#555') as string;

    // Image logic: [REMOVED] hardcoded ID checks - replaced by data-driven visualCategory in V2
    const getIconPath = () => {
        // TODO: V2 will use item.def.icon or visualCategory mapping
        return '';
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            {/* 卡片容器 */}
            <div
                className="relative w-[90%] max-w-md p-1 bg-[#2D1B2E] border-2 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                style={{ borderColor: borderColor }}
            >
                {/* 掃描線背景 */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-black mix-blend-overlay"></div>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/80"></div>

                {/* 內容區 */}
                <div className="relative z-10 flex flex-col items-center p-6 text-center">

                    {/* 標題 */}
                    <div className="mb-2 text-xs tracking-[0.2em] text-gray-400 uppercase animate-pulse">
                        {subtitle || 'SYSTEM ALERT // NEW HARDWARE DETECTED'}
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-wider mb-6" style={{ textShadow: `0 0 10px ${glowColor}` }}>
                        {title || 'WEAPON ACQUIRED'}
                    </h2>

                    {/* 武器圖示 (旋轉展示) */}
                    <div className="relative w-32 h-32 mb-6 group">
                        <div className="absolute inset-0 border-2 border-dashed rounded-full animate-spin-slow opacity-30" style={{ borderColor: glowColor }}></div>
                        <div className="flex items-center justify-center w-full h-full bg-black/40 rounded-lg border border-white/10">
                            <img src={getIconPath()}
                                className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                                alt="Weapon"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiIGQ9Ik0xMyAxMFYzaTN2N2g2bDIgMy0yIDNWMTB6bS0tNCAwSDdWLTNoLTN2N2g2eiIgLz48L3N2Zz4=';
                                }}
                            />
                        </div>
                    </div>

                    {/* 武器名稱 (動態詞條顏色) */}
                    <div className="text-xl font-bold mb-2">
                        {item.prefix && (
                            <span style={{ color: item.prefix?.visuals?.textColor || '#aaa' }} className="mr-2">
                                {item.prefix.name}
                            </span>
                        )}
                        <span className="text-white">
                            {item.name || item.displayName}
                        </span>
                        {item.suffix && (
                            <span style={{ color: '#aaa' }} className="ml-2">
                                {item.suffix.name}
                            </span>
                        )}
                    </div>

                    {/* 數值面板 */}
                    <div className="w-full bg-black/50 p-3 rounded mb-4 text-sm font-mono text-left space-y-1 border-l-2" style={{ borderColor: glowColor }}>
                        <div className="flex justify-between">
                            <span className="text-gray-500">DMG (傷害)</span>
                            <span className="text-white">{Math.floor(item.computedStats.damage)}</span>
                        </div>
                        {/* Convert Delay to Rate or just ms */}
                        <div className="flex justify-between">
                            <span className="text-gray-500">DELAY (射擊間隔)</span>
                            <span className="text-white">{item.computedStats.fireRate}ms</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">RANGE (射程)</span>
                            <span className="text-white">{item.computedStats.range}</span>
                        </div>
                        {item.prefix && (
                            <div className="text-xs text-yellow-500 mt-2 pt-2 border-t border-white/10 italic">
                                "{item.prefix.name}": 數值已修正
                            </div>
                        )}

                    </div>

                    {/* Flavor Text */}
                    <p className="text-xs text-gray-500 italic mb-6">
                        {flavorText || "「這東西也許能救你一命...」"}
                    </p>

                    {/* 按鈕 */}
                    <button
                        onClick={onAccept}
                        className="w-full py-3 bg-white text-black font-black uppercase tracking-widest hover:bg-[#00FFFF] hover:scale-105 transition-all skew-x-[-10deg]"
                    >
                        EQUIP // 裝備
                    </button>
                </div>
            </div>
        </div>
    );
};
