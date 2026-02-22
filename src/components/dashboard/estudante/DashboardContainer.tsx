'use client';

import React from 'react';

/**
 * Ensures that children components (which may use client-side only APIs 
 * like framer-motion or local locale-sensitive formatting) only render 
 * on the client after hydration.
 */
export function DashboardContainer({ children }: { children: React.ReactNode }) {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return <>{children}</>;
}
