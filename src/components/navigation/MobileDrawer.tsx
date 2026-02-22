'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    X,
    User,
    BookOpen,
    Calendar,
    Vote,
    Bot,
    Settings,
    LogOut,
    ChevronRight,
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';

interface DrawerLinkProps {
    href: string;
    icon: React.ElementType;
    label: string;
    active: boolean;
    highlighted?: boolean;
}

function DrawerLink({ href, icon: Icon, label, active, highlighted = false }: DrawerLinkProps) {
    return (
        <Link
            href={href}
            className={`flex items-center justify-between px-3 py-3 rounded-xl mb-1 transition-colors active:scale-[0.98] ${active
                    ? 'bg-city-blue/10 text-city-blue font-bold'
                    : highlighted
                        ? 'text-slate-700 hover:bg-slate-50'
                        : 'text-slate-600 hover:bg-slate-50'
                }`}
        >
            <div className="flex items-center space-x-3">
                <Icon
                    size={20}
                    className={
                        active ? 'text-city-blue' : highlighted ? 'text-coop-orange' : 'text-slate-400'
                    }
                />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <ChevronRight
                size={16}
                className={`opacity-40 ${active ? 'text-city-blue' : ''}`}
            />
        </Link>
    );
}

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user?: { name?: string; email?: string; avatarUrl?: string };
}

export function MobileDrawer({ isOpen, onClose, user }: MobileDrawerProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = getSupabaseClient();

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close drawer on route change
    useEffect(() => {
        onClose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer Panel */}
            <aside
                className={`fixed top-0 right-0 z-[70] h-[100dvh] w-4/5 max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <header className="flex items-start justify-between p-5 pt-safe bg-slate-50 border-b border-slate-100 shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-city-blue text-white flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User size={24} />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-bold text-slate-800 line-clamp-1">
                                {user?.name || 'Professor(a)'}
                            </span>
                            <span className="text-xs text-slate-500 line-clamp-1">{user?.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-400 hover:text-slate-700 rounded-full active:bg-slate-200 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </header>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-2 scrollbar-hide">
                    <div className="px-3 py-2">
                        <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Programa
                        </p>
                        <DrawerLink
                            href="/professor/diretrizes"
                            icon={BookOpen}
                            label="Diretrizes"
                            active={pathname === '/professor/diretrizes'}
                        />
                        <DrawerLink
                            href="/professor/eventos"
                            icon={Calendar}
                            label="Eventos"
                            active={pathname.startsWith('/professor/eventos')}
                        />
                        <DrawerLink
                            href="/professor/eleicoes"
                            icon={Vote}
                            label="Eleições"
                            active={pathname.startsWith('/professor/eleicoes')}
                        />
                    </div>
                    <div className="h-px bg-slate-100 my-2 mx-5" />
                    <div className="px-3 py-2">
                        <p className="px-3 text-[11px] font-bold text-coop-orange uppercase tracking-wider mb-1">
                            Inteligência Artificial
                        </p>
                        <DrawerLink
                            href="/professor/ia"
                            icon={Bot}
                            label="DOT Assistente"
                            active={pathname.startsWith('/professor/ia')}
                            highlighted
                        />
                    </div>
                    <div className="h-px bg-slate-100 my-2 mx-5" />
                    <div className="px-3 py-2">
                        <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Conta
                        </p>
                        <DrawerLink
                            href="/professor/perfil"
                            icon={User}
                            label="Meu Perfil"
                            active={pathname === '/professor/perfil'}
                        />
                        <DrawerLink
                            href="/professor/configuracoes"
                            icon={Settings}
                            label="Configurações"
                            active={pathname === '/professor/configuracoes'}
                        />
                    </div>
                </div>

                {/* Footer */}
                <footer className="p-4 pb-safe border-t border-slate-100 shrink-0">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 space-x-3 text-red-600 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-semibold text-sm">Sair da Conta</span>
                    </button>
                </footer>
            </aside>
        </>
    );
}
