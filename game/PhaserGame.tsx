import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { WorkbenchScene } from './scenes/WorkbenchScene';
import { MainScene } from './scenes/MainScene';
import { COLORS } from '../constants';

export const PhaserGame: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // We target the internal div ref
    // const container = document.getElementById('game-container'); // REMOVED

    // Ensure we don't pass 0 dimensions to config
    // const initialWidth = Math.max(window.innerWidth, 320); // Not needed with Resize?
    // const initialHeight = Math.max(window.innerHeight, 240);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'phaser-container', // [FIX] Target the internal React div
      backgroundColor: 0x000000,
      width: '100%',
      height: '100%',
      scale: {
        mode: Phaser.Scale.RESIZE, // Will fill the 'phaser-container' div
        autoCenter: Phaser.Scale.NO_CENTER, // CSS handles centering
      },
      render: {
        powerPreference: 'high-performance',
        antialias: false,
        pixelArt: true,
        roundPixels: true,
        maxLights: 20
      },
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
        },
      },
      scene: [BootScene, WorkbenchScene, MainScene],
      input: {
        activePointers: 3,
      }
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;
    (window as any).phaserGame = game;

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // [FIX] Render a container for Phaser to attach to
  return <div id="phaser-container" className="w-full h-full" />;
};