import React, { useRef, useState, useEffect } from 'react';

/**
 * VIRTUAL JOYSTICK (Native Events Version)
 * 
 * Uses native DOM events via addEventListener to bypass React's Synthetic Event system
 * and potential pointer-events issues at the root level.
 */

interface VirtualJoystickProps {
    onMove: (x: number, y: number) => void;
    onSkill?: (skill: 'DASH') => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, onSkill }) => {
    // VISUAL STATE
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });     // The Stick (Red Dot)
    const [origin, setOrigin] = useState({ x: 0, y: 0 });         // The Base (Circle)

    // LOGIC STATE (Refs for speed)
    const originRef = useRef({ x: 0, y: 0 });
    const dragStartRef = useRef(0);
    const maxDistRef = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // CONFIG
    const RADIUS = 75; // Max pull radius

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        console.log("🎮 VirtualJoystick (Native) MOUNTED!");

        const onPointerDown = (e: PointerEvent) => {
            console.log("🚨 NATIVE POINTER DOWN!", e.clientX, e.clientY);
            // Crucial: Stop default behavior
            e.preventDefault();
            e.stopPropagation();

            container.setPointerCapture(e.pointerId);

            const rect = container.getBoundingClientRect();
            const localX = e.clientX - rect.left;
            const localY = e.clientY - rect.top;

            originRef.current = { x: localX, y: localY };
            setOrigin({ x: localX, y: localY });
            setPosition({ x: localX, y: localY });

            setIsVisible(true);
            dragStartRef.current = Date.now();
            maxDistRef.current = 0;
            onMove(0, 0);
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!container.hasPointerCapture(e.pointerId)) return;
            e.preventDefault();
            e.stopPropagation();

            const rect = container.getBoundingClientRect();
            const localX = e.clientX - rect.left;
            const localY = e.clientY - rect.top;

            let dx = localX - originRef.current.x;
            let dy = localY - originRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > maxDistRef.current) maxDistRef.current = dist;

            if (dist > RADIUS) {
                const ratio = RADIUS / dist;
                dx *= ratio;
                dy *= ratio;
            }

            setPosition({
                x: originRef.current.x + dx,
                y: originRef.current.y + dy
            });

            onMove(dx / RADIUS, dy / RADIUS);
        };

        const onPointerUp = (e: PointerEvent) => {
            if (!container.hasPointerCapture(e.pointerId)) return;
            e.preventDefault();
            container.releasePointerCapture(e.pointerId);

            setIsVisible(false);
            onMove(0, 0);

            // FLICK
            const duration = Date.now() - dragStartRef.current;
            if (onSkill && duration < 200 && maxDistRef.current > 40) {
                console.log("⚡ [Joystick] Flick Detected!");
                onSkill('DASH');
            }
        };

        // Attach Native Listeners
        // checking for 'true' as third arg (capture phase) might be even stronger, but bubbling is usually fine if we are top z-index.
        container.addEventListener('pointerdown', onPointerDown);
        container.addEventListener('pointermove', onPointerMove);
        container.addEventListener('pointerup', onPointerUp);
        container.addEventListener('pointercancel', onPointerUp);

        return () => {
            container.removeEventListener('pointerdown', onPointerDown);
            container.removeEventListener('pointermove', onPointerMove);
            container.removeEventListener('pointerup', onPointerUp);
            container.removeEventListener('pointercancel', onPointerUp);
        };
    }, [onMove, onSkill]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-[100] touch-none cursor-crosshair select-none"
            style={{ touchAction: 'none' }}
        >
            {/* RENDER JOYSTICK ONLY WHEN ACTIVE */}
            {isVisible && (
                <div
                    className="absolute pointer-events-none"
                    style={{
                        left: origin.x,
                        top: origin.y
                    }}
                >
                    {/* BASE CIRCLE (Centered on Origin) */}
                    <div
                        className="absolute rounded-full border-2 border-white/20 bg-black/20 backdrop-blur-sm"
                        style={{
                            width: RADIUS * 2,
                            height: RADIUS * 2,
                            transform: 'translate(-50%, -50%)'
                        }}
                    />

                    {/* STICK (Relative to Origin) */}
                    <div
                        className="absolute rounded-full bg-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                        style={{
                            width: 50,
                            height: 50,
                            transform: `translate(calc(-50% + ${position.x - origin.x}px), calc(-50% + ${position.y - origin.y}px))`
                        }}
                    />
                </div>
            )}

            {/* HINT TEXT */}
            {!isVisible && (
                <div className="absolute bottom-20 w-full text-center pointer-events-none opacity-30 text-white font-mono text-xs animate-pulse">
                    CLICK & DRAG TO MOVE (NATIVE)
                </div>
            )}
        </div>
    );
};
