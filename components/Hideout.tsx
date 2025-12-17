import React, { useEffect, useState } from 'react';
import { metaGame } from '../services/MetaGameService';
import { inventoryService } from '../services/InventoryService';
import { InventoryItem, ItemType, getItemDef, EquipmentSlot, ItemDef } from '../game/data/Items';

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

    // Helper to render a slot
    const renderSlot = (slot: EquipmentSlot, label: string) => {
        const loadout = invState.loadouts[heroId] || {};
        const item = loadout[slot];
        const def = item ? getItemDef(item.defId) : null;

        return (
            <div
                onClick={() => item && handleUnequip(slot)}
                className={`w-16 h-16 border ${item ? 'border-cyan-400 bg-[#272933]' : 'border-[#272933] bg-black/50'} relative cursor-pointer hover:border-white transition-colors flex items-center justify-center`}
            >
                {item ? (
                    <>
                        <div className="text-2xl">{def?.icon}</div>
                        <div className="absolute bottom-0 right-0 text-[8px] bg-black px-1">{def?.tier}</div>
                    </>
                ) : (
                    <span className="text-[8px] text-[#494d5e]">{label}</span>
                )}
            </div>
        );
    };

    return (
        <div className="absolute inset-0 bg-[#0e0d16] font-['Press_Start_2P'] text-[#eddbda] selection:bg-[#ff0055] selection:text-white pointer-events-auto flex flex-col">

            {/* ... Background Layers (Same as before) ... */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e0d16] via-[#0e0d16]/80 to-transparent"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 h-16 flex items-center justify-between px-8 border-b border-[#272933]/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="text-xl tracking-widest text-cyan-400">ARMORY // {heroId}</div>
                    <div className="text-xs text-[#494d5e]">Lv.1 (XP: 0/1000)</div>
                </div>
                <div className="text-yellow-400 text-sm">{invState.credits.toLocaleString()} CR</div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden relative z-10">

                {/* 1. Paper Doll (Equipment) */}
                <div className="w-full md:w-1/3 flex flex-col items-center gap-4 border border-[#272933] p-4 bg-[#0e0d16]/80">
                    <div className="flex justify-between w-full">
                        <div className="flex flex-col gap-2">
                            {renderSlot(EquipmentSlot.HEAD, 'HEAD')}
                            {renderSlot(EquipmentSlot.BODY, 'BODY')}
                        </div>

                        {/* Hero Preview Center */}
                        <div onClick={handleHeroClick} className="flex-1 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                            {/* Placeholder for Hero Art */}
                            <div className={`w-32 h-32 border-2 border-cyan-400 rotate-45 flex items-center justify-center`}>
                                <span className="text-4xl -rotate-45">✨</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            {renderSlot(EquipmentSlot.LEGS, 'LEGS')}
                            {renderSlot(EquipmentSlot.FEET, 'FEET')}
                        </div>
                    </div>

                    <div className="flex gap-4 w-full justify-center mt-4">
                        {renderSlot(EquipmentSlot.MAIN_HAND, 'MAIN')}
                        {renderSlot(EquipmentSlot.OFF_HAND, 'OFF')}
                    </div>

                    {/* Stats Summary */}
                    <div className="w-full mt-4 text-[10px] space-y-1 text-[#494d5e]">
                        <div className="flex justify-between"><span>ATK</span> <span className="text-white">100</span></div>
                        <div className="flex justify-between"><span>HP</span> <span className="text-white">500</span></div>
                    </div>
                </div>

                {/* 2. Stash Grid */}
                <div className="flex-1 flex flex-col border border-[#272933] bg-[#0e0d16]/80">
                    <div className="p-2 border-b border-[#272933] text-xs">STASH ({invState.stash.length})</div>
                    <div className="flex-1 grid grid-cols-5 content-start gap-2 p-2 overflow-y-auto custom-scrollbar">
                        {invState.stash.map(item => {
                            const def = getItemDef(item.defId);
                            if (!def) return null;
                            const canEquip = !def.classReq || def.classReq.includes(heroId);

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className={`
                                        aspect-square border-2 relative flex items-center justify-center cursor-pointer
                                        ${selectedItem?.id === item.id ? 'border-cyan-400 bg-[#272933]' : 'border-[#272933]'}
                                        ${!canEquip ? 'opacity-50 grayscale' : ''}
                                    `}
                                >
                                    <div className="text-2xl">{def.icon}</div>
                                    {/* Rarity Corner */}
                                    <div className="absolute top-0 right-0 w-2 h-2" style={{ background: def.rarity === 'COMMON' ? '#666' : def.rarity === 'UNCOMMON' ? '#0f0' : '#d0f' }}></div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Item Inspector */}
                    {selectedItem && (
                        <div className="h-40 border-t border-[#272933] p-4 flex gap-4 animate-slide-up">
                            {(() => {
                                const def = getItemDef(selectedItem.defId);
                                if (!def) return null;
                                const canEquip = !def.classReq || def.classReq.includes(heroId);

                                return (
                                    <>
                                        <div className="w-24 border border-[#272933] flex items-center justify-center text-4xl">
                                            {def.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-cyan-400 text-sm mb-1">{def.name}</div>
                                            <div className="text-[10px] text-[#494d5e] mb-2">{def.type} // {def.slot} // Tier {def.tier}</div>

                                            {/* Requirements Warning */}
                                            {def.classReq && !canEquip && (
                                                <div className="text-red-500 text-[10px] mb-2">⚠ REQUIRES: {def.classReq.join(', ')}</div>
                                            )}

                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={handleEquip}
                                                    disabled={!canEquip}
                                                    className={`px-4 py-2 text-xs text-black font-bold uppercase ${canEquip ? 'bg-cyan-400 hover:bg-white' : 'bg-gray-600 cursor-not-allowed'}`}
                                                >
                                                    Equip
                                                </button>

                                                {/* Social Gift Button */}
                                                {!canEquip && (
                                                    <button
                                                        onClick={handleGift}
                                                        className="px-4 py-2 bg-[#ff0055] text-white text-xs font-bold uppercase hover:bg-white hover:text-[#ff0055]"
                                                    >
                                                        GIFT to Friend
                                                    </button>
                                                )}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">
                    <div className="bg-[#272933] p-8 border border-cyan-400 max-w-lg text-center">
                        <h2 className="text-cyan-400 text-xl mb-4">TRANSFER READY</h2>
                        <p className="text-xs text-[#eddbda] mb-4">Item has been removed from stash and packed for transport.</p>

                        <div className="bg-black p-4 text-[10px] text-green-400 break-all border border-[#494d5e] mb-4">
                            {giftLink}
                        </div>

                        <button onClick={() => setGiftLink(null)} className="px-8 py-3 bg-cyan-400 text-black font-bold">
                            CONFIRM
                        </button>
                    </div>
                </div>
            )}

            {/* Deploy Button */}
            <div className="h-16 border-t border-[#272933] flex items-center justify-center bg-[#0e0d16]">
                <button onClick={() => metaGame.startGame()} className="text-cyan-400 tracking-[0.5em] hover:text-white transition-colors">
                    INITIATE WARP
                </button>
            </div>
        </div>
    );
};
