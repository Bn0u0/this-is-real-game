import React, { useState, useRef } from 'react';
import { ItemInstance } from '../../types';
import { sessionService } from '../../services/SessionService';
import { inventoryService } from '../../services/InventoryService'; // [NEW] Import for equip
import { EventBus } from '../../services/EventBus';
import { languageService } from '../../services/LanguageService';
import classNames from 'classnames';

// Mock Data for UI Dev (Simulating "Loading" state possibility)
const MOCK_ITEMS: ItemInstance[] = [
    { uid: '1', defId: 'W_PISTOL', name: 'P-99 Sidewinder', rarity: 'COMMON', computedStats: { damage: 10 } } as any,
    { uid: '2', defId: 'W_SMG', name: 'Vector .45', rarity: 'RARE', computedStats: { damage: 8, fireRate: 100 } } as any,
];

interface Props {
    currentWeapon: ItemInstance | null;
    inventory: ItemInstance[];
}

export const ArsenalOverlay: React.FC<Props> = ({ currentWeapon, inventory }) => {
    const [isClosing, setIsClosing] = useState(false);

    // --- Logic ---
    const [sellingMode, setSellingMode] = useState(false); // Sell Mode Toggle

    const handleItemClick = (item: ItemInstance) => {
        if (sellingMode) {
            // Sell Logic
            if (confirm(`Sell ${item.name} for 50 Credits?`)) {
                // Mock sell for MVP
                console.log(`[Arsenal] Sold ${item.name}`);
                // In real implementation: inventoryService.removeItem(item.uid);
                // sessionService.addCredits(50);
            }
        } else {
            // Equip Logic
            console.log("Equipping:", item.name);
            inventoryService.equipItem(item.uid); // [NEW] Direct equip via service
            // Haptic Feedback
            if (navigator.vibrate) navigator.vibrate(50);

            // Return to Hero view to show result
            handleBackToHero();
        }
    };

    const handleBack = () => {
        setIsClosing(true);
        setTimeout(() => {
            EventBus.emit('WORKBENCH_ACTION', 'BACK');
        }, 200); // Wait for exit animation
    };

    const handleBackToHero = () => {
        setIsClosing(true);
        setTimeout(() => {
            // Switch back to HERO view to see new loadout
            EventBus.emit('WORKBENCH_FOCUS', 'HERO');
        }, 200);
    };

    // --- Render Components ---
    const EmptySlot = () => (
        <div className="aspect-square border border-white/10 bg-black flex items-center justify-center opacity-30">
            {/* Flat Empty Slot */}
            <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] font-bold">EMPTY</div>
        </div>
    );

    return (
        <div className="absolute inset-0 z-50 flex flex-col pointer-events-none overflow-hidden bg-black/80 backdrop-blur-sm">
            {/* Header / Top Bar */}
            <div className="w-full h-24 bg-gradient-to-b from-black to-transparent pointer-events-auto flex justify-between items-center px-6 pt-4">
                <button onClick={handleBack} className="text-white/50 hover:text-white font-mono text-xs">
                    &lt; RETURN TO BASE
                </button>
            </div>

            <div className={`mt-auto w-full bg-[#111] border-t-4 border-[#FFAA00] p-4 pointer-events-auto transition-transform duration-300 ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}>
                {/* Drag Handle */}
                <div className="w-full flex justify-center mb-4 pt-2" onClick={handleBack}>
                    <div className="w-12 h-1 bg-white/20 rounded-full" />
                </div>

                <div className="flex justify-between items-end mb-4 px-2 border-b border-[#FFAA00]/20 pb-2">
                    <h2 className="text-[#FFAA00] font-black text-xl italic tracking-tighter drop-shadow-md" style={{ fontFamily: 'Microsoft JhengHei' }}>
                        {languageService.t('ARSENAL_STORAGE')}
                    </h2>

                    {/* [NEW] SELL TOGGLE */}
                    <button
                        onClick={() => setSellingMode(!sellingMode)}
                        className={classNames(
                            "px-3 py-1 text-xs font-bold border rounded transition-all pointer-events-auto",
                            sellingMode ? "bg-red-500 text-white border-red-500 animate-pulse" : "bg-transparent text-[#FFAA00] border-[#FFAA00]"
                        )}
                    >
                        {sellingMode ? languageService.t('BTN_SELL_ACTIVE') : languageService.t('BTN_SELL_MODE')}
                    </button>

                    {/* [NEW] CLOSE BUTTON */}
                    <button
                        onClick={handleBack}
                        className="ml-2 px-3 py-1 text-xs font-bold border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-all pointer-events-auto"
                    >
                        [{languageService.t('BTN_CLOSE')}]
                    </button>
                </div>

                {/* Grid Container */}
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3 overflow-y-auto custom-scrollbar pb-8 max-h-[400px]">
                    {[...inventory, ...MOCK_ITEMS].map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleItemClick(item)}
                            className={classNames(
                                "aspect-square border p-2 flex flex-col justify-between active:scale-95 transition-all cursor-pointer relative group overflow-hidden",
                                sellingMode ? "bg-red-900/20 border-red-500/50 hover:bg-red-500/20" : "bg-[#FFAA00]/5 border-[#FFAA00]/20 hover:bg-[#FFAA00]/20"
                            )}
                        >
                            <div className="text-[10px] opacity-70 leading-none tracking-wider text-inherit">
                                {item.rarity.substring(0, 3)}
                            </div>
                            <div className="font-bold text-xs leading-none break-words z-10 drop-shadow-sm text-inherit">
                                {item.name}
                            </div>

                            {/* Cost Preview in Sell Mode */}
                            {sellingMode && (
                                <div className="absolute top-1 right-1 text-[10px] text-red-300 font-mono">$</div>
                            )}

                            {/* Background Noise */}
                            <div className="absolute inset-0 opacity-10 bg-black mix-blend-overlay pointer-events-none" />
                        </div>
                    ))}

                    {/* Empty Slots */}
                    {[...Array(12)].map((_, i) => <EmptySlot key={`empty-${i}`} />)}
                </div>
            </div>
        </div>
    );
};
