'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/icons';

interface GestorMobileBottomNavProps {
    onOpenMenu: () => void;
}

export function GestorMobileBottomNav({ onOpenMenu }: GestorMobileBottomNavProps) {
    const pathname = usePathname();

    const navItems = [
        { label: 'Início', href: '/gestor', icon: Icons.menu },
        { label: 'Escolas', href: '/gestor/escolas', icon: Icons.bookOpen },
        { label: 'Profs', href: '/gestor/professores', icon: Icons.user },
        { label: 'Relat.', href: '/gestor/relatorios', icon: Icons.chart },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-slate-200/60 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between h-16 px-4">
                <div className="flex items-center justify-start flex-1 -ml-2">
                    {navItems.map((item) => {
                        const isActive = item.href === '/gestor'
                            ? pathname === '/gestor'
                            : pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex flex-col items-center justify-center min-w-[64px] h-full transition-all active:scale-95 touch-manipulation ${isActive ? 'text-city-blue' : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                style={{ minWidth: '44px', minHeight: '44px' }}
                            >
                                <Icon className={`h-5 w-5 ${isActive ? 'text-city-blue' : ''}`} />
                                <span className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-city-blue rounded-b-[2px]" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Unique Sandwich Menu Button — Elite Touch */}
                <button
                    onClick={onOpenMenu}
                    className="flex flex-col items-center justify-center w-14 h-14 bg-slate-900 group active:scale-90 transition-all shadow-lg overflow-hidden shrink-0"
                    style={{ borderRadius: '6px', minWidth: '44px', minHeight: '44px' }}
                    aria-label="Toggle menu"
                >
                    <div className="relative w-5 h-4 flex flex-col justify-between">
                        <span className="w-full h-[2.5px] bg-white transition-all group-hover:w-3/4" />
                        <span className="w-full h-[2.5px] bg-white transition-all" />
                        <span className="w-3/4 h-[2.5px] bg-white transition-all group-hover:w-full" />
                    </div>
                    <span className="text-[8px] text-white/70 font-black mt-1.5 uppercase tracking-widest">
                        MENU
                    </span>
                </button>
            </div>
        </nav>
    );
}
