import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-green-500 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold">CC</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">City Coop</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600">
            Entrar
          </Link>
          <Button asChild>
            <Link href="/register">Cadastre-se</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-32 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
              Plataforma de Cooperativismo Escolar
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900">
              Formando líderes através do <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">Cooperativismo</span>
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Uma plataforma completa para gerenciar cooperativas escolares, conectar alunos e professores, e desenvolver competências socioemocionais com ajuda de Inteligência Artificial.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" asChild>
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
        <section className="py-20 bg-slate-50 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                <Icons.user className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Para Professores</h3>
              <p className="text-slate-600">
                Gerencie turmas, acompanhe o desenvolvimento dos núcleos e avalie competências em tempo real.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-green-600">
                <Icons.menu className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Cooperativas</h3>
              <p className="text-slate-600">
                Estrutura completa com 6 núcleos operacionais: Financeiro, Logística, Comunicação e mais.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                <Icons.spinner className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">IA Integrada</h3>
              <p className="text-slate-600">
                Coop Assistant disponível 24/7 para tirar dúvidas e guiar os alunos nos desafios do projeto.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-500 border-t bg-white">
        <p>&copy; {new Date().getFullYear()} City Coop. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
