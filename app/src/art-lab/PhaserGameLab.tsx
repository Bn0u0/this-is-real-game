import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { ArtLabScene } from './ArtLabScene';

export const PhaserGameLab: React.FC = () => {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            parent: 'phaser-lab-container',
            backgroundColor: 'transparent', // Let React handle BG
            width: '100%',
            height: '100%',
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.NO_CENTER,
            },
            render: {
                powerPreference: 'high-performance',
                antialias: false,
                pixelArt: true,
                roundPixels: true,
            },
            // Only load ArtLabScene
            scene: [ArtLabScene],
            input: {
                activePointers: 3,
            }
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return <div id="phaser-lab-container" className="w-full h-full" />;
};
