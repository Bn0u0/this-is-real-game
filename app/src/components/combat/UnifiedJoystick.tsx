import React, { useRef, useState, useEffect } from 'react';

/**
 * UNIFIED JOYSTICK
 * Bottom-layer input surface for the Combat Interface.
 * Uses native pointer events to ensure reliable input tracking.
 */

interface UnifiedJoystickProps {
    onMove: (x: number, y: number) => void;
    onSkill?: (skill: 'DASH') => void;
}

export const UnifiedJoystick: React.FC<UnifiedJoystickProps> = ({ onMove, onSkill }) => {
    // VISUAL STATE
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 }); // Local coordinates relative to Origin
    const [origin, setOrigin] = useState({ x: 0, y: 0 });     // Local coordinates relative to Container

    // LOGIC STATE
    const paramsRef = useRef({
        origin: { x: 0, y: 0 },
        dragStart: 0,
        maxDist: 0,
        isActive: false
    });
    const containerRef = useRef<HTMLDivElement>(null);

    // CONSTANTS
    const RADIUS = 75;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        console.log("🎮 [UnifiedJoystick] Native Listeners Attaching...");

        // --- NATIVE HANDLERS ---

        const onPointerDown = (e: PointerEvent) => {
            // Only capture if it's the primary button (usually left click or touch)
            if (!e.isPrimary) return;

            // [CRITICAL] Prevent default to stop scrolling/selection
            e.preventDefault();
            // Stop propagation so we don't trigger anything below (though we are at bottom)
            // But more importantly, checking if we clicked ON a button happens via Z-Index.
            // Since this component is behind the HUD, HUD buttons catch the event first.

            // Capture Pointer
            container.setPointerCapture(e.pointerId);

            // Calculate Local Coordinates
            const rect = container.getBoundingClientRect();
            const localX = e.clientX - rect.left;
            const localY = e.clientY - rect.top;

            // Update Logic State
            paramsRef.current = {
                origin: { x: localX, y: localY },
                dragStart: Date.now(),
                maxDist: 0,
                isActive: true
            };

            // Update Visual State
            setOrigin({ x: localX, y: localY });
            setPosition({ x: 0, y: 0 }); // Center stick on origin initially
            setIsVisible(true);

            // Reset Output
            onMove(0, 0);

            console.log("Joystick START", localX, localY);
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!paramsRef.current.isActive) return;
            if (!container.hasPointerCapture(e.pointerId)) return;

            e.preventDefault();

            const rect = container.getBoundingClientRect();
            const localX = e.clientX - rect.left;
            const localY = e.clientY - rect.top;

            // Delta from Origin
            let dx = localX - paramsRef.current.origin.x;
            let dy = localY - paramsRef.current.origin.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Track Max (Flick)
            if (dist > paramsRef.current.maxDist) paramsRef.current.maxDist = dist;

            // Clamp Visuals
            let visualDx = dx;
            let visualDy = dy;
            if (dist > RADIUS) {
                const ratio = RADIUS / dist;
                visualDx *= ratio;
                visualDy *= ratio;
            }

            // Update Stick Position (Relative to Origin for CSS transform)
            setPosition({ x: visualDx, y: visualDy });

            // Output Normalized Vector
            // We allow output > 1.0 if user drags far (optional, but good for "running fast" intent)
            // Or typically clamp it:
            const normX = dx / RADIUS;
            const normY = dy / RADIUS;
            const normDist = Math.sqrt(normX * normX + normY * normY);

            // If we want to clamp output to length 1.0:
            if (normDist > 1) {
                onMove(normX / normDist, normY / normDist);
            } else {
                onMove(normX, normY);
            }
        };

        const onPointerUp = (e: PointerEvent) => {
            if (!paramsRef.current.isActive) return;
            if (!container.hasPointerCapture(e.pointerId)) return;

            e.preventDefault();
            container.releasePointerCapture(e.pointerId);

            setIsVisible(false);
            paramsRef.current.isActive = false;
            onMove(0, 0);

            // Flick Check
            const duration = Date.now() - paramsRef.current.dragStart;
            if (onSkill && duration < 200 && paramsRef.current.maxDist > 40) {
                console.log("⚡ [Joystick] FLICK!");
                onSkill('DASH');
            }
        };

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
            id="joystick-surface"
            className="absolute inset-0 touch-none select-none cursor-crosshair z-0"
        // z-0 ensures it is the baseline. HUD will be higher.
        >
            {isVisible && (
                <div
                    className="absolute pointer-events-none will-change-transform"
                    style={{
                        left: origin.x,
                        top: origin.y,
                        // Using translate3d for GPU acceleration
                        transform: 'translate3d(-50%, -50%, 0)'
                    }}
                >
                    {/* Base */}
                    <div
                        className="rounded-full border-2 border-white/20 bg-black/20 backdrop-blur-sm"
                        style={{ width: RADIUS * 2, height: RADIUS * 2 }}
                    />

                    {/* Stick */}
                    <div
                        className="absolute top-1/2 left-1/2 rounded-full bg-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                        style={{
                            width: 50,
                            height: 50,
                            marginTop: -25,
                            marginLeft: -25,
                            transform: `translate3d(${position.x}px, ${position.y}px, 0)`
                        }}
                    />
                </div>
            )}
        </div>
    );
};
