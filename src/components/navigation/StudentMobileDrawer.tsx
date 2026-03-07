'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    X,
    Trophy,
    Vote,
    Calendar,
    User,
    Settings,
    LogOut,
    ChevronRight,
    UserCircle
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';

interface StudentMobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user?: { name: string; email: string; image?: string; nucleus?: string | null };
}

export function StudentMobileDrawer({ isOpen, onClose, user }: StudentMobileDrawerProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = getSupabaseClient();

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Close when navigating
    useEffect(() => {
        onClose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <>
            {/* Backdrop — Premium Blur */}
            <div
                className={`fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-md transition-opacity duration-500 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Side Drawer — Unique Entry */}
            <aside
                className={`fixed top-0 right-0 z-[70] h-[100dvh] w-[85%] max-w-[320px] bg-white transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col md:hidden border-l border-slate-100 ${isOpen ? 'translate-x-0 shadow-[-20px_0_40px_rgba(0,0,0,0.05)]' : 'translate-x-[110%]'
                    }`}
            >
                {/* Header — Light & Clean */}
                <header className="flex flex-col p-6 pt-12 bg-white shrink-0">
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 rounded-md bg-slate-100 text-slate-800 flex items-center justify-center font-bold shrink-0 overflow-hidden border border-slate-200">
                            {user?.image ? (
                                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <UserCircle size={28} strokeWidth={1.5} />
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-slate-400 hover:text-slate-900 transition-colors"
                            aria-label="Close menu"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex flex-col">
                        <h2 className="text-[clamp(1.1rem,4vw,1.3rem)] font-bold text-slate-900 leading-tight">
                            {user?.name || 'Estudante'}
                        </h2>
                        <span className="text-sm text-slate-500 font-medium mb-2">{user?.email}</span>
                        {user?.nucleus && (
                            <span className="inline-flex py-0.5 px-2 bg-city-blue/5 text-city-blue text-[10px] font-bold rounded-[4px] border border-city-blue/10 w-fit uppercase tracking-wider">
                                {user.nucleus}
                            </span>
                        )}
                    </div>
                </header>

                <div className="h-px bg-slate-100 mx-6" />

                {/* Menu Links */}
                <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                    {/* Seção: Progresso */}
                    <div className="mb-6">
                        <h3 className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Progresso</h3>
                        <div className="space-y-0.5">
                            <DrawerLink
                                icon={Trophy}
                                label="Formação & Scores"
                                href="/estudante/formacao"
                                active={pathname.startsWith('/estudante/formacao')}
                            />
                        </div>
                    </div>

                    {/* Seção: Engajamento */}
                    <div className="mb-6">
                        <h3 className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Engajamento</h3>
                        <div className="space-y-0.5">
                            <DrawerLink
                                icon={Vote}
                                label="Eleições"
                                href="/estudante/eleicoes"
                                active={pathname.startsWith('/estudante/eleicoes')}
                            />
                            <DrawerLink
                                icon={Calendar}
                                label="Próximos Eventos"
                                href="/estudante/evento"
                                active={pathname.startsWith('/estudante/evento')}
                            />
                        </div>
                    </div>

                    {/* Seção: Conta */}
                    <div className="mb-6">
                        <h3 className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">Conta</h3>
                        <div className="space-y-0.5">
                            <DrawerLink
                                icon={User}
                                label="Meu Perfil"
                                href="/estudante/perfil"
                                active={pathname === '/estudante/perfil'}
                            />
                            <DrawerLink
                                icon={Settings}
                                label="Configurações"
                                href="/estudante/configuracoes"
                                active={pathname === '/estudante/configuracoes'}
                            />
                        </div>
                    </div>
                </div>

                {/* Logout Footer */}
                <footer className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] border-t border-slate-100 shrink-0">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-3.5 space-x-3 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-100 hover:bg-red-50 transition-all font-semibold text-sm"
                        style={{ minHeight: '48px', borderRadius: '6px' }}
                    >
                        <LogOut size={18} />
                        <span>Sair da Conta</span>
                    </button>
                </footer>
            </aside>
        </>
    );
}

function DrawerLink({ icon: Icon, label, href, active }: { icon: any, label: string, href: string, active: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center justify-between px-6 py-3.5 border-b border-slate-50/50 transition-all active:bg-slate-50 ${active
                ? 'bg-city-blue/5 text-city-blue font-bold border-l-4 border-l-city-blue'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            style={{ minHeight: '48px' }}
        >
            <div className="flex items-center space-x-3">
                <Icon
                    className={`h-5 w-5 ${active ? 'text-city-blue' : 'text-slate-400'}`}
                />
                <span className="text-[clamp(0.875rem,2vw,1rem)] font-medium">{label}</span>
            </div>
            <ChevronRight
                size={16}
                className={`opacity-30 ${active ? 'text-city-blue' : ''}`}
            />
        </Link>
    );
}
