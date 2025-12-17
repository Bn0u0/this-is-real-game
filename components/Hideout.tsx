import React, { useEffect, useState } from 'react';
import { metaGame } from '../services/MetaGameService';
import { inventoryService } from '../services/InventoryService';
import { InventoryItem, ItemType, getItemDef, EquipmentSlot, ItemRarity } from '../game/data/Items';

export const Hideout: React.FC = () => {
    // Local state
    const [invState, setInvState] = useState(inventoryService.getState());
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [heroId, setHeroId] = useState(metaGame.getState().selectedHeroId);

    // Social Modal
    const [giftLink, setGiftLink] = useState<string | null>(null);

    const heroes = ['Vanguard', 'Spectre', 'Bastion', 'Catalyst', 'Weaver'];

    useEffect(() => {
        const unsub = inventoryService.subscribe(setInvState);
        return () => unsub();
    }, []);

    const handleHeroClick = () => {
        const currentIndex = heroes.indexOf(heroId);
        const nextHero = heroes[(currentIndex + 1) % heroes.length];
        setHeroId(nextHero);
        metaGame.selectHero(nextHero);
    };

    // Actions
    const handleEquip = () => {
        if (!selectedItem) return;
        const def = getItemDef(selectedItem.defId);
        if (!def) return;

        // Check slot
        const success = inventoryService.equipItem(heroId, selectedItem, def.slot);
        if (success) setSelectedItem(null);
    };

    const handleUnequip = (slot: EquipmentSlot) => {
        inventoryService.unequipItem(heroId, slot);
    };

    const handleGift = () => {
        if (!selectedItem) return;
        const link = inventoryService.generateGiftLink(selectedItem);
        setGiftLink(link);
        setSelectedItem(null);
    };

    const handleDecrypt = (item: InventoryItem) => {
        inventoryService.decryptArtifact(item.id);
        setSelectedItem(null);
    };

    const handleSell = (item: InventoryItem) => {
        inventoryService.sellItem(item.id);
        setSelectedItem(null);
    };

    // Helper to render a slot
    const renderSlot = (slot: EquipmentSlot, label: string) => {
        const loadout = invState.loadouts[heroId] || {};
        const item = loadout[slot];
        const def = item ? getItemDef(item.defId) : null;

        return (
            <div
                onClick={() => item && handleUnequip(slot)}
                className={`w-14 h-14 md:w-16 md:h-16 border ${item ? 'border-cyan-400 bg-[#272933]' : 'border-[#272933] bg-black/50'} relative cursor-pointer hover:border-white transition-colors flex items-center justify-center group`}
            >
                {item ? (
                    <>
                        <div className="text-2xl group-hover:scale-110 transition-transform">{def?.icon}</div>
                        <div className="absolute bottom-0 right-0 text-[8px] bg-black px-1 text-cyan-400">T{def?.tier}</div>
                    </>
                ) : (
                    <span className="text-[8px] text-[#494d5e]">{label}</span>
                )}
            </div>
        );
    };

    // Helper to get Rarity Color
    const getRarityColor = (r: string) => {
        if (r === ItemRarity.LEGENDARY) return '#ffe736';
        if (r === ItemRarity.RARE) return '#54fcfc';
        if (r === ItemRarity.UNCOMMON) return '#ff0055';
        return '#494d5e';
    };

    // --- PROCEDURAL HERO AVATARS (CSS ONLY) ---
    const renderHeroAvatar = (hId: string) => {
        // Unique geometric signature for each class
        if (hId === 'Vanguard') return (
            <div className="relative">
                {/* Cyan Triangle */}
                <div className="w-0 h-0 border-l-[30px] border-r-[30px] border-b-[50px] border-l-transparent border-r-transparent border-b-cyan-400 drop-shadow-[0_0_15px_rgba(84,252,252,0.8)] animate-pulse"></div>
                <div className="absolute top-8 left-[-20px] w-10 h-2 bg-white rotate-45"></div>
            </div>
        );
        if (hId === 'Bastion') return (
            <div className="relative">
                {/* Gold/Green Heavy Square */}
                <div className="w-12 h-12 bg-[#ffe736] border-4 border-[#272933] transform rotate-3 drop-shadow-[0_0_15px_rgba(255,231,54,0.6)]"></div>
                <div className="absolute -top-4 -left-4 w-20 h-4 bg-cyan-400 opacity-50"></div>
            </div>
        );
        if (hId === 'Spectre') return (
            <div className="relative">
                {/* Purple Thin Triangle (Upside down) */}
                <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[60px] border-l-transparent border-r-transparent border-t-[#ff0055] drop-shadow-[0_0_10px_rgba(255,0,85,0.8)]"></div>
                {/* Eye */}
                <div className="absolute -top-[50px] -left-[5px] w-3 h-3 bg-white rounded-full animate-ping"></div>
            </div>
        );
        if (hId === 'Weaver') return (
            <div className="relative animate-spin-slow">
                {/* Central Core + Orbitals */}
                <div className="w-8 h-8 bg-white rounded-full shadow-[0_0_20px_white]"></div>
                <div className="absolute -top-8 left-0 w-4 h-4 bg-[#ffe736] rounded-full"></div>
                <div className="absolute top-6 -right-6 w-4 h-4 bg-[#ffe736] rounded-full"></div>
                <div className="absolute top-6 -left-6 w-4 h-4 bg-[#ffe736] rounded-full"></div>
            </div>
        );
        if (hId === 'Catalyst') return (
            <div className="relative">
                {/* Slime Blob */}
                <div className="w-14 h-12 bg-green-400 rounded-[50%] animate-bounce opacity-80 border-b-4 border-green-600"></div>
                <div className="absolute top-2 left-3 w-2 h-2 bg-white rounded-full"></div>
                <div className="absolute top-4 right-4 w-1 h-1 bg-white rounded-full"></div>
            </div>
        );

        return <div className="text-4xl">?</div>;
    };

    return (
        <div className="absolute inset-0 bg-[#0e0d16] font-['Press_Start_2P'] text-[#eddbda] selection:bg-[#ff0055] selection:text-white pointer-events-auto flex flex-col">

            {/* Background: Geometric Void (CSS Radial) */}
            <div className="absolute inset-0 z-0 bg-[#0e0d16]" style={{
                backgroundImage: `
                    radial-gradient(circle at 50% 50%, #1a1c24 0%, #0e0d16 80%),
                    linear-gradient(45deg, #1a1c24 1px, transparent 1px),
                    linear-gradient(-45deg, #1a1c24 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 40px 40px, 40px 40px',
                opacity: 0.8
            }}></div>

            {/* Header */}
            <div className="relative z-10 h-16 flex items-center justify-between px-8 border-b border-[#272933]/50 backdrop-blur-sm shadow-[0_5px_20px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <div className="text-xl tracking-[0.2em] text-cyan-400 drop-shadow-[0_0_5px_rgba(84,252,252,0.8)]">ARMORY</div>
                        <div className="text-[8px] text-[#494d5e] uppercase tracking-widest">UNIT: {heroId} // SYNC OLINE</div>
                    </div>
                </div>
                <div className="flex items-center gap-2 border border-[#272933] px-4 py-2 bg-black/40">
                    <div className="w-2 h-2 bg-yellow-400 animate-pulse"></div>
                    <span className="text-yellow-400 text-xs tracking-widest">{invState.credits.toLocaleString()} CR</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden relative z-10">

                {/* 1. Paper Doll (Equipment) */}
                <div className="w-full md:w-1/3 flex flex-col items-center gap-2 border border-[#272933] p-4 bg-[#0e0d16]/90 shadow-lg relative overflow-hidden">
                    {/* Decorative Scan Line */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400/20 animate-scan"></div>

                    <div className="flex justify-between w-full h-full relative">
                        {/* Left Slots */}
                        <div className="flex flex-col justify-center gap-4 z-10">
                            {renderSlot(EquipmentSlot.HEAD, 'HEAD')}
                            {renderSlot(EquipmentSlot.BODY, 'BODY')}
                            {renderSlot(EquipmentSlot.MAIN_HAND, 'MAIN')}
                        </div>

                        {/* Hero Preview Center */}
                        <div onClick={handleHeroClick} className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors rounded-lg group">
                            <div className="scale-150 transition-transform duration-300 group-hover:scale-175 group-hover:rotate-6">
                                {renderHeroAvatar(heroId)}
                            </div>
                            <div className="mt-8 text-[10px] text-cyan-400 tracking-widest animate-pulse">CLICK TO SWAP</div>
                        </div>

                        {/* Right Slots */}
                        <div className="flex flex-col justify-center gap-4 z-10">
                            {renderSlot(EquipmentSlot.LEGS, 'LEGS')}
                            {renderSlot(EquipmentSlot.FEET, 'FEET')}
                            {renderSlot(EquipmentSlot.OFF_HAND, 'OFF')}
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="w-full mt-2 grid grid-cols-2 gap-2 text-[10px] text-[#494d5e] border-t border-[#272933] pt-2">
                        <div className="flex justify-between px-2"><span>ATK</span> <span className="text-white">100</span></div>
                        <div className="flex justify-between px-2"><span>DEF</span> <span className="text-white">50</span></div>
                        <div className="flex justify-between px-2"><span>SPD</span> <span className="text-white">120%</span></div>
                        <div className="flex justify-between px-2"><span>CRIT</span> <span className="text-white">5%</span></div>
                    </div>
                </div>

                {/* 2. Stash Grid */}
                <div className="flex-1 flex flex-col border border-[#272933] bg-[#0e0d16]/90 relative">
                    <div className="p-3 border-b border-[#272933] flex justify-between items-center bg-black/20">
                        <span className="text-xs text-[#eddbda] tracking-widest">STORAGE MATRIX</span>
                        <span className="text-[10px] text-[#494d5e]">{invState.stash.length} / 20</span>
                    </div>

                    <div className="flex-1 grid grid-cols-5 content-start gap-2 p-4 overflow-y-auto custom-scrollbar">
                        {invState.stash.map(item => {
                            const def = getItemDef(item.defId);
                            if (!def) return null;
                            const canEquip = !def.classReq || def.classReq.includes(heroId);

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className={`
                                        aspect-square border-2 relative flex items-center justify-center cursor-pointer transition-all duration-200
                                        ${selectedItem?.id === item.id ? 'border-cyan-400 bg-[#272933] scale-95 shadow-[0_0_10px_rgba(84,252,252,0.3)]' : 'border-[#272933] hover:border-[#494d5e]'}
                                        ${!canEquip ? 'opacity-40 grayscale' : ''}
                                    `}
                                >
                                    <div className="text-2xl drop-shadow-md">{def.icon}</div>
                                    <div className="absolute top-0 right-0 w-2 h-2" style={{ background: getRarityColor(def.rarity) }}></div>
                                    {!canEquip && <div className="absolute bottom-0 right-0 text-[8px] text-red-500 font-bold bg-black px-1">X</div>}
                                </div>
                            );
                        })}
                        {/* Empty Slots */}
                        {Array.from({ length: Math.max(0, 20 - invState.stash.length) }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square border border-[#1a1c24] bg-black/20"></div>
                        ))}
                    </div>

                    {/* Item Inspector */}
                    {selectedItem && (
                        <div className="h-auto min-h-[160px] border-t border-[#272933] p-4 flex gap-6 animate-slide-up bg-black/40 backdrop-blur-md">
                            {(() => {
                                const def = getItemDef(selectedItem.defId);
                                if (!def) return null;
                                const canEquip = !def.classReq || def.classReq.includes(heroId);

                                return (
                                    <>
                                        <div className="w-24 h-24 border border-[#272933] flex items-center justify-center text-5xl bg-black/50 shadow-inner">
                                            {def.icon}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="text-cyan-400 text-lg tracking-wider mb-1 uppercase drop-shadow-md">{def.name}</div>
                                                <div className="flex gap-2 text-[10px] text-[#494d5e] mb-2 uppercase tracking-widest">
                                                    <span style={{ color: getRarityColor(def.rarity) }}>{def.rarity}</span>
                                                    <span>|</span>
                                                    <span>{def.type}</span>
                                                    <span>|</span>
                                                    <span>{def.slot}</span>
                                                </div>

                                                {/* Requirements Warning */}
                                                {def.classReq && !canEquip && (
                                                    <div className="text-[#ff0055] text-[10px] mb-2 border border-[#ff0055] inline-block px-2 py-1 bg-[#ff0055]/10">
                                                        ⚠ CLASS MISMATCH: {def.classReq.join(', ')} ONLY
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-4 mt-2">
                                                <button
                                                    onClick={handleEquip}
                                                    disabled={!canEquip}
                                                    className={`
                                                        px-6 py-2 text-xs font-bold uppercase transition-all
                                                        ${canEquip
                                                            ? 'bg-cyan-400 text-black hover:bg-white hover:shadow-[0_0_10px_cyan]'
                                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                                                    `}
                                                >
                                                    EQUIP
                                                </button>

                                                {/* Social Gift Button */}
                                                {!canEquip && (
                                                    <button
                                                        onClick={handleGift}
                                                        className="px-6 py-2 bg-[#ff0055] text-white text-xs font-bold uppercase hover:bg-white hover:text-[#ff0055] hover:shadow-[0_0_10px_magenta] transition-all"
                                                    >
                                                        GIFT [LINK]
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleSell(selectedItem)}
                                                    className="px-6 py-2 border border-[#494d5e] text-[#494d5e] text-xs font-bold uppercase hover:bg-[#494d5e] hover:text-white transition-all ml-auto"
                                                >
                                                    SALVAGE (+10)
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>

            {/* Gift Link Modal */}
            {giftLink && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                    <div className="bg-[#1a1c24] p-8 border border-cyan-400 max-w-lg text-center shadow-[0_0_50px_rgba(84,252,252,0.2)]">
                        <h2 className="text-cyan-400 text-xl mb-4 tracking-[0.2em] animate-pulse">TRANSFER READY</h2>
                        <p className="text-xs text-[#eddbda] mb-6 leading-relaxed">
                            Item has been removed from your inventory and encrypted for long-range transmission.
                            <br /><span className="text-[#494d5e]">Send this data packet to a qualified operative.</span>
                        </p>

                        <div className="bg-black p-4 text-[10px] text-green-400 break-all border border-[#272933] mb-8 font-mono shadow-inner select-all">
                            {giftLink}
                        </div>

                        <button
                            onClick={() => setGiftLink(null)}
                            className="px-10 py-3 bg-cyan-400 text-black font-bold tracking-widest hover:bg-white transition-colors"
                        >
                            CLOSE TERMINAL
                        </button>
                    </div>
                </div>
            )}

            {/* Deploy Button */}
            <div className="h-20 border-t border-[#272933] flex items-center justify-center bg-[#0e0d16] relative z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                <button
                    onClick={() => metaGame.startGame()}
                    className="w-full h-full text-cyan-400 text-xl tracking-[0.5em] hover:text-white hover:bg-cyan-400/10 transition-all duration-300 group"
                >
                    <span className="group-hover:animate-pulse">INITIATE WARP</span>
                </button>
            </div>
        </div>
    );
};
