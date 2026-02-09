'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

import { ScrollArea } from '@/components/ui/scroll-area'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = getSupabaseClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const routes = [
        {
            label: 'Visão Geral',
            icon: Icons.menu,
            href: '/gestor',
            active: pathname === '/gestor',
        },
        {
            label: 'Escolas',
            icon: Icons.bookOpen,
            href: '/gestor/escolas',
            active: pathname.startsWith('/gestor/escolas'),
        },
        {
            label: 'Professores',
            icon: Icons.user,
            href: '/gestor/professores',
            active: pathname.startsWith('/gestor/professores'),
        },
        {
            label: 'Estudantes',
            icon: Icons.graduationCap,
            href: '/gestor/estudantes',
            active: pathname.startsWith('/gestor/estudantes'),
        },
        {
            label: 'Planos de Evento',
            icon: Icons.calendar,
            href: '/gestor/eventos',
            active: pathname.startsWith('/gestor/eventos'),
        },
        {
            label: 'Base de Conhecimento IA',
            icon: Icons.ai,
            href: '/gestor/ia',
            active: pathname.startsWith('/gestor/ia'),
        },
        {
            label: 'Relatórios',
            icon: Icons.chart,
            href: '/gestor/relatorios',
            active: pathname.startsWith('/gestor/relatorios'),
        },
        {
            label: 'Núcleo de Gestão',
            icon: Icons.users,
            href: '/gestor/nucleo',
            active: pathname.startsWith('/gestor/nucleo'),
        },
        {
            label: 'Cooperativas',
            icon: Icons.building,
            href: '/gestor/cooperativas',
            active: pathname.startsWith('/gestor/cooperativas'),
        },
        {
            label: 'Documentação',
            icon: Icons.bookOpen,
            href: '/gestor/documentacao',
            active: pathname.startsWith('/gestor/documentacao'),
        },
        {
            label: 'Configurações',
            icon: Icons.settings,
            href: '/gestor/configuracoes',
            active: pathname.startsWith('/gestor/configuracoes'),
        },
    ]

    return (
        <div className={cn('flex flex-col h-screen sticky top-0 border-r border-tech-gray/20 bg-gradient-to-b from-white to-slate-50/80', className)}>
            <ScrollArea className="flex-1">
                <div className="space-y-4 py-4">
                    <div className="px-3 py-2">
                        <div className="flex items-center px-4 mb-8">
                            <Image
                                src="/logo.png"
                                alt="City Coop"
                                width={150}
                                height={45}
                                className="object-contain"
                                priority
                            />
                        </div>
                        <div className="space-y-1">
                            {routes.map((route) => (
                                <Button
                                    key={route.href}
                                    variant={route.active ? 'secondary' : 'ghost'}
                                    className={cn(
                                        'w-full justify-start transition-all duration-200',
                                        route.active
                                            ? 'bg-gradient-to-r from-city-blue/10 to-coop-orange/10 text-city-blue border-l-4 border-coop-orange font-semibold'
                                            : 'text-tech-gray hover:text-city-blue hover:bg-city-blue/5'
                                    )}
                                    asChild
                                >
                                    <Link href={route.href}>
                                        <route.icon className={cn(
                                            "mr-3 h-5 w-5 transition-colors",
                                            route.active ? "text-coop-orange" : "text-tech-gray"
                                        )} />
                                        {route.label}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </ScrollArea>
            <div className="p-4 mt-auto border-t border-slate-100 bg-white/50">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors font-bold"
                    onClick={handleSignOut}
                >
                    <Icons.logout className="mr-3 h-5 w-5" />
                    Sair
                </Button>
            </div>
        </div>
    )
}
