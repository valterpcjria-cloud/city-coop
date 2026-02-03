import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function DashboardHeader({
    user
}: {
    user?: { name: string; email: string; image?: string }
}) {
    return (
        <header className="border-b bg-white/50 backdrop-blur-sm px-6 h-16 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
                {/* Breadcrumbs or Page Title could go here */}
                <h1 className="font-semibold text-lg text-slate-800">
                    Painel do Professor
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8 border">
                                <AvatarImage src={user?.image} alt={user?.name || "User"} />
                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                    {user?.name?.substring(0, 2).toUpperCase() || 'PF'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name || 'Professor'}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email || 'professor@citycoop.com'}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                Configurações
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                            Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
