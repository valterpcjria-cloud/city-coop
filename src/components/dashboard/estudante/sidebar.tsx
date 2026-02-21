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
            label: 'Formação & Scores',
            icon: Icons.trophy,
            href: '/estudante/formacao',
            active: pathname.startsWith('/estudante/formacao'),
        },
        {
            label: 'Atividades',
            icon: Icons.check,
            href: '/estudante/atividades',
            active: pathname.startsWith('/estudante/atividades'),
        },
        {
            label: 'Eleições',
            icon: Icons.vote,
            href: '/estudante/eleicoes',
            active: pathname.startsWith('/estudante/eleicoes'),
        },
        {
            label: 'Chat IA',
            icon: Icons.ai,
            href: '/estudante/chat',
            active: pathname.startsWith('/estudante/chat'),
        },
    ]

    return (
        <div className={cn('flex flex-col h-screen sticky top-0 border-r border-tech-gray/20 bg-gradient-to-b from-white to-slate-50/80', className)}>
            <ScrollArea className="flex-1">
                <div className="space-y-4 py-4">
                    <div className="px-3 py-2">
                        <div className="flex items-center px-4 mb-8 overflow-visible">
                            <Link href="/estudante" className="relative group/logo block overflow-visible">
                                <div className="absolute inset-0 bg-city-blue/5 rounded-full blur-xl transition-all duration-700 group-hover/logo:bg-city-blue/20" />
                                <div className="absolute -inset-4 bg-gradient-to-r from-city-blue/40 via-coop-orange/20 to-city-blue/40 rounded-full blur-2xl opacity-0 transition-opacity duration-300 group-hover/logo:opacity-100" />
                                <Image
                                    src="/logo.png"
                                    alt="City Coop"
                                    width={150}
                                    height={45}
                                    className="relative object-contain transition-transform duration-300 group-hover/logo:scale-105"
                                    priority
                                />
                            </Link>
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
                        <div className="bg-gradient-to-br from-[#4A90D9]/10 to-[#F5A623]/10 p-4 rounded-xl border border-coop-orange/20 mx-2 shadow-sm">
                            <h3 className="font-bold text-city-blue text-sm mb-1 flex items-center gap-2">
                                <div className="h-8 w-8 flex-shrink-0 flex items-center justify-center p-0.5">
                                    <img src="/dot-bot.png" alt="DOT" className="h-full w-full object-contain" />
                                </div>
                                DOT Assistente
                            </h3>
                            <p className="text-xs text-tech-gray mb-3">Precisa de ajuda com sua tarefa?</p>
                            <Button size="sm" className="w-full bg-gradient-to-r from-city-blue to-coop-orange hover:from-city-blue-dark hover:to-coop-orange-dark text-white h-8 text-xs font-semibold shadow-md transition-all duration-200" asChild>
                                <Link href="/estudante/chat">Falar com IA</Link>
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
