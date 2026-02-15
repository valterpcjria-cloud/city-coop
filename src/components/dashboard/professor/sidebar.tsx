'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Icons } from '@/components/ui/icons'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
            label: 'Diretrizes',
            icon: Icons.bookOpen,
            href: '/professor/diretrizes',
            active: pathname.startsWith('/professor/diretrizes'),
        },
        {
            label: 'Visão Geral',
            icon: Icons.menu,
            href: '/professor',
            active: pathname === '/professor',
        },
        {
            label: 'Estudantes',
            icon: Icons.users,
            href: '/professor/estudantes',
            active: pathname.startsWith('/professor/estudantes'),
        },
        {
            label: 'Minhas Turmas',
            icon: Icons.user,
            href: '/professor/turmas',
            active: pathname.startsWith('/professor/turmas'),
        },
        {
            label: 'Avaliações',
            icon: Icons.check,
            href: '/professor/avaliacoes',
            active: pathname.startsWith('/professor/avaliacoes'),
        },
        {
            label: 'Eventos',
            icon: Icons.calendar,
            href: '/professor/eventos',
            active: pathname.startsWith('/professor/eventos'),
        },
        {
            label: 'Eleições',
            icon: Icons.vote,
            href: '/professor/eleicoes',
            active: pathname.startsWith('/professor/eleicoes'),
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
                                            ? 'bg-gradient-to-r from-[#4A90D9]/10 to-[#F5A623]/10 text-city-blue border-l-4 border-coop-orange font-semibold'
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
                    <div className="px-3 py-2">
                        <h2 className="mb-3 px-4 text-xs font-bold tracking-wider uppercase text-coop-orange">
                            Ferramentas IA
                        </h2>
                        <div className="space-y-1">
                            <Button
                                variant={pathname === '/professor/ia' ? 'secondary' : 'ghost'}
                                className={cn(
                                    "w-full justify-start transition-all duration-200",
                                    pathname === '/professor/ia'
                                        ? "bg-gradient-to-r from-[#4A90D9]/15 to-[#F5A623]/15 text-city-blue border-l-4 border-coop-orange font-semibold"
                                        : "text-city-blue hover:text-city-blue-dark hover:bg-city-blue/5"
                                )}
                                asChild
                            >
                                <Link href="/professor/ia">
                                    <div className="mr-3 h-7 w-7 rounded-full shadow-sm flex-shrink-0 flex items-center justify-center p-0.5">
                                        <img src="/dot-bot.png" alt="DOT" className="h-full w-full object-contain" />
                                    </div>
                                    DOT Assistente
                                </Link>
                            </Button>
                            <Button
                                variant={pathname === '/professor/ia/avaliacoes' ? 'secondary' : 'ghost'}
                                className={cn(
                                    "w-full justify-start transition-all duration-200",
                                    pathname === '/professor/ia/avaliacoes'
                                        ? "bg-gradient-to-r from-[#4A90D9]/15 to-[#F5A623]/15 text-city-blue border-l-4 border-coop-orange font-semibold"
                                        : "text-city-blue hover:text-city-blue-dark hover:bg-city-blue/5"
                                )}
                                asChild
                            >
                                <Link href="/professor/ia/avaliacoes">
                                    <Icons.add className={cn(
                                        "mr-3 h-5 w-5",
                                        pathname === '/professor/ia/avaliacoes' ? "text-coop-orange" : "text-city-blue"
                                    )} />
                                    Criar Avaliação IA
                                </Link>
                            </Button>
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
