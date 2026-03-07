'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    X,
    User,
    LogOut,
    ChevronRight,
} from 'lucide-react';
import { Icons } from '@/components/ui/icons';
import { getSupabaseClient } from '@/lib/supabase/client';

interface DrawerLinkProps {
    href: string;
    icon: any;
    label: string;
    active: boolean;
    highlighted?: boolean;
}

function DrawerLink({ href, icon: Icon, label, active, highlighted = false }: DrawerLinkProps) {
    return (
        <Link
            href={href}
            className={`flex items-center justify-between px-4 py-3.5 border-b border-slate-50 transition-all active:bg-slate-50 ${active
                ? 'bg-city-blue/5 text-city-blue font-bold border-l-4 border-l-city-blue'
                : highlighted
                    ? 'text-slate-700 hover:bg-slate-50'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
            style={{ minHeight: '48px' }}
        >
            <div className="flex items-center space-x-3">
                <Icon
                    className={`h-5 w-5 ${active ? 'text-city-blue' : highlighted ? 'text-coop-orange' : 'text-slate-400'}`}
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

interface GestorMobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user?: { name?: string; email?: string; avatarUrl?: string };
}

const routes = [
    { label: 'Visão Geral', icon: Icons.menu, href: '/gestor' },
    { label: 'Escolas', icon: Icons.bookOpen, href: '/gestor/escolas' },
    { label: 'Professores', icon: Icons.user, href: '/gestor/professores' },
    { label: 'Estudantes', icon: Icons.graduationCap, href: '/gestor/estudantes' },
    { label: 'Planos de Evento', icon: Icons.calendar, href: '/gestor/eventos' },
    { label: 'Base de Conhecimento', icon: Icons.ai, href: '/gestor/ia' },
    { label: 'Relatórios', icon: Icons.chart, href: '/gestor/relatorios' },
    { label: 'Configurações', icon: Icons.settings, href: '/gestor/configuracoes' },
];

export function GestorMobileDrawer({ isOpen, onClose, user }: GestorMobileDrawerProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = getSupabaseClient();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    useEffect(() => {
        onClose();
    }, [pathname]);

    const handleLogout = async () => {
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
                        <div className="w-14 h-14 rounded-md bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden border border-slate-200">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User size={28} strokeWidth={1.5} />
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
                            {user?.name || 'Gestor(a)'}
                        </h2>
                        <span className="text-sm text-slate-500 font-medium">{user?.email}</span>
                    </div>
                </header>

                <div className="h-px bg-slate-100 mx-6" />

                {/* Navigation Links — Fluid & Spaced */}
                <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                    {routes.map((route) => (
                        <DrawerLink
                            key={route.href}
                            href={route.href}
                            icon={route.icon}
                            label={route.label}
                            active={pathname === route.href || (route.href !== '/gestor' && pathname.startsWith(route.href))}
                        />
                    ))}
                </nav>

                {/* Footer — Plain & Professional */}
                <footer className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] border-t border-slate-100 shrink-0">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3.5 space-x-3 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-100 hover:bg-red-50 transition-all font-semibold text-sm rounded-md"
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
