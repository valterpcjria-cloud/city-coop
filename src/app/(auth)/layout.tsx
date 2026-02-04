import Link from 'next/link'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
            {/* Brand Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#4A90D9]/8 rounded-full blur-3xl" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#F5A623]/8 rounded-full blur-3xl" />
                <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-[#4A90D9]/5 rounded-full blur-2xl" />
            </div>

            <div className="z-10 w-full max-w-[420px] px-4 space-y-6">
                {children}
            </div>

            <div className="mt-8 text-center text-xs text-[#6B7C93] z-10">
                <p>&copy; {new Date().getFullYear()} City Coop. Todos os direitos reservados.</p>
            </div>
        </div>
    )
}
