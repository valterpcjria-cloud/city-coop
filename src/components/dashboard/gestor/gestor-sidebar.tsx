'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/ui/icons'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface GestorSidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

const routes = [
    {
        label: 'Visão Geral',
        icon: Icons.menu,
        href: '/gestor',
    },
    {
        label: 'Escolas',
        icon: Icons.bookOpen,
        href: '/gestor/escolas',
    },
    {
        label: 'Professores',
        icon: Icons.user,
        href: '/gestor/professores',
    },
    {
        label: 'Estudantes',
        icon: Icons.graduationCap,
        href: '/gestor/estudantes',
    },
    {
        label: 'Planos de Evento',
        icon: Icons.calendar,
        href: '/gestor/eventos',
    },
    {
        label: 'Base de Conhecimento IA',
        icon: Icons.ai,
        href: '/gestor/ia',
    },
    {
        label: 'Relatórios',
        icon: Icons.chart,
        href: '/gestor/relatorios',
    },
    {
        label: 'Núcleo de Gestão',
        icon: Icons.users,
        href: '/gestor/nucleo',
    },
    {
        label: 'Cooperativas',
        icon: Icons.building,
        href: '/gestor/cooperativas',
    },
    {
        label: 'Documentação',
        icon: Icons.bookOpen,
        href: '/gestor/documentacao',
    },
    {
        label: 'Gestão de Usuários',
        icon: Icons.users,
        href: '/gestor/usuarios',
    },
    {
        label: 'Configurações',
        icon: Icons.settings,
        href: '/gestor/configuracoes',
    },
]

export function GestorSidebar({ className }: GestorSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = getSupabaseClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const isActive = (href: string) => {
        if (href === '/gestor') {
            return pathname === '/gestor'
        }
        return pathname.startsWith(href)
    }

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen w-72 glass-sidebar',
                'flex flex-col',
                className
            )}
        >
            {/* Logo Section */}
            <div className="flex items-center justify-center px-6 py-8">
                <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-r from-city-blue/20 to-coop-orange/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Image
                        src="/logo.png"
                        alt="City Coop"
                        width={160}
                        height={48}
                        className="object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                        priority
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                {routes.map((route, index) => {
                    const active = isActive(route.href)
                    return (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                'menu-item-premium group',
                                'animate-slide-in-left opacity-0',
                                active && 'active'
                            )}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div
                                className={cn(
                                    'flex items-center justify-center w-10 h-10 rounded-xl mr-3 transition-all duration-300',
                                    active
                                        ? 'bg-gradient-to-br from-city-blue/15 to-coop-orange/10'
                                        : 'bg-slate-100/80 group-hover:bg-city-blue/10'
                                )}
                            >
                                <route.icon
                                    className={cn(
                                        'h-5 w-5 transition-all duration-300',
                                        active
                                            ? 'text-city-blue'
                                            : 'text-tech-gray group-hover:text-city-blue group-hover:scale-110'
                                    )}
                                />
                            </div>
                            <span
                                className={cn(
                                    'font-medium text-sm transition-colors duration-200',
                                    active
                                        ? 'text-slate-800'
                                        : 'text-tech-gray group-hover:text-slate-700'
                                )}
                            >
                                {route.label}
                            </span>

                            {/* Active Indicator Dot */}
                            {active && (
                                <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-city-blue to-coop-orange animate-pulse-glow" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom Section - Logout */}
            <div className="p-4 border-t border-slate-200/50">
                <button
                    onClick={handleSignOut}
                    className={cn(
                        'menu-item-premium w-full group',
                        'hover:bg-red-50/80'
                    )}
                >
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl mr-3 bg-red-50/50 group-hover:bg-red-100/80 transition-all duration-300">
                        <Icons.logout className="h-5 w-5 text-red-500 group-hover:text-red-600 transition-colors" />
                    </div>
                    <span className="font-medium text-sm text-red-500 group-hover:text-red-600 transition-colors">
                        Sair
                    </span>
                </button>
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/50 to-transparent pointer-events-none" />
        </aside>
    )
}
