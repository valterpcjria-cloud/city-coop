'use client';

import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RollingNumberProps {
    value: number;
    className?: string;
    prefix?: string;
    suffix?: string;
    duration?: number;
}

export function RollingNumber({
    value,
    className = "",
    prefix = "",
    suffix = "",
    duration = 2000
}: RollingNumberProps) {
    const [isMounted, setIsMounted] = useState(false);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, {
        damping: 30,
        stiffness: 100,
    });

    useEffect(() => {
        setIsMounted(true);
        motionValue.set(value);
    }, [value, motionValue]);

    const displayValue = useTransform(springValue, (latest) =>
        Math.floor(latest).toLocaleString('pt-BR')
    );

    if (!isMounted) return <span className={className}>{prefix}{value}{suffix}</span>;

    return (
        <span className={className}>
            {prefix}
            <motion.span>{displayValue}</motion.span>
            {suffix}
        </span>
    );
}
