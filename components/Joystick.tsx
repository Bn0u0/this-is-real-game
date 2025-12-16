
import React, { useRef, useState } from 'react';
import { JoystickData } from '../types';

interface JoystickProps {
  onMove: (data: JoystickData) => void;
  color?: string;
  side?: 'left' | 'right';
}

export const Joystick: React.FC<JoystickProps> = ({ onMove, color = '#00F0FF', side = 'left' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  const RADIUS = 60; 

  const handleStart = (clientX: number, clientY: number) => {
    setActive(true);
    setOrigin({ x: clientX, y: clientY });
    setPosition({ x: 0, y: 0 });
    onMove({ x: 0, y: 0, angle: 0, force: 0 });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!active) return;
    const dx = clientX - origin.x;
    const dy = clientY - origin.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const force = Math.min(distance, RADIUS);
    const x = Math.cos(angle) * force;
    const y = Math.sin(angle) * force;
    setPosition({ x, y });
    onMove({ x: x / RADIUS, y: y / RADIUS, angle: angle, force: distance / RADIUS });
  };

  const handleEnd = () => {
    setActive(false);
    setPosition({ x: 0, y: 0 });
    onMove({ x: 0, y: 0, angle: 0, force: 0 });
  };

  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX, e.clientY);

  return (
    <div
      ref={containerRef}
      className={`absolute bottom-8 ${side === 'left' ? 'left-8' : 'right-8'} w-40 h-40 flex items-center justify-center touch-none select-none z-50 pointer-events-auto`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={handleEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
        {/* Holographic Hexagon Base */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-30'}`}>
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible spin-slow">
                <path d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
                <circle cx="50" cy="50" r="2" fill={color} />
                <line x1="50" y1="10" x2="50" y2="20" stroke={color} />
                <line x1="50" y1="80" x2="50" y2="90" stroke={color} />
                <line x1="10" y1="50" x2="20" y2="50" stroke={color} />
                <line x1="80" y1="50" x2="90" y2="50" stroke={color} />
            </svg>
        </div>

        {/* Thumb Stick */}
        <div 
            className="absolute top-1/2 left-1/2 w-12 h-12 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform duration-75"
            style={{ 
                transform: `translate(${position.x - 50}%, ${position.y - 50}%)`
            }}
        >
            <div className={`w-12 h-12 border-2 border-white rounded-full ${active ? 'bg-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.6)]' : 'bg-transparent'}`}></div>
            <div className="absolute w-1 h-1 bg-white rounded-full"></div>
        </div>
    </div>
  );
};
