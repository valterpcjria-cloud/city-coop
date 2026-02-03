'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function StudentSidebar({ className }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = getSupabaseClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const routes = [
        {
            label: 'Meu Painel',
            icon: Icons.menu,
            href: '/estudante',
            active: pathname === '/estudante',
        },
        {
            label: 'Meu Núcleo',
            icon: Icons.user,
            href: '/estudante/nucleo',
            active: pathname.startsWith('/estudante/nucleo'),
        },
        {
            label: 'Atividades',
            icon: Icons.check,
            href: '/estudante/atividades',
            active: pathname.startsWith('/estudante/atividades'),
        },
        {
            label: 'Chat IA',
            icon: Icons.spinner,
            href: '/estudante/chat',
            active: pathname.startsWith('/estudante/chat'),
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
                        <h2 className="text-lg font-bold tracking-tight">Estudante</h2>
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
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mx-2">
                        <h3 className="font-semibold text-blue-900 text-sm mb-1">Coop Buddy</h3>
                        <p className="text-xs text-blue-700 mb-2">Precisa de ajuda com sua tarefa?</p>
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 h-7 text-xs" asChild>
                            <Link href="/estudante/chat">Falar com IA</Link>
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
