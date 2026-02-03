'use client'

import Link from 'next/link'
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
            label: 'Visão Geral',
            icon: Icons.menu, // Using Menu as placeholder for Dashboard icon
            href: '/professor',
            active: pathname === '/professor',
        },
        {
            label: 'Minhas Turmas',
            icon: Icons.user, // Placeholder
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
            icon: Icons.calendar, // Need to add Calendar icon
            href: '/professor/eventos',
            active: pathname.startsWith('/professor/eventos'),
        },
        {
            label: 'Diretrizes',
            icon: Icons.settings, // Using Settings as placeholder for Book/Guide
            href: '/professor/diretrizes',
            active: pathname.startsWith('/professor/diretrizes'),
        },
    ]

    return (
        <div className={cn('pb-12 h-screen border-r bg-slate-50/40', className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="flex items-center px-4 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center mr-2 shadow-sm">
                            <span className="text-white font-bold">CC</span>
                        </div>
                        <h2 className="text-lg font-bold tracking-tight">City Coop</h2>
                    </div>
                    <div className="space-y-1">
                        {routes.map((route) => (
                            <Button
                                key={route.href}
                                variant={route.active ? 'secondary' : 'ghost'}
                                className={cn(
                                    'w-full justify-start',
                                    route.active && 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800'
                                )}
                                asChild
                            >
                                <Link href={route.href}>
                                    <route.icon className={cn("mr-2 h-4 w-4", route.active ? "text-blue-600" : "text-slate-500")} />
                                    {route.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-slate-500">
                        Ferramentas IA
                    </h2>
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                            <Icons.spinner className="mr-2 h-4 w-4" /> {/* Placeholder for Robot icon */}
                            Coop Assistant
                        </Button>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-4 left-0 w-full px-3">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleSignOut}
                >
                    <Icons.logout className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </div>
        </div>
    )
}
