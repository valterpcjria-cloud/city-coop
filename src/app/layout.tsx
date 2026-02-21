import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

const geistSans = GeistSans
const geistMono = GeistMono

import { constructMetadata } from '@/lib/metadata'

export const metadata = constructMetadata({
  title: 'Início',
  description: 'Acesse a Plataforma City Coop para gerir sua cooperativa escolar.'
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
