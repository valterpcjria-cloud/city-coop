import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-white via-[#4A90D9]/3 to-[#F5A623]/5">
      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-[#6B7C93]/10 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="City Coop"
            width={140}
            height={40}
            className="object-contain"
            priority
          />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-[#6B7C93] hover:text-[#4A90D9] transition-colors">
            Entrar
          </Link>
          <Button variant="brand" asChild>
            <Link href="/register">Cadastre-se</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-32 px-6 relative overflow-hidden">
          {/* Background decor */}
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#4A90D9]/8 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#F5A623]/8 rounded-full blur-3xl" />

          <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
            <div className="inline-flex items-center rounded-full border border-[#4A90D9]/30 bg-[#4A90D9]/5 px-4 py-1.5 text-sm font-semibold text-[#4A90D9]">
              <span className="flex h-2 w-2 rounded-full bg-[#F5A623] mr-2 animate-pulse"></span>
              Plataforma de Cooperativismo Escolar
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#1a2332]">
              Formando líderes através do <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A90D9] to-[#F5A623]">Cooperativismo</span>
            </h1>

            <p className="text-xl text-[#6B7C93] max-w-2xl mx-auto leading-relaxed">
              Uma plataforma completa para gerenciar cooperativas escolares, conectar alunos e professores, e desenvolver competências socioemocionais com ajuda de Inteligência Artificial.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" variant="brand" className="h-12 px-8 text-base shadow-xl shadow-[#4A90D9]/20" asChild>
                <Link href="/register">
                  Começar agora
                  <Icons.arrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link href="/login">
                  Já tenho conta
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#4A90D9] mb-3">Por que City Coop?</h2>
              <p className="text-[#6B7C93] max-w-xl mx-auto">Uma solução completa para transformar a educação através do cooperativismo.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-[#4A90D9]/5 to-transparent p-8 rounded-2xl border border-[#4A90D9]/15 hover:shadow-xl hover:shadow-[#4A90D9]/10 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-[#4A90D9] to-[#3A7BC8] rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-[#4A90D9]/25">
                  <Icons.user className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1a2332] mb-2">Para Professores</h3>
                <p className="text-[#6B7C93]">
                  Gerencie turmas, acompanhe o desenvolvimento dos núcleos e avalie competências em tempo real.
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#F5A623]/5 to-transparent p-8 rounded-2xl border border-[#F5A623]/15 hover:shadow-xl hover:shadow-[#F5A623]/10 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-[#F5A623] to-[#E09000] rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-[#F5A623]/25">
                  <Icons.menu className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1a2332] mb-2">Cooperativas</h3>
                <p className="text-[#6B7C93]">
                  Estrutura completa com 6 núcleos operacionais: Financeiro, Logística, Comunicação e mais.
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#4A90D9]/5 via-[#F5A623]/5 to-transparent p-8 rounded-2xl border border-[#6B7C93]/15 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-[#4A90D9] to-[#F5A623] rounded-xl flex items-center justify-center mb-5 shadow-lg">
                  <Icons.ai className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#1a2332] mb-2">IA Integrada</h3>
                <p className="text-[#6B7C93]">
                  Coop Assistant disponível 24/7 para tirar dúvidas e guiar os alunos nos desafios do projeto.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-[#6B7C93] border-t border-[#6B7C93]/10 bg-white">
        <p>&copy; {new Date().getFullYear()} City Coop. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
