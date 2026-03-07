'use client';

import { useState } from 'react';
import { GestorMobileBottomNav } from './GestorMobileBottomNav';
import { GestorMobileDrawer } from './GestorMobileDrawer';

interface GestorMobileNavManagerProps {
    user?: { name?: string; email?: string; avatarUrl?: string };
}

export function GestorMobileNavManager({ user }: GestorMobileNavManagerProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <>
            <GestorMobileBottomNav onOpenMenu={() => setIsDrawerOpen(true)} />
            <GestorMobileDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                user={user}
            />
        </>
    );
}
