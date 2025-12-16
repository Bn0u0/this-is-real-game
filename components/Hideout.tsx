import React, { useEffect, useState } from 'react';
import { metaGame } from '../services/MetaGameService';
import { inventoryService } from '../services/InventoryService';
import { InventoryItem, ItemType } from '../game/data/Items';

export const Hideout: React.FC = () => {
    // Local state for UI refresh
    const [stash, setStash] = useState<InventoryItem[]>([]);
    const [credits, setCredits] = useState(0);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = () => {
        const state = inventoryService.getState();
        setStash([...state.stash]); // Copy to trigger re-render
        setCredits(state.credits);
        setSelectedItem(null);
    };

    const handleDeploy = () => {
        metaGame.startGame();
    };

    const handleDecrypt = (item: InventoryItem) => {
        const result = inventoryService.decryptArtifact(item.id);
        if (result) {
            refreshData();
        }
    };

    const handleSell = (item: InventoryItem) => {
        inventoryService.sellItem(item.id);
        refreshData();
    };

    // --- Renders ---

    return (
        <div className="absolute inset-0 bg-[#0e0d16] font-['Press_Start_2P'] text-[#eddbda] selection:bg-[#ff0055] selection:text-white pointer-events-auto flex flex-col">

            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
                <img src="/assets/ui/bg_hld_ruins.png" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0d16] via-[#0e0d16]/80 to-transparent"></div>
            </div>

            {/* Top Bar: Minimalist Header */}
            <div className="relative z-10 h-16 flex items-center justify-between px-8 border-b border-[#272933]/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-cyan-400 rotate-45"></div>
                    <div className="text-xl tracking-widest text-cyan-400">DRIFTER CAMP</div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400"></div>
                    <span className="text-yellow-400 text-sm tracking-widest">{credits.toLocaleString()} SCRAP</span>
                </div>
            </div>

            {/* Main Layout: Split Columns */}
            <div className="flex-1 flex p-8 gap-8 overflow-hidden">

                {/* LEFT: Hero Visualization (Monolith Style) */}
                <div className="w-1/3 border border-[#272933] bg-[#0e0d16] relative flex flex-col items-center justify-center group overflow-hidden">
                    {/* Background Glitch Effect */}
                    <div className="absolute inset-0 bg-[url('/assets/textures/floor_scifi.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

                    {/* Character Placeholder (Would use Sprite) */}
                    <img
                        src="/assets/sprites/hero_vanguard.png"
                        className="w-32 h-32 rendering-pixelated scale-150 drop-shadow-[0_0_15px_rgba(84,252,252,0.4)] transition-transform group-hover:scale-175 duration-500"
                    />

                    <div className="mt-8 text-center z-10">
                        <h2 className="text-2xl text-cyan-400 tracking-[0.2em] mb-2 uppercase">Vanguard</h2>
                        <div className="text-[10px] text-[#494d5e] tracking-widest uppercase">Class Details // Synced</div>
                    </div>
                </div>

                {/* RIGHT: Inventory Grid (Grid System) */}
                <div className="flex-1 flex flex-col gap-4">
                    <div className="flex justify-between items-end border-b border-[#272933] pb-2">
                        <h3 className="text-sm text-[#eddbda] tracking-widest">INVENTORY_MATRIX</h3>
                        <span className="text-[10px] text-[#494d5e]">{stash.length} / 20 SLOTS</span>
                    </div>

                    <div className="flex-1 grid grid-cols-6 gap-2 content-start overflow-y-auto pr-2 custom-scrollbar">
                        {stash.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className={`
                                    relative aspect-square border-2 flex flex-col items-center justify-center cursor-pointer transition-all group
                                    ${selectedItem?.id === item.id ? 'border-cyan-400 bg-[#272933]' : 'border-[#272933] hover:border-[#494d5e]'}
                                `}
                            >
                                <div className="text-2xl relative z-10 group-hover:scale-110 transition-transform">
                                    {getIcon(item.type)}
                                </div>

                                {/* Rarity Indicator (Corner Triangle) */}
                                <div
                                    className="absolute top-0 right-0 w-3 h-3"
                                    style={{ background: `linear-gradient(225deg, ${getRarityColor(item.rarity)} 50%, transparent 50%)` }}
                                />
                            </div>
                        ))}

                        {/* Empty Slots Fill */}
                        {Array.from({ length: Math.max(0, 24 - stash.length) }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square border border-[#1a1c24] bg-[#0e0d16] opacity-30"></div>
                        ))}
                    </div>

                    {/* Item Details / Actions Panel */}
                    <div className="h-32 border-t border-[#272933] pt-4 flex gap-4">
                        {selectedItem ? (
                            <>
                                <div className="w-32 h-full border border-[#272933] flex items-center justify-center bg-[#0e0d16]">
                                    {getIcon(selectedItem.type)}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="text-cyan-400 text-lg tracking-wider mb-1 uppercase">{selectedItem.defId}</div>
                                        <div className="text-[10px] text-[#494d5e] uppercase tracking-[0.2em]" style={{ color: getRarityColor(selectedItem.rarity) }}>
                                            [{selectedItem.rarity}] // {selectedItem.type}
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        {selectedItem.type === ItemType.ARTIFACT && (
                                            <button
                                                onClick={() => handleDecrypt(selectedItem)}
                                                className="px-6 py-3 bg-[#ff0055] hover:bg-[#ff0055]/80 text-white text-xs tracking-widest uppercase transition-colors"
                                            >
                                                Decrypt
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleSell(selectedItem)}
                                            className="px-6 py-3 bg-[#272933] hover:bg-[#494d5e] text-white text-xs tracking-widest uppercase transition-colors"
                                        >
                                            Salvage
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-[#494d5e] text-xs tracking-widest uppercase italic">
                                Select an item to analyze...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer / Deploy Button */}
            <div className="h-20 border-t border-[#272933] flex items-center justify-center p-4 bg-[#0e0d16]/95">
                <button
                    onClick={handleDeploy}
                    className="w-full max-w-sm h-full border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black text-lg tracking-[0.5em] uppercase transition-all duration-300 relative overflow-hidden group"
                >
                    <span className="relative z-10">Initiate Warp</span>
                    <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
            </div>
        </div>
    );
};

// Helpers
function getRarityColor(r: string) {
    if (r === 'LEGENDARY') return '#ffe736'; // Electric Yellow
    if (r === 'RARE') return '#54fcfc'; // Drifter Cyan
    if (r === 'UNCOMMON') return '#ff0055'; // Signal Magenta
    return '#494d5e'; // Grime Grey
}

function getIcon(t: string) {
    // Map types to simple unicode or reuse images if verified. 
    // Using images for better HLD feel.
    if (t === 'WEAPON') return <img src="/assets/icons/icon_pulse_rifle.png" className="w-8 h-8 filter invert" />;
    if (t === 'ARTIFACT') return <img src="/assets/icons/icon_artifact_box.png" className="w-8 h-8 filter invert" />;
    return <img src="/assets/icons/icon_scrap_metal.png" className="w-8 h-8 filter invert" />;
}
