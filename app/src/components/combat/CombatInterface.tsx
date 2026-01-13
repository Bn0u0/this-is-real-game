import React from 'react';
import { HUD } from './HUD';
import { UnifiedJoystick } from './UnifiedJoystick';
import { EventBus } from '../../services/EventBus';

/**
 * COMBAT INTERFACE
 * The master container for the combat stage.
 * 
 * LAYERING:
 * 1. UnifiedJoystick (Bottom, captures empty space clicks)
 * 2. HUD (Top, pointer-events-none, buttons are auto)
 */

export const CombatInterface: React.FC = () => {

    const handleMove = (x: number, y: number) => {
        // Broadcast movement to Phaser MainScene
        EventBus.emit('JOYSTICK_MOVE', { x, y });
    };

    const handleSkill = (skill: 'DASH') => {
        EventBus.emit('TRIGGER_SKILL', skill);
    };

    return (
        <div id="combat-interface" className="absolute inset-0 overflow-hidden">
            {/* LAYER 1: INPUT */}
            <UnifiedJoystick onMove={handleMove} onSkill={handleSkill} />

            {/* LAYER 2: HUD */}
            <HUD />
        </div>
    );
};
