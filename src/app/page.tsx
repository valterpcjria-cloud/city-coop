"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { PremiumCard } from "@/components/ui/premium-card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Premium com Glassmorphism */}
      <header className="px-6 h-18 flex items-center justify-between border-b border-white/10 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xl sticky top-0 z-50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="City Coop"
              width={150}
              height={45}
              className="object-contain dark:invert"
              priority
            />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Button variant="ghost" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button variant="brand" className="rounded-full px-6" asChild>
            <Link href="/login">Começar Agora</Link>
          </Button>
        </motion.div>
      </header>

      <main className="flex-1 relative">
        {/* Background Gradients Dinâmicos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        {/* Hero Section */}
        <section className="py-24 md:py-40 px-6 relative z-10 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400"
            >
              <span className="flex h-2 w-2 rounded-full bg-amber-500 mr-3 animate-ping" />
              Educação Cooperativista do Futuro
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
            >
              Transformando o amanhã através da <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-amber-500">Cooperação</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              A plataforma definitiva para vivenciar o cooperativismo escolar. Gestão moderna, núcleos reais e inteligência artificial pedagógica em um só lugar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
            >
              <Button size="lg" variant="brand" className="h-14 px-10 text-lg rounded-full group shadow-2xl shadow-blue-500/20" asChild>
                <Link href="/login">
                  Explorar Plataforma
                  <Icons.arrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full border-slate-200 dark:border-slate-800" asChild>
                <Link href="#features">Saiba mais</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 bg-white dark:bg-slate-950/50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 px-6">
            <div className="text-center mb-16">
              <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">Experiência City Coop</h2>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">Recursos de Próxima Geração</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <PremiumCard delay={1}>
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                  <Icons.user className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Para Professores</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Acompanhamento total. Dashboards exclusivos para monitorar o engajamento e a evolução dos núcleos cooperativos.
                </p>
              </PremiumCard>

              <PremiumCard delay={2}>
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 text-amber-600 dark:text-amber-400">
                  <Icons.menu className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Núcleos de Atuação</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Estrutura profissional com núcleos de Comunicação, Logística, Financeiro e muito mais para vivência prática.
                </p>
              </PremiumCard>

              <PremiumCard delay={3}>
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                  <Icons.ai className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">IA Pedagógica</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  O "DOT", nosso assistente inteligente, guia os estudantes 24/7 com suporte personalizado e feedbacks imediatos.
                </p>
              </PremiumCard>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Minimalista */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Image
            src="/logo.png"
            alt="City Coop"
            width={120}
            height={36}
            className="opacity-50 grayscale hover:grayscale-0 transition-all dark:invert"
          />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} City Coop Platform. Semeando colaboração.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-slate-400 hover:text-blue-500 transition-colors text-sm">Privacidade</Link>
            <Link href="#" className="text-slate-400 hover:text-blue-500 transition-colors text-sm">Termos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
