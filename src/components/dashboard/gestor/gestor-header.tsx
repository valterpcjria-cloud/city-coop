'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/ui/icons'

export function GestorHeader({
    user,
    title = "Painel do Gestor"
}: {
    user?: { name: string; email: string; image?: string }
    title?: string
}) {
    const router = useRouter()
    const initials = user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'GS'

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <header className="sticky top-0 z-30 mx-4 mt-4 mb-2">
            <div className="glass-header rounded-2xl px-6 h-16 flex items-center justify-between">
                {/* Left Section - Title with gradient */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-gradient-brand">
                            {title}
                        </h1>
                        <p className="text-xs text-tech-gray">
                            Bem-vindo de volta, {user?.name?.split(' ')[0] || 'Gestor'}
                        </p>
                    </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center gap-3">
                    {/* Notification Bell */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative w-10 h-10 rounded-xl hover:bg-city-blue/5 transition-all duration-200"
                    >
                        <Icons.bell className="h-5 w-5 text-tech-gray" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-coop-orange rounded-full animate-pulse" />
                    </Button>

                    {/* User Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-11 rounded-xl pl-2 pr-3 hover:bg-city-blue/5 transition-all duration-200"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="avatar-ring">
                                        <Avatar className="h-9 w-9 border-2 border-white shadow-md">
                                            <AvatarImage src={user?.image} alt={user?.name || "User"} />
                                            <AvatarFallback className="bg-gradient-to-br from-city-blue to-city-blue-dark text-white font-semibold text-sm">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="hidden md:flex flex-col items-start">
                                        <span className="text-sm font-semibold text-slate-800">
                                            {user?.name || 'Gestor'}
                                        </span>
                                        <span className="text-xs text-tech-gray">
                                            Administrador
                                        </span>
                                    </div>
                                    <Icons.chevronDown className="h-4 w-4 text-tech-gray ml-1" />
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-60 p-2 rounded-xl shadow-premium border-slate-200/50"
                            align="end"
                            forceMount
                        >
                            <DropdownMenuLabel className="font-normal px-3 py-2">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-semibold text-slate-800">
                                        {user?.name || 'Gestor'}
                                    </p>
                                    <p className="text-xs text-tech-gray">
                                        {user?.email || 'gestor@citycoop.com'}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="my-2" />
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-city-blue/5 transition-colors">
                                    <Link href="/gestor/perfil" className="flex items-center w-full">
                                        <Icons.user className="mr-3 h-4 w-4 text-tech-gray" />
                                        <span>Perfil</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-city-blue/5 transition-colors">
                                    <Link href="/gestor/configuracoes" className="flex items-center w-full">
                                        <Icons.settings className="mr-3 h-4 w-4 text-tech-gray" />
                                        <span>Configurações</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator className="my-2" />
                            <DropdownMenuItem
                                onClick={handleSignOut}
                                className="px-3 py-2.5 rounded-lg cursor-pointer text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <Icons.logout className="mr-3 h-4 w-4" />
                                <span>Sair</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
