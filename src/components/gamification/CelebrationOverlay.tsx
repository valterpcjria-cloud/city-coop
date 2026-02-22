'use client';

import React, { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

interface CelebrationOverlayProps {
    trigger: boolean;
    onComplete?: () => void;
}

export function CelebrationOverlay({ trigger, onComplete }: CelebrationOverlayProps) {
    const fireCelebration = useCallback(() => {
        // Haptic feedback (short vibration)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([50, 30, 50]);
        }

        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
                onComplete?.();
                return;
            }

            const particleCount = 50 * (timeLeft / duration);

            // City Blue: #4A90D9, Coop Orange: #F5A623
            const colors = ['#4A90D9', '#F5A623', '#3B82F6', '#FB923C'];

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors
            });
        }, 250);

        return () => clearInterval(interval);
    }, [onComplete]);

    useEffect(() => {
        if (trigger) {
            fireCelebration();
        }
    }, [trigger, fireCelebration]);

    return null; // Side-effect component
}
