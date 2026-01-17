import React, { useState } from 'react';
import { ItemInstance } from '../../types';
import { sessionService } from '../../services/SessionService';
import { inventoryService } from '../../services/InventoryService';

// Mock Items for UI Dev
const MOCK_ITEMS: ItemInstance[] = [
    { uid: '1', defId: 'W_PISTOL', name: '響尾蛇 P-99', rarity: 'COMMON', computedStats: { damage: 10 } } as any,
    { uid: '2', defId: 'W_SMG', name: '向量 .45', rarity: 'RARE', computedStats: { damage: 8, fireRate: 100 } } as any,
];

interface Props {
    currentWeapon: ItemInstance | null;
    inventory: ItemInstance[];
}

export const ArsenalOverlay: React.FC<Props> = ({ currentWeapon, inventory }) => {
    const [sellingMode, setSellingMode] = useState(false);

    const handleItemClick = (item: ItemInstance) => {
        if (sellingMode) {
            if (confirm(`確定要賣掉 ${item.name} 換取 50 金幣嗎?`)) {
                console.log(`[Arsenal] Sold ${item.name}`);
            }
        } else {
            console.log("裝備中:", item.name);
            inventoryService.equipItem(item.uid);
            if (navigator.vibrate) navigator.vibrate(50);
            handleBackToHero();
        }
    };

    const handleClose = () => {
        sessionService.openWorkbench('NONE');
    };

    const handleBackToHero = () => {
        sessionService.openWorkbench('HERO');
    };

    const getRarityClass = (rarity: string) => {
        switch (rarity) {
            case 'COMMON': return 'rarity-common';
            case 'UNCOMMON': return 'rarity-uncommon';
            case 'RARE': return 'rarity-rare';
            case 'EPIC': return 'rarity-epic';
            case 'LEGENDARY': return 'rarity-legendary';
            default: return 'text-bone';
        }
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center p-4 z-50 pointer-events-auto">
            <div className="baba-box p-6 w-full max-w-md max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between mb-4 border-b-2 border-rust pb-3">
                    <h2 className="text-2xl text-rust uppercase tracking-widest">
                        // 武器庫
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSellingMode(!sellingMode)}
                            className={`baba-btn-ghost px-3 py-1 text-sm ${sellingMode ? 'bg-blood text-bone' : ''}`}
                        >
                            {sellingMode ? '出售中' : '出售'}
                        </button>
                        <button
                            onClick={handleClose}
                            className="baba-btn-ghost px-3 py-1 text-sm"
                        >
                            X
                        </button>
                    </div>
                </div>

                <p className="text-ash text-sm mb-4">
                    {sellingMode ? '// 點擊物品進行出售' : '// 點擊物品進行裝備'}
                </p>

                {/* Items Grid */}
                <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-3 pb-4">
                    {[...inventory, ...MOCK_ITEMS].map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleItemClick(item)}
                            className={`baba-slot aspect-square p-2 flex flex-col justify-between cursor-pointer
                                ${sellingMode ? 'border-blood' : ''}
                            `}
                        >
                            <div className={`text-xs ${getRarityClass(item.rarity)} uppercase`}>
                                {item.rarity.substring(0, 3)}
                            </div>
                            <div className="text-sm text-bone text-center leading-tight">
                                {item.name}
                            </div>
                            {sellingMode && (
                                <div className="text-xs text-rad text-center">$50</div>
                            )}
                        </div>
                    ))}

                    {/* Empty Slots */}
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={`empty-${i}`}
                            className="baba-slot aspect-square flex items-center justify-center border-dashed"
                        >
                            <span className="text-ash text-sm">空</span>
                        </div>
                    ))}
                </div>

                {/* Return Button */}
                <button
                    onClick={handleBackToHero}
                    className="baba-btn w-full py-3 mt-4"
                >
                    &lt;&lt; 返回裝備
                </button>
            </div>
        </div>
    );
};
