
import React, { useEffect, useState } from 'react';
import { EventBus } from '../services/EventBus';
import { SkillsHUD } from './SkillsHUD';
import { GameStats } from '../types';

export const GameOverlay: React.FC = () => {
    const [stats, setStats] = useState<GameStats>({
        hp: 100, maxHp: 100, level: 1, xp: 0, xpToNextLevel: 10, score: 0, wave: 1, enemiesAlive: 0, survivalTime: 0
    });

    const [waveAlert, setWaveAlert] = useState<{ show: boolean, text: string, subtext: string } | null>(null);

    const [directorState, setDirectorState] = useState<'BUILDUP' | 'PEAK' | 'RELAX'>('BUILDUP');

    useEffect(() => {
        const handleUpdate = (newStats: GameStats) => setStats(newStats);

        const handleDirectorChange = (data: { state: 'BUILDUP' | 'PEAK' | 'RELAX', msg: string }) => {
            setDirectorState(data.state);
        };

        const handleWaveStart = (data: { wave: number, isElite: boolean }) => {
            setWaveAlert({
                show: true,
                text: data.isElite ? '⚠️ ANOMALY ⚠️' : `CYCLE ${data.wave.toString().padStart(2, '0')} `,
                subtext: data.isElite ? 'HIGH THREAT DETECTED' : 'HOSTILES INBOUND'
            });
            setTimeout(() => setWaveAlert(null), 3000);
        };

        const handleWaveComplete = () => {
            setWaveAlert({ show: true, text: 'AREA SECURED', subtext: 'SYSTEM STABLE' });
            setTimeout(() => setWaveAlert(null), 2500);
        };

        EventBus.on('STATS_UPDATE', handleUpdate);
        EventBus.on('DIRECTOR_STATE_CHANGE', handleDirectorChange);
        EventBus.on('WAVE_START', handleWaveStart);
        EventBus.on('WAVE_COMPLETE', handleWaveComplete);

        // Inject font if not exists
        if (!document.getElementById('font-press-start')) {
            const link = document.createElement('link');
            link.id = 'font-press-start';
            link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }

        return () => {
            EventBus.off('STATS_UPDATE', handleUpdate);
            EventBus.off('DIRECTOR_STATE_CHANGE', handleDirectorChange);
            EventBus.off('WAVE_START', handleWaveStart);
            EventBus.off('WAVE_COMPLETE', handleWaveComplete);
        };
    }, []);

    // HP Bar Logic (Top Center Big Bar)
    const hpPercent = (stats.hp / stats.maxHp) * 100;

    return (
        <div className="absolute inset-0 pointer-events-none z-40 font-['Press_Start_2P'] text-white select-none overflow-hidden text-shadow-sm">

            {/* THREAT VIGNETTE (PEAK ONLY) */}
            <div className={`absolute inset - 0 border - [20px] pointer - events - none transition - colors duration - 1000 ${directorState === 'PEAK' ? 'border-red-600/50 shadow-[inset_0_0_100px_rgba(255,0,0,0.5)]' : 'border-transparent'
                } `} />

            {/* --- TOP CENTER: HP BAR --- */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[80%] max-w-md flex flex-col gap-1 items-center">
                <div className="w-full h-4 bg-gray-800 border-2 border-white/20 skew-x-[-15deg] relative overflow-hidden">
                    <div
                        className="h-full bg-[#ff0055] transition-all duration-300 shadow-[0_0_10px_#ff0055]"
                        style={{ width: `${hpPercent}% ` }}
                    />
                </div>
                <div className="text-[10px] tracking-widest text-[#ff0055] font-bold">SHIELD INTEGRITY</div>
            </div>

            {/* --- TOP LEFT: Threat / Level --- */}
            <div className="absolute top-16 left-4 flex flex-col gap-2">
                <div className={`text - [10px] tracking - widest ${directorState === 'PEAK' ? 'text-red-500 animate-pulse' : 'text-cyan-400'} `}>
                    THREAT: {directorState}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-xs">LV.{stats.level}</span>
                    <div className="w-16 h-1 bg-gray-700">
                        <div className="h-full bg-yellow-400" style={{ width: `${(stats.xp / stats.xpToNextLevel) * 100}% ` }} />
                    </div>
                </div>
            </div>

            {/* --- TOP RIGHT: Timer / Score --- */}
            <div className="absolute top-16 right-4 flex flex-col items-end gap-1">
                <div className="text-2xl text-[#eddbda] drop-shadow-[0_0_8px_rgba(84,252,252,0.8)] tabular-nums">
                    {(() => {
                        const sec = Math.floor(stats.survivalTime || 0);
                        const min = Math.floor(sec / 60);
                        const s = sec % 60;
                        return `${min.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} `;
                    })()}
                </div>
                <div className="text-[8px] text-gray-400">SCORE: {stats.score}</div>
            </div>

            {/* --- CENTER: ALERTS --- */}
            <div className="absolute top-[25%] left-0 w-full flex justify-center pointer-events-none">
                {waveAlert && (
                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300 gap-4 bg-black/60 backdrop-blur-sm p-6 border-y border-cyan-500/50 w-full">
                        <h2 className="text-xl text-cyan-400 tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(84,252,252,1)] text-center">
                            {waveAlert.text}
                        </h2>
                        <div className="text-xs text-[#eddbda] tracking-widest typewriter text-center">
                            {waveAlert.subtext}
                        </div>
                    </div>
                )}
            </div>

            {/* --- THUMB ZONE (Bottom 40%) --- */}
            {/* Kept clear for gestures */}

            {/* --- BOTTOM RIGHT: SKILLS (Moved Up for Thumb Reach) --- */}
            <div className="absolute bottom-16 right-6 pointer-events-auto transform scale-125 origin-bottom-right">
                <SkillsHUD />
            </div>
        </div>
    );
};

