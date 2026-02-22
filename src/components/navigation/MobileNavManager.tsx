'use client';

import { useState } from 'react';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileDrawer } from './MobileDrawer';

interface MobileNavManagerProps {
    user?: { name?: string; email?: string; avatarUrl?: string };
}

export function MobileNavManager({ user }: MobileNavManagerProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <>
            <MobileBottomNav onOpenMenu={() => setIsDrawerOpen(true)} />
            <MobileDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                user={user}
            />
        </>
    );
}
