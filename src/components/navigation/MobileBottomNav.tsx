'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Users, FileText, Menu } from 'lucide-react';

interface MobileBottomNavProps {
    onOpenMenu: () => void;
}

export function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
    const pathname = usePathname();

    const navItems = [
        { label: 'Home', href: '/professor', icon: Home },
        { label: 'Turmas', href: '/professor/turmas', icon: BookOpen },
        { label: 'Alunos', href: '/professor/estudantes', icon: Users },
        { label: 'Aval.', href: '/professor/avaliacoes', icon: FileText },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 backdrop-blur-md border-t border-slate-200 pb-safe">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = item.href === '/professor'
                        ? pathname === '/professor'
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors touch-manipulation ${isActive ? 'text-city-blue' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
                <button
                    onClick={onOpenMenu}
                    className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 hover:text-slate-700 transition-colors touch-manipulation"
                >
                    <Menu size={20} strokeWidth={2} />
                    <span className="text-[10px] font-medium">Menu</span>
                </button>
            </div>
        </nav>
    );
}
