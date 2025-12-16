
import React, { useEffect, useState } from 'react';
import { EventBus } from '../services/EventBus';
import { SkillsHUD } from './SkillsHUD';
import { VirtualJoystick } from './VirtualJoystick';
import { GameStats } from '../types';



export const GameOverlay: React.FC = () => {
    const [stats, setStats] = useState<GameStats>({
        hp: 100, maxHp: 100, level: 1, xp: 0, xpToNextLevel: 10, score: 0, wave: 1, enemiesAlive: 0
    });

    const [waveAlert, setWaveAlert] = useState<{ show: boolean, text: string, subtext: string } | null>(null);

    useEffect(() => {
        const handleUpdate = (newStats: GameStats) => setStats(newStats);

        const handleWaveStart = (data: { wave: number, isElite: boolean }) => {
            setWaveAlert({
                show: true,
                text: data.isElite ? 'ELITE THREAT' : `CYCLE ${data.wave.toString().padStart(2, '0')}`,
                subtext: data.isElite ? 'SEEK // DESTROY' : 'ENTITIES DETECTED'
            });
            setTimeout(() => setWaveAlert(null), 3000);
        };

        const handleWaveComplete = () => {
            setWaveAlert({ show: true, text: 'ZONE CLEARED', subtext: 'SYSTEM STABILIZED' });
            setTimeout(() => setWaveAlert(null), 2500);
        };

        EventBus.on('STATS_UPDATE', handleUpdate);
        EventBus.on('WAVE_START', handleWaveStart);
        EventBus.on('WAVE_COMPLETE', handleWaveComplete);

        // Inject font
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        return () => {
            EventBus.off('STATS_UPDATE', handleUpdate);
            EventBus.off('WAVE_START', handleWaveStart);
            EventBus.off('WAVE_COMPLETE', handleWaveComplete);
        };
    }, []);

    // Health Logic: 1 Diamond = 20 HP
    const chunks = 5;
    const hpPerChunk = stats.maxHp / chunks;
    const currentChunks = Math.ceil(stats.hp / hpPerChunk);

    return (
        <div className="absolute inset-0 pointer-events-none z-40 p-8 font-['Press_Start_2P'] flex flex-col justify-between text-white selection:bg-pink-500 selection:text-black">

            {/* Top Bar: Minimalist with Diamonds */}
            <div className="flex justify-between items-start">

                {/* Top Left: Health & Ammo */}
                <div className="flex flex-col gap-4">
                    {/* Health Diamonds */}
                    <div className="flex gap-2">
                        {Array.from({ length: chunks }).map((_, i) => (
                            <img
                                key={i}
                                src={i < currentChunks ? "/assets/ui/diamond_full.png" : "/assets/ui/diamond_empty.png"}
                                className={`w-8 h-8 rendering-pixelated ${i < currentChunks ? 'drop-shadow-[0_0_8px_rgba(255,0,85,0.8)]' : 'opacity-40'}`}
                                alt=""
                            />
                        ))}
                    </div>

                    {/* Weapon / Ammo (Decor) */}
                    <div className="flex items-center gap-4 opacity-80 mt-2">
                        <div className="w-10 h-10 border-2 border-slate-700 bg-slate-900/80 flex items-center justify-center p-1">
                            <img src="/assets/icons/icon_pulse_rifle.png" className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all" />
                        </div>
                        <div className="flex gap-1 h-6 items-end">
                            {/* Infinite Ammo Visuals */}
                            {Array.from({ length: 6 }).map((_, i) => (
                                <img key={i} src="/assets/ui/ammo_pip.png" className="w-2 h-4" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center: Wave Counter (Hidden unless active?) - Let's keep it minimal */}
                {/* HLD doesn't have a wave counter usually, but we need one. Small top center. */}
                <div className="flex flex-col items-center opacity-60">
                    <div className="text-[10px] text-cyan-400 mb-1">Drifter Signal</div>
                    <div className="text-xl tracking-widest text-slate-300">
                        {stats.wave.toString().padStart(2, '0')}
                    </div>
                </div>

                {/* Top Right: Currency / Score */}
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                        <img src="assets/ui/diamond_full.png" className="w-4 h-4 hue-rotate-[60deg]" /> {/* Yellowish */}
                        <span className="text-yellow-400 text-sm">{stats.score}</span>
                    </div>
                    {/* XP Indicator (Tiny bar) */}
                    <div className="w-32 h-1 bg-slate-800 mt-1">
                        <div className="h-full bg-cyan-400" style={{ width: `${(stats.xp / stats.xpToNextLevel) * 100}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Alert Overlay */}
            <div className="absolute top-1/4 left-0 w-full flex justify-center pointer-events-none">
                {waveAlert && (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300 gap-4">
                        <div className="h-px w-64 bg-cyan-500/50"></div>
                        <h2 className="text-3xl text-cyan-400 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(84,252,252,0.8)]">
                            {waveAlert.text}
                        </h2>
                        <p className="text-[10px] text-pink-500 tracking-[0.4em] uppercase">
                            {waveAlert.subtext}
                        </p>
                        <div className="h-px w-64 bg-pink-500/50"></div>
                    </div>
                )}
            </div>

            {/* Bottom: Skills & Input Hint */}
            <div className="w-full flex justify-between items-end">
                {/* Skills aligned left-bottom? Or center? HLD has no skill bar. */}
                {/* We need one though. Let's make it look like artifacts. */}
                <SkillsHUD />

                {/* Connection Status */}
                <div className="flex items-center gap-2 opacity-30">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px]">SYNC</span>
                </div>
            </div>

            {/* Input Overlay */}
            <VirtualJoystick
                onMove={(x, y) => EventBus.emit('JOYSTICK_MOVE', { x, y })}
                onAim={(x, y, isFiring) => EventBus.emit('JOYSTICK_AIM', { x, y, isFiring })}
                onSkill={(skill) => EventBus.emit('JOYSTICK_SKILL', skill)}
            />
        </div>
    );
};
