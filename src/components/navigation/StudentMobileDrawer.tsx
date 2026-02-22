'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
import { cn } from '@/lib/utils';

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
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] md:hidden">
                    {/* Backdrop Fade */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Drawer Panel Slide-in */}
                    <motion.aside
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute top-0 right-0 h-[100dvh] w-[80%] max-w-sm bg-white shadow-2xl flex flex-col pt-safe"
                    >
                        {/* Header / Profile Info */}
                        <div className="p-6 bg-slate-50 border-b border-slate-100 relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-slate-400 active:bg-slate-200 rounded-full transition-colors"
                                aria-label="Fechar menu"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-4 mt-2">
                                <div className="w-14 h-14 rounded-2xl bg-city-blue/10 flex items-center justify-center text-city-blue overflow-hidden border border-city-blue/20 shadow-sm">
                                    {user?.image ? (
                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCircle size={32} />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-bold text-slate-900 leading-tight line-clamp-1">
                                        {user?.name || 'Estudante'}
                                    </span>
                                    <span className="text-xs text-slate-500 line-clamp-1 mb-1">{user?.email}</span>
                                    {user?.nucleus && (
                                        <span className="inline-flex py-0.5 px-2 bg-city-blue/10 text-city-blue text-[10px] font-bold rounded-full border border-city-blue/20 w-fit">
                                            {user.nucleus}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Menu Links */}
                        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
                            {/* Seção: Progresso */}
                            <div>
                                <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-3">Progresso</h3>
                                <div className="space-y-1">
                                    <DrawerLink
                                        icon={Trophy}
                                        label="Formação & Scores"
                                        href="/estudante/formacao"
                                        active={pathname.startsWith('/estudante/formacao')}
                                    />
                                </div>
                            </div>

                            {/* Seção: Engajamento */}
                            <div>
                                <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-3">Engajamento</h3>
                                <div className="space-y-1">
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
                            <div>
                                <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-3">Conta</h3>
                                <div className="space-y-1">
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
                        <div className="p-4 pb-safe border-t border-slate-100">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center justify-between px-4 py-4 text-red-600 font-bold bg-red-50/50 rounded-2xl active:bg-red-100 active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <LogOut size={18} />
                                    <span>Sair da Conta</span>
                                </div>
                                <ChevronRight size={16} opacity={0.5} />
                            </button>
                        </div>
                    </motion.aside>
                </div>
            )}
        </AnimatePresence>
    );
}

function DrawerLink({ icon: Icon, label, href, active }: { icon: any, label: string, href: string, active: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center justify-between px-3 py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.98]",
                active
                    ? "bg-city-blue/5 text-city-blue shadow-[0_4px_12px_-2px_rgba(74,144,217,0.12)]"
                    : "text-slate-600 hover:bg-slate-50"
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                    active ? "bg-city-blue text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                )}>
                    <Icon size={18} />
                </div>
                <span className={cn("text-sm font-semibold", active ? "text-city-blue" : "text-slate-700")}>
                    {label}
                </span>
            </div>
            <ChevronRight size={14} className={cn("transition-opacity", active ? "opacity-100" : "opacity-30")} />
        </Link>
    );
}
