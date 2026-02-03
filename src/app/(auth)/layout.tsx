import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-green-400/10 rounded-full blur-3xl animate-pulse" />
            </div>

            <div className="z-10 w-full max-w-[400px] px-4 space-y-6">
                <div className="flex flex-col items-center space-y-2 text-center">
                    <Link href="/" className="flex flex-col items-center gap-2 mb-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-green-500 shadow-lg mb-2">
                            <span className="text-white font-bold text-xl">CC</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            City Coop Platform
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Cooperativismo, Cidadania e Empreendedorismo
                        </p>
                    </Link>
                </div>
                {children}
            </div>

            <div className="mt-8 text-center text-xs text-muted-foreground z-10">
                <p>&copy; {new Date().getFullYear()} City Coop. Todos os direitos reservados.</p>
            </div>
        </div>
    )
}
