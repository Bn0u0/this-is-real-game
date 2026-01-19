import React, { useState } from 'react';
import { EventBus } from '../services/EventBus';
import { ArtLabState, DEFAULT_LAB_CONFIG } from './ArtLabConfig';

export const ArtLabOverlay: React.FC = () => {
    const [config, setConfig] = useState<ArtLabState>(DEFAULT_LAB_CONFIG);

    const handleUpdate = (key: keyof ArtLabState, value: number | string | boolean) => {
        console.log(`UI Update: ${key} = ${value}`);
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
                    <h2 className="text-xl text-[#39ff14] font-bold">🧪 美術實驗室 (Art Lab)</h2>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {/* 1. CHARACTER PARAMS */}
                    {config.activeMode === 'CHARACTER' && (
                        <>
                            <div className="space-y-2">
                                <h3 className="text-[#39ff14] font-bold">手繪抖動 (Wobble)</h3>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs w-12">速度</span>
                                    <input
                                        type="range" min="0" max="5" step="0.1"
                                        value={config.wobbleSpeed}
                                        onChange={(e) => handleUpdate('wobbleSpeed', parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-xs w-8">{config.wobbleSpeed}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-[#39ff14] font-bold text-xs uppercase opacity-70">角色縮放</h4>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs w-4">X</span>
                                    <input
                                        type="range" min="0.5" max="3" step="0.1"
                                        value={config.charScaleX}
                                        onChange={(e) => handleUpdate('charScaleX', parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-xs w-8">{config.charScaleX}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs w-4">Y</span>
                                    <input
                                        type="range" min="0.5" max="3" step="0.1"
                                        value={config.charScaleY}
                                        onChange={(e) => handleUpdate('charScaleY', parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-xs w-8">{config.charScaleY}</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* 2. WEAPON PARAMS */}
                    {config.activeMode === 'WEAPON' && (
                        <>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-[#39ff14] font-bold">武器選擇</h3>
                                    <select
                                        className="w-full bg-gray-800 border border-gray-600 px-2 py-1 text-xs"
                                        value={config.selectedWeaponId}
                                        onChange={(e) => handleUpdate('selectedWeaponId', e.target.value)}
                                    >
                                        <optgroup label="T0: 初始">
                                            <option value="w_fist_t0">拳頭</option>
                                            <option value="weapon_crowbar_t0">生鏽撬棍</option>
                                            <option value="weapon_pistol_t0">老夥計 (Pistol)</option>
                                            <option value="weapon_drone_t0">無人機 Beta</option>
                                        </optgroup>
                                        <optgroup label="T1: 廢棄">
                                            <option value="w_nailgun_t1">改造釘槍</option>
                                            <option value="w_pipe_wrench_t1">重型管鉗</option>
                                            <option value="w_scrap_shotgun_t1">土製噴子</option>
                                        </optgroup>
                                        <optgroup label="T2: 工業">
                                            <option value="w_assault_rifle_t2">制式步槍</option>
                                            <option value="w_sledgehammer_t2">動力大錘</option>
                                            <option value="w_sawblade_t2">圓鋸發射器</option>
                                        </optgroup>
                                        <optgroup label="T3: 戰術">
                                            <option value="w_sniper_t3">維和者 (Sniper)</option>
                                            <option value="w_katana_t3">熱能太刀</option>
                                            <option value="w_vector_t3">死亡風暴 (SMG)</option>
                                        </optgroup>
                                        <optgroup label="T4: 傳說">
                                            <option value="w_railgun_t4">磁軌砲</option>
                                            <option value="w_funnels_t4">浮游砲陣列</option>
                                        </optgroup>
                                        <optgroup label="T5: 亂碼 (Glitch)">
                                            <option value="w_reality_slicer_t5">現實切割者</option>
                                            <option value="w_glitch_storm_t5">溢位風暴</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => handleUpdate('simulatingAttack', !config.simulatingAttack)}
                                        className={`flex-1 px-3 py-1 border transition-colors ${config.simulatingAttack ? 'bg-red-600 text-white border-transparent' : 'border-red-600 text-red-600'}`}
                                    >
                                        {config.simulatingAttack ? '⏹ 停止攻擊' : '⚔️ 模擬攻擊'}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-[#39ff14] font-bold">武器微調</h3>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs w-12">縮放</span>
                                    <input
                                        type="range" min="0.5" max="4" step="0.1"
                                        value={config.weaponScale}
                                        onChange={(e) => handleUpdate('weaponScale', parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-xs w-8">{config.weaponScale}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs w-12">旋轉</span>
                                    <input
                                        type="range" min="-180" max="180" step="1"
                                        value={config.weaponRotation}
                                        onChange={(e) => handleUpdate('weaponRotation', parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-xs w-8">{config.weaponRotation}°</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* 3. CAMERA (Always Visible) */}
                    <div className="space-y-2 border-l border-white/10 pl-4">
                        <h3 className="text-[#39ff14] font-bold">視角縮放 (Zoom)</h3>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs w-12">倍率</span>
                            <input
                                type="range" min="0.1" max="3" step="0.1"
                                value={config.cameraZoom}
                                onChange={(e) => handleUpdate('cameraZoom', parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-xs w-8">{config.cameraZoom}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-between border-t border-white/10 pt-4">
                    <div className="space-x-2">
                        {/* Categories */}
                        <button
                            onClick={() => handleUpdate('activeMode', 'CHARACTER')}
                            className={`px-4 py-1 border transition-all ${config.activeMode === 'CHARACTER' ? 'bg-[#39ff14] text-black border-transparent font-bold' : 'border-gray-500 text-gray-500 hover:text-white'}`}
                        >
                            馬鈴薯 (Actor)
                        </button>
                        <button
                            onClick={() => handleUpdate('activeMode', 'WEAPON')}
                            className={`px-4 py-1 border transition-all ${config.activeMode === 'WEAPON' ? 'bg-[#39ff14] text-black border-transparent font-bold' : 'border-gray-500 text-gray-500 hover:text-white'}`}
                        >
                            武裝 (Gear)
                        </button>
                    </div>

                    <div className="space-x-2 flex items-center">
                        {config.activeMode === 'CHARACTER' && (
                            <button
                                onClick={() => handleUpdate('simulatingMove', !config.simulatingMove)}
                                className={`px-3 py-1 border transition-colors ${config.simulatingMove ? 'bg-[#39ff14] text-black border-transparent' : 'border-[#39ff14] text-[#39ff14] opacity-50'}`}
                            >
                                {config.simulatingMove ? '⏹ 停止模擬' : '🏃 模擬移動'}
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            className="px-4 py-1 bg-[#39ff14]/20 border border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/40 font-bold"
                        >
                            💾 保存設定
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
