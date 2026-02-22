'use client';

import { useState } from 'react';
import { StudentMobileBottomNav } from './StudentMobileBottomNav';
import { StudentMobileDrawer } from './StudentMobileDrawer';

interface StudentMobileNavManagerProps {
    user?: { name: string; email: string; image?: string; nucleus?: string | null };
}

export function StudentMobileNavManager({ user }: StudentMobileNavManagerProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <>
            {/* Bottom Navigation Bar */}
            <StudentMobileBottomNav onOpenMenu={() => setIsDrawerOpen(true)} />

            {/* Slide-out Drawer Menu */}
            <StudentMobileDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                user={user}
            />
        </>
    );
}
