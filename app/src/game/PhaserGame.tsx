import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { WorkbenchScene } from './scenes/WorkbenchScene';
import { MainScene } from './scenes/MainScene';
import { ArtLabScene } from '../art-lab/ArtLabScene';
import { COLORS } from '../constants';

export const PhaserGame: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'phaser-container',
      backgroundColor: 0x000000,
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
        maxLights: 20
      },
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
        },
      },
      scene: [BootScene, WorkbenchScene, MainScene, ArtLabScene],
      input: {
        activePointers: 3,
      }
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;
    (window as any).phaserGame = game;

    // [FIX] Audio Context Unlocker
    const unlockAudio = () => {
      if (!game.sound) return;

      const soundManager = game.sound as Phaser.Sound.WebAudioSoundManager;
      if (soundManager.context) {
        if (soundManager.context.state === 'suspended') {
          soundManager.context.resume().then(() => {
            console.log("🔊 [System] Audio Context Resumed via User Gesture!");
          }).catch(err => {
            console.error("❌ [System] Audio Resume Failed:", err);
          });
        }
      }

      ['pointerdown', 'keydown', 'touchstart'].forEach(evt => {
        document.removeEventListener(evt, unlockAudio);
      });
    };

    ['pointerdown', 'keydown', 'touchstart'].forEach(evt => {
      document.addEventListener(evt, unlockAudio);
    });

    return () => {
      document.removeEventListener('pointerdown', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div id="phaser-container" className="w-full h-full" />;
};