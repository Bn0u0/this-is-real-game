import React, { useEffect, useState } from 'react';
import { sessionService } from '../services/SessionService';

export const SceneMonitor: React.FC = () => {
    const [info, setInfo] = useState<string[]>([]);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const game = (window as any).phaserGame as Phaser.Game;
            if (!game) return;

            const scenes = game.scene.scenes.map(s =>
                `${s.scene.key}: ${s.sys.settings.active ? 'ACTIVE' : 'INACTIVE'} (vis: ${s.sys.settings.visible})`
            );

            const appState = sessionService.getState().appState;
            setInfo([
                `AppState: ${appState}`,
                ...scenes
            ]);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    // Toggle with F9
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'F9') setVisible(v => !v);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed top-0 right-0 bg-black/80 text-green-500 font-mono text-xs p-4 pointer-events-none z-[9999]">
            <h3 className="font-bold border-b border-green-500 mb-2">SCENE MONITOR (F9)</h3>
            {info.map((line, i) => (
                <div key={i}>{line}</div>
            ))}
        </div>
    );
};
