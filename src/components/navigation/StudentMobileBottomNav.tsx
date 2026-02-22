'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Users, CheckSquare, MessageSquare, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

const navItems: NavItem[] = [
    { label: 'Home', href: '/estudante', icon: Home },
    { label: 'Núcleo', href: '/estudante/nucleo', icon: Users },
    { label: 'Atividades', href: '/estudante/atividades', icon: CheckSquare },
    { label: 'Chat', href: '/estudante/chat', icon: MessageSquare },
];

interface StudentMobileBottomNavProps {
    onOpenMenu: () => void;
}

export function StudentMobileBottomNav({ onOpenMenu }: StudentMobileBottomNavProps) {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden">
            {/* Glassmorphic Background with Liquid Precision border top */}
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-t border-slate-200/50 pb-safe shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.05)]" />

            <div className="relative flex items-center justify-between h-16 px-4 pb-safe max-w-lg mx-auto">
                {navItems.map((item) => {
                    const isActive = item.href === '/estudante'
                        ? pathname === '/estudante'
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group"
                        >
                            <div className={cn(
                                "relative z-10 flex flex-col items-center transition-all duration-300",
                                isActive ? "text-city-blue -translate-y-1" : "text-slate-500"
                            )}>
                                <item.icon
                                    size={20}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={cn("mb-1 transition-transform", isActive ? "scale-110" : "group-active:scale-95")}
                                />
                                <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                            </div>

                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute top-0 w-10 h-0.5 bg-city-blue rounded-full"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}

                {/* Menu Button - Triggers Drawer */}
                <button
                    onClick={onOpenMenu}
                    className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group text-slate-500 active:scale-95 transition-transform"
                >
                    <div className="flex flex-col items-center">
                        <Menu size={20} className="mb-1" />
                        <span className="text-[10px] font-bold tracking-tight">Menu</span>
                    </div>
                </button>
            </div>
        </nav>
    );
}
