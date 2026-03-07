import type { Metadata } from 'next'

/**
 * Standard utility to generate page metadata with consistency across the platform.
 */
export function constructMetadata({
    title = 'City Coop Platform',
    description = 'Plataforma de Cooperativismo Escolar e Empreendedorismo - Desenvolvendo futuros líderes.',
    image = '/og-image.png',
    noIndex = false
}: {
    title?: string
    description?: string
    image?: string
    noIndex?: boolean
} = {}): Metadata {
    return {
        title: title === 'City Coop Platform' ? title : `${title} | City Coop`,
        description,
        manifest: '/manifest.json',
        appleWebApp: {
            capable: true,
            statusBarStyle: 'default',
            title: 'City Coop',
            // startUpImage: [],
        },
        formatDetection: {
            telephone: false,
        },
        openGraph: {
            title,
            description,
            images: [
                {
                    url: image
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
            creator: '@citycoop'
        },
        icons: {
            icon: '/favicon.ico',
            apple: [
                { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            ],
        },
        metadataBase: new URL('https://platform.citycoop.com.br'),
        ...(noIndex && {
            robots: {
                index: false,
                follow: false
            }
        })
    }
}
